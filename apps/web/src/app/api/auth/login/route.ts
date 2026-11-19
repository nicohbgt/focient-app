import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  verifyPassword,
  createSession,
  findLocalUserByEmail,
  findLocalUserById,
  saveUserToLocalDb,
  getCategoriesFromLocalDb,
  isDbAvailable,
  withDbTimeout,
  handleDbError,
} from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password = '' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Query User from Database or Local Store
    let user: any = null;
    if (isDbAvailable()) {
      try {
        user = await withDbTimeout(
          prisma.user.findUnique({
            where: { email: cleanEmail },
            include: { categories: true },
          }),
          350
        );
      } catch (err) {
        handleDbError(err);
      }
    }

    if (!user) {
      user = findLocalUserByEmail(cleanEmail);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak cocok.' },
        { status: 401 }
      );
    }

    // 2. Validate Password
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak cocok.' },
        { status: 401 }
      );
    }

    // 3. Create Real Session & Token
    const { token, expiresAt } = await createSession(user.id);

    const isOnboardingCompleted = Boolean(user.isOnboardingCompleted);
    const start = isOnboardingCompleted ? (user.startWorkTime || user.workHourStart || '09:00') : (user.startWorkTime || user.workHourStart || '');
    const end = isOnboardingCompleted ? (user.endWorkTime || user.workHourEnd || '17:00') : (user.endWorkTime || user.workHourEnd || '');
    const userCategories = (user.categories && user.categories.length > 0)
      ? user.categories
      : getCategoriesFromLocalDb(user.id);

    const userSession = {
      id: user.id,
      name: user.name,
      username: user.username || user.name,
      email: user.email,
      workHourStart: start,
      workHourEnd: end,
      startWorkTime: start,
      endWorkTime: end,
      dailyCapacityMinutes: user.dailyCapacityMinutes || 480,
      roleArchetype: user.roleArchetype || '',
      occupancy: user.occupancy || user.roleArchetype || '',
      workingRhythm: user.workingRhythm || '',
      schedulingStyle: user.schedulingStyle || '',
      restTimePerTask: user.restTimePerTask ?? 10,
      weekStartDay: (user as any).weekStartDay || 'monday',
      isOnboardingCompleted,
      categories: userCategories,
      provider: 'credentials' as const,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Berhasil masuk.',
      user: userSession,
      categories: userCategories,
      token,
    });

    response.cookies.set({
      name: 'focient_token',
      value: token,
      httpOnly: false,
      path: '/',
      expires: expiresAt,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat proses masuk. Silakan coba beberapa saat lagi.' },
      { status: 500 }
    );
  }
}
