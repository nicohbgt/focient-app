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
        // 2. Retrieve session from Supabase Client (handles PKCE code exchange automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        let user = session?.user;

        // If not immediately available, listen for auth state change
        if (!user) {
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (newSession?.user && isMounted) {
              await synchronizeUser(newSession.user);
              authListener.subscription.unsubscribe();
            }
          });

          // Timeout guard (6 seconds)
          setTimeout(() => {
            if (isMounted && !user) {
              setErrorMessage('Waktu verifikasi sesi habis. Silakan coba masuk kembali.');
            }
          }, 6000);
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

      // 3. Post to backend to synchronize with Prisma PostgreSQL and establish native FoCient session
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

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan sesi akun.');
      }

      if (data.token && data.user) {
        authClient.setSession(data.token, data.user);
      }

      // 4. Redirect smoothly based on onboarding status
      if (data.isNewUser) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
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
