/**
 * FoCient PWA Service Worker
 * Handles background push notifications, notification clicks, and responsive reminders.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification event listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'FoCient Focus Reminder',
    body: 'Time to calibrate your focus rhythm.',
    icon: '/brand/focient-logo.png',
    badge: '/brand/focient-logo.png',
    url: '/dashboard',
    tag: 'focient-notification',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/brand/focient-logo.png',
    badge: data.badge || '/brand/focient-logo.png',
    tag: data.tag || 'focient-notification',
    data: {
      url: data.url || '/dashboard',
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open FoCient' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Message listener from foreground web client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, url, tag, icon } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: icon || '/brand/focient-logo.png',
      badge: '/brand/focient-logo.png',
      tag: tag || 'focient-reminder',
      data: { url: url || '/dashboard' },
      vibrate: [80, 40, 80],
    });
  }
});
