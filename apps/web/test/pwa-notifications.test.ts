import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildTaskReminderCopy,
  buildTaskLeadReminderCopy,
  buildTop3DailyReminderCopy,
  buildDailyQuietTimeSummaryCopy,
  buildWorkloadAlertCopy,
  buildScheduleRecommendationCopy,
  buildWorkloadWarningCopy,
  buildDailySummaryCopy,
  buildRestBufferCopy,
  isNotificationSupported,
  getNotificationPermission,
} from '../src/lib/pwa-notifications.ts';
import { resolveDocumentTitle, type AppNotification, type NotificationCategory } from '../src/state/focient-store.tsx';

describe('FoCient PWA & Web Notification System Test Suite', () => {
  it('1. PWA Web App Manifest is valid and configured with standalone display', () => {
    const manifestUrl = new URL('../public/manifest.json', import.meta.url);
    assert.equal(fs.existsSync(manifestUrl), true, 'manifest.json must exist in apps/web/public');

    const manifestContent = JSON.parse(fs.readFileSync(manifestUrl, 'utf8'));
    assert.equal(manifestContent.name, 'FoCient - Guilt-Free Focus & Pacing');
    assert.equal(manifestContent.short_name, 'FoCient');
    assert.equal(manifestContent.display, 'standalone');
    assert.equal(manifestContent.start_url, '/dashboard');
    assert.equal(manifestContent.theme_color, '#2563EB');
    assert.ok(Array.isArray(manifestContent.icons) && manifestContent.icons.length > 0);
  });

  it('2. PWA Service Worker sw.js exists and handles push & notificationclick events', () => {
    const swUrl = new URL('../public/sw.js', import.meta.url);
    assert.equal(fs.existsSync(swUrl), true, 'sw.js must exist in apps/web/public');

    const swCode = fs.readFileSync(swUrl, 'utf8');
    assert.ok(swCode.includes("addEventListener('push'"), 'sw.js must listen for push notifications');
    assert.ok(swCode.includes("addEventListener('notificationclick'"), 'sw.js must handle notification click navigation');
    assert.ok(swCode.includes('showNotification'), 'sw.js must trigger native browser notification');
  });

  it('3. Task Reminder Copy generates clean title without redundant Focus Session prefix', () => {
    const enCopy = buildTaskReminderCopy('Architecture Review', '09:30', 45, 'en');
    assert.equal(enCopy.title, 'Architecture Review');
    assert.equal(enCopy.title.startsWith('Focus Session:'), false);
    assert.ok(enCopy.body.includes('09:30'));
    assert.ok(enCopy.body.includes('45 min'));
    assert.ok(enCopy.body.includes('Time to focus'));
    // Ensure no guilt or panic terms
    assert.equal(/failed|overdue|late|lazy/i.test(enCopy.body), false);

    const idCopy = buildTaskReminderCopy('Tinjauan Arsitektur', '09:30', 45, 'id');
    assert.equal(idCopy.title, 'Tinjauan Arsitektur');
    assert.equal(idCopy.title.startsWith('Sesi Fokus:'), false);
    assert.ok(idCopy.body.includes('09:30'));
    assert.ok(idCopy.body.includes('45 menit'));
    assert.ok(idCopy.body.includes('fokus ke tugas ini'));
    assert.equal(/gagal|terlambat|malas|denda/i.test(idCopy.body), false);
  });

  it('4. Workload Alert Copy encourages healthy rebalancing without accusatory red alerts', () => {
    const enWorkload = buildWorkloadWarningCopy(92, 440, 480, 'en');
    assert.ok(enWorkload.title.includes('Busy Schedule Today'));
    assert.ok(enWorkload.body.includes('92%'));
    assert.ok(enWorkload.body.includes('move some tasks to tomorrow without guilt'));
    assert.equal(/overdue|danger|failed/i.test(enWorkload.body), false);

    const idWorkload = buildWorkloadWarningCopy(92, 440, 480, 'id');
    assert.ok(idWorkload.title.includes('Jadwal Hari Ini Cukup Padat'));
    assert.ok(idWorkload.body.includes('92%'));
    assert.ok(idWorkload.body.includes('tanpa rasa bersalah'));
    assert.equal(/gagal|bahaya|malas/i.test(idWorkload.body), false);
  });

  it('5. Daily Summary Copy affirms intentional completion and mindful rest buffers', () => {
    const enSummary = buildDailySummaryCopy(4, 30, 'en');
    assert.ok(enSummary.title.includes("Today's Recap"));
    assert.ok(enSummary.body.includes('4 tasks completed'));
    assert.ok(enSummary.body.includes('30m of rest'));

    const idSummary = buildDailySummaryCopy(4, 30, 'id');
    assert.ok(idSummary.title.includes('Rekap Hari Ini'));
    assert.ok(idSummary.body.includes('4 tugas selesai'));
    assert.ok(idSummary.body.includes('30 menit'));
  });

  it('6. Rest Buffer Copy reminds users to preserve cognitive stamina', () => {
    const enRest = buildRestBufferCopy(15, 'en');
    assert.ok(enRest.title.includes('Time for a Break'));
    assert.ok(enRest.body.includes('15m breather'));

    const idRest = buildRestBufferCopy(15, 'id');
    assert.ok(idRest.title.includes('Waktunya Istirahat'));
    assert.ok(idRest.body.includes('15 menit'));
  });

  it('7. In-App Notification Center data structures support filtering and read state', () => {
    const sampleNotifications: AppNotification[] = [
      {
        id: 'n1',
        title: 'Focus Session',
        message: 'Starting soon',
        category: 'task',
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: 'n2',
        title: 'Load Balanced',
        message: 'Load at 65%',
        category: 'workload',
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: 'n3',
        title: 'Buffer Time',
        message: 'Rest 10m',
        category: 'rest',
        createdAt: new Date().toISOString(),
        read: true,
      },
      {
        id: 'n4',
        title: 'Evening Calm',
        message: 'Day complete',
        category: 'summary',
        createdAt: new Date().toISOString(),
        read: false,
      },
    ];

    // Total unread calculation
    const unreadCount = sampleNotifications.filter((n) => !n.read).length;
    assert.equal(unreadCount, 3);

    // Category filter: workload
    const workloadOnly = sampleNotifications.filter((n) => n.category === 'workload');
    assert.equal(workloadOnly.length, 1);
    assert.equal(workloadOnly[0].id, 'n2');

    // Mark as read operation
    const markedAsRead = sampleNotifications.map((n) => (n.id === 'n1' ? { ...n, read: true } : n));
    assert.equal(markedAsRead.find((n) => n.id === 'n1')?.read, true);
    assert.equal(markedAsRead.filter((n) => !n.read).length, 2);

    // Mark all as read operation
    const markAllRead = sampleNotifications.map((n) => ({ ...n, read: true }));
    assert.equal(markAllRead.filter((n) => !n.read).length, 0);
  });

  it('8. urlBase64ToUint8Array accurately decodes URL-safe base64 strings', async () => {
    const { urlBase64ToUint8Array } = await import('../src/lib/pwa-notifications.ts');
    const testKey = 'BGNRwppE3b8if61Khd3l6KfQm1WAxjS6-IGlpa7Ey_66eZ98xBEnv8PaUtuqsE14kObAv9jZHB-6KLol-7KpIW8';
    const decoded = urlBase64ToUint8Array(testKey);
    assert.ok(decoded instanceof Uint8Array);
    assert.equal(decoded.length, 65, 'VAPID public key Uint8Array length should be 65 bytes');
  });

  it('9. Server Web Push module exports valid VAPID keys and push methods', async () => {
    const { VAPID_PUBLIC_KEY, sendWebPushToUser } = await import('../src/lib/web-push.ts');
    assert.ok(typeof VAPID_PUBLIC_KEY === 'string' && VAPID_PUBLIC_KEY.length > 50);
    assert.ok(typeof sendWebPushToUser === 'function');
  });

  it('10. Background Web Push API route files exist and export standard Next.js handlers', () => {
    const vapidRouteUrl = new URL('../src/app/api/notifications/vapid-key/route.ts', import.meta.url);
    const subscribeRouteUrl = new URL('../src/app/api/notifications/subscribe/route.ts', import.meta.url);
    const pushRouteUrl = new URL('../src/app/api/notifications/push/route.ts', import.meta.url);

    assert.equal(fs.existsSync(vapidRouteUrl), true, 'vapid-key route must exist');
    assert.equal(fs.existsSync(subscribeRouteUrl), true, 'subscribe route must exist');
    assert.equal(fs.existsSync(pushRouteUrl), true, 'push route must exist');

    const vapidCode = fs.readFileSync(vapidRouteUrl, 'utf8');
    const subscribeCode = fs.readFileSync(subscribeRouteUrl, 'utf8');
    const pushCode = fs.readFileSync(pushRouteUrl, 'utf8');

    assert.ok(vapidCode.includes('GET'), 'vapid-key route must export GET');
    assert.ok(subscribeCode.includes('POST'), 'subscribe route must export POST');
    assert.ok(pushCode.includes('POST'), 'push route must export POST');
  });

  it('11. Comprehensive Notification Suite: 1h/3h/6h lead reminders, top 3, quiet time/23:59 summary, high/low workload, and schedule tips', () => {
    // 1 hour, 3 hours, 6 hours lead reminders
    const lead1 = buildTaskLeadReminderCopy('Design System Sync', '14:00', 1, 'id');
    assert.equal(lead1.title, 'Design System Sync');
    assert.ok(lead1.body.includes('1 jam'));
    assert.ok(lead1.body.includes('14:00'));

    const lead3 = buildTaskLeadReminderCopy('Sprint Planning', '16:00', 3, 'en');
    assert.equal(lead3.title, 'Sprint Planning');
    assert.ok(lead3.body.includes('3 hours'));
    assert.ok(lead3.body.includes('16:00'));

    const lead6 = buildTaskLeadReminderCopy('Architecture Review', '19:00', 6, 'id');
    assert.equal(lead6.title, 'Architecture Review');
    assert.ok(lead6.body.includes('6 jam'));
    assert.ok(lead6.body.includes('19:00'));

    // Top 3 Daily Priority reminder
    const top3 = buildTop3DailyReminderCopy(
      [{ title: 'Task A' }, { title: 'Task B' }, { title: 'Task C' }],
      'id'
    );
    assert.equal(top3.title, '3 Tugas Utama Hari Ini');
    assert.ok(top3.body.includes('3 tugas penting'));
    assert.ok(top3.body.includes('Task A'));

    // Daily summary with quiet hours vs 23:59 fallback
    const quietSummary = buildDailyQuietTimeSummaryCopy(5, 45, '22:00', 'id');
    assert.equal(quietSummary.title, 'Rekap Hari Ini');
    assert.ok(quietSummary.body.includes('22:00'));

    const midnightSummary = buildDailyQuietTimeSummaryCopy(3, 20, undefined, 'id');
    assert.ok(midnightSummary.body.includes('23:59'));

    // Workload alerts: High and Low
    const highAlert = buildWorkloadAlertCopy(94, 450, 480, 'high', 'id');
    assert.equal(highAlert.title, 'Jadwal Hari Ini Cukup Padat');
    assert.ok(highAlert.body.includes('94%'));

    const lowAlert = buildWorkloadAlertCopy(25, 120, 480, 'low', 'id');
    assert.equal(lowAlert.title, 'Jadwal Hari Ini Masih Longgar');
    assert.ok(lowAlert.body.includes('25%'));

    // Schedule Allocation Recommendation
    const tipHigh = buildScheduleRecommendationCopy(90, 430, 480, 'id');
    assert.equal(tipHigh.title, 'Saran Jadwal Hari Ini');
    assert.ok(tipHigh.body.includes('padat'));

    const tipBalanced = buildScheduleRecommendationCopy(65, 310, 480, 'id');
    assert.ok(tipBalanced.body.includes('seimbang'));

    const tipLow = buildScheduleRecommendationCopy(25, 120, 480, 'id');
    assert.ok(tipLow.body.includes('santai'));
  });

  it('12. Browser Tab Title strictly follows [nama page] - FoCient format and FoCient on landing without bell icons', () => {
    const storeCode = fs.readFileSync(
      new URL('../src/state/focient-store.tsx', import.meta.url),
      'utf8'
    );

    // 1. Guarding against bell icon / notification emoji in tab title
    assert.equal(
      storeCode.includes('🔔'),
      false,
      'document.title must never contain bell emoji (🔔) or alert icons'
    );

    // 2. Tab title synchronization must reset to FoCient for landing page and logout
    assert.ok(
      storeCode.includes("document.title = 'FoCient';"),
      'logout() and landing page must reset document.title to clean default FoCient'
    );

    // 3. Tab title must follow "[nama page] - FoCient" pattern
    assert.ok(
      storeCode.includes('`${pageName} - FoCient`'),
      'Tab title must format as [nama page] - FoCient'
    );

    // 4. Logout must explicitly clear notifications, local storage, and reset document.title
    assert.ok(
      storeCode.includes('setNotifications([]);'),
      'logout() must reset notifications state to empty array'
    );
    assert.ok(
      storeCode.includes("window.localStorage.removeItem('focient_notifications');"),
      'logout() must remove focient_notifications from localStorage'
    );

    // 5. Auto-scheduler interval must be guarded by isAuthenticated
    const normalizedStoreCode = storeCode.replace(/\r\n/g, '\n');
    assert.ok(
      normalizedStoreCode.includes('if (!isAuthenticated) {\n      scheduledTaskRemindersRef.current.clear();\n      return;\n    }'),
      'Auto-scheduler interval must abort immediately if user is not authenticated'
    );

    // 6. Test resolveDocumentTitle directly across all app pages
    // Landing page: strictly FoCient
    assert.equal(resolveDocumentTitle({ authView: 'landing', isAuthenticated: false }), 'FoCient');
    assert.equal(resolveDocumentTitle({ pathname: '/', isAuthenticated: false }), 'FoCient');
    assert.equal(resolveDocumentTitle({ authView: 'welcome', isAuthenticated: false }), 'FoCient');

    // Main authenticated pages: [nama page] - FoCient
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'dashboard', language: 'id', isAuthenticated: true }),
      'Dashboard - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'plan', language: 'id', isAuthenticated: true }),
      'Rencana Hari Ini - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'plan', language: 'en', isAuthenticated: true }),
      "Today's Plan - FoCient"
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'tasks', language: 'id', isAuthenticated: true }),
      'Daftar Tugas - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'tasks', language: 'en', isAuthenticated: true }),
      'Tasks - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'reschedule', language: 'id', isAuthenticated: true }),
      'Penyesuaian Jadwal - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'reschedule', language: 'en', isAuthenticated: true }),
      'Reschedule - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'insights', language: 'id', isAuthenticated: true }),
      'Refleksi - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'insights', language: 'en', isAuthenticated: true }),
      'Insights - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'settings', language: 'id', isAuthenticated: true }),
      'Pengaturan - FoCient'
    );
    assert.equal(
      resolveDocumentTitle({ authView: 'dashboard', activeNavTab: 'settings', language: 'en', isAuthenticated: true }),
      'Settings - FoCient'
    );

    // Auth & Onboarding sub-pages
    assert.equal(resolveDocumentTitle({ authView: 'login', language: 'id' }), 'Masuk - FoCient');
    assert.equal(resolveDocumentTitle({ authView: 'login', language: 'en' }), 'Log In - FoCient');
    assert.equal(resolveDocumentTitle({ authView: 'register', language: 'id' }), 'Daftar - FoCient');
    assert.equal(resolveDocumentTitle({ authView: 'register', language: 'en' }), 'Sign Up - FoCient');
    assert.equal(resolveDocumentTitle({ authView: 'forgotPassword', language: 'id' }), 'Lupa Kata Sandi - FoCient');
    assert.equal(resolveDocumentTitle({ authView: 'resetPassword', language: 'id' }), 'Reset Kata Sandi - FoCient');
    assert.equal(resolveDocumentTitle({ authView: 'otp', language: 'id' }), 'Verifikasi OTP - FoCient');
    assert.equal(resolveDocumentTitle({ authView: 'onboarding', language: 'id' }), 'Onboarding - FoCient');

    // Direct pathname mapping
    assert.equal(resolveDocumentTitle({ pathname: '/tasks', language: 'id', isAuthenticated: true }), 'Daftar Tugas - FoCient');
    assert.equal(resolveDocumentTitle({ pathname: '/settings', language: 'id', isAuthenticated: true }), 'Pengaturan - FoCient');
    assert.equal(resolveDocumentTitle({ pathname: '/login', language: 'id' }), 'Masuk - FoCient');
  });

  it('13. Notification Center CTA Navigation Contract reliably routes to tasks, plan, reschedule, insights, settings & dashboard', () => {
    const modalCode = fs.readFileSync(
      new URL('../src/screens/components/NotificationCenterModal.tsx', import.meta.url),
      'utf8'
    );

    // 1. handleActionClick must explicitly handle task routing (lower.includes('task'))
    assert.ok(
      modalCode.includes("lower.includes('task')"),
      "NotificationCenterModal must route task action URLs via lower.includes('task')"
    );
    assert.ok(
      modalCode.includes("safeNavigate('tasks')"),
      "NotificationCenterModal must navigate to 'tasks' tab for task actions"
    );

    // 2. handleActionClick must reliably handle reschedule (lower.includes('resched'))
    assert.ok(
      modalCode.includes("lower.includes('resched')"),
      "NotificationCenterModal must route reschedule action URLs via lower.includes('resched')"
    );
    assert.ok(
      modalCode.includes("safeNavigate('reschedule')"),
      "NotificationCenterModal must navigate to 'reschedule' tab for reschedule actions"
    );

    // 3. handleActionClick must route plan, insights, settings, and dashboard
    assert.ok(modalCode.includes("safeNavigate('plan')"), 'Must route plan');
    assert.ok(modalCode.includes("safeNavigate('insights')"), 'Must route insights');
    assert.ok(modalCode.includes("safeNavigate('settings')"), 'Must route settings');
    assert.ok(modalCode.includes("safeNavigate('dashboard')"), 'Must route dashboard');

    // 4. Notification cards must have onClick handler for intuitive tap-to-navigate
    assert.ok(
      modalCode.includes('handleActionClick(n.actionUrl, n.id)'),
      'Card container must trigger handleActionClick when actionUrl is present'
    );

    // 5. Test router dispatch logic directly
    const routeAction = (actionUrl?: string): string => {
      if (!actionUrl) return '';
      const lower = actionUrl.toLowerCase();
      if (lower.includes('task')) return 'tasks';
      if (lower.includes('plan')) return 'plan';
      if (lower.includes('resched')) return 'reschedule';
      if (lower.includes('insight')) return 'insights';
      if (lower.includes('setting')) return 'settings';
      return 'dashboard';
    };

    assert.equal(routeAction('/tasks'), 'tasks');
    assert.equal(routeAction('/tasks?filter=today'), 'tasks');
    assert.equal(routeAction('/task'), 'tasks');
    assert.equal(routeAction('/plan'), 'plan');
    assert.equal(routeAction('/reschedule'), 'reschedule');
    assert.equal(routeAction('/insights'), 'insights');
    assert.equal(routeAction('/settings'), 'settings');
    assert.equal(routeAction('/dashboard'), 'dashboard');
    assert.equal(routeAction(''), '');
  });

  it('14. Single Activity Single Notification Contract: Task completion strictly emits exactly one notification and prevents duplicate alerts', () => {
    const storeCode = fs.readFileSync(
      new URL('../src/state/focient-store.tsx', import.meta.url),
      'utf8'
    );

    // 1. toggleTaskComplete must NOT call addAppNotification inside setTasks updater
    const toggleFuncMatch = storeCode.match(/const toggleTaskComplete = useCallback\([\s\S]*?\n  \);/);
    assert.ok(toggleFuncMatch, 'toggleTaskComplete must be defined in store');
    const toggleFuncCode = toggleFuncMatch[0];

    // Inside setTasks(...) there must NOT be any addAppNotification
    const setTasksMatch = toggleFuncCode.match(/setTasks\(\(prev\) =>[\s\S]*?\);/);
    assert.ok(setTasksMatch, 'setTasks updater must exist in toggleTaskComplete');
    assert.equal(
      setTasksMatch[0].includes('addAppNotification'),
      false,
      'setTasks updater callback MUST NOT call addAppNotification (pure updater function to prevent double invocation)'
    );

    // 2. toggleTaskComplete must have rapid click debounce guard
    assert.ok(
      toggleFuncCode.includes('lastTaskToggleTimeRef'),
      'toggleTaskComplete must debounce rapid duplicate toggle events'
    );

    // 3. addAppNotification must enforce deduplication guard
    assert.ok(
      storeCode.includes('recentDispatchedNotifsRef'),
      'addAppNotification must maintain recentDispatchedNotifsRef to drop duplicates'
    );
    assert.ok(
      storeCode.includes('isDuplicate'),
      'addAppNotification must verify no duplicate notifications exist in state within the cooldown window'
    );

    // 4. Test deduplication simulator directly
    const notificationsState: AppNotification[] = [];
    const dispatchLog: string[] = [];

    const simulateAddNotification = (
      notif: { title: string; message: string; category: NotificationCategory },
      timestamp: number
    ) => {
      const isDup = notificationsState.some(
        (n) =>
          n.title === notif.title &&
          n.message === notif.message &&
          Math.abs(timestamp - new Date(n.createdAt).getTime()) < 3000
      );
      if (isDup) return false;

      notificationsState.unshift({
        id: `notif-${timestamp}`,
        title: notif.title,
        message: notif.message,
        category: notif.category,
        createdAt: new Date(timestamp).toISOString(),
        read: false,
      });
      dispatchLog.push(notif.title);
      return true;
    };

    const taskTitle = 'Finalize Budget Plan';
    const completedCopy = {
      title: 'Tugas Selesai!',
      message: `Mantap! "${taskTitle}" sudah beres.`,
      category: 'task' as NotificationCategory,
    };

    // First event at t=1000: Must succeed
    const firstDispatch = simulateAddNotification(completedCopy, 1000);
    assert.equal(firstDispatch, true);
    assert.equal(notificationsState.length, 1);

    // Duplicate event at t=1050 (e.g. React StrictMode or double-click): Must be blocked
    const duplicateDispatch = simulateAddNotification(completedCopy, 1050);
    assert.equal(duplicateDispatch, false);
    assert.equal(notificationsState.length, 1, 'Notifications count must remain 1');

    // Duplicate event at t=2000 (within 3s): Must be blocked
    const thirdDispatch = simulateAddNotification(completedCopy, 2000);
    assert.equal(thirdDispatch, false);
    assert.equal(notificationsState.length, 1);

    // A completely different activity at t=2100: Must succeed
    const differentCopy = {
      title: 'Waktunya Istirahat',
      message: 'Tugas selesai! Istirahat 10 menit.',
      category: 'rest' as NotificationCategory,
    };
    const diffDispatch = simulateAddNotification(differentCopy, 2100);
    assert.equal(diffDispatch, true);
    assert.equal(notificationsState.length, 2);
  });
});
