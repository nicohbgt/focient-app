'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFocient } from '../../state/focient-store';
import { supabase } from '../../lib/supabase';

export interface GoogleSignInButtonProps {
  className?: string;
  onClick?: () => void;
  mode?: 'login' | 'register' | 'continue';
}

/**
 * Official FoCient Google SSO Button
 *
 * Implements Supabase Google OAuth 2.0 PKCE Flow:
 * 1. Initiates OAuth with Supabase provider: 'google' redirecting to /auth/callback.
 * 2. On redirect, /auth/callback synchronizes user profile with Prisma PostgreSQL database.
 * 3. Fallback to direct mock / store session when offline or during test environments.
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  className = '',
  onClick,
  mode = 'continue',
}) => {
  const router = useRouter();
  const { language, loginWithGoogle, showToast } = useFocient();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
      return;
    }

    setIsLoading(true);

    try {
      // 1. Primary: Supabase Google OAuth
      const redirectUri = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : '/auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.warn('Supabase OAuth error, attempting fallback:', error);
        throw error;
      }

      if (data?.url) {
        // Redirect browser to Google Consent Screen
        window.location.href = data.url;
        return;
      }

      // 2. Fallback: Direct authentication via store / API if no URL returned
      const success = await loginWithGoogle();
      if (success) {
        if (mode === 'register') {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      // Secondary fallback to store login in local development
      try {
        const fallbackSuccess = await loginWithGoogle();
        if (fallbackSuccess) {
          if (mode === 'register') {
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
          return;
        }
      } catch (fallbackErr) {
        console.warn('Secondary fallback failed:', fallbackErr);
      }

      showToast(
        language === 'id'
          ? 'Gagal masuk dengan Google. Silakan coba lagi atau gunakan email.'
          : 'Failed to sign in with Google. Please try again or use email.',
        'warning'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const label = language === 'id' ? 'Lanjutkan dengan Google' : 'Continue with Google';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={label}
      className={`w-full h-11 px-4 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-800 font-medium text-sm transition-all duration-150 flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
      ) : (
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span className="text-slate-800 font-medium text-sm">
        {label}
      </span>
    </button>
  );
};
