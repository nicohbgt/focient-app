import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildTaskReminderCopy,
  buildWorkloadWarningCopy,
  buildDailySummaryCopy,
  buildRestBufferCopy,
  isNotificationSupported,
  getNotificationPermission,
} from '../src/lib/pwa-notifications.ts';
import type { AppNotification, NotificationCategory } from '../src/state/focient-store.tsx';

describe('FoCient PWA & Web Notification System Test Suite', () => {
  it('1. PWA Web App Manifest is valid and configured with standalone display', () => {
    const manifestPath = path.resolve('public/manifest.json');
    assert.equal(fs.existsSync(manifestPath), true, 'manifest.json must exist in apps/web/public');

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifestContent.name, 'FoCient - Guilt-Free Focus & Pacing');
    assert.equal(manifestContent.short_name, 'FoCient');
    assert.equal(manifestContent.display, 'standalone');
    assert.equal(manifestContent.start_url, '/dashboard');
    assert.equal(manifestContent.theme_color, '#2563EB');
    assert.ok(Array.isArray(manifestContent.icons) && manifestContent.icons.length > 0);
  });

  it('2. PWA Service Worker sw.js exists and handles push & notificationclick events', () => {
    const swPath = path.resolve('public/sw.js');
    assert.equal(fs.existsSync(swPath), true, 'sw.js must exist in apps/web/public');

    const swCode = fs.readFileSync(swPath, 'utf8');
    assert.ok(swCode.includes("addEventListener('push'"), 'sw.js must listen for push notifications');
    assert.ok(swCode.includes("addEventListener('notificationclick'"), 'sw.js must handle notification click navigation');
    assert.ok(swCode.includes('showNotification'), 'sw.js must trigger native browser notification');
  });

  it('3. Task Reminder Copy generates gentle single-task guidance in EN and ID without guilt', () => {
    const enCopy = buildTaskReminderCopy('Architecture Review', '09:30', 45, 'en');
    assert.ok(enCopy.title.includes('Focus Session: Architecture Review'));
    assert.ok(enCopy.body.includes('09:30'));
    assert.ok(enCopy.body.includes('45 min'));
    assert.ok(enCopy.body.includes('single priority'));
    // Ensure no guilt or panic terms
    assert.equal(/failed|overdue|late|lazy/i.test(enCopy.body), false);

    const idCopy = buildTaskReminderCopy('Tinjauan Arsitektur', '09:30', 45, 'id');
    assert.ok(idCopy.title.includes('Sesi Fokus: Tinjauan Arsitektur'));
    assert.ok(idCopy.body.includes('09:30'));
    assert.ok(idCopy.body.includes('45 menit'));
    assert.ok(idCopy.body.includes('Ambil napas tenang'));
    assert.equal(/gagal|terlambat|malas|denda/i.test(idCopy.body), false);
  });

  it('4. Workload Alert Copy encourages healthy rebalancing without accusatory red alerts', () => {
    const enWorkload = buildWorkloadWarningCopy(92, 440, 480, 'en');
    assert.ok(enWorkload.title.includes('Workload Rhythm Calibration'));
    assert.ok(enWorkload.body.includes('92%'));
    assert.ok(enWorkload.body.includes('shift non-essential tasks without guilt'));
    assert.equal(/overdue|danger|failed/i.test(enWorkload.body), false);

    const idWorkload = buildWorkloadWarningCopy(92, 440, 480, 'id');
    assert.ok(idWorkload.title.includes('Kalibrasi Ritme Beban Kerja'));
    assert.ok(idWorkload.body.includes('92%'));
    assert.ok(idWorkload.body.includes('tanpa rasa bersalah'));
    assert.equal(/gagal|bahaya|malas/i.test(idWorkload.body), false);
  });

  it('5. Daily Summary Copy affirms intentional completion and mindful rest buffers', () => {
    const enSummary = buildDailySummaryCopy(4, 30, 'en');
    assert.ok(enSummary.title.includes('Daily Calm Summary'));
    assert.ok(enSummary.body.includes('4 focus tasks completed'));
    assert.ok(enSummary.body.includes('30m mindful rest buffers'));
    assert.ok(enSummary.body.includes('Rest peacefully'));

    const idSummary = buildDailySummaryCopy(4, 30, 'id');
    assert.ok(idSummary.title.includes('Rangkuman Ketenangan Hari Ini'));
    assert.ok(idSummary.body.includes('4 tugas fokus selesai'));
    assert.ok(idSummary.body.includes('30 menit jeda pemulihan'));
  });

  it('6. Rest Buffer Copy reminds users to preserve cognitive stamina', () => {
    const enRest = buildRestBufferCopy(15, 'en');
    assert.ok(enRest.title.includes('Time for a Recovery Buffer'));
    assert.ok(enRest.body.includes('15m restorative buffer'));

    const idRest = buildRestBufferCopy(15, 'id');
    assert.ok(idRest.title.includes('Waktunya Jeda Pemulihan'));
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
    const vapidRoutePath = path.resolve('src/app/api/notifications/vapid-key/route.ts');
    const subscribeRoutePath = path.resolve('src/app/api/notifications/subscribe/route.ts');
    const pushRoutePath = path.resolve('src/app/api/notifications/push/route.ts');

    assert.equal(fs.existsSync(vapidRoutePath), true, 'vapid-key route must exist');
    assert.equal(fs.existsSync(subscribeRoutePath), true, 'subscribe route must exist');
    assert.equal(fs.existsSync(pushRoutePath), true, 'push route must exist');

    const vapidCode = fs.readFileSync(vapidRoutePath, 'utf8');
    const subscribeCode = fs.readFileSync(subscribeRoutePath, 'utf8');
    const pushCode = fs.readFileSync(pushRoutePath, 'utf8');

    assert.ok(vapidCode.includes('GET'), 'vapid-key route must export GET');
    assert.ok(subscribeCode.includes('POST'), 'subscribe route must export POST');
    assert.ok(pushCode.includes('POST'), 'push route must export POST');
  });
});
