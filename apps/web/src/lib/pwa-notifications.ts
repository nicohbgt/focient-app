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
  const title = taskTitle.trim();
  if (locale === 'id') {
    return {
      title,
      body: `Mulai jam ${startHour} (${durationMinutes} menit). Yuk fokus ke tugas ini dulu.`,
    };
  }
  return {
    title,
    body: `Starts at ${startHour} (${durationMinutes} min). Time to focus on this task.`,
  };
}

/**
 * Builds copy for advance task reminders (1 hour, 3 hours, or 6 hours before)
 */
export function buildTaskLeadReminderCopy(
  taskTitle: string,
  startHour: string,
  leadHours: 1 | 3 | 6,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  const title = taskTitle.trim();
  if (locale === 'id') {
    let body = '';
    if (leadHours === 6) {
      body = `Ada tugas jam ${startHour} (6 jam lagi). Masih banyak waktu santai buat persiapan.`;
    } else if (leadHours === 3) {
      body = `Ada tugas jam ${startHour} (3 jam lagi). Siapkan hal yang kamu butuhkan ya.`;
    } else {
      body = `Tugas dimulai 1 jam lagi (jam ${startHour}). Selesaikan dulu kegiatanmu sekarang ya.`;
    }
    return { title, body };
  }

  let body = '';
  if (leadHours === 6) {
    body = `Task coming up at ${startHour} (in 6 hours). Plenty of time to prepare comfortably.`;
  } else if (leadHours === 3) {
    body = `Task coming up at ${startHour} (in 3 hours). Ready whatever you need ahead of time.`;
  } else {
    body = `Task starts in 1 hour (at ${startHour}). Wrap up what you're doing and get ready.`;
  }
  return { title, body };
}

/**
 * Builds copy for daily morning Top 3 priority tasks
 */
export function buildTop3DailyReminderCopy(
  top3Tasks: Array<{ title: string }>,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  const count = top3Tasks.length;
  const titles = top3Tasks
    .map((t) => `"${t.title}"`)
    .slice(0, 3)
    .join(', ');

  if (locale === 'id') {
    return {
      title: '3 Tugas Utama Hari Ini',
      body: `Hari ini ada ${count} tugas penting (${titles}). Kerjakan pelan-pelan satu per satu ya.`,
    };
  }
  return {
    title: "Today's Top 3 Tasks",
    body: `You have ${count} key tasks today (${titles}). Take them one step at a time.`,
  };
}

/**
 * Builds copy for daily evening summary at quiet time (or 23:59 fallback)
 */
export function buildDailyQuietTimeSummaryCopy(
  completedCount: number,
  restMinutes: number,
  quietHourStart?: string,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: 'Rekap Hari Ini',
      body: quietHourStart
        ? `${completedCount} tugas selesai hari ini dan kamu sempat istirahat ${restMinutes} menit. Jam istirahat (${quietHourStart}) sudah tiba, selamat beristirahat!`
        : `${completedCount} tugas selesai hari ini dan kamu sempat istirahat ${restMinutes} menit. Sudah jam 23:59, selamat beristirahat!`,
    };
  }
  return {
    title: "Today's Recap",
    body: quietHourStart
      ? `${completedCount} tasks completed today with ${restMinutes}m of rest. Quiet hours (${quietHourStart}) have started, enjoy your rest!`
      : `${completedCount} tasks completed today with ${restMinutes}m of rest. It's 23:59, enjoy your rest!`,
  };
}

/**
 * Builds copy for workload calibration alerts (both overload and low workload)
 */
export function buildWorkloadAlertCopy(
  workloadPercent: number,
  allocatedMinutes: number,
  capacityMinutes: number,
  type: 'high' | 'low' = 'high',
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (type === 'high') {
    if (locale === 'id') {
      return {
        title: 'Jadwal Hari Ini Cukup Padat',
        body: `Waktu kerja sudah terisi ${workloadPercent}% (${allocatedMinutes}/${capacityMinutes} menit). Kalau terasa berat, geser saja sebagian tugas ke besok tanpa rasa bersalah ya.`,
      };
    }
    return {
      title: 'Busy Schedule Today',
      body: `Workload is at ${workloadPercent}% (${allocatedMinutes}/${capacityMinutes}m). Feel free to move some tasks to tomorrow without guilt.`,
    };
  }

  // type === 'low'
  if (locale === 'id') {
    return {
      title: 'Jadwal Hari Ini Masih Longgar',
      body: `Baru terisi ${workloadPercent}% (${allocatedMinutes}/${capacityMinutes} menit). Kamu bisa santai atau pilih tugas lain dari daftar tugas.`,
    };
  }
  return {
    title: 'Light Schedule Today',
    body: `Only at ${workloadPercent}% (${allocatedMinutes}/${capacityMinutes}m). You can relax or pick tasks from your task list.`,
  };
}

/**
 * Builds simple schedule allocation recommendations according to daily workload
 */
export function buildScheduleRecommendationCopy(
  workloadPercent: number,
  allocatedMinutes: number,
  capacityMinutes: number,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    if (workloadPercent > 85) {
      return {
        title: 'Saran Jadwal Hari Ini',
        body: `Hari ini cukup padat (${allocatedMinutes} menit). Sempatkan istirahat sebentar di sela tugas dan hindari menambah tugas baru ya.`,
      };
    }
    if (workloadPercent >= 45) {
      return {
        title: 'Saran Jadwal Hari Ini',
        body: `Jadwal hari ini pas dan seimbang (${allocatedMinutes} menit). Selesaikan tugas utamamu lebih awal ya.`,
      };
    }
    return {
      title: 'Saran Jadwal Hari Ini',
      body: `Jadwal hari ini cukup santai (${allocatedMinutes} menit). Fokus ke 1 hal penting atau manfaatkan buat istirahat.`,
    };
  }

  // English
  if (workloadPercent > 85) {
    return {
      title: 'Schedule Tip',
      body: `Today is quite busy (${allocatedMinutes}m). Take short breathers between tasks and avoid adding new tasks.`,
    };
  }
  if (workloadPercent >= 45) {
    return {
      title: 'Schedule Tip',
      body: `Nicely balanced schedule (${allocatedMinutes}m). Finish your key tasks earlier in the day.`,
    };
  }
  return {
    title: 'Schedule Tip',
    body: `A light day ahead (${allocatedMinutes}m). Focus on 1 key task or enjoy some relaxing downtime.`,
  };
}

export function buildWorkloadWarningCopy(
  workloadPercent: number,
  allocatedMinutes: number,
  capacityMinutes: number,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  return buildWorkloadAlertCopy(workloadPercent, allocatedMinutes, capacityMinutes, 'high', locale);
}

export function buildDailySummaryCopy(
  completedCount: number,
  restMinutes: number,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  return buildDailyQuietTimeSummaryCopy(completedCount, restMinutes, undefined, locale);
}

export function buildRestBufferCopy(
  restMinutes: number,
  locale: 'id' | 'en' = 'en'
): { title: string; body: string } {
  if (locale === 'id') {
    return {
      title: 'Waktunya Istirahat',
      body: `Tugas selesai! Yuk istirahat dulu ${restMinutes} menit biar pikiran segar kembali.`,
    };
  }
  return {
    title: 'Time for a Break',
    body: `Task complete! Take a ${restMinutes}m breather to recharge your mind.`,
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
      title: 'Pengingat Tugas Penting',
      body: startHour
        ? `Tugas "${taskTitle}" dijadwalkan jam ${startHour}. Yuk kerjakan sekarang!`
        : `Tugas "${taskTitle}" perlu diselesaikan hari ini. Kerjakan pelan-pelan ya.`,
    };
  }
  return {
    title: 'Important Task Reminder',
    body: startHour
      ? `Task "${taskTitle}" is scheduled at ${startHour}. Let's work on it now!`
      : `Task "${taskTitle}" is due today. Take it step by step.`,
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
      title: 'Tugas Ditambahkan',
      body: dateOrTime
        ? `Tugas "${taskTitle}" dijadwalkan untuk ${dateOrTime}.`
        : `Tugas "${taskTitle}" sudah masuk ke daftar tugasmu.`,
    };
  }
  return {
    title: 'Task Added',
    body: dateOrTime
      ? `Task "${taskTitle}" scheduled for ${dateOrTime}.`
      : `Task "${taskTitle}" added to your task list.`,
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
      title: 'Tugas Selesai!',
      body: `Mantap! "${taskTitle}" sudah beres. Tarik napas dulu sebelum lanjut ya.`,
    };
  }
  return {
    title: 'Task Done!',
    body: `Well done! "${taskTitle}" is finished. Take a quick breather before moving on.`,
  };
}
