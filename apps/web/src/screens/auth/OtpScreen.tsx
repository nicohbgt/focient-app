'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFocient } from '../../state/focient-store';
import { authClient } from '../../lib/auth-client';
import { ArrowLeftIcon, AlertCircleIcon } from '../../components/icons';

export const OtpScreen: React.FC = () => {
  const {
    otpEmail,
    setOtpEmail,
    verifyOtp,
    cancelOtp,
    resendOtp,
    pendingRegistration,
    language,
    showToast,
  } = useFocient();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120); // 2:00
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Sync email from URL or storage if not yet loaded in context
  useEffect(() => {
    if (!otpEmail && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      if (emailParam) {
        setOtpEmail(emailParam.trim().toLowerCase());
        return;
      }
      const pending = authClient.getPendingRegistration();
      if (pending?.email) {
        setOtpEmail(pending.email);
      }
    }
  }, [otpEmail, setOtpEmail]);

  // 2. Focus first empty box on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // 3. Countdown timer for resend
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError(null);
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    const numericChars = pasted.replace(/\D/g, '').slice(0, 6);
    if (!numericChars) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = numericChars[i] || '';
    }
    setDigits(newDigits);
    setError(null);

    const focusIdx = Math.min(numericChars.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = digits.join('');
    if (fullCode.length < 6) {
      setError(language === 'id' ? 'Masukkan 6 digit kode verifikasi lengkap' : 'Please enter the complete 6-digit code');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const ok = await verifyOtp(fullCode);
      if (ok) {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
          window.location.href = '/';
        }
      } else {
        setError(language === 'id' ? 'Kode OTP tidak cocok. Periksa kembali email Anda.' : 'Invalid OTP code. Please check your email.');
      }
    } catch {
      setError(language === 'id' ? 'Gagal memverifikasi OTP. Silakan coba kembali.' : 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(120);
    setError(null);
    setDigits(['', '', '', '', '', '']);
    inputsRef.current[0]?.focus();
    await resendOtp();
  };

  const handleAutofill = (codeToFill: string) => {
    const chars = codeToFill.replace(/\D/g, '').slice(0, 6).split('');
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = chars[i] || '';
    }
    setDigits(newDigits);
    setError(null);
    inputsRef.current[5]?.focus();
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth/register';
    } else {
      cancelOtp();
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCodeComplete = digits.every((d) => d.length === 1);

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-[420px] mx-auto w-full animate-fade-in font-sans">
      {/* Top Back Nav */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon size="xs" />
          <span>{language === 'id' ? 'Kembali' : 'Back'}</span>
        </button>
      </div>

      {/* Authentication & Verification Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
          {language === 'id' ? 'Verifikasi Kode OTP' : 'Verify Your Email'}
        </h1>
        <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
          {language === 'id' ? 'Masukkan 6 digit kode yang dikirimkan ke ' : 'Enter the 6-digit code sent to '}
          <span className="font-semibold text-slate-800 break-all">{otpEmail || 'email Anda'}</span>
        </p>

        {/* Development / Sandbox Testing Banner */}
        {pendingRegistration?.devCode && (
          <div className="mb-5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center justify-between gap-2 text-left">
            <span>
              {language === 'id' ? 'Kode OTP Pengujian:' : 'Test OTP Code:'}{' '}
              <strong className="font-mono font-bold text-blue-600 tracking-wider text-sm">{pendingRegistration.devCode}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleAutofill(pendingRegistration.devCode!)}
              className="shrink-0 px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-[11px] font-semibold transition-colors"
            >
              {language === 'id' ? 'Isi Otomatis' : 'Auto Fill'}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-center gap-2">
            <AlertCircleIcon size="xs" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <div className="flex justify-center gap-2 sm:gap-2.5 mb-6" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              aria-label={`Digit ${idx + 1}`}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm tabular-nums bg-white"
            />
          ))}
        </div>

        {/* Verification CTA */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={isLoading || !isCodeComplete}
          className="w-full h-11 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : null}
          <span>{language === 'id' ? 'Verifikasi & Lanjutkan' : 'Verify & Continue'}</span>
        </button>

        {/* Resend Cooldown Timer */}
        <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100">
          {timer > 0 ? (
            <span>
              {language === 'id' ? 'Kirim ulang kode dalam ' : 'Resend code in '}
              <strong className="font-semibold text-slate-700 tabular-nums">{formatTimer(timer)}</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              {language === 'id' ? 'Kirim Ulang Kode' : 'Resend Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
