import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  extractTokenFromRequest,
  verifySession,
  findLocalUserById,
  getCategoriesFromLocalDb,
  createRoleSignature,
} from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Tidak ada sesi aktif. Header otentikasi diperlukan.' },
      { status: 401 }
    );
  }

  const { valid, user, message } = await verifySession(token);
  if (!valid || !user) {
    return NextResponse.json(
      { success: false, message: message || 'Sesi telah berakhir atau tidak valid.' },
      { status: 401 }
    );
  }

  // 1. Try finding full profile from Prisma
  let fullUser: any = null;
  try {
    fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { categories: true },
    });
  } catch {
    // PostgreSQL is offline
  }

  // 2. Fall back to local store
  if (!fullUser) {
    fullUser = findLocalUserById(user.id);
  }

  if (!fullUser) {
    // If not found in either, still return session user
    fullUser = user;
  }

  const isOnboarding = !fullUser.isOnboardingCompleted;
  const start = isOnboarding ? (fullUser.startWorkTime || fullUser.workHourStart || '') : (fullUser.startWorkTime || fullUser.workHourStart || '09:00');
  const end = isOnboarding ? (fullUser.endWorkTime || fullUser.workHourEnd || '') : (fullUser.endWorkTime || fullUser.workHourEnd || '17:00');

  const response = NextResponse.json({
    success: true,
    user: {
      id: fullUser.id,
      name: fullUser.name,
      username: fullUser.username || fullUser.name,
      email: fullUser.email,
      role: fullUser.role || 'USER',
      subscriptionTier: fullUser.subscriptionTier || 'FREE',
      subscriptionExpiresAt: fullUser.subscriptionExpiresAt
        ? typeof fullUser.subscriptionExpiresAt === 'string'
          ? fullUser.subscriptionExpiresAt
          : fullUser.subscriptionExpiresAt.toISOString()
        : null,
      founderPassClaimNumber: fullUser.founderPassClaimNumber ?? null,
      roleArchetype: fullUser.roleArchetype || '',
      occupancy: fullUser.occupancy || fullUser.roleArchetype || '',
      workingRhythm: fullUser.workingRhythm || '',
      schedulingStyle: fullUser.schedulingStyle || '',
      workHoursLimit: fullUser.workHoursLimit || 8.0,
      startWorkTime: start,
      endWorkTime: end,
      workHourStart: start,
      workHourEnd: end,
      dailyCapacityMinutes: fullUser.dailyCapacityMinutes || 480,
      restTimePerTask: fullUser.restTimePerTask ?? 10,
      isOnboardingCompleted: Boolean(fullUser.isOnboardingCompleted),
      categories: Array.isArray(fullUser.categories) && fullUser.categories.length > 0
        ? fullUser.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            colorToken: c.colorToken || c.colorHex,
            isDefault: c.isDefault,
          }))
        : getCategoriesFromLocalDb(user.id),
      provider: 'credentials',
    },
  });

  const userRole = (fullUser.role as string) || 'USER';
  const roleSig = createRoleSignature(userRole, token);
  const thirtyDays = 30 * 24 * 3600;

  response.cookies.set({
    name: 'focient_token',
    value: token,
    httpOnly: false,
    path: '/',
    maxAge: thirtyDays,
    sameSite: 'lax',
  });

  response.cookies.set({
    name: 'focient_role',
    value: userRole,
    httpOnly: false,
    path: '/',
    maxAge: thirtyDays,
    sameSite: 'lax',
  });

  response.cookies.set({
    name: 'focient_role_sig',
    value: roleSig,
    httpOnly: true,
    path: '/',
    maxAge: thirtyDays,
    sameSite: 'lax',
  });

  return response;
}
