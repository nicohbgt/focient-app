/**
 * FoCient PWA & Web Notification Engine
 * Provides cross-platform desktop & mobile PWA notification triggers,
 * service worker registration, and guilt-free cognitive reminders.
 */

export interface PwaNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Registers the FoCient PWA Service Worker in client environments
 */
export async function registerPwaServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    swRegistration = registration;
    return registration;
  } catch (err) {
    // Graceful fallback for local or restricted environments
    return null;
  }
}

/**
 * Checks whether native Web Notification API is supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Converts a url-safe base64 string to a Uint8Array for PushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const atobFn =
    typeof window !== 'undefined' && typeof window.atob === 'function'
      ? window.atob.bind(window)
      : typeof atob === 'function'
      ? atob
      : (str: string) => Buffer.from(str, 'base64').toString('binary');

  const rawData = atobFn(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribes the current PWA browser instance to Web Push and registers it on the server
 */
export async function subscribeToWebPush(authToken?: string): Promise<{
  success: boolean;
  subscription?: PushSubscription | null;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Push notifications are not supported in this environment.' };
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.pushManager) {
      return { success: false, error: 'PushManager is not available.' };
    }

    // 1. Fetch VAPID public key from backend
    const vapidRes = await fetch('/api/notifications/vapid-key');
    const vapidData = await vapidRes.json();
    const publicKey = vapidData.publicKey;

    if (!publicKey) {
      return { success: false, error: 'Failed to retrieve VAPID public key from server.' };
    }

    // 2. Check if already subscribed
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      });
    }

    // 3. Register subscription on backend
    const token = authToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('focient_token') || '' : '');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const subJson = subscription.toJSON();
    const regRes = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      }),
    });

    const regData = await regRes.json();
    return {
      success: regData.success !== false,
      subscription,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Subscription failed' };
  }
}

/**
 * Triggers a real server-side Web Push notification to all of the user's active devices
 */
export async function triggerServerWebPush(
  payload: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    category?: 'task' | 'workload' | 'summary' | 'rest';
  },
  authToken?: string
): Promise<{ success: boolean; sentCount?: number; message?: string }> {
  try {
    const token = authToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('focient_token') || '' : '');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch('/api/notifications/push', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Returns current Notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Requests native notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerPwaServiceWorker();
      await subscribeToWebPush().catch(() => {});
    }
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Triggers a native desktop or mobile PWA push/system notification
 */
export async function showPwaNotification(payload: PwaNotificationPayload): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const {
    title,
    body,
    icon = '/brand/focient-logo.png',
    badge = '/brand/focient-logo.png',
    tag = 'focient-alert',
    url = '/dashboard',
  } = payload;

  try {
    // Prefer Service Worker registration if available (supports mobile PWA background & actions)
    if (!swRegistration && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      swRegistration = reg || null;
    }

    if (swRegistration && 'showNotification' in swRegistration) {
      await swRegistration.showNotification(title, {
        body,
        icon,
        badge,
        tag,
        data: { url },
      });
      return true;
    }

    // Direct Notification constructor fallback (standard desktop browser)
    new Notification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Guilt-free localized notification message builders
 */
export function buildTaskReminderCopy(
  taskTitle: string,
  startHour: string,
  durationMinutes: number,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: `Sesi Fokus: ${taskTitle}`,
      body: `Dimulai pukul ${startHour} (${durationMinutes} menit). Ambil napas tenang dan fokus pada satu tugas.`,
    };
  }
  return {
    title: `Focus Session: ${taskTitle}`,
    body: `Starting at ${startHour} (${durationMinutes} min). Take a breath and focus on this single priority.`,
  };
}

export function buildWorkloadWarningCopy(
  workloadPercent: number,
  allocatedMinutes: number,
  capacityMinutes: number,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: 'Kalibrasi Ritme Beban Kerja',
      body: `Beban kerja hari ini mencapai ${workloadPercent}% (${allocatedMinutes}/${capacityMinutes}m). Jangan ragu geser tugas tanpa rasa bersalah.`,
    };
  }
  return {
    title: 'Workload Rhythm Calibration',
    body: `Today's load is at ${workloadPercent}% (${allocatedMinutes}/${capacityMinutes}m). Feel free to shift non-essential tasks without guilt.`,
  };
}

export function buildDailySummaryCopy(
  completedCount: number,
  restMinutes: number,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: 'Rangkuman Ketenangan Hari Ini',
      body: `${completedCount} tugas fokus selesai dengan ${restMinutes} menit jeda pemulihan. Istirahatlah dengan tenang malam ini.`,
    };
  }
  return {
    title: 'Daily Calm Summary',
    body: `${completedCount} focus tasks completed with ${restMinutes}m mindful rest buffers protected. Rest peacefully tonight.`,
  };
}

export function buildRestBufferCopy(
  restMinutes: number,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: 'Waktunya Jeda Pemulihan',
      body: `Sesi fokus selesai. Nikmati jeda istirahat ${restMinutes} menit untuk menjaga stamina kognitif Anda.`,
    };
  }
  return {
    title: 'Time for a Recovery Buffer',
    body: `Focus session complete. Enjoy a ${restMinutes}m restorative buffer to sustain your mental energy.`,
  };
}

/**
 * Builds copy for urgent high-priority task completion reminders
 */
export function buildUrgentTaskReminderCopy(
  taskTitle: string,
  startHour?: string,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: 'Pengingat Tugas Genting',
      body: startHour
        ? `Tugas prioritas utama "${taskTitle}" dijadwalkan pukul ${startHour}. Selesaikan dengan fokus penuh dan tenang.`
        : `Tugas prioritas utama "${taskTitle}" perlu diselesaikan hari ini. Selesaikan secara bertahap tanpa cemas.`,
    };
  }
  return {
    title: 'Urgent Task Reminder',
    body: startHour
      ? `High-priority focus task "${taskTitle}" is scheduled at ${startHour}. Complete it with calm, steady focus.`
      : `High-priority focus task "${taskTitle}" needs completion today. Work through it steadily without stress.`,
  };
}

/**
 * Builds copy when a task is newly added to the schedule
 */
export function buildTaskAddedCopy(
  taskTitle: string,
  dateOrTime?: string,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: 'Tugas Ditambahkan ke Sistem',
      body: dateOrTime
        ? `Tugas "${taskTitle}" berhasil dijadwalkan (${dateOrTime}).`
        : `Tugas "${taskTitle}" berhasil ditambahkan ke rencana kerja Anda.`,
    };
  }
  return {
    title: 'Task Added to System',
    body: dateOrTime
      ? `Task "${taskTitle}" has been scheduled (${dateOrTime}).`
      : `Task "${taskTitle}" has been added to your workspace plan.`,
  };
}

/**
 * Builds copy when a task is completed (calm positive affirmation)
 */
export function buildTaskCompletedCopy(
  taskTitle: string,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: 'Tugas Selesai Dikerjakan',
      body: `Hebat! Tugas "${taskTitle}" telah selesai. Berikan diri Anda jeda istirahat sebelum lanjut ke tugas berikutnya.`,
    };
  }
  return {
    title: 'Task Completed',
    body: `Well done! Task "${taskTitle}" is complete. Take a short pause before moving to the next session.`,
  };
}
