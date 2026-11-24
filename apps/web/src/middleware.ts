import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Verifies cryptographic HMAC-SHA256 signature on role cookie.
 * Native Edge runtime Web Crypto API - executes in <0.05ms without sub-requests.
 */
async function verifyRoleSignature(role: string, token: string, sig: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET || process.env.AUTH_SALT || 'focient_secure_salt_2026';
    const data = `${role}:${token.substring(0, 16)}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const expectedSig = Array.from(new Uint8Array(expectedSigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return expectedSig === sig;
  } catch {
    return false;
  }
}

/**
 * Stealth Security Middleware for Internal FoCient Systems
 * Zero Public Visibility: Any unauthenticated request or request without
 * SUPERADMIN / INTERNAL_OPERATOR role is rewritten to /404 (HTTP 404 Not Found).
 * Absolutely no 401 or 403 status is returned to prevent enumeration or existence discovery.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isInternalRoute =
    pathname === '/ops-console' ||
    pathname.startsWith('/ops-console/') ||
    pathname === '/api/ops-console' ||
    pathname.startsWith('/api/ops-console/') ||
    pathname.startsWith('/api/admin');

  if (isInternalRoute) {
    // 1. Extract session token from Authorization header or cookie
    let token: string | null = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = request.cookies.get('focient_token')?.value || null;
    }

    if (!token) {
      // Stealth 404 rewrite
      return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
    }

    // 2. High-performance Fast Path: Check tamper-proof signed role cookie
    const roleCookie = request.cookies.get('focient_role')?.value;
    const roleSigCookie = request.cookies.get('focient_role_sig')?.value;

    if (roleCookie && roleSigCookie) {
      const isSigValid = await verifyRoleSignature(roleCookie, token, roleSigCookie);
      if (isSigValid) {
        if (roleCookie === 'SUPERADMIN' || roleCookie === 'INTERNAL_OPERATOR') {
          return NextResponse.next();
        }
        // Valid signature for non-admin role (e.g. USER) -> stealth 404
        return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
      }
    }

    // 3. Fallback: Validate with internal auth check with abort timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const authCheckUrl = new URL('/api/auth/me', request.url);
      const res = await fetch(authCheckUrl.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          cookie: `focient_token=${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
      }

      const data = await res.json();
      const userRole = data?.user?.role;

      if (userRole !== 'SUPERADMIN' && userRole !== 'INTERNAL_OPERATOR') {
        // Disallow standard users with 404 stealth rewrite
        return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
      }

      // Valid internal operator / superadmin session
      return NextResponse.next();
    } catch {
      // Fail closed with stealth 404
      return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/ops-console/:path*',
    '/ops-console',
    '/api/ops-console/:path*',
    '/api/admin/:path*',
  ],
};
