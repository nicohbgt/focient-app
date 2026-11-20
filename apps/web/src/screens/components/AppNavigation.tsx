'use client';

import React from 'react';
import { useFocient } from '../../state/focient-store.js';
import {
  LayoutDashboardIcon,
  CalendarIcon,
  PlusIcon,
  ClockIcon,
  SparklesIcon,
  TagIcon,
  BellIcon,
} from '../../components/icons/index.js';
import { CommandPalette } from '../../components/organism/CommandPalette.js';
import { ContextPreservationDialog } from '../../components/organism/ContextPreservationDialog.js';
import { FoCientWordmark } from '../../components/brand/FoCientWordmark.js';
import { NotificationCenterModal } from './NotificationCenterModal.js';
import { getAvatarInitial } from '../../lib/utils.js';

export const AppNavigation: React.FC = () => {
  const {
    activeNavTab,
    safeNavigate,
    openAddTaskModal,
    language,
    user,
    setLanguage,
    badgeCounts,
    isScrolled,
    activeCalendarDate,
    navigateDate,
    toggleCommandPalette,
    isMobileKeyboardActive,
    unreadNotificationCount,
    openNotificationPanel,
  } = useFocient();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: language === 'id' ? 'Beranda' : 'Dashboard',
      icon: <LayoutDashboardIcon size="sm" />,
      badge: 0,
    },
    {
      id: 'plan' as const,
      label: language === 'id' ? 'Rencana Hari Ini' : "Today's Plan",
      icon: <SparklesIcon size="sm" />,
      badge: badgeCounts.todayPlan,
    },
    {
      id: 'tasks' as const,
      label: language === 'id' ? 'Daftar Tugas' : 'Task List',
      icon: <CalendarIcon size="sm" />,
      badge: badgeCounts.tasks,
    },
    {
      id: 'reschedule' as const,
      label: language === 'id' ? 'Penyesuaian' : 'Reschedule',
      icon: <ClockIcon size="sm" />,
      badge: badgeCounts.reschedule,
    },
    {
      id: 'insights' as const,
      label: language === 'id' ? 'Refleksi' : 'Insights',
      icon: <SparklesIcon size="sm" />,
      badge: badgeCounts.insights,
    },
  ];

  return (
    <>
      {/* Mobile Top Header (Sticky Elevation for Phone Viewports) */}
      <header
        className={`md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b sticky top-0 z-30 transition-all ${
          isScrolled
            ? 'border-slate-300 shadow-xs bg-white/95 backdrop-blur-md'
            : 'border-slate-200 shadow-none'
        }`}
      >
        <div
          className="flex items-center cursor-pointer py-1"
          onClick={() => safeNavigate('dashboard')}
        >
          <FoCientWordmark height={16} className="transition-opacity hover:opacity-85" />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Notification Button */}
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

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              getAvatarInitial(user?.name)
            )}
          </div>
        </div>
      </header>

      {/* Desktop & Tablet Top Header Bar (Sticky Elevation & Zero Layout Shift) */}
      <header
        className={`hidden md:flex items-center justify-between px-4 lg:px-6 py-2.5 bg-white border-b sticky top-0 z-30 transition-all ${
          isScrolled
            ? 'border-slate-300 shadow-xs bg-white/95 backdrop-blur-md'
            : 'border-slate-200 shadow-none'
        }`}
      >
        <div className="flex items-center gap-8">
          <div
            className="flex items-center cursor-pointer py-1"
            onClick={() => safeNavigate('dashboard')}
          >
            <FoCientWordmark height={17} className="transition-opacity hover:opacity-85" />
          </div>

          {/* Desktop Nav Items */}
          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeNavTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => safeNavigate(item.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openAddTaskModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <PlusIcon size="xs" />
            <span>{language === 'id' ? 'Tambah Tugas' : 'Add Task'}</span>
          </button>

          {/* Notification Button */}
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

          <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              getAvatarInitial(user?.name)
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Hidden when mobile virtual keyboard is active) */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around z-40 shadow-xs transition-transform duration-200 ${
          isMobileKeyboardActive ? 'translate-y-full pointer-events-none' : 'translate-y-0'
        }`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      >
        {/* Dashboard Tab */}
        <button
          type="button"
          onClick={() => safeNavigate('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[11px] font-medium transition-transform active:scale-95 ${
            activeNavTab === 'dashboard' ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
          aria-label="Dashboard"
        >
          <LayoutDashboardIcon size="sm" />
          <span className="mt-0.5">{language === 'id' ? 'Beranda' : 'Home'}</span>
          {activeNavTab === 'dashboard' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" aria-hidden="true" />
          )}
        </button>

        {/* Plan Tab */}
        <button
          type="button"
          onClick={() => safeNavigate('plan')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[11px] font-medium transition-transform active:scale-95 relative ${
            activeNavTab === 'plan' ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
          aria-label="Today Plan"
        >
          <div className="relative">
            <SparklesIcon size="sm" />
            {badgeCounts.todayPlan > 0 && (
              <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                {badgeCounts.todayPlan}
              </span>
            )}
          </div>
          <span className="mt-0.5">{language === 'id' ? 'Rencana' : 'Plan'}</span>
          {activeNavTab === 'plan' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" aria-hidden="true" />
          )}
        </button>

        {/* Central Add Task Action Button (48px hit target with tactility) */}
        <button
          type="button"
          onClick={() => openAddTaskModal()}
          className="w-12 h-12 -mt-5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center shadow-sm transition-transform"
          aria-label="Add Task"
        >
          <PlusIcon size="md" strokeWidth={2.5} />
        </button>

        {/* Task List Tab */}
        <button
          type="button"
          onClick={() => safeNavigate('tasks')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[11px] font-medium transition-transform active:scale-95 relative ${
            activeNavTab === 'tasks' ? 'text-blue-600 font-semibold' : 'text-slate-500'
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
          {activeNavTab === 'tasks' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" aria-hidden="true" />
          )}
        </button>

        {/* Insights Tab */}
        <button
          type="button"
          onClick={() => safeNavigate('insights')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[11px] font-medium transition-transform active:scale-95 ${
            activeNavTab === 'insights' ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
          aria-label="Insights"
        >
          <SparklesIcon size="sm" />
          <span className="mt-0.5">{language === 'id' ? 'Refleksi' : 'Insights'}</span>
          {activeNavTab === 'insights' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Global Command Palette, Notification Center & Context Preservation Dialog */}
      <CommandPalette />
      <ContextPreservationDialog />
      <NotificationCenterModal />
    </>
  );
};
