'use client';

import React from 'react';
import { useFocient } from '../../state/focient-store';
import { TargetIcon, SparklesIcon, ClockIcon, ArrowRightIcon } from '../../components/icons';
import { FoCientWordmark } from '../../components/brand/FoCientWordmark';

export const WelcomeScreen: React.FC = () => {
  const { language, setLanguage, setAuthView, loginAsGuest } = useFocient();

  return (
    <div className="min-h-full flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto w-full animate-fade-in">
      {/* Top Bar with Back to Landing & Language Switcher */}
      <div className="w-full flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={() => setAuthView('landing')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <span>← {language === 'id' ? 'Halaman Utama' : 'Landing Page'}</span>
        </button>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 shadow-sm text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full transition-all ${
              language === 'en' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`px-3 py-1 rounded-full transition-all ${
              language === 'id' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Indonesia
          </button>
        </div>
      </div>

      {/* Brand Wordmark & Tagline (Standalone & Spacious) */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <FoCientWordmark height={22} className="hover:opacity-90 transition-opacity" />
        </div>
        <p className="text-base text-slate-600 max-w-sm mx-auto font-medium">
          {language === 'id'
            ? 'Fokus kerja lebih tenang tanpa beban dan tanpa rasa bersalah.'
            : 'Focus on your work with ease and peace of mind.'}
        </p>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="w-full space-y-3 mb-8">
        <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TargetIcon size="sm" />
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {language === 'id'
              ? 'Fokus satu per satu tugas tanpa panik'
              : 'Focus on one task at a time without stress'}
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <SparklesIcon size="sm" />
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {language === 'id'
              ? 'Geser jadwal kapan saja dengan santai'
              : 'Reschedule tasks easily anytime'}
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ClockIcon size="sm" />
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {language === 'id'
              ? 'Jaga batas kerja harian agar malammu bebas tugas'
              : 'Healthy daily work limits to protect your rest'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3">
        <button
          type="button"
          onClick={() => setAuthView('register')}
          className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base shadow-sm transition-all text-center"
        >
          <span>{language === 'id' ? 'Mulai Sekarang' : 'Get Started'}</span>
        </button>

        <button
          type="button"
          onClick={() => setAuthView('login')}
          className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 border border-slate-200 font-semibold text-base transition-all text-center"
        >
          {language === 'id' ? 'Sudah punya akun? Masuk' : 'Already have an account? Login'}
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => loginAsGuest()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {language === 'id' ? 'Atau coba langsung demo Mode Tamu' : 'Or try immediate demo with Guest Session'}
          </button>
        </div>
      </div>
    </div>
  );
};
