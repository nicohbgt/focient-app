import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifySession } from '../../../../lib/auth-server';
import {
  savePushSubscription,
  getUserPushSubscriptions,
  getAllPushSubscriptions,
  removePushSubscription,
} from '../../../../lib/web-push';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    let userId: string | null = null;

    if (token) {
      const { valid, user } = await verifySession(token);
      if (valid && user) {
        userId = user.id;
      }
    }

    const subscriptions = userId
      ? await getUserPushSubscriptions(userId)
      : await getAllPushSubscriptions();

    return NextResponse.json({
      success: true,
      hasActiveSubscription: subscriptions.length > 0,
      subscriptionCount: subscriptions.length,
    });
  } catch (error) {
    console.error('[WebPush Subscribe GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to query push subscription status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    let userId = 'guest-user';

    if (token) {
      const { valid, user } = await verifySession(token);
      if (valid && user) {
        userId = user.id;
      }
    }

    const body = await request.json().catch(() => ({}));
    const { endpoint, keys, guestUserId } = body || {};

    if (guestUserId && userId === 'guest-user') {
      userId = guestUserId;
    }

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format langganan push tidak valid (endpoint, p256dh, dan auth diperlukan).',
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || 'Browser PWA';
    const saved = await savePushSubscription(
      userId,
      { endpoint, keys },
      userAgent
    );

    return NextResponse.json({
      success: saved,
      userId,
      message: saved
        ? 'Langganan Web Push berhasil didaftarkan.'
        : 'Gagal menyimpan langganan Web Push.',
    });
  } catch (error) {
    console.error('[WebPush Subscribe POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process push subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Parameter endpoint diperlukan.' },
        { status: 400 }
      );
    }

    await removePushSubscription(endpoint);
    return NextResponse.json({
      success: true,
      message: 'Langganan Web Push berhasil dihapus.',
    });
  } catch (error) {
    console.error('[WebPush Subscribe DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete push subscription' },
      { status: 500 }
    );
  }
}
