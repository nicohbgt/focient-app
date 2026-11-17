import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifySession } from '../../../../lib/auth-server';
import { sendWebPushToUser, sendWebPushBroadcast } from '../../../../lib/web-push';
import { prisma } from '@focient/database';

export const dynamic = 'force-dynamic';

function mapCategoryToPrismaType(
  category?: string
): 'FOCUS_REMINDER' | 'CAPACITY_WARNING' | 'DAILY_SUMMARY' | 'RIPPLE_SUGGESTION' {
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

export async function POST(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    let userId: string | null = null;

    if (token) {
      const { valid, user } = await verifySession(token);
      if (valid && user) {
        userId = user.id;
      }
    }

    const body = await request.json().catch(() => ({}));
    const { title, body: pushBody, url, tag, category, targetUserId } = body || {};

    if (!title || !pushBody) {
      return NextResponse.json(
        { success: false, error: 'Parameter title dan body diperlukan.' },
        { status: 400 }
      );
    }

    const effectiveUserId = targetUserId || userId;

    // 1. Dispatch native Web Push
    let pushResult;
    if (effectiveUserId) {
      pushResult = await sendWebPushToUser(effectiveUserId, {
        title,
        body: pushBody,
        url: url || '/dashboard',
        tag: tag || 'focient-alert',
        category: category || 'task',
      });

      // If user has 0 devices (e.g. tested before logging in), fallback to broadcast
      if (pushResult.sentCount === 0) {
        const broadcastResult = await sendWebPushBroadcast({
          title,
          body: pushBody,
          url: url || '/dashboard',
          tag: tag || 'focient-alert',
          category: category || 'task',
        });
        if (broadcastResult.sentCount > 0) {
          pushResult = broadcastResult;
        }
      }
    } else {
      // Direct PowerShell / curl / external test without token: broadcast to all active local devices
      pushResult = await sendWebPushBroadcast({
        title,
        body: pushBody,
        url: url || '/dashboard',
        tag: tag || 'focient-alert',
        category: category || 'task',
      });
    }

    // 2. Also record in in-app notification DB if available
    if (effectiveUserId) {
      try {
        if (process.env.DATABASE_URL) {
          await prisma.notification.create({
            data: {
              userId: effectiveUserId,
              title,
              message: pushBody,
              type: mapCategoryToPrismaType(category),
              isRead: false,
            },
          });
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: pushResult.success,
      sentCount: pushResult.sentCount,
      errors: pushResult.errors,
      message:
        pushResult.sentCount > 0
          ? `Notifikasi Web Push terkirim ke ${pushResult.sentCount} perangkat.`
          : 'Belum ada perangkat terdaftar yang menerima push (buka browser di http://localhost:3000 dan klik "Izinkan Notifikasi" terlebih dahulu).',
    });
  } catch (error) {
    console.error('[WebPush POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dispatch push notification' },
      { status: 500 }
    );
  }
}
