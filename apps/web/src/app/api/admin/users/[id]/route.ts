import { NextResponse } from 'next/server';
import {
  extractTokenFromRequest,
  verifySession,
  getUserDetailForAdmin,
  updateUserRoleByAdmin,
  updateUserOnboardingByAdmin,
  updateUserSubscriptionByAdmin,
} from '../../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Stealth Auth Guard
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const session = await verifySession(token);
  if (!session.valid || !session.user || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'INTERNAL_OPERATOR')) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const { id } = await params;
  const detail = await getUserDetailForAdmin(id);
  if (!detail) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: detail,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Stealth Auth Guard
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const session = await verifySession(token);
  if (!session.valid || !session.user || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'INTERNAL_OPERATOR')) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const { id } = await params;
  const body = await request.json();

  // 1. Role Change (Superadmin only for promoting to Superadmin or changing roles)
  if (body.role !== undefined) {
    if (!['USER', 'INTERNAL_OPERATOR', 'SUPERADMIN'].includes(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    // Only superadmins can assign or demote superadmins
    if ((body.role === 'SUPERADMIN' || session.user.role !== 'SUPERADMIN') && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Superadmin privileges required to modify roles.' }, { status: 403 });
    }
    await updateUserRoleByAdmin(id, body.role);
  }

  // 2. Onboarding Status Override
  if (body.isOnboardingCompleted !== undefined) {
    await updateUserOnboardingByAdmin(id, Boolean(body.isOnboardingCompleted));
  }

  // 3. Subscription Override
  if (body.subscriptionTier !== undefined) {
    if (!['FREE', 'FOUNDERS_PASS', 'PRO_MONTHLY'].includes(body.subscriptionTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }
    await updateUserSubscriptionByAdmin(
      id,
      body.subscriptionTier,
      body.subscriptionExpiresAt,
      body.founderPassClaimNumber
    );
  }

  const updatedDetail = await getUserDetailForAdmin(id);
  return NextResponse.json({
    success: true,
    message: 'Data pengguna berhasil diperbarui.',
    data: updatedDetail,
  });
}
