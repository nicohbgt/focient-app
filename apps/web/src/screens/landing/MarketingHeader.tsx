'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useFocient } from '../../state/focient-store';
import { FoCientWordmark } from '../../components/brand/FoCientWordmark';
import { XIcon } from '../../components/icons';

export const MarketingHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, loginAsGuest } = useFocient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoClick = async () => {
    setIsDemoLoading(true);
    try {
      await loginAsGuest();
      router.push('/today');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const navLinks = [
    { labelId: 'Nilai Kami', labelEn: 'Our Value', href: '/#philosophy' },
    { labelId: 'Fitur Utama', labelEn: 'Features', href: '/#features' },
    { labelId: 'Panduan', labelEn: 'Guidance', href: '/guidance' },
    { labelId: 'Tentang Kami', labelEn: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark (Standalone & Spacious) */}
        <Link href="/" className="flex items-center cursor-pointer py-1" aria-label="FoCient Home">
          <FoCientWordmark height={16} className="transition-opacity hover:opacity-80" />
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-600">
          {navLinks.map((link) => {
            const isGuidance = link.href === '/guidance' && pathname === '/guidance';
            const isAbout = link.href === '/about' && pathname === '/about';
            const isActive = isGuidance || isAbout;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'hover:text-slate-900 hover:bg-white/60 text-slate-600'
                }`}
              >
                {language === 'id' ? link.labelId : link.labelEn}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls: demo - masuk - daftar */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all uppercase"
            title={language === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
          >
            {language}
          </button>

          {/* Quick Demo CTA */}
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={isDemoLoading}
            className="hidden sm:inline-flex px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] text-slate-700 font-bold text-xs shadow-2xs transition-all disabled:opacity-50"
          >
            <span>{isDemoLoading ? (language === 'id' ? 'Memuat...' : 'Loading...') : (language === 'id' ? 'Demo' : 'Demo')}</span>
          </button>

          {/* Login Link */}
          <Link
            href="/login"
            className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {language === 'id' ? 'Masuk' : 'Log In'}
          </Link>

          {/* Primary Get Started CTA */}
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-sm transition-all"
          >
            <span>{language === 'id' ? 'Daftar' : 'Sign Up'}</span>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <XIcon size="sm" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {language === 'id' ? link.labelId : link.labelEn}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={async () => {
                setIsMobileMenuOpen(false);
                await handleDemoClick();
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-center font-bold text-xs transition-colors"
            >
              {language === 'id' ? 'Coba Versi Demo' : 'Try Demo Mode'}
            </button>
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-center font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              {language === 'id' ? 'Masuk' : 'Log In'}
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-xs transition-colors"
            >
              {language === 'id' ? 'Daftar Akun Baru' : 'Sign Up Free'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
