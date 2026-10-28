'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, AlertCircleIcon } from '../../components/icons';

export const RegisterScreen: React.FC = () => {
  const { register, setAuthView, setIsTermsOpen, language } = useFocient();
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@focient.dev');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError(language === 'id' ? 'Nama minimal 2 karakter' : 'Name must be at least 2 characters');
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
    if (password !== confirmPassword) {
      setError(language === 'id' ? 'Konfirmasi kata sandi tidak cocok' : 'Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError(language === 'id' ? 'Anda harus menyetujui Syarat & Ketentuan' : 'Please agree to the Terms of Service');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await register(name, email, password);
    } catch {
      setError(language === 'id' ? 'Gagal mendaftar. Silakan coba lagi' : 'Registration failed. Please try again');
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {language === 'id' ? 'Buat Akun Baru' : 'Create an Account'}
          </h2>
          <p className="text-sm text-slate-500">
            {language === 'id'
              ? 'Mulai perjalanan produktivitas adaptif dan sehat'
              : 'Start your guilt-free focus journey today'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircleIcon size="xs" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-name">
              {language === 'id' ? 'Nama Lengkap / Username' : 'Full Name / Username'}
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-password">
              {language === 'id' ? 'Kata Sandi' : 'Password'}
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-confirm-password">
              {language === 'id' ? 'Konfirmasi Kata Sandi' : 'Confirm Password'}
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-snug">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span>
                {language === 'id' ? 'Saya setuju dengan ' : 'I agree to the '}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {language === 'id' ? 'Syarat & Ketentuan Layanan' : 'Terms of Service & Privacy'}
                </button>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{language === 'id' ? 'Buat Akun' : 'Create Account'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          {language === 'id' ? 'Sudah memiliki akun? ' : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setAuthView('login')}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {language === 'id' ? 'Masuk' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};
