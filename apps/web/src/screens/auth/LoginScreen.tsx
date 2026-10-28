'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, AlertCircleIcon } from '../../components/icons';

export const LoginScreen: React.FC = () => {
  const { login, loginAsGuest, setAuthView, language } = useFocient();
  const [email, setEmail] = useState('alex@focient.dev');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError(language === 'id' ? 'Masukkan format email yang valid' : 'Please enter a valid email address');
      return;
    }
    if (!password) {
      setError(language === 'id' ? 'Masukkan kata sandi Anda' : 'Please enter your password');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch {
      setError(language === 'id' ? 'Email atau kata sandi tidak sesuai' : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full animate-fade-in">
      {/* Top Back Nav */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setAuthView('welcome')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon size="sm" />
          <span>{language === 'id' ? 'Kembali' : 'Back'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {language === 'id' ? 'Selamat Datang Kembali' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-500">
            {language === 'id'
              ? 'Masuk untuk melanjutkan fokus kerja harian Anda'
              : 'Enter your credentials to access your daily plan'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircleIcon size="xs" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-password">
              {language === 'id' ? 'Kata Sandi' : 'Password'}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (language === 'id' ? 'Sembunyi' : 'Hide') : (language === 'id' ? 'Lihat' : 'Show')}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span>{language === 'id' ? 'Ingat saya' : 'Remember me'}</span>
            </label>

            <button
              type="button"
              onClick={() => setAuthView('forgotPassword')}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {language === 'id' ? 'Lupa sandi?' : 'Forgot password?'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{language === 'id' ? 'Masuk' : 'Log In'}</span>
          </button>
        </form>

        <div className="relative my-6 text-center text-xs text-slate-400">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-slate-500 font-medium">
            {language === 'id' ? 'atau' : 'or continue with'}
          </span>
        </div>

        <button
          type="button"
          onClick={loginAsGuest}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 mb-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Google</span>
        </button>

        <p className="text-center text-xs text-slate-500 mt-6">
          {language === 'id' ? 'Belum punya akun? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setAuthView('register')}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {language === 'id' ? 'Daftar Sekarang' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
