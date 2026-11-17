import { NextResponse } from 'next/server';
import { VAPID_PUBLIC_KEY } from '../../../../lib/web-push';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    publicKey: VAPID_PUBLIC_KEY,
  });
}
