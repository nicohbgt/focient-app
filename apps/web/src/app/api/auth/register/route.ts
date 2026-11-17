import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  hashPassword,
  createSession,
  saveUserToLocalDb,
  findLocalUserByEmail,
  deleteLocalUserByEmail,
  LocalUserRecord,
} from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password = '', roleArchetype = 'Software Engineer' } = body;

    // 1. Validation Contracts
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Nama minimal harus 2 karakter.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const url = new URL(request.url);
    const isOverwriteRequested = Boolean(body.overwrite) || url.searchParams.get('overwrite') === 'true';
    const isDev = process.env.NODE_ENV !== 'production';

    // 2. Check if user already exists (Gunakan union '| any | null' untuk mencegah inferensi never)
    let existingUser: any = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch {
      // PostgreSQL offline in local dev mode
      existingUser = findLocalUserByEmail(cleanEmail);
    }

    if (existingUser) {
      if (isDev && isOverwriteRequested) {
        // Dev Mode: Automatically overwrite & clean existing user
        try {
          const targetId = existingUser.id;
          if (targetId) {
            await prisma.$transaction([
              prisma.task.deleteMany({ where: { userId: targetId } }),
              prisma.category.deleteMany({ where: { userId: targetId } }),
              prisma.scheduleBlock.deleteMany({ where: { userId: targetId } }),
              prisma.workloadDaily.deleteMany({ where: { userId: targetId } }),
              prisma.activityLog.deleteMany({ where: { userId: targetId } }),
              prisma.rescheduleAuditLog.deleteMany({ where: { userId: targetId } }),
              prisma.rescheduleLog.deleteMany({ where: { userId: targetId } }),
              prisma.notification.deleteMany({ where: { userId: targetId } }),
              prisma.session.deleteMany({ where: { userId: targetId } }),
              prisma.deviceToken.deleteMany({ where: { userId: targetId } }),
              prisma.user.delete({ where: { id: targetId } }),
            ]).catch(async () => {
              await prisma.user.delete({ where: { id: targetId } }).catch(() => {});
            });
          }
        } catch (_) {}
        deleteLocalUserByEmail(cleanEmail);
      } else {
        return NextResponse.json(
          {
            success: false,
            message: 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.',
            canOverwrite: isDev,
          },
          { status: 409 }
        );
      }
    }

    // 3. Create Real User
    const hashedPassword = hashPassword(password);
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;

    const localUser: LocalUserRecord = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      username: cleanName,
      passwordHash: hashedPassword,
      roleArchetype: roleArchetype || '',
      occupancy: '',
      workingRhythm: '',
      schedulingStyle: '',
      workHourStart: '',
      workHourEnd: '',
      startWorkTime: '',
      endWorkTime: '',
      dailyCapacityMinutes: 480,
      restTimePerTask: 10,
      isOnboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };

    // Always persist to local file DB for resilient offline dev
    saveUserToLocalDb(localUser);

    // Also attempt PostgreSQL write
    let finalId = userId;
    try {
      const dbUser = await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          passwordHash: hashedPassword,
          roleArchetype: roleArchetype || '',
          workHourStart: '',
          workHourEnd: '',
          startWorkTime: '',
          endWorkTime: '',
          dailyCapacityMinutes: 480,
          isOnboardingCompleted: false,
        },
      });
      finalId = dbUser.id;
      localUser.id = finalId;
      saveUserToLocalDb(localUser);
    } catch {
      console.warn('Prisma user creation skipped (local fallback used)');
    }

    // 4. Create Real Session & Token
    const { token, expiresAt } = await createSession(finalId);

    const userSession = {
      id: finalId,
      name: cleanName,
      username: cleanName,
      email: cleanEmail,
      workHourStart: '',
      workHourEnd: '',
      startWorkTime: '',
      endWorkTime: '',
      dailyCapacityMinutes: 480,
      roleArchetype: roleArchetype || '',
      occupancy: '',
      workingRhythm: '',
      schedulingStyle: '',
      restTimePerTask: 10,
      isOnboardingCompleted: false,
      provider: 'credentials' as const,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Selamat datang di FoCient.',
      user: userSession,
      token,
      isNewUser: true,
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
    console.error('Registration API unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pendaftaran. Silakan periksa kembali data Anda.' },
      { status: 400 }
    );
  }
}
