'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFocient, ActiveNavTab } from '../../state/focient-store.js';
import {
  LayoutDashboardIcon,
  CalendarIcon,
  PlusIcon,
  ClockIcon,
  SparklesIcon,
  TagIcon,
  ActivityIcon,
  RefreshCcwIcon,
  AlertTriangleIcon,
  BellIcon,
} from '../../components/icons/index.js';
import { SideNavBar, SideNavItem } from '../../components/organism/NavBar.js';
import { CommandPalette } from '../../components/organism/CommandPalette.js';
import { ContextPreservationDialog } from '../../components/organism/ContextPreservationDialog.js';
import { NotificationCenterModal } from './NotificationCenterModal.js';
import { calculateCapacityMinutes } from '../../lib/date-utils.js';
import { FoCientWordmark } from '../../components/brand/FoCientWordmark.js';
import { getAvatarInitial } from '../../lib/utils.js';

export interface MainAppShellProps {
  children: React.ReactNode;
}

export const MainAppShell: React.FC<MainAppShellProps> = ({ children }) => {
  const {
    activeNavTab,
    safeNavigate,
    openAddTaskModal,
    setOnboardingStep,
    language,
    user,
    isAuthenticated,
    setLanguage,
    badgeCounts,
    isScrolled,
    activeCalendarDate,
    navigateDate,
    toggleCommandPalette,
    isMobileKeyboardActive,
    isSidebarCollapsed,
    toggleSidebar,
    allocatedMinutes,
    refreshTasksFromDb,
    devicePreview,
    openNotificationPanel,
    unreadNotificationCount,
  } = useFocient();

  const [isSyncing, setIsSyncing] = useState(false);

  // Auth guard: If user is unauthenticated inside MainAppShell, redirect cleanly to /login
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      if (!window.location.pathname.startsWith('/auth') && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/login');
        window.location.replace('/login');
      }
    }
  }, [isAuthenticated]);

  // Manual DB Refresh handler with visual feedback
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await refreshTasksFromDb();
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const pathname = usePathname();

  const isDashboardActive = pathname === '/dashboard' || pathname.startsWith('/dashboard');
  const isTodayActive = pathname === '/today' || pathname.startsWith('/today') || pathname === '/plan';
  const isTasksActive = pathname.startsWith('/tasks');
  const isInsightsActive = pathname.startsWith('/insights');
  const isSettingsActive = pathname.startsWith('/settings');

  // Workload percentage calculation (dynamically tailored to user's schedule window)
  const capacityMinutes = calculateCapacityMinutes(user?.workHourStart || '09:00', user?.workHourEnd || '17:00');
  const workloadPercent = Math.min(100, Math.round((allocatedMinutes / capacityMinutes) * 100));

  // Active Screen Titles for Header dynamically based on URL pathname
  const getScreenTitle = () => {
    if (isDashboardActive) {
      return language === 'id' ? 'Beranda' : 'Dashboard';
    }
    if (isTasksActive) {
      return language === 'id' ? 'Daftar Tugas' : 'Task List';
    }
    if (isInsightsActive) {
      return language === 'id' ? 'Refleksi' : 'Insights & Reflection';
    }
    if (isSettingsActive) {
      return language === 'id' ? 'Pengaturan' : 'Settings';
    }
    return language === 'id' ? 'Rencana Hari Ini' : "Today's Plan";
  };

  // Nav Items configured for SideNavBar organism with canonical URLs
  const sideNavItems: SideNavItem[] = [
    {
      id: 'dashboard',
      label: language === 'id' ? 'Beranda' : 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboardIcon size="sm" />,
      active: isDashboardActive,
      badgeCount: 0,
      onClick: () => safeNavigate('dashboard'),
    },
    {
      id: 'plan',
      label: language === 'id' ? 'Rencana Hari Ini' : "Today's Plan",
      href: '/today',
      icon: <SparklesIcon size="sm" />,
      active: isTodayActive,
      badgeCount: badgeCounts.todayPlan + badgeCounts.reschedule,
      onClick: () => safeNavigate('plan'),
    },
    {
      id: 'tasks',
      label: language === 'id' ? 'Daftar Tugas' : 'Task List',
      href: '/tasks',
      icon: <CalendarIcon size="sm" />,
      active: isTasksActive,
      badgeCount: badgeCounts.tasks,
      onClick: () => safeNavigate('tasks'),
    },
    {
      id: 'insights',
      label: language === 'id' ? 'Refleksi' : 'Insights',
      href: '/insights',
      icon: <ActivityIcon size="sm" />,
      active: isInsightsActive,
      badgeCount: badgeCounts.insights,
      onClick: () => safeNavigate('insights'),
    },
    {
      id: 'settings',
      label: language === 'id' ? 'Pengaturan' : 'Settings',
      href: '/settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      active: isSettingsActive,
      badgeCount: 0,
      onClick: () => safeNavigate('settings'),
    },
    ...(user?.provider === 'guest'
      ? [
          {
            id: 'onboarding-demo',
            label: language === 'id' ? 'Tur Onboarding' : 'Onboarding Tour',
            href: '/onboarding',
            icon: <SparklesIcon size="sm" />,
            active: pathname === '/onboarding',
            badgeCount: 0,
            onClick: () => {
              setOnboardingStep(1);
              safeNavigate('onboarding' as any);
            },
          },
        ]
      : []),
  ];

  // Pure responsive design for commercial release
  const isForcedMobile = false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative font-sans antialiased text-slate-900">
      {/* -------------------------------------------------------------
          1. DESKTOP & TABLET: SIDE NAVBAR
          Expanded 260px (desktop) / Collapsed 72px rail (tablet).
          Active Cobalt indicator bar (3px solid #2563EB).
          Anti-flicker 300ms delay tooltips on rail mode.
          Integrated DailyCapacityMeter + User Profile.
          ------------------------------------------------------------- */}
      {!isForcedMobile && (
        <div className="hidden md:flex shrink-0">
          <SideNavBar
            items={sideNavItems}
            collapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            allocatedMinutes={allocatedMinutes}
            totalCapacityMinutes={capacityMinutes}
          />
        </div>
      )}

      {/* -------------------------------------------------------------
          2. RIGHT COLUMN: STICKY TOP BAR + MAIN SCROLLABLE VIEWPORT
          ------------------------------------------------------------- */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* DESKTOP & TABLET STICKY TOP BAR */}
        {!isForcedMobile && (
          <header
            className={`hidden md:flex items-center justify-between px-6 py-3.5 bg-white border-b sticky top-0 z-30 transition-all ${
              isScrolled
                ? 'border-slate-300 shadow-xs bg-white/95 backdrop-blur-md'
                : 'border-slate-200 shadow-none'
            }`}
          >
            {/* Left: Active Screen Title */}
            <div className="flex items-center gap-4">
              <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight">
                {getScreenTitle()}
              </h1>
            </div>

            {/* Right: Refresh + Notification + CTA */}
            <div className="flex items-center gap-3">
              {/* Demo Mode Onboarding Tour Link */}
              {user?.provider === 'guest' && (
                <Link
                  href="/onboarding"
                  onClick={() => setOnboardingStep(1)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all shadow-2xs"
                  title={language === 'id' ? 'Demonstrasi Setup Onboarding' : 'Onboarding Setup Demo'}
                >
                  <SparklesIcon size="xs" />
                  <span>{language === 'id' ? 'Tur Onboarding' : 'Onboarding Tour'}</span>
                </Link>
              )}

              {/* Refresh Action Button */}
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title={language === 'id' ? 'Segarkan Data' : 'Refresh Data'}
                aria-label={language === 'id' ? 'Segarkan data' : 'Refresh data'}
              >
                <RefreshCcwIcon size="xs" className={isSyncing ? 'animate-spin text-blue-600' : ''} />
              </button>

              {/* Notification Center Trigger */}
              <button
                type="button"
                onClick={openNotificationPanel}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
                title={language === 'id' ? 'Pusat Pemberitahuan' : 'Notifications'}
                aria-label="Notifications"
              >
                <BellIcon size="xs" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Add Task Primary CTA */}
              <button
                type="button"
                onClick={() => openAddTaskModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
              >
                <PlusIcon size="xs" />
                <span>{language === 'id' ? 'Tambah Tugas' : 'Add Task'}</span>
              </button>

              {/* User Avatar & Settings Trigger */}
              <button
                type="button"
                onClick={() => safeNavigate('settings')}
                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200 transition-colors cursor-pointer overflow-hidden"
                title={user?.name ? `${user.name} (${language === 'id' ? 'Buka Pengaturan' : 'Open Settings'})` : 'Settings'}
                aria-label="Settings"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  getAvatarInitial(user?.name)
                )}
              </button>
            </div>
          </header>
        )}

        {/* -------------------------------------------------------------
            3. MOBILE STICKY TOP HEADER (< 768px or Mobile Device Preview)
            ------------------------------------------------------------- */}
        {(isForcedMobile || true) && (
          <header
            className={`flex items-center justify-between px-4 py-2.5 bg-white border-b sticky top-0 z-30 transition-all ${
              isForcedMobile ? 'flex' : 'md:hidden'
            } ${
              isScrolled
                ? 'border-slate-300 shadow-xs bg-white/95 backdrop-blur-md'
                : 'border-slate-200 shadow-none'
            }`}
          >
            {/* Brand Wordmark (Standalone & Spacious) */}
            <div
              className="flex items-center cursor-pointer py-1"
              onClick={() => safeNavigate('dashboard')}
            >
              <FoCientWordmark height={16} className="transition-opacity hover:opacity-85" />
            </div>

            {/* Mobile Header Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 uppercase"
              >
                {language}
              </button>

              {/* Mobile Notification Trigger */}
              <button
                type="button"
                onClick={openNotificationPanel}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
                title={language === 'id' ? 'Pusat Pemberitahuan' : 'Notifications'}
                aria-label="Notifications"
              >
                <BellIcon size="xs" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Avatar & Settings Trigger */}
              <button
                type="button"
                onClick={() => safeNavigate('settings')}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
                title="Settings"
                aria-label="Settings"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  getAvatarInitial(user?.name)
                )}
              </button>
            </div>
          </header>
        )}

        {/* -------------------------------------------------------------
            4. MAIN VIEWPORT CONTENT (Fluid & Responsive)
            ------------------------------------------------------------- */}
        <main className={`flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto ${isForcedMobile ? 'pb-24' : 'pb-24 md:pb-8'}`}>
          {children}
        </main>
      </div>

      {/* -------------------------------------------------------------
          5. MOBILE FIXED BOTTOM NAVIGATION BAR
          48px touch-safe hit area.
          Physical touch haptic feedback.
          Active Cobalt 4px micro-dot.
          Virtual keyboard auto-hide.
          ------------------------------------------------------------- */}
      <nav
        className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around z-40 shadow-lg transition-transform duration-200 ${
          isForcedMobile ? 'flex' : 'md:hidden'
        } ${isMobileKeyboardActive ? 'translate-y-full pointer-events-none' : 'translate-y-0'}`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
        aria-label="Mobile Navigation"
      >
        {/* Dashboard Tab */}
        <Link
          href="/dashboard"
          onClick={() => safeNavigate('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[11px] font-medium transition-transform active:scale-95 ${
            isDashboardActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
          aria-label="Dashboard"
        >
          <LayoutDashboardIcon size="sm" />
          <span className="mt-0.5">{language === 'id' ? 'Beranda' : 'Home'}</span>
          {isDashboardActive && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" aria-hidden="true" />
          )}
        </Link>

        {/* Plan Tab */}
        <Link
          href="/today"
          onClick={() => safeNavigate('plan')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[11px] font-medium transition-transform active:scale-95 relative ${
            isTodayActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
          aria-label="Today Plan"
        >
          <div className="relative">
            <SparklesIcon size="sm" />
            {(badgeCounts.todayPlan + badgeCounts.reschedule) > 0 && (
              <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                {badgeCounts.todayPlan + badgeCounts.reschedule}
              </span>
            )}
          </div>
          <span className="mt-0.5">{language === 'id' ? 'Rencana' : 'Plan'}</span>
          {isTodayActive && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" aria-hidden="true" />
          )}
        </Link>

        {/* Central Add Task Action Button (48px hit target with tactility) */}
        <button
          type="button"
          onClick={() => openAddTaskModal()}
          className="w-12 h-12 -mt-5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center shadow-lg transition-transform focus-visible:outline-2 focus-visible:outline-blue-400"
          aria-label={language === 'id' ? 'Tambah Tugas' : 'Add Task'}
        >
          <PlusIcon size="md" strokeWidth={2.5} />
        </button>

        {/* Task List Tab */}
        <Link
          href="/tasks"
          onClick={() => safeNavigate('tasks')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[11px] font-medium transition-transform active:scale-95 relative ${
            isTasksActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
          aria-label="Tasks"
        >
          <div className="relative">
            <CalendarIcon size="sm" />
            {badgeCounts.tasks > 0 && (
              <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                {badgeCounts.tasks}
              </span>
            )}
          </div>
          <span className="mt-0.5">{language === 'id' ? 'Tugas' : 'Tasks'}</span>
          {isTasksActive && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" aria-hidden="true" />
          )}
        </Link>

        {/* Insights Tab */}
        <Link
          href="/insights"
          onClick={() => safeNavigate('insights')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[11px] font-medium transition-transform active:scale-95 ${
            isInsightsActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
          aria-label="Insights"
        >
          <ActivityIcon size="sm" />
          <span className="mt-0.5">{language === 'id' ? 'Refleksi' : 'Insights'}</span>
          {isInsightsActive && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" aria-hidden="true" />
          )}
        </Link>
      </nav>

      {/* Global Command Palette, Notification Center & Context Preservation Dialog */}
      <CommandPalette />
      <ContextPreservationDialog />
      <NotificationCenterModal />
    </div>
  );
};
