'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { authClient } from '../../lib/auth-client';
import { ArrowLeftIcon, AlertCircleIcon, EyeIcon, EyeOffIcon } from '../../components/icons';

export const LoginScreen: React.FC = () => {
  const {
    login,
    setAuthView,
    language,
  } = useFocient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError(language === 'id' ? 'Masukkan format email yang valid' : 'Please enter a valid email address');
      return;
    }
    if (!password) {
      setError(language === 'id' ? 'Masukkan kata sandi kamu' : 'Please enter your password');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const ok = await login(email, password);
      if (ok && typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
        window.location.href = '/';
      }
    } catch {
      setError(language === 'id' ? 'Email atau kata sandi tidak sesuai' : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth/register';
    } else {
      setAuthView('register');
    }
  };

  const handleNavigateBack = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
      window.location.href = '/';
    } else {
      setAuthView('landing');
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-[420px] mx-auto w-full animate-fade-in font-sans">
      {/* Top Back Nav */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleNavigateBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon size="xs" />
          <span>{language === 'id' ? 'Kembali' : 'Back'}</span>
        </button>
      </div>

      {/* Single Authentication Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            {language === 'id' ? 'Selamat datang kembali' : 'Welcome back'}
          </h1>
          <p className="text-sm text-slate-500 font-normal leading-relaxed">
            {language === 'id'
              ? 'Masuk untuk kelola fokus dan jadwal harianmu.'
              : 'Log in to manage your daily focus and schedule.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircleIcon size="xs" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Essential Form: Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="login-email">
              {language === 'id' ? 'Alamat Email' : 'Email Address'}
            </label>
            <input
              id="login-email"
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="login-password">
                {language === 'id' ? 'Kata Sandi' : 'Password'}
              </label>
              <button
                type="button"
                onClick={() => setAuthView('forgotPassword')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                {language === 'id' ? 'Lupa kata sandi?' : 'Forgot password?'}
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
            <span>{language === 'id' ? 'Masuk' : 'Log In'}</span>
          </button>
        </form>

        {/* 4. Footer Link Switch */}
        <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
          {language === 'id' ? 'Belum punya akun? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={handleNavigateToRegister}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {language === 'id' ? 'Daftar' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
