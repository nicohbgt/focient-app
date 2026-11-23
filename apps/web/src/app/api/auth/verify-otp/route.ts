import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  hashPassword,
  createSession,
  saveUserToLocalDb,
  findLocalUserByEmail,
  LocalUserRecord,
  isDbAvailable,
  withDbTimeout,
  handleDbError,
} from '../../../../lib/auth-server';
import { verifyAndConsumeOtp } from '../../../../lib/auth-otp-store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, name = '', password = '', roleArchetype = 'General' } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || code.trim().length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP harus berupa 6 digit angka.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    // 1. Verify OTP code
    const verification = await verifyAndConsumeOtp(cleanEmail, code.trim(), 'REGISTRATION');
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.reason || 'Kode OTP tidak valid atau telah kedaluwarsa.' },
        { status: 400 }
      );
    }

    // 2. Query or create real user in PostgreSQL or Local DB
    let user: any = null;
    if (isDbAvailable()) {
      try {
        user = await withDbTimeout(
          prisma.user.findUnique({
            where: { email: cleanEmail },
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

    const hashedPassword = hashPassword(password || 'focient_default_pass_2026');
    const userId = user?.id || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;

    const localUser: LocalUserRecord = {
      id: userId,
      email: cleanEmail,
      name: user?.name || cleanName,
      username: user?.username || cleanName,
      passwordHash: user?.passwordHash || hashedPassword,
      roleArchetype: user?.roleArchetype || '',
      occupancy: user?.occupancy || '',
      workingRhythm: user?.workingRhythm || '',
      schedulingStyle: user?.schedulingStyle || '',
      workHourStart: user?.workHourStart || '',
      workHourEnd: user?.workHourEnd || '',
      startWorkTime: user?.startWorkTime || '',
      endWorkTime: user?.endWorkTime || '',
      dailyCapacityMinutes: user?.dailyCapacityMinutes || 480,
      restTimePerTask: user?.restTimePerTask || 10,
      isOnboardingCompleted: Boolean(user?.isOnboardingCompleted),
      createdAt: user?.createdAt || new Date().toISOString(),
    };

    saveUserToLocalDb(localUser);

    if (!user && isDbAvailable()) {
      try {
        const created = await withDbTimeout(
          prisma.user.create({
            data: {
              name: cleanName,
              email: cleanEmail,
              passwordHash: hashedPassword,
              roleArchetype: '',
              workHourStart: '',
              workHourEnd: '',
              startWorkTime: '',
              endWorkTime: '',
              dailyCapacityMinutes: 480,
              isOnboardingCompleted: false,
            },
          }),
          350
        );
        if (created) user = created;
      } catch (err) {
        handleDbError(err);
      }
    }

    const finalUser = user || localUser;

    // 3. Create Session & Token
    const { token, expiresAt } = await createSession(finalUser.id);

    const userSession = {
      id: finalUser.id,
      name: finalUser.name,
      username: finalUser.username || finalUser.name,
      email: cleanEmail,
      workHourStart: finalUser.startWorkTime || finalUser.workHourStart || '09:00',
      workHourEnd: finalUser.endWorkTime || finalUser.workHourEnd || '17:00',
      startWorkTime: finalUser.startWorkTime || finalUser.workHourStart || '09:00',
      endWorkTime: finalUser.endWorkTime || finalUser.workHourEnd || '17:00',
      dailyCapacityMinutes: finalUser.dailyCapacityMinutes || 480,
      roleArchetype: finalUser.roleArchetype || roleArchetype,
      isOnboardingCompleted: Boolean(finalUser.isOnboardingCompleted),
      provider: 'credentials' as const,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Email berhasil diverifikasi! Selamat datang di FoCient.',
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
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memverifikasi OTP. Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
