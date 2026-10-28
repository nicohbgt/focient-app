'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon } from '../../components/icons';

export const OtpScreen: React.FC = () => {
  const { otpEmail, verifyOtp, cancelOtp, language, showToast } = useFocient();
  const [digits, setDigits] = useState(['5', '1', '2', '8', '9', '0']);
  const [timer, setTimer] = useState(119); // 1:59
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = digits.join('');
    setIsLoading(true);
    try {
      await verifyOtp(fullCode);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(120);
    showToast(
      language === 'id' ? 'Kode baru telah dikirim' : 'A new verification code has been sent',
      'info'
    );
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
          <span>{language === 'id' ? 'Kembali' : 'Back'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">
          ✉️
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Verifikasi Kode OTP' : 'Verify Your Email'}
        </h2>
        <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
          {language === 'id' ? 'Masukkan 6 digit kode yang dikirimkan ke ' : 'Enter the 6-digit code sent to '}
          <span className="font-semibold text-slate-800">{otpEmail}</span>
        </p>

        {/* 6 Digit Input Boxes */}
        <div className="flex justify-center gap-2 sm:gap-2.5 mb-6">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 text-center text-xl font-bold rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm tabular-nums"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mb-4"
        >
          {isLoading && (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span>{language === 'id' ? 'Verifikasi & Lanjutkan' : 'Verify & Continue'}</span>
        </button>

        <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
          {timer > 0 ? (
            <span>
              {language === 'id' ? 'Kirim ulang dalam ' : 'Resend code in '}
              <strong className="font-semibold text-slate-700 tabular-nums">{formatTimer(timer)}</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {language === 'id' ? 'Kirim Ulang Kode' : 'Resend Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
