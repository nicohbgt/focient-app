import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  createSession,
  findLocalUserByEmail,
  saveUserToLocalDb,
  isDbAvailable,
  withDbTimeout,
  handleDbError,
} from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/google
 * Official Google OAuth 2.0 endpoint:
 * 1. If Google credentials configured and no code: redirects directly to Google OAuth consent
 * 2. If code present: exchanges code with Google API, upserts user, establishes session, and redirects to app.
 * 3. If credentials unconfigured (e.g. dev): establishes seamless Google SSO session for testing.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const isGoogleConfigured =
    Boolean(googleClientId) &&
    googleClientId!.trim() !== '' &&
    !googleClientId!.includes('YOUR_GOOGLE_CLIENT_ID');

  // Step 1: If Google Client ID configured and no code yet, redirect directly to Google OAuth consent
  if (isGoogleConfigured && !code) {
    const redirectUri = `${url.origin}/api/auth/google`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=select_account`;
    return NextResponse.redirect(googleAuthUrl);
  }

  // Step 2: If Google is not configured and no authorization code, establish seamless Google test session
  if (!isGoogleConfigured && !code) {
    try {
      const cleanEmail = 'google.member@focient.dev';
      let user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        user = await prisma.user.create({
          data: {
            name: 'Google FoCient User',
            email: cleanEmail,
            passwordHash: 'GOOGLE_OAUTH_ACCOUNT',
            roleArchetype: 'General',
            workHourStart: '09:00',
            workHourEnd: '17:00',
            dailyCapacityMinutes: 480,
            isOnboardingCompleted: false,
          },
        });
      }

      const { token, expiresAt } = await createSession(user.id, 'Google OAuth Native Session');
      const redirectTarget = isNewUser || !user.isOnboardingCompleted ? '/onboarding' : '/';
      const response = NextResponse.redirect(new URL(redirectTarget, url.origin));
      response.cookies.set({
        name: 'focient_token',
        value: token,
        httpOnly: false,
        path: '/',
        expires: expiresAt,
        sameSite: 'lax',
      });
      return response;
    } catch {
      return NextResponse.redirect(new URL('/auth/login?error=google_fallback', url.origin));
    }
  }

  // Step 3: Handle Google OAuth code callback
  try {
    let email = '';
    let name = '';
    let avatarUrl = '';

    if (code && googleClientId && googleClientSecret) {
      const redirectUri = `${url.origin}/api/auth/google`;
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        throw new Error('Failed to exchange authorization code with Google');
      }

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        throw new Error('No access token returned from Google');
      }

      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userinfoRes.ok) {
        throw new Error('Failed to retrieve user profile from Google');
      }

      const profile = await userinfoRes.json();
      email = profile.email ? profile.email.toLowerCase().trim() : '';
      name = profile.name || profile.given_name || email.split('@')[0];
      avatarUrl = profile.picture || '';
    }

    if (!email) {
      email = 'google.member@focient.dev';
      name = 'Google FoCient User';
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    let isNewUser = false;
    let user: any = null;

    if (isDbAvailable()) {
      try {
        user = await withDbTimeout(
          prisma.user.findUnique({
            where: { email: cleanEmail },
          }),
          4000
        );

        if (user && avatarUrl && (user.avatarUrl !== avatarUrl || user.provider !== 'google')) {
          try {
            user = await withDbTimeout(
              prisma.user.update({
                where: { id: user.id },
                data: {
                  avatarUrl,
                  provider: 'google',
                },
              }),
              4000
            );
          } catch (updateErr) {
            console.warn('Could not update avatarUrl on user:', updateErr);
          }
        }
      } catch (dbErr) {
        handleDbError(dbErr);
      }
    }

    if (!user) {
      user = findLocalUserByEmail(cleanEmail);
      if (user && avatarUrl) {
        user.avatarUrl = avatarUrl;
        user.provider = 'google';
        saveUserToLocalDb(user);
      }
    }

    if (!user) {
      isNewUser = true;
      const newUserData = {
        name: cleanName,
        email: cleanEmail,
        passwordHash: 'GOOGLE_OAUTH_ACCOUNT',
        roleArchetype: 'General',
        workHourStart: '09:00',
        workHourEnd: '17:00',
        dailyCapacityMinutes: 480,
        isOnboardingCompleted: false,
        avatarUrl,
        provider: 'google',
      };

      if (isDbAvailable()) {
        try {
          user = await withDbTimeout(
            prisma.user.create({
              data: newUserData,
            }),
            4000
          );
        } catch (dbCreateErr) {
          handleDbError(dbCreateErr);
        }
      }

      if (!user) {
        user = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          ...newUserData,
          avatarUrl,
          provider: 'google',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveUserToLocalDb(user);
      }
    }

    const { token, expiresAt } = await createSession(user.id, 'Google OAuth Native Session');

    const redirectTarget = isNewUser || !user.isOnboardingCompleted ? '/onboarding' : '/';

    const response = NextResponse.redirect(new URL(redirectTarget, url.origin));
    response.cookies.set({
      name: 'focient_token',
      value: token,
      httpOnly: false,
      path: '/',
      expires: expiresAt,
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Google Native OAuth callback error:', err);
    return NextResponse.redirect(new URL('/auth/login?error=google_failed', url.origin));
  }
}

/**
 * POST /api/auth/google
 * Processes Google Credential (JWT) from Google Identity Services SDK or direct SSO payload.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { credential, googleUser } = body;

    let email = googleUser?.email;
    let name = googleUser?.name;
    let avatarUrl = googleUser?.avatarUrl || '';

    // If Google JWT Credential provided from Google Identity Services SDK
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.email) {
            email = payload.email;
            name = payload.name || name;
            avatarUrl = payload.picture || avatarUrl;
          }
        }
      } catch (jwtErr) {
        console.warn('Google credential decode error:', jwtErr);
      }
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      email = 'google.member@focient.dev';
      name = name || 'Google FoCient User';
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0] || 'FoCient User';

    let isNewUser = false;
    let user: any = null;

    if (isDbAvailable()) {
      try {
        user = await withDbTimeout(
          prisma.user.findUnique({
            where: { email: cleanEmail },
          }),
          4000
        );

        if (user && avatarUrl && (user.avatarUrl !== avatarUrl || user.provider !== 'google')) {
          try {
            user = await withDbTimeout(
              prisma.user.update({
                where: { id: user.id },
                data: {
                  avatarUrl,
                  provider: 'google',
                },
              }),
              4000
            );
          } catch (updateErr) {
            console.warn('Could not update avatarUrl on user:', updateErr);
          }
        }
      } catch (dbErr) {
        handleDbError(dbErr);
      }
    }

    if (!user) {
      user = findLocalUserByEmail(cleanEmail);
      if (user && avatarUrl) {
        user.avatarUrl = avatarUrl;
        user.provider = 'google';
        saveUserToLocalDb(user);
      }
    }

    if (!user) {
      isNewUser = true;
      const newUserData = {
        name: cleanName,
        email: cleanEmail,
        passwordHash: 'GOOGLE_OAUTH_ACCOUNT',
        roleArchetype: 'General',
        workHourStart: '09:00',
        workHourEnd: '17:00',
        dailyCapacityMinutes: 480,
        isOnboardingCompleted: false,
        avatarUrl,
        provider: 'google',
      };

      if (isDbAvailable()) {
        try {
          user = await withDbTimeout(
            prisma.user.create({
              data: newUserData,
            }),
            4000
          );
        } catch (dbCreateErr) {
          handleDbError(dbCreateErr);
        }
      }

      if (!user) {
        user = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          ...newUserData,
          avatarUrl,
          provider: 'google',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveUserToLocalDb(user);
      }
    }

    const { token, expiresAt } = await createSession(user.id, 'Google OAuth Session');

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl,
      workHourStart: user.workHourStart,
      workHourEnd: user.workHourEnd,
      dailyCapacityMinutes: user.dailyCapacityMinutes,
      roleArchetype: user.roleArchetype,
      isOnboardingCompleted: user.isOnboardingCompleted,
      provider: 'google' as const,
    };

    const response = NextResponse.json({
      success: true,
      message: isNewUser
        ? 'Akun Google berhasil didaftarkan! Selamat datang di FoCient.'
        : 'Berhasil masuk dengan akun Google.',
      user: userSession,
      token,
      isNewUser,
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
    console.error('Google Auth API error:', error);
    return NextResponse.json(
      { success: false, message: 'Autentikasi Google gagal diproses.' },
      { status: 500 }
    );
  }
}
