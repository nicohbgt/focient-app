import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  extractTokenFromRequest,
  verifySession,
  saveNotificationToLocalDb,
  getNotificationsFromLocalDb,
  markNotificationReadInLocalDb,
  deleteNotificationFromLocalDb,
} from '../../../lib/auth-server';

export const dynamic = 'force-dynamic';

function mapPrismaTypeToCategory(type: string): 'task' | 'workload' | 'summary' | 'rest' {
  switch (type) {
    case 'FOCUS_REMINDER':
      return 'task';
    case 'CAPACITY_WARNING':
      return 'workload';
    case 'DAILY_SUMMARY':
      return 'summary';
    case 'RIPPLE_SUGGESTION':
    default:
      return 'rest';
  }
}

function mapCategoryToPrismaType(category: string): 'FOCUS_REMINDER' | 'CAPACITY_WARNING' | 'DAILY_SUMMARY' | 'RIPPLE_SUGGESTION' {
  switch (category) {
    case 'task':
      return 'FOCUS_REMINDER';
    case 'workload':
      return 'CAPACITY_WARNING';
    case 'summary':
      return 'DAILY_SUMMARY';
    case 'rest':
    default:
      return 'RIPPLE_SUGGESTION';
  }
}

export async function GET(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Header otorisasi Bearer diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user, message } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { success: false, error: message || 'Unauthorized: Sesi tidak valid.' },
        { status: 401 }
      );
    }

    // 1. Try PostgreSQL first
    try {
      const dbNotifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      if (dbNotifications && dbNotifications.length > 0) {
        const notifications = dbNotifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          category: mapPrismaTypeToCategory(n.type),
          createdAt: n.createdAt.toISOString(),
          read: n.isRead,
          actionUrl: n.type === 'CAPACITY_WARNING' ? '/dashboard' : n.type === 'DAILY_SUMMARY' ? '/insights' : '/plan',
          actionLabel: n.type === 'CAPACITY_WARNING' ? 'Reschedule' : n.type === 'DAILY_SUMMARY' ? 'View Insights' : 'View Plan',
        }));

        return NextResponse.json({ success: true, notifications });
      }
    } catch {
      // PostgreSQL is offline
    }

    // 2. Fall back to local persistent store
    const localNotifs = getNotificationsFromLocalDb(user.id);
    const notifications = localNotifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      category: mapPrismaTypeToCategory(n.type),
      createdAt: n.createdAt,
      read: n.isRead,
      actionUrl: n.type === 'CAPACITY_WARNING' ? '/dashboard' : n.type === 'DAILY_SUMMARY' ? '/insights' : '/plan',
      actionLabel: n.type === 'CAPACITY_WARNING' ? 'Reschedule' : n.type === 'DAILY_SUMMARY' ? 'View Insights' : 'View Plan',
    }));

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Header otorisasi Bearer diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user, message } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { success: false, error: message || 'Unauthorized: Sesi tidak valid.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, message: bodyMessage, category } = body;

    if (!title || !bodyMessage) {
      return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 });
    }

    const type = mapCategoryToPrismaType(category);
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const notifPayload = {
      id: notifId,
      userId: user.id,
      title,
      message: bodyMessage,
      type,
      isRead: false,
      createdAt,
    };

    // Always persist to local DB for resilience
    saveNotificationToLocalDb(notifPayload);

    // Also attempt PostgreSQL write
    try {
      const created = await prisma.notification.create({
        data: {
          id: notifId,
          userId: user.id,
          title,
          message: bodyMessage,
          type,
          isRead: false,
        },
      });

      return NextResponse.json({
        success: true,
        notification: {
          id: created.id,
          title: created.title,
          message: created.message,
          category: mapPrismaTypeToCategory(created.type),
          createdAt: created.createdAt.toISOString(),
          read: created.isRead,
          actionUrl: created.type === 'CAPACITY_WARNING' ? '/dashboard' : created.type === 'DAILY_SUMMARY' ? '/insights' : '/plan',
        },
      });
    } catch {
      // Prisma offline: return resilient local notification
      return NextResponse.json({
        success: true,
        notification: {
          id: notifPayload.id,
          title: notifPayload.title,
          message: notifPayload.message,
          category: mapPrismaTypeToCategory(notifPayload.type),
          createdAt: notifPayload.createdAt,
          read: notifPayload.isRead,
          actionUrl: notifPayload.type === 'CAPACITY_WARNING' ? '/dashboard' : notifPayload.type === 'DAILY_SUMMARY' ? '/insights' : '/plan',
        },
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Header otorisasi Bearer diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user, message } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { success: false, error: message || 'Unauthorized: Sesi tidak valid.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, readAll } = body;

    // Update local DB
    markNotificationReadInLocalDb(user.id, id, readAll);

    // Also attempt Prisma
    try {
      if (readAll) {
        await prisma.notification.updateMany({
          where: { userId: user.id, isRead: false },
          data: { isRead: true },
        });
      } else if (id) {
        await prisma.notification.updateMany({
          where: { id, userId: user.id },
          data: { isRead: true },
        });
      }
    } catch {}

    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Header otorisasi Bearer diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user, message } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { success: false, error: message || 'Unauthorized: Sesi tidak valid.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notification ID required' }, { status: 400 });
    }

    // Delete from local DB
    deleteNotificationFromLocalDb(user.id, id);

    // Also attempt Prisma
    try {
      await prisma.notification.deleteMany({
        where: { id, userId: user.id },
      });
    } catch {}

    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 });
  }
}
