'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, AlertCircleIcon } from '../../components/icons';

export const ResetPasswordScreen: React.FC = () => {
  const { resetPassword, cancelOtp, language } = useFocient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(language === 'id' ? 'Kata sandi minimal 6 karakter' : 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError(language === 'id' ? 'Konfirmasi kata sandi tidak cocok' : 'Passwords do not match');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await resetPassword(password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full animate-fade-in">
      <div className="mb-6">
        <button
          type="button"
          onClick={cancelOtp}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon size="sm" />
          <span>{language === 'id' ? 'Batal' : 'Cancel'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Atur Ulang Kata Sandi' : 'Reset Password'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Buat kata sandi baru yang kuat untuk akun Anda.'
            : 'Create a new strong password for your account.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircleIcon size="xs" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reset-new-password">
              {language === 'id' ? 'Kata Sandi Baru' : 'New Password'}
            </label>
            <input
              id="reset-new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reset-confirm-password">
              {language === 'id' ? 'Konfirmasi Kata Sandi' : 'Confirm Password'}
            </label>
            <input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
            <span>{language === 'id' ? 'Simpan Kata Sandi Baru' : 'Update Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
