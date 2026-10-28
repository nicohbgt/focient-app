'use client';

import React from 'react';
import { useFocient } from '../../state/focient-store';
import {
  LayoutDashboardIcon,
  CalendarIcon,
  PlusIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
} from '../../components/icons';

export const AppNavigation: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    openAddTaskModal,
    language,
    user,
    setLanguage,
  } = useFocient();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: language === 'id' ? 'Beranda' : 'Dashboard',
      icon: <LayoutDashboardIcon size="sm" />,
    },
    {
      id: 'plan' as const,
      label: language === 'id' ? 'Rencana' : 'Today Plan',
      icon: <SparklesIcon size="sm" />,
    },
    {
      id: 'tasks' as const,
      label: language === 'id' ? 'Daftar Tugas' : 'Task List',
      icon: <CalendarIcon size="sm" />,
    },
  ];

  return (
    <>
      {/* Desktop Top Header Bar (hidden on mobile) */}
      <header className="hidden md:flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveNavTab('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              F
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">FoCient</span>
          </div>

          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeNavTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNavTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
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

          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 uppercase"
          >
            {language}
          </button>

          <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
            {user?.name?.slice(0, 2).toUpperCase() || 'AJ'}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around z-40 shadow-lg">
        {/* Dashboard Tab */}
        <button
          type="button"
          onClick={() => setActiveNavTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            activeNavTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboardIcon size="sm" />
          <span>{language === 'id' ? 'Beranda' : 'Home'}</span>
        </button>

        {/* Plan Tab */}
        <button
          type="button"
          onClick={() => setActiveNavTab('plan')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            activeNavTab === 'plan' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <SparklesIcon size="sm" />
          <span>{language === 'id' ? 'Rencana' : 'Plan'}</span>
        </button>

        {/* Central Add Task Action Button */}
        <button
          type="button"
          onClick={() => openAddTaskModal()}
          className="w-12 h-12 -mt-5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform"
          aria-label="Add Task"
        >
          <PlusIcon size="md" strokeWidth={2.5} />
        </button>

        {/* Task List Tab */}
        <button
          type="button"
          onClick={() => setActiveNavTab('tasks')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            activeNavTab === 'tasks' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <CalendarIcon size="sm" />
          <span>{language === 'id' ? 'Tugas' : 'Tasks'}</span>
        </button>
      </nav>
    </>
  );
};
