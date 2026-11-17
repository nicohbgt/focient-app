import { NextResponse } from 'next/server';
import {
  findLocalUserByEmail,
  updateUserPasswordInAllStores,
} from '../../../../lib/auth-server';
import { prisma } from '@focient/database';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi baru minimal harus 6 karakter.' },
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

    // Persist updated password to all stores (local file DB + PostgreSQL)
    await updateUserPasswordInAllStores(cleanEmail, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Gagal mengatur ulang kata sandi.' },
      { status: 500 }
    );
  }
}
