'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, CheckCircleIcon, AlertCircleIcon } from '../../components/icons';

export const ForgotPasswordScreen: React.FC = () => {
  const { forgotPassword, setAuthView, language } = useFocient();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackToLogin = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth/login';
    } else {
      setAuthView('login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(language === 'id' ? 'Masukkan format email yang valid' : 'Please enter a valid email address');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const ok = await forgotPassword(cleanEmail);
      if (ok) {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
          window.location.href = `/auth/reset-password?email=${encodeURIComponent(cleanEmail)}`;
        } else {
          setAuthView('resetPassword');
        }
      }
    } catch (err: any) {
      setError(err?.message || (language === 'id' ? 'Gagal memproses lupa kata sandi' : 'Failed to process forgot password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full animate-fade-in font-sans">
      <div className="mb-6">
        <button
          type="button"
          onClick={handleBackToLogin}
          aria-label={language === 'id' ? 'Kembali' : 'Back'}
          className="inline-flex items-center justify-center p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeftIcon size="sm" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {isSubmitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mx-auto mb-4">
              <CheckCircleIcon size="md" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {language === 'id' ? 'Instruksi Terkirim' : 'Instructions Sent'}
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-xs mx-auto">
              {language === 'id'
                ? `Kami telah mengirimkan instruksi ke ${email}. Yuk cek inbox email kamu.`
                : `We sent password reset instructions to ${email}. Check your inbox.`}
            </p>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all"
            >
              {language === 'id' ? 'Kembali ke Masuk' : 'Back to Login'}
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {language === 'id' ? 'Lupa Kata Sandi?' : 'Forgot Password?'}
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {language === 'id'
                ? 'Masukkan email akunmu. Kami akan bantu atur ulang kata sandimu.'
                : 'Enter your email and we will help you reset your password.'}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircleIcon size="xs" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

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
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
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
                <span>{language === 'id' ? 'Kirim Instruksi Pemulihan' : 'Send Reset Instructions'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
