import { createRequire } from 'node:module';
import { prisma } from '@focient/database';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const webpush = require('web-push');

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  'BGNRwppE3b8if61Khd3l6KfQm1WAxjS6-IGlpa7Ey_66eZ98xBEnv8PaUtuqsE14kObAv9jZHB-6KLol-7KpIW8';

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  '2B_SaZbe3RBFT4yJQzxt0R1IB5o9ZW5Q6eqhpoilAY4';

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:support@focient.dev';

// Configure Web Push with VAPID details
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('[WebPush] Failed to initialize VAPID credentials:', e);
}

export interface StoredPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  userAgent?: string;
}

function getLocalDbPaths(): string[] {
  const paths = new Set<string>();
  paths.add(path.join(process.cwd(), '.focient_local_auth_db.json'));
  paths.add(path.join(process.cwd(), 'apps', 'web', '.focient_local_auth_db.json'));
  const parent = path.resolve(process.cwd(), '..', '.focient_local_auth_db.json');
  if (fs.existsSync(parent)) paths.add(parent);
  return Array.from(paths);
}

function readLocalDb(): any {
  let merged: any = { users: [], sessions: [], webPushSubscriptions: [] };
  const allSubs: any[] = [];
  const seenEndpoints = new Set<string>();

  for (const p of getLocalDbPaths()) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (Array.isArray(data.webPushSubscriptions)) {
          for (const s of data.webPushSubscriptions) {
            if (s?.endpoint && !seenEndpoints.has(s.endpoint)) {
              allSubs.push(s);
              seenEndpoints.add(s.endpoint);
            }
          }
        }
        if (Array.isArray(data.users) && data.users.length > 0 && merged.users.length === 0) {
          merged.users = data.users;
        }
        if (Array.isArray(data.sessions) && data.sessions.length > 0 && merged.sessions.length === 0) {
          merged.sessions = data.sessions;
        }
      } catch {
        // continue
      }
    }
  }
  merged.webPushSubscriptions = allSubs;
  return merged;
}

function writeLocalDb(data: any): void {
  for (const p of getLocalDbPaths()) {
    try {
      fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // continue
    }
  }
}

/**
 * Saves a browser Web Push subscription for a user (supporting both Prisma & local JSON fallback)
 */
export async function savePushSubscription(
  userId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  userAgent?: string
): Promise<boolean> {
  let savedInPrisma = false;

  try {
    if (process.env.DATABASE_URL) {
      await prisma.deviceToken.upsert({
        where: { token: subscription.endpoint },
        create: {
          userId,
          token: subscription.endpoint,
          platform: 'WEB',
          deviceInfo: JSON.stringify({
            keys: subscription.keys,
            userAgent: userAgent || 'Browser PWA',
          }),
        },
        update: {
          userId,
          platform: 'WEB',
          deviceInfo: JSON.stringify({
            keys: subscription.keys,
            userAgent: userAgent || 'Browser PWA',
          }),
          updatedAt: new Date(),
        },
      });
      savedInPrisma = true;
    }
  } catch (err) {
    // fallback to local file
  }

  // Always mirror to local DB for reliability in test & dev environments
  try {
    const db = readLocalDb();
    if (!Array.isArray(db.webPushSubscriptions)) {
      db.webPushSubscriptions = [];
    }
    const filtered = db.webPushSubscriptions.filter(
      (s: any) => s.endpoint !== subscription.endpoint
    );
    filtered.push({
      id: `sub_${Date.now()}`,
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: userAgent || 'Browser PWA',
      createdAt: new Date().toISOString(),
    });
    db.webPushSubscriptions = filtered;
    writeLocalDb(db);
    return true;
  } catch {
    return savedInPrisma;
  }
}

/**
 * Retrieves all valid Web Push subscriptions for a given user
 */
export async function getUserPushSubscriptions(
  userId: string
): Promise<StoredPushSubscription[]> {
  const results: StoredPushSubscription[] = [];
  const seenEndpoints = new Set<string>();

  // 1. Try Prisma DB
  try {
    if (process.env.DATABASE_URL) {
      const records = await prisma.deviceToken.findMany({
        where: { userId, platform: 'WEB' },
      });
      for (const r of records) {
        if (r.deviceInfo) {
          try {
            const parsed = JSON.parse(r.deviceInfo);
            if (parsed.keys?.p256dh && parsed.keys?.auth) {
              results.push({
                endpoint: r.token,
                keys: parsed.keys,
                userId: r.userId,
                userAgent: parsed.userAgent,
              });
              seenEndpoints.add(r.token);
            }
          } catch {
            // invalid JSON
          }
        }
      }
    }
  } catch {
    // fallback
  }

  // 2. Try Local DB
  try {
    const db = readLocalDb();
    if (Array.isArray(db.webPushSubscriptions)) {
      for (const s of db.webPushSubscriptions) {
        if (s.userId === userId && !seenEndpoints.has(s.endpoint)) {
          if (s.keys?.p256dh && s.keys?.auth) {
            results.push({
              endpoint: s.endpoint,
              keys: s.keys,
              userId: s.userId,
              userAgent: s.userAgent,
            });
            seenEndpoints.add(s.endpoint);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return results;
}

/**
 * Removes a dead / expired subscription from both stores
 */
export async function removePushSubscription(endpoint: string): Promise<void> {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.deviceToken.deleteMany({
        where: { token: endpoint },
      });
    }
  } catch {
    // ignore
  }

  try {
    const db = readLocalDb();
    if (Array.isArray(db.webPushSubscriptions)) {
      db.webPushSubscriptions = db.webPushSubscriptions.filter(
        (s: any) => s.endpoint !== endpoint
      );
      writeLocalDb(db);
    }
  } catch {
    // ignore
  }
}

export interface WebPushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  category?: 'task' | 'workload' | 'summary' | 'rest';
  timestamp?: number;
}

/**
 * Retrieves all registered Web Push subscriptions across all users and local guest devices
 */
export async function getAllPushSubscriptions(): Promise<StoredPushSubscription[]> {
  const results: StoredPushSubscription[] = [];
  const seenEndpoints = new Set<string>();

  // 1. Try Prisma DB
  try {
    if (process.env.DATABASE_URL) {
      const records = await prisma.deviceToken.findMany({
        where: { platform: 'WEB' },
      });
      for (const r of records) {
        if (r.deviceInfo) {
          try {
            const parsed = JSON.parse(r.deviceInfo);
            if (parsed.keys?.p256dh && parsed.keys?.auth) {
              results.push({
                endpoint: r.token,
                keys: parsed.keys,
                userId: r.userId,
                userAgent: parsed.userAgent,
              });
              seenEndpoints.add(r.token);
            }
          } catch {
            // invalid JSON
          }
        }
      }
    }
  } catch {
    // fallback
  }

  // 2. Try Local DB
  try {
    const db = readLocalDb();
    if (Array.isArray(db.webPushSubscriptions)) {
      for (const s of db.webPushSubscriptions) {
        if (!seenEndpoints.has(s.endpoint)) {
          if (s.keys?.p256dh && s.keys?.auth) {
            results.push({
              endpoint: s.endpoint,
              keys: s.keys,
              userId: s.userId,
              userAgent: s.userAgent,
            });
            seenEndpoints.add(s.endpoint);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return results;
}

/**
 * Sends a native Web Push notification to all active devices (broadcast / testing).
 */
export async function sendWebPushBroadcast(
  payload: WebPushNotificationPayload
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const subscriptions = await getAllPushSubscriptions();
  if (subscriptions.length === 0) {
    return { success: true, sentCount: 0, errors: [] };
  }

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/brand/focient-logo.png',
    badge: payload.badge || '/brand/focient-logo.png',
    url: payload.url || '/dashboard',
    tag: payload.tag || 'focient-notification',
    timestamp: payload.timestamp || Date.now(),
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payloadString
      );
      sentCount++;
    } catch (err: any) {
      errors.push(err.message || 'Push delivery failed');
      if (err.statusCode === 404 || err.statusCode === 410) {
        await removePushSubscription(sub.endpoint);
      }
    }
  }

  return {
    success: sentCount > 0 || subscriptions.length === 0,
    sentCount,
    errors,
  };
}

/**
 * Sends a native Web Push notification to all active devices of a user.
 * Even if the browser or PWA is completely closed, the OS will receive the push!
 */
export async function sendWebPushToUser(
  userId: string,
  payload: WebPushNotificationPayload
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const subscriptions = await getUserPushSubscriptions(userId);
  if (subscriptions.length === 0) {
    return { success: true, sentCount: 0, errors: [] };
  }

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/brand/focient-logo.png',
    badge: payload.badge || '/brand/focient-logo.png',
    url: payload.url || '/dashboard',
    tag: payload.tag || 'focient-notification',
    timestamp: payload.timestamp || Date.now(),
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payloadString
      );
      sentCount++;
    } catch (err: any) {
      errors.push(err.message || 'Push delivery failed');
      // 404 or 410 means subscription expired or uninstalled
      if (err.statusCode === 404 || err.statusCode === 410) {
        await removePushSubscription(sub.endpoint);
      }
    }
  }

  return {
    success: sentCount > 0 || subscriptions.length === 0,
    sentCount,
    errors,
  };
}
