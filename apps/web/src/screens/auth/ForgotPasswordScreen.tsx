'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon } from '../../components/icons';

export const ForgotPasswordScreen: React.FC = () => {
  const { forgotPassword, setAuthView, language } = useFocient();
  const [email, setEmail] = useState('alex@focient.dev');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsLoading(true);
    try {
      await forgotPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full animate-fade-in">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setAuthView('login')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon size="sm" />
          <span>{language === 'id' ? 'Kembali ke Login' : 'Back to Login'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl mb-4">
          🔑
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Lupa Kata Sandi?' : 'Forgot Password?'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Masukkan email Anda dan kami akan mengirimkan kode 6 digit untuk mengatur ulang sandi.'
            : 'Enter your registered email address and we will send you a 6-digit verification code.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isLoading && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{language === 'id' ? 'Kirim Kode Verifikasi' : 'Send Verification Code'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
