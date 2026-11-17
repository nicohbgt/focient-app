import { NextResponse } from 'next/server';
import { findLocalUserByEmail } from '../../../../lib/auth-server';
import { prisma } from '@focient/database';

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

    // Check if user exists in local store or PostgreSQL
    let userExists = Boolean(findLocalUserByEmail(cleanEmail));
    if (!userExists) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
          select: { id: true },
        });
        if (dbUser) userExists = true;
      } catch {
        // PostgreSQL is offline
      }
    }

    if (!userExists) {
      return NextResponse.json(
        { success: false, message: 'Akun dengan email tersebut tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Instruksi pemulihan kata sandi telah dikirimkan ke email Anda.',
      email: cleanEmail,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Gagal memproses permintaan lupa kata sandi.' },
      { status: 500 }
    );
  }
}
