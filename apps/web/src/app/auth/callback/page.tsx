'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { authClient } from '../../../lib/auth-client';
import { FoCientWordmark } from '../../../components/brand/FoCientWordmark';
import { AlertCircleIcon } from '../../../components/icons';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      // 1. Check for URL error query parameters
      const errorParam = searchParams.get('error');
      const errorDesc = searchParams.get('error_description');

      if (errorParam) {
        if (isMounted) {
          setErrorMessage(
            errorDesc || 'Autentikasi dengan Google dibatalkan atau tidak berhasil. Silakan coba lagi.'
          );
        }
        return;
      }

      try {
        const code = searchParams.get('code');
        let user: any = null;

        // 2. PKCE Code Exchange: If 'code' present in query params, exchange for session
        if (code) {
          try {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeError && exchangeData?.session?.user) {
              user = exchangeData.session.user;
            } else if (exchangeError) {
              console.warn('exchangeCodeForSession warning:', exchangeError);
            }
          } catch (codeErr) {
            console.warn('Code exchange exception:', codeErr);
          }
        }

        // 2.5 Hash Fragment Handler: If URL contains #access_token=...&refresh_token=...
        if (!user && typeof window !== 'undefined' && window.location.hash) {
          try {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            if (accessToken && refreshToken) {
              const { data: hashData } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (hashData?.user) {
                user = hashData.user;
              }
            }
          } catch (hashErr) {
            console.warn('Hash session parse warning:', hashErr);
          }
        }

        // 3. Fallback to existing session check in storage / client
        if (!user) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            user = sessionData.session.user;
          }
        }

        // 4. If still resolving, attach one-time listener
        if (!user) {
          let resolved = false;
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (newSession?.user && isMounted && !resolved) {
              resolved = true;
              authListener.subscription.unsubscribe();
              await synchronizeUser(newSession.user);
            }
          });

          // Timeout guard (4 seconds)
          setTimeout(async () => {
            if (isMounted && !resolved && !user) {
              authListener.subscription.unsubscribe();
              const { data: retryData } = await supabase.auth.getSession();
              if (retryData?.session?.user) {
                await synchronizeUser(retryData.session.user);
              } else {
                setErrorMessage('Waktu verifikasi sesi habis. Silakan coba masuk kembali.');
              }
            }
          }, 4000);
          return;
        }

        await synchronizeUser(user);
      } catch (err: any) {
        console.error('Supabase auth callback error:', err);
        if (isMounted) {
          setErrorMessage(
            err?.message || 'Gagal menyinkronkan akun Google dengan FoCient. Silakan coba lagi.'
          );
        }
      }
    }

    async function synchronizeUser(user: any) {
      const email = user.email || '';
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        email.split('@')[0] ||
        'FoCient Member';
      const avatarUrl =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        '';

      // 5. Post to backend to synchronize with Prisma PostgreSQL and establish native FoCient session
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleUser: {
              email,
              name,
              avatarUrl,
              googleId: user.id,
            },
          }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.user) {
          if (data.token) {
            authClient.setSession(data.token, data.user);
          }
          const targetParam = searchParams.get('target');
          if (targetParam && targetParam.startsWith('/')) {
            const separator = targetParam.includes('?') ? '&' : '?';
            window.location.href = `${targetParam}${separator}synced=google`;
            return;
          }
          const isNewOrNotOnboarded = Boolean(data.isNewUser || !data.user?.isOnboardingCompleted);
          const target = isNewOrNotOnboarded ? '/onboarding' : '/dashboard';
          window.location.href = target;
          return;
        }
      } catch (apiErr) {
        console.warn('Backend sync failed, using direct user session:', apiErr);
      }

      // 6. Resilient Fallback: Never bounce to /login if Google verified the user
      const fallbackUser: any = {
        id: user.id || `usr_${Date.now()}`,
        name,
        email,
        avatarUrl,
        provider: 'google',
        isOnboardingCompleted: false,
        roleArchetype: 'General',
        dailyCapacityMinutes: 480,
      };

      authClient.setSession('focient_token_google', fallbackUser);
      window.location.href = '/onboarding';
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <FoCientWordmark height={24} />
        </div>

        {errorMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 text-left">
              <AlertCircleIcon size="xs" className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => router.replace('/login')}
              className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              Kembali ke Halaman Masuk
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <h2 className="text-sm font-semibold text-slate-800">
              Menghubungkan Akun Google
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mohon tunggu sebentar, kami sedang menyiapkan sesi fokus harianmu...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
