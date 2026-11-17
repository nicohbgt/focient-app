import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import { hashPassword, createSession } from '../../../../lib/auth-server';
import { verifyAndConsumeOtp } from '../../../../lib/auth-otp-store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, name = '', password = '', roleArchetype = 'Software Engineer' } = body;

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

    // 2. Check or create real user in PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const hashedPassword = hashPassword(password || 'focient_default_pass_2026');
      user = await prisma.user.create({
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
      });
    }

    // 3. Create Session & Token in PostgreSQL
    const { token, expiresAt } = await createSession(user.id);

    const userSession = {
      id: user.id,
      name: user.name,
      username: user.name,
      email: cleanEmail,
      workHourStart: user.startWorkTime || user.workHourStart || '09:00',
      workHourEnd: user.endWorkTime || user.workHourEnd || '17:00',
      startWorkTime: user.startWorkTime || user.workHourStart || '09:00',
      endWorkTime: user.endWorkTime || user.workHourEnd || '17:00',
      dailyCapacityMinutes: user.dailyCapacityMinutes || 480,
      roleArchetype: user.roleArchetype || roleArchetype,
      isOnboardingCompleted: Boolean(user.isOnboardingCompleted),
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
