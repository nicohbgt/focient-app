'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, AlertCircleIcon, EyeIcon, EyeOffIcon } from '../../components/icons';

export const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const {
    register,
    cleanUser,
    setAuthView,
    setIsTermsOpen,
    language,
    pendingRegistration,
  } = useFocient();

  const [name, setName] = useState(pendingRegistration?.name || '');
  const [email, setEmail] = useState(pendingRegistration?.email || '');
  const [password, setPassword] = useState(pendingRegistration?.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDevMode =
    process.env.NODE_ENV !== 'production' ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '3000' ||
        window.location.port === '4000'));

  const isEmailConflict = Boolean(
    error && (
      error.toLowerCase().includes('terdaftar') ||
      error.toLowerCase().includes('registered') ||
      error.toLowerCase().includes('already') ||
      error.toLowerCase().includes('failed') ||
      isDevMode
    )
  );

  const handleDevCleanAndRetry = async () => {
    if (!email) return;
    setIsCleaning(true);
    setError(null);
    try {
      await cleanUser(email);
      const ok = await register(name, email, password, true);
      if (ok) {
        router.push('/onboarding');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membersihkan user testing.';
      setError(message);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError(language === 'id' ? 'Nama lengkap minimal 2 karakter' : 'Full name must be at least 2 characters');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(language === 'id' ? 'Format email tidak valid' : 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError(language === 'id' ? 'Kata sandi minimal 6 karakter' : 'Password must be at least 6 characters');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const ok = await register(name, email, password);
      if (ok) {
        router.push('/onboarding');
      } else {
        setError(language === 'id' ? 'Gagal mendaftar. Silakan coba kembali.' : 'Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (language === 'id' ? 'Gagal mendaftar. Silakan coba lagi' : 'Failed to register. Please try again');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-[420px] mx-auto w-full animate-fade-in font-sans">
      {/* Top Back Nav */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon size="xs" />
          <span>{language === 'id' ? 'Kembali' : 'Back'}</span>
        </Link>
      </div>

      {/* Single Registration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            {language === 'id' ? 'Mulai bersama FoCient' : 'Get started with FoCient'}
          </h1>
          <p className="text-sm text-slate-500 font-normal leading-relaxed">
            {language === 'id'
              ? 'Daftar akun untuk simpan dan sinkronkan fokus harianmu.'
              : 'Sign up to keep your daily focus in sync across devices.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircleIcon size="xs" className="shrink-0" />
              <span>{error}</span>
            </div>
            {isEmailConflict && (
              <button
                type="button"
                onClick={handleDevCleanAndRetry}
                disabled={isCleaning}
                className="mt-1 self-start px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                {isCleaning
                  ? (language === 'id' ? 'Membersihkan...' : 'Cleaning...')
                  : (language === 'id' ? 'Reset Email Testing & Lanjut' : 'Reset Test Email & Continue')}
              </button>
            )}
          </div>
        )}

        {/* Essential Form: Name, Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="register-name">
              {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Pratama"
              required
              autoComplete="name"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="register-email">
              {language === 'id' ? 'Alamat Email' : 'Email Address'}
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              autoComplete="email"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="register-password">
              {language === 'id' ? 'Kata Sandi' : 'Password'}
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                autoComplete="new-password"
                className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? (language === 'id' ? 'Sembunyikan kata sandi' : 'Hide password') : (language === 'id' ? 'Tampilkan kata sandi' : 'Show password')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOffIcon size="xs" /> : <EyeIcon size="xs" />}
              </button>
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{language === 'id' ? 'Buat Akun' : 'Create Account'}</span>
          </button>
        </form>

        {/* Legal Microcopy */}
        <p className="text-center text-xs text-slate-500 leading-relaxed mt-4">
          {language === 'id' ? (
            <>
              Dengan mendaftar, kamu menyetujui{' '}
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Syarat & Ketentuan
              </button>{' '}
              dan{' '}
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Kebijakan Privasi
              </button>{' '}
              kami.
            </>
          ) : (
            <>
              By signing up, you agree to our{' '}
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy
              </button>
              .
            </>
          )}
        </p>

        {/* Footer Link Switch */}
        <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
          {language === 'id' ? 'Sudah punya akun? ' : 'Already have an account? '}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {language === 'id' ? 'Masuk' : 'Log In'}
          </Link>
        </p>
      </div>
    </div>
  );
};
