import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { prisma } from '@focient/database';
import { saveOtp } from '../../../../lib/auth-otp-store';
import { sendOtpEmail } from '../../../../lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is already registered in DB
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.' },
          { status: 409 }
        );
      }
    } catch {
      // Prisma offline, proceed with OTP generation
    }

    // Generate cryptographically secure 6-digit OTP code
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresInSeconds = 600; // 10 minutes

    await saveOtp(cleanEmail, otpCode, 'REGISTRATION', expiresInSeconds);

    // Dispatch via real email service (Resend / Brevo / Webhook / Console)
    const emailResult = await sendOtpEmail(cleanEmail, otpCode, 'registration');

    return NextResponse.json({
      success: true,
      message: emailResult.delivered
        ? 'Kode OTP telah berhasil dikirimkan ke email Anda.'
        : 'Kode OTP telah dibuat. Silakan periksa email Anda.',
      expiresInSeconds,
      email: cleanEmail,
      delivered: emailResult.delivered,
      devCode: emailResult.delivered ? undefined : otpCode,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengirim kode OTP. Silakan coba kembali.' },
      { status: 500 }
    );
  }
}
