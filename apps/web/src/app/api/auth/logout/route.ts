import { NextResponse } from 'next/server';
import { extractTokenFromRequest, revokeSession } from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const token = extractTokenFromRequest(request);
  if (token) {
    await revokeSession(token);
  }

  const response = NextResponse.json({
    success: true,
    message: 'Berhasil keluar dari akun.',
  });

  response.cookies.set({
    name: 'focient_token',
    value: '',
    httpOnly: false,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}
