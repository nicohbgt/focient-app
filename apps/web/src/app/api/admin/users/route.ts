import { NextResponse } from 'next/server';
import {
  extractTokenFromRequest,
  verifySession,
  getAllUsersForAdmin,
} from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Stealth Auth Guard
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const session = await verifySession(token);
  if (!session.valid || !session.user || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'INTERNAL_OPERATOR')) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const roleFilter = searchParams.get('role');
    const tierFilter = searchParams.get('tier');
    const onboardingFilter = searchParams.get('onboarding');

    let users = await getAllUsersForAdmin();

    // Apply Filters
    if (query) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.username && u.username.toLowerCase().includes(query)) ||
          (u.roleArchetype && u.roleArchetype.toLowerCase().includes(query))
      );
    }

    if (roleFilter && roleFilter !== 'ALL') {
      users = users.filter((u) => u.role === roleFilter);
    }

    if (tierFilter && tierFilter !== 'ALL') {
      users = users.filter((u) => u.subscriptionTier === tierFilter);
    }

    if (onboardingFilter && onboardingFilter !== 'ALL') {
      const isCompleted = onboardingFilter === 'COMPLETED';
      users = users.filter((u) => u.isOnboardingCompleted === isCompleted);
    }

    return NextResponse.json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
