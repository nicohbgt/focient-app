'use client';

import React, { useState, useEffect } from 'react';
import { useFocient } from '../../state/focient-store';
import {
  SparklesIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  CalendarIcon,
  TargetIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SunIcon,
  MoonIcon,
  ActivityIcon,
} from '../../components/icons';
import { FoCientWordmark } from '../../components/brand/FoCientWordmark';

export const LandingPageScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    setAuthView,
    startOnboarding,
    loginAsGuest,
    setInspectorView,
    setIsTermsOpen,
  } = useFocient();

  // Active section tracking state
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Interactive hero timer preview state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25:00

  // Feature 2 interactive rebalance simulation state
  const [isFeature2Rebalanced, setIsFeature2Rebalanced] = useState(false);

  // Feature 3 capacity meter simulation slider
  const [simulatedMinutes, setSimulatedMinutes] = useState(312);
  const maxCapacityMinutes = 480;
  const simulatedPercent = Math.min(100, Math.round((simulatedMinutes / maxCapacityMinutes) * 100));

  // Feature 4 active chronotype tab
  const [activeChronotype, setActiveChronotype] = useState<'early' | 'steady' | 'night'>('steady');

  // Feature 5 interactive chart day selection
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Default Wednesday (peak)

  // Mobile navigation drawer toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sectionList = [
    { id: 'hero', labelEn: 'Overview', labelId: 'Ringkasan' },
    { id: 'philosophy', labelEn: 'Why FoCient', labelId: 'Kenapa FoCient' },
    { id: 'comparison', labelEn: 'Comparison', labelId: 'Beda FoCient' },
    { id: 'features', labelEn: 'Features', labelId: 'Fitur Utama' },
    { id: 'feature-2', labelEn: 'Adaptive Shift', labelId: 'Geser Jadwal' },
    { id: 'feature-3', labelEn: 'Workload Limit', labelId: 'Batas Beban' },
    { id: 'feature-4', labelEn: 'Energy Peak', labelId: 'Waktu Segar' },
    { id: 'feature-5', labelEn: 'Weekly Pace', labelId: 'Hasil Mingguan' },
    { id: 'how-it-works', labelEn: 'How It Works', labelId: 'Cara Pakai' },
  ];

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Advance to next / previous section
  const advanceSection = (direction: 'next' | 'prev') => {
    const ids = sectionList.map((s) => s.id);
    const currentIndex = ids.indexOf(activeSection);
    if (direction === 'next' && currentIndex < ids.length - 1) {
      scrollToSection(ids[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      scrollToSection(ids[currentIndex - 1]);
    }
  };

  // IntersectionObserver to dynamically detect current visible section
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-35% 0px -45% 0px',
      threshold: 0,
    });

    const ids = sectionList.map((s) => s.id);

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Keyboard navigation (ArrowDown / PageDown / ArrowUp / PageUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        advanceSection('next');
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        advanceSection('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection]);

  // Live timer tick-down effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Helper timer display
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR (STICKY & ELEVATED WITH BACKDROP BLUR)
      ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Wordmark (Standalone & Spacious) */}
          <div
            className="flex items-center cursor-pointer py-1"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <FoCientWordmark height={16} className="transition-opacity hover:opacity-80" />
          </div>

          {/* Center Navigation Links with Active State Capsule */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => scrollToSection('philosophy')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'philosophy'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'hover:text-slate-900 hover:bg-white/60 text-slate-600'
              }`}
            >
              {language === 'id' ? 'Kenapa FoCient' : 'Why FoCient'}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('comparison')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'comparison'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'hover:text-slate-900 hover:bg-white/60 text-slate-600'
              }`}
            >
              {language === 'id' ? 'Beda FoCient' : 'Comparison'}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                ['features', 'feature-2', 'feature-3', 'feature-4', 'feature-5'].includes(activeSection)
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'hover:text-slate-900 hover:bg-white/60 text-slate-600'
              }`}
            >
              <span>{language === 'id' ? 'Fitur Utama' : 'Features'}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'how-it-works'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'hover:text-slate-900 hover:bg-white/60 text-slate-600'
              }`}
            >
              {language === 'id' ? 'Cara Pakai' : 'How It Works'}
            </button>
          </nav>

          {/* Right Action Controls */}
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

            {/* Login Link */}
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {language === 'id' ? 'Masuk' : 'Log In'}
            </button>

            {/* Primary Get Started CTA */}
            <button
              type="button"
              onClick={() => setAuthView('register')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>{language === 'id' ? 'Daftar' : 'Sign Up'}</span>
            </button>

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

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-fade-in text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('philosophy');
              }}
              className="block w-full text-left py-1 text-slate-700 hover:text-blue-600"
            >
              {language === 'id' ? 'Kenapa FoCient?' : 'Why FoCient?'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('comparison');
              }}
              className="block w-full text-left py-1 text-slate-700 hover:text-blue-600"
            >
              {language === 'id' ? 'Beda FoCient vs To-Do Biasa' : 'Traditional To-Do vs FoCient'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('features');
              }}
              className="block w-full text-left py-1 text-slate-700 hover:text-blue-600"
            >
              {language === 'id' ? 'Fitur Utama' : 'Core Features'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('how-it-works');
              }}
              className="block w-full text-left py-1 text-slate-700 hover:text-blue-600"
            >
              {language === 'id' ? 'Cara Pakai (3 Langkah)' : 'How It Works (3 Steps)'}
            </button>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setAuthView('login');
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-center font-bold text-xs"
              >
                {language === 'id' ? 'Masuk ke Akun' : 'Log In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setAuthView('register');
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-center font-bold text-xs"
              >
                <span>{language === 'id' ? 'Daftar' : 'Sign Up'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (HEADLINE + PARAGRAPH + CTA + APP MOCKUP - 1 SCREEN HERO)
      ────────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-white py-16 lg:py-20 scroll-mt-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                {language === 'id' ? (
                  <>
                    Jadikan harimu <span className="text-blue-600">produktif</span> tanpa rasa bersalah.
                  </>
                ) : (
                  <>
                    Make your day <span className="text-blue-600">productive</span> without the guilt.
                  </>
                )}
              </h1>

              {/* Subtitle Paragraph */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {language === 'id'
                  ? 'Bantu kamu fokus selesaikan satu per satu tugas tanpa panik. Atur jam kerja sesukamu, nikmati jeda istirahat otomatis, dan geser jadwal dengan santai kalau rencanamu berubah.'
                  : 'Focus on one task at a time without stress. Set your own hours, enjoy automatic rest breaks, and easily shift tasks when your plans change.'}
              </p>

              {/* Primary CTA Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={startOnboarding}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-xs hover:shadow-sm transition-all text-center"
                >
                  <span>{language === 'id' ? 'Mulai Sekarang' : 'Get Started'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Interactive Live Mockup Widget */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
                {/* Simulated Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'id' ? 'Sesi Fokus Hari Ini' : 'Today\'s Focus Session'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 tabular-nums flex items-center gap-1">
                    <ActivityIcon size="xs" />
                    <span>{language === 'id' ? '65% Pas' : '65% Optimal'}</span>
                  </span>
                </div>

                {/* Single-Task Spotlight Card */}
                <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
                        {language === 'id' ? 'Fokus Utama' : 'Main Focus'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {language === 'id' ? '#1 Prioritas' : '#1 Priority'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                      {language === 'id' ? '25 menit' : '25 mins'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {language === 'id' ? 'Review Desain Aplikasi' : 'Review App Design'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'id'
                        ? 'Selesaikan draft awal sebelum makan siang.'
                        : 'Finish the initial draft before lunch.'}
                    </p>
                  </div>

                  {/* Interactive Timer Controls */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleTimer}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-sm text-white ${
                          isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        title={isTimerRunning ? 'Pause timer' : 'Start focus timer'}
                      >
                        {isTimerRunning ? <PauseIcon size="sm" /> : <PlayIcon size="sm" />}
                      </button>
                      <div className="text-2xl font-mono font-extrabold text-slate-900 tabular-nums tracking-wider">
                        {formatTimer(timerSeconds)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTimerSeconds(1500)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Reset timer to 25m"
                    >
                      <RotateCcwIcon size="xs" />
                    </button>
                  </div>

                  {/* Rest Buffer Callout */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    <span>
                      {language === 'id'
                        ? '+10 menit istirahat santai setelah sesi ini.'
                        : '+10 min break scheduled right after this.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Scroll Down Indicator */}
        <div
          onClick={() => scrollToSection('philosophy')}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 cursor-pointer text-slate-400 hover:text-blue-600 transition-colors z-20 group"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
            {language === 'id' ? 'Gulir ke Bawah' : 'Scroll Down'}
          </span>
          <ChevronDownIcon size="xs" className="animate-bounce" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. PHILOSOPHY OF GUILT-FREE JOURNEY SECTION + 5 STATS CARDS
      ────────────────────────────────────────────────────────────── */}
      <section id="philosophy" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-white py-16 lg:py-24 scroll-mt-16">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {language === 'id' ? 'Kerja Lebih Tenang Tanpa Beban' : 'Work Calmly Without the Guilt'}
          </h2>

          <p className="text-sm sm:text-base font-semibold text-blue-600">
            {language === 'id' ? 'Pendekatan baru agar fokus harianmu lebih seimbang' : 'A balanced approach to your daily focus'}
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {language === 'id'
              ? 'Aplikasi to-do biasa sering bikin stres dengan daftar panjang dan tanda merah menakutkan saat ada tugas yang belum selesai. Di FoCient, kami tahu energimu ada batasnya. Di sini, kamu diajak kerja teratur, selalu ada jeda istirahat, dan geser jadwal itu hal wajar—bukan tanda kegagalan.'
              : 'Traditional to-do apps often stress you out with endless lists and alarming red marks. In FoCient, we understand that energy has limits. Work at a comfortable pace, take built-in breaks, and reschedule anytime without guilt.'}
          </p>

          {/* 3 Metric / Milestone Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-3xl font-extrabold text-blue-600 tabular-nums">0</span>
              <h4 className="text-xs font-bold text-slate-900">
                {language === 'id' ? 'Tanpa Tanda Merah' : 'Zero Red Badges'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {language === 'id' ? 'Bebas dari warna merah panik dan notifikasi yang bikin cemas.' : 'Zero panic red badges or accusatory copy.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-3xl font-extrabold text-purple-600 tabular-nums">10m</span>
              <h4 className="text-xs font-bold text-slate-900">
                {language === 'id' ? 'Ada Waktu Santai' : 'Built-in Breaks'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {language === 'id' ? 'Otomatis ada jeda istirahat setelah setiap tugas beres.' : 'Scheduled automatically between focus blocks.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-3xl font-extrabold text-amber-600 tabular-nums">100%</span>
              <h4 className="text-xs font-bold text-slate-900">
                {language === 'id' ? 'Jadwal Fleksibel' : 'Flexible Schedule'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {language === 'id' ? 'Bisa geser tugas kapan saja kalau ada urusan mendadak.' : 'Reschedule anytime without stress.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE REAL BURNOUT PROBLEM vs FOCIENT SOLUTION (COMPARISON - 1 SCREEN HERO)
      ────────────────────────────────────────────────────────────── */}
      <section id="comparison" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-[#F8FAFC] py-16 lg:py-24 scroll-mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8 relative z-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {language === 'id' ? 'To-Do List Biasa vs FoCient' : 'Traditional To-Do Apps vs FoCient'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {language === 'id'
                ? 'Kenapa to-do list biasa sering bikin stres, dan bagaimana FoCient bikin kerjamu lebih tenang.'
                : 'Why regular to-do lists leave you exhausted, and how FoCient helps you stay at ease.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch">
            {/* Left Card: The Old Way (Burnout & Guilt Cycle) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-rose-50/50 border-2 border-rose-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    {language === 'id' ? 'Cara Lama' : 'The Old Way'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-rose-950">
                  {language === 'id' ? 'To-Do List Biasa' : 'Traditional To-Do Apps'}
                </h3>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {language === 'id'
                    ? 'Daftar tugas panjang tanpa henti yang bikin cepat jenuh dan cemas.'
                    : 'Endless task lists that make you feel overwhelmed and anxious.'}
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  {[
                    language === 'id' ? 'Tanda merah menyala yang bikin panik saat tugas belum selesai.' : 'Alarming red badges that cause unnecessary panic.',
                    language === 'id' ? 'Tugas menumpuk sampai bingung harus mulai dari mana.' : 'Infinite tasks piling up with no idea where to start.',
                    language === 'id' ? 'Tidak ada batas jam kerja, gampang kebablasan lembur.' : 'No boundaries for working hours, leading to burnout.',
                    language === 'id' ? 'Geser jadwal terasa seperti sebuah kegagalan.' : 'Rescheduling a task feels like failing.',
                    language === 'id' ? 'Ngerjain banyak hal sekaligus sampai fokus berantakan.' : 'Scattered multitasking that ruins your attention.',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-rose-900 font-medium leading-snug">
                      <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
                        <XIcon size="xs" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-100/60 border border-rose-200 text-[11px] text-rose-900 font-semibold text-center">
                {language === 'id' ? 'Hasil: Pikiran capek, gampang stres, dan burnout.' : 'Outcome: Mental exhaustion, frustration, and burnout.'}
              </div>
            </div>

            {/* Right Card: The FoCient Solution (Calm Cognitive Flow) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-blue-50/50 border border-blue-200 shadow-xs space-y-3.5 flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    {language === 'id' ? 'Cara FoCient' : 'The FoCient Solution'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-blue-950">
                  {language === 'id' ? 'Fokus Santai & Teratur' : 'Calm & Steady Flow'}
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {language === 'id'
                    ? 'Selesaikan pekerjaan satu per satu sesuai energimu tanpa rasa bersalah.'
                    : 'Get things done comfortably with flexible, calm scheduling.'}
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  {[
                    language === 'id' ? 'Pengingat ramah warna oranye yang tidak bikin panik.' : 'Gentle amber reminders for adjustments without guilt.',
                    language === 'id' ? 'Fokus ke 3 tugas utama tiap hari biar tidak pusing.' : 'Top 3 daily priorities so you always know what matters.',
                    language === 'id' ? 'Atur jam kerja harian agar malammu bebas tugas.' : 'Custom daily work hours to protect your evening rest.',
                    language === 'id' ? 'Jadwal otomatis menyesuaikan kalau ada agenda yang mundur.' : 'Automatically shifts tasks when schedules change.',
                    language === 'id' ? 'Jeda istirahat otomatis setelah setiap sesi fokus.' : 'Automated 10–30 min breaks after every work session.',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-800 font-medium leading-snug">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckIcon size="xs" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-100/70 border border-blue-200 text-[11px] text-blue-950 font-bold text-center">
                {language === 'id' ? 'Hasil: Kerja beres, pikiran tenang, waktu istirahat aman.' : 'Outcome: Consistent output, calm mind, and protected rest.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. 5 CORE FEATURE SHOWCASES - FULL VIEWPORT (1 SCREEN PER FEATURE)
      ────────────────────────────────────────────────────────────── */}

      {/* ──────── FEATURE 1: Single-Task Cognitive Flow (Full Viewport) ──────── */}
      <section id="features" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-white py-16 lg:py-24 scroll-mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {language === 'id'
                  ? 'Fokus Satu Tugas Sampai Selesai'
                  : 'Focus on One Task at a Time'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'id'
                  ? 'Lupakan kebiasaan buka banyak tab dan pindah-pindah kerjaan yang bikin kepala pusing. FoCient mengarahkan fokusmu ke satu tugas aktif di layar, lengkap dengan timer santai dan waktu istirahat.'
                  : 'Stop jumping between tasks and losing focus. FoCient spotlights just one task at a time, complete with a clean timer and automatic break times.'}
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-blue-600" />
                  <span>{language === 'id' ? 'Satu tugas utama yang jadi fokus di layar' : 'One spotlighted task at a time'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-blue-600" />
                  <span>{language === 'id' ? 'Maksimal 3 tugas prioritas per hari biar tidak kewalahan' : 'Max 3 main priorities a day so you never feel overwhelmed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-blue-600" />
                  <span>{language === 'id' ? 'Bebas gangguan dan notifikasi berisik' : 'Distraction-free ambient workspace'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{language === 'id' ? 'FOKUS HARI INI' : 'TODAY\'S FOCUS'}</span>
                  <span className="text-blue-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>{language === 'id' ? 'SEDANG BERJALAN' : 'IN PROGRESS'}</span>
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white border-2 border-blue-600 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {language === 'id' ? 'Prioritas #1' : 'Priority #1'}
                    </span>
                    <span className="text-xs font-bold text-teal-700">
                      {language === 'id' ? '+10m istirahat' : '+10m break'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {language === 'id' ? 'Bereskan Laporan Mingguan' : 'Finish Weekly Report'}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">10:00 - 10:45</span>
                    <span className="font-mono font-bold text-blue-600 tabular-nums">
                      {language === 'id' ? '25:00 fokus' : '25:00 focus'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── FEATURE 2: Guilt-Free Adaptive Rescheduling (Full Viewport) ──────── */}
      <section id="feature-2" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-[#F8FAFC] py-16 lg:py-24 scroll-mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {language === 'id'
                  ? 'Jadwal Bergeser? Tenang, Otomatis Menyesuaikan'
                  : 'Schedule Shifted? Easily Adjust in One Tap'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'id'
                  ? 'Rencana bisa berubah kapan saja. Meeting molor atau ada urusan mendadak itu hal biasa. FoCient otomatis menggeser jadwal tugas berikutnya dengan jeda istirahat yang pas—tanpa tanda merah dan tanpa rasa bersalah.'
                  : 'Life happens. Meetings run long and unexpected things pop up. FoCient automatically shifts your next tasks with healthy rest breaks—no alarming red alerts, no guilt.'}
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-amber-600" />
                  <span>{language === 'id' ? 'Warna oranye hangat yang ramah, bukan merah yang bikin panik' : 'Gentle warm amber alerts instead of stressful reds'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-amber-600" />
                  <span>{language === 'id' ? 'Saran geser waktu 10–25 menit yang otomatis pas' : 'Automatic 10–25 min buffer shift suggestions'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-amber-600" />
                  <span>{language === 'id' ? 'Tinggal klik "Nanti Dulu" atau "Sesuaikan Sekarang"' : 'One click to "Keep Schedule" or "Adjust Now"'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:order-1">
              <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                  <AlertTriangleIcon size="sm" />
                  <span>{language === 'id' ? 'SARAN PENYESUAIAN JADWAL' : 'SCHEDULE ADJUSTMENT'}</span>
                </div>
                <div className={`p-4 rounded-2xl bg-white border transition-all duration-300 space-y-2 text-xs ${
                  isFeature2Rebalanced ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-amber-200'
                }`}>
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>
                      {language === 'id'
                        ? 'Jadwal bentrok antara Review Tugas dan Diskusi Tim'
                        : 'Schedule overlap between Task Review and Team Sync'}
                    </span>
                    {isFeature2Rebalanced && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {language === 'id' ? 'Terselesaikan' : 'Resolved'}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 flex items-center gap-2">
                    <span className={`line-through text-slate-400 ${isFeature2Rebalanced ? 'opacity-40' : ''}`}>14:00 - 14:25</span>
                    <span>→</span>
                    <span className="font-bold text-emerald-700">
                      14:40 - 15:05 ({language === 'id' ? '+15m istirahat' : '+15m break'})
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-xs font-bold">
                  {isFeature2Rebalanced ? (
                    <button
                      type="button"
                      onClick={() => setIsFeature2Rebalanced(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckIcon size="xs" />
                      <span>{language === 'id' ? 'Jadwal Pas! (Klik Reset Demo)' : 'Adjusted! (Reset Demo)'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsFeature2Rebalanced(false)}
                        className="px-3 py-1.5 rounded-lg text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        {language === 'id' ? 'Nanti Dulu' : 'Later'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFeature2Rebalanced(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-xs cursor-pointer"
                      >
                        {language === 'id' ? 'Sesuaikan Sekarang' : 'Adjust Now'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── FEATURE 3: Dynamic Workload Capacity Meter (Full Viewport) ──────── */}
      <section id="feature-3" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-white py-16 lg:py-24 scroll-mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {language === 'id'
                  ? 'Ketahui Batas Beban Kerja Harianmu'
                  : 'Know Your Daily Workload Limit'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'id'
                  ? 'Kapasitas harianmu dihitung dari jam mulai dan selesai kerja yang kamu tentukan. Kalau tugasmu sudah mulai penuh, FoCient akan memberi tahu dengan warna ramah agar sisa tugas bisa dipindah ke hari esok.'
                  : 'Your daily capacity is based on your own working hours. If your day gets too packed, FoCient gives a gentle nod to move extra tasks to tomorrow.'}
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-teal-600" />
                  <span>{language === 'id' ? 'Disesuaikan dengan jam mulai dan selesai kerjamu' : 'Matches the work start and end hours you choose'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-teal-600" />
                  <span>{language === 'id' ? 'Warna berganti perlahan tanpa tanda merah yang bikin cemas' : 'Gentle color transitions without any stressful red badges'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {language === 'id' ? 'Coba Geser Beban Kerja' : 'Simulate Daily Workload'}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                    simulatedPercent > 90 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    <ActivityIcon size="xs" />
                    <span>{simulatedMinutes}m / 480m ({simulatedPercent}%)</span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      simulatedPercent > 90 ? 'bg-amber-500' : simulatedPercent > 70 ? 'bg-blue-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${simulatedPercent}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="60"
                  max="600"
                  step="15"
                  value={simulatedMinutes}
                  onChange={(e) => setSimulatedMinutes(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />

                <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                  {simulatedPercent > 90 ? (
                    <>
                      <AlertTriangleIcon size="xs" className="text-amber-600 shrink-0" />
                      <span>{language === 'id' ? 'Mulai padat: Sebaiknya geser tugas tambahan ke besok biar tidak capek.' : 'Getting full: Consider moving extra tasks to tomorrow.'}</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon size="xs" className="text-emerald-600 shrink-0" />
                      <span>{language === 'id' ? 'Beban kerja aman: Waktu kerja dan istirahat seimbang.' : 'Optimal workload: Balanced pace with plenty of rest.'}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── FEATURE 4: Circadian Rhythm & Chronotype Pacing (Full Viewport) ──────── */}
      <section id="feature-4" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-[#F8FAFC] py-16 lg:py-24 scroll-mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {language === 'id'
                  ? 'Kerja Sesuai Waktu Segarmu'
                  : 'Work When You Are at Your Best'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'id'
                  ? 'Setiap orang punya jam paling produktif yang berbeda. Kerjakan tugas berat saat energimu sedang di puncak, dan simpan urusan ringan saat energi mulai turun.'
                  : 'Everyone has different peak hours. Do your toughest thinking when your energy is highest, and save easy chores for when you feel tired.'}
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-purple-600" />
                  <span>{language === 'id' ? '3 pilihan ritme: Pagi (Early Bird), Siang (Steady Pacer), atau Malam (Night Owl)' : '3 rhythm choices: Early Bird, Steady Pacer, or Night Owl'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-purple-600" />
                  <span>{language === 'id' ? 'Jam mulai dan selesai kerja otomatis menyesuaikan pilihanmu' : 'Work start and end times automatically adjust to your pace'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:order-1">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'early' as const, label: language === 'id' ? 'Pagi' : 'Early Bird', time: '06:00 - 14:00', icon: <SunIcon size="sm" className="text-amber-500 mx-auto mb-1" /> },
                    { id: 'steady' as const, label: language === 'id' ? 'Normal' : 'Steady Pacer', time: '09:00 - 17:00', icon: <ClockIcon size="sm" className="text-blue-500 mx-auto mb-1" /> },
                    { id: 'night' as const, label: language === 'id' ? 'Malam' : 'Night Owl', time: '14:00 - 22:00', icon: <MoonIcon size="sm" className="text-indigo-500 mx-auto mb-1" /> },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveChronotype(c.id)}
                      className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                        activeChronotype === c.id
                          ? 'bg-white border-purple-500 shadow-sm text-purple-900 font-bold ring-2 ring-purple-100'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div>{c.icon}</div>
                      <div className="text-xs">{c.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.time}</div>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    {activeChronotype === 'early' && (
                      <>
                        <SunIcon size="xs" className="text-amber-500" />
                        <span>
                          {language === 'id'
                            ? 'Paling pas fokus berat di jam 07:00 - 10:00 pagi'
                            : 'High focus best at 07:00 - 10:00 AM'}
                        </span>
                      </>
                    )}
                    {activeChronotype === 'steady' && (
                      <>
                        <ClockIcon size="xs" className="text-blue-500" />
                        <span>
                          {language === 'id'
                            ? 'Paling pas fokus berat di jam 10:00 - 13:00 siang'
                            : 'High focus best at 10:00 AM - 1:00 PM'}
                        </span>
                      </>
                    )}
                    {activeChronotype === 'night' && (
                      <>
                        <MoonIcon size="xs" className="text-indigo-500" />
                        <span>
                          {language === 'id'
                            ? 'Paling pas fokus berat di jam 16:00 - 20:00 malam'
                            : 'High focus best at 4:00 - 8:00 PM'}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {language === 'id'
                      ? 'FoCient akan bantu taruh tugas penting di jam-jam penuh energi ini.'
                      : 'FoCient helps schedule high-priority tasks during your peak hours.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── FEATURE 5: Weekly Reflection & Insights (Full Viewport) ──────── */}
      <section id="feature-5" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-white py-16 lg:py-24 scroll-mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {language === 'id'
                  ? 'Lihat Hasil Mingguanmu dengan Tenang'
                  : 'Check Your Weekly Progress Without Stress'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'id'
                  ? 'Tidak ada hitungan "streak" atau hukuman kalau kamu libur. FoCient memperlihatkan seberapa baik kamu menjaga waktu istirahat dan menjaga pikiran tetap segar sepanjang minggu.'
                  : 'No toxic streaks or punishment for taking days off. FoCient shows how well you took care of rest breaks and kept your mind clear throughout the week.'}
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-emerald-600" />
                  <span>{language === 'id' ? 'Pantau beban kerja 7 hari tanpa rasa bersalah' : 'View your 7-day workload distribution without guilt'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size="xs" className="text-emerald-600" />
                  <span>{language === 'id' ? 'Lihat total waktu istirahat yang berhasil kamu nikmati' : 'See your total restorative rest time protected'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{language === 'id' ? 'BEBAN KERJA MINGGU INI' : 'WEEKLY WORKLOAD'}</span>
                  <span className="text-emerald-600">{language === 'id' ? 'RITME SEHAT' : 'HEALTHY PACE'}</span>
                </div>

                {/* 7-Day Mini Chart with Interactive Clickable Day Bars */}
                <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28">
                  {[
                    { day: 'M', fullDay: language === 'id' ? 'Senin' : 'Monday', pct: 65, buffer: language === 'id' ? '1j' : '1.0h' },
                    { day: 'T', fullDay: language === 'id' ? 'Selasa' : 'Tuesday', pct: 70, buffer: language === 'id' ? '1j 10m' : '1.2h' },
                    { day: 'W', fullDay: language === 'id' ? 'Rabu' : 'Wednesday', pct: 85, buffer: language === 'id' ? '48m' : '0.8h' },
                    { day: 'T', fullDay: language === 'id' ? 'Kamis' : 'Thursday', pct: 60, buffer: language === 'id' ? '1j 30m' : '1.5h' },
                    { day: 'F', fullDay: language === 'id' ? 'Jumat' : 'Friday', pct: 55, buffer: language === 'id' ? '1j 30m' : '1.5h' },
                    { day: 'S', fullDay: language === 'id' ? 'Sabtu' : 'Saturday', pct: 20, buffer: language === 'id' ? '2j' : '2.0h' },
                    { day: 'S', fullDay: language === 'id' ? 'Minggu' : 'Sunday', pct: 15, buffer: language === 'id' ? '2j' : '2.0h' },
                  ].map((d, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedDayIndex(i)}
                      className="flex flex-col items-center gap-1 h-full justify-end cursor-pointer group"
                      title={`${d.fullDay}: ${d.pct}% workload, ${d.buffer} rest buffer`}
                    >
                      <span className={`text-[10px] font-mono transition-colors ${selectedDayIndex === i ? 'text-blue-600 font-bold' : 'text-slate-400 group-hover:text-slate-700'}`}>
                        {d.pct}%
                      </span>
                      <div className={`w-full rounded-t-md h-16 flex items-end overflow-hidden transition-all ${
                        selectedDayIndex === i ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            selectedDayIndex === i ? 'bg-blue-600 shadow-sm' : 'bg-blue-500 group-hover:bg-blue-600'
                          }`}
                          style={{ height: `${d.pct}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-bold transition-colors ${selectedDayIndex === i ? 'text-blue-700' : 'text-slate-600'}`}>
                        {d.day}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2 transition-all">
                  <div className="flex items-center gap-2">
                    <CheckIcon size="xs" className="text-emerald-700 shrink-0" />
                    <span className="font-semibold">
                      {selectedDayIndex === 2
                        ? (language === 'id' ? 'Rabu: 85% fokus dengan 48m waktu istirahat terjaga.' : 'Wednesday: 85% peak flow with 48m protected rest buffer.')
                        : (language === 'id' ? 'Ritme harian seimbang tanpa kelelahan berlebih.' : 'Sustainable daily pace with protected rest buffers.')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold tabular-nums">
                    {language === 'id' ? 'Bebas Stres' : '100% Guilt-Free'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. 3 SIMPLE STEPS TO GUILT-FREE FOCUS (HOW IT WORKS)
      ────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative overflow-hidden min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex items-center justify-center border-b border-slate-200 bg-[#F8FAFC] py-16 lg:py-24 scroll-mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {language === 'id'
                ? '3 Langkah Sederhana Menuju Kerja Tenang'
                : '3 Simple Steps to Calm Productivity'}
            </h2>
            <p className="text-sm text-slate-600">
              {language === 'id'
                ? 'Mulai rasakan kerja lebih santai dalam kurang dari 2 menit.'
                : 'Start experiencing calm focus in less than 2 minutes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: 3 Steps + CTA Button */}
            <div className="lg:col-span-6 space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'id' ? 'Langkah 1: Tentukan Jam Kerja & Waktu Istirahat' : 'Step 1: Set Your Work Hours & Breaks'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {language === 'id'
                      ? 'Tentukan jam mulai kerja, jam selesai, dan berapa lama kamu ingin istirahat di sela tugas.'
                      : 'Set your ideal work hours and choose how much rest buffer you need between tasks.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'id' ? 'Langkah 2: Tentukan 3 Tugas Utama Hari Ini' : 'Step 2: Choose 3 Main Tasks for Today'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {language === 'id'
                      ? 'Pilih 3 hal paling penting yang ingin kamu selesaikan hari ini. Tugas lainnya disimpan rapi di backlog.'
                      : 'Pick only the 3 key priorities for today. Keep the rest safely tucked away in your calm backlog.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'id' ? 'Langkah 3: Jalani Santai & Sesuaikan Kapan Saja' : 'Step 3: Flow Smoothly & Adjust Anytime'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {language === 'id'
                      ? 'Kerjakan tugas satu per satu. Kalau rencanamu bergeser, tinggal sesuaikan jadwal dalam satu klik.'
                      : 'Execute in single-task flow. If your day shifts, easily adjust your schedule in one click.'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={startOnboarding}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-focient-3 transition-all text-center"
                >
                  <span>{language === 'id' ? 'Mulai Sekarang' : 'Get Started'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Journey Preview Card */}
            <div className="lg:col-span-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckIcon size="md" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {language === 'id' ? 'Kerja Beres, Pikiran Tenang' : 'Work Done, Mind at Ease'}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    {language === 'id'
                      ? 'Semua tugas penting hari ini beres tanpa lembur. Waktunya santai dan nikmati waktu luangmu.'
                      : 'All planned focus blocks completed without overwork. Time to enjoy your evening guilt-free.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>{language === 'id' ? 'Ritme Kerja Seimbang' : 'Balanced Rhythm'}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckIcon size="xs" />
                    <span>{language === 'id' ? '100% Pas' : '100% Balanced'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FOOTER SECTION (LINKS, MISSION, WCAG COMPLIANCE & LEGAL)
      ────────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Col 1 & 2: Brand & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <div className="py-1">
                <FoCientWordmark height={17} light className="mb-1" />
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                {language === 'id'
                  ? 'FoCient adalah aplikasi pengatur fokus harian yang membantu kamu menyelesaikan pekerjaan dengan tenang, tanpa rasa panik, dan tanpa lembur berlebihan.'
                  : 'FoCient is a calm productivity system that helps you get work done smoothly, without anxiety or endless overwork.'}
              </p>
            </div>

            {/* Col 3: Product */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                {language === 'id' ? 'Produk' : 'Product'}
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    {language === 'id' ? 'Fitur Utama' : 'Features'}
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={loginAsGuest}
                    className="hover:text-white transition-colors"
                  >
                    {language === 'id' ? 'Coba Demo' : 'Try Demo'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Philosophy */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                {language === 'id' ? 'Filosofi' : 'Philosophy'}
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="#philosophy" className="hover:text-white transition-colors">
                    {language === 'id' ? 'Kenapa FoCient' : 'Why FoCient'}
                  </a>
                </li>
                <li>
                  <a href="#comparison" className="hover:text-white transition-colors">
                    {language === 'id' ? 'Beda FoCient' : 'Comparison'}
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {language === 'id' ? 'Ketentuan Waktu' : 'Schedule Policy'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 5: Access & Legal */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                {language === 'id' ? 'Akun' : 'Account'}
              </h5>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="hover:text-white transition-colors"
                  >
                    {language === 'id' ? 'Masuk' : 'Log In'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setAuthView('register')}
                    className="hover:text-white transition-colors"
                  >
                    {language === 'id' ? 'Daftar Gratis' : 'Sign Up Free'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    {language === 'id' ? 'Syarat Layanan' : 'Terms of Service'}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Status */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              FoCient • Focus &amp; Flow
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>
                  {language === 'id' ? 'Status: Semua Sistem Beroperasi Normal' : 'Status: All Systems Operational'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="hover:text-white underline uppercase"
              >
                {language === 'en' ? 'Bahasa Indonesia' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
