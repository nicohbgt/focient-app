'use client';

import React, { useState } from 'react';
import { useFocient, ScreenInspectorView } from '../../state/focient-store';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '../../components/icons';

export const ScreenInspectorOverlay: React.FC = () => {
  const {
    inspectorView,
    setInspectorView,
    emptyStateMode,
    setEmptyStateMode,
    devicePreview,
    setDevicePreview,
    language,
    setLanguage,
  } = useFocient();

  const [isOpen, setIsOpen] = useState(false);

  const menuSections: {
    title: string;
    items: { id: ScreenInspectorView; label: string }[];
  }[] = [
    {
      title: 'End-to-End Journey',
      items: [{ id: 'fullFlow', label: 'Full Interactive Flow' }],
    },
    {
      title: 'Auth & Access',
      items: [
        { id: 'welcome', label: 'Welcome Screen' },
        { id: 'login', label: 'Login Screen' },
        { id: 'register', label: 'Register Screen' },
        { id: 'otp', label: 'OTP Verification Screen' },
        { id: 'forgotPassword', label: 'Forgot Password Screen' },
        { id: 'resetPassword', label: 'Reset Password Screen' },
      ],
    },
    {
      title: 'Onboarding (5 Steps)',
      items: [
        { id: 'step1Workspace', label: 'Step 1: Workspace Setup' },
        { id: 'step2Rhythm', label: 'Step 2: Working Rhythm' },
        { id: 'step3Time', label: 'Step 3: Time Allocation' },
        { id: 'step4Task', label: 'Step 4: Enter First Task' },
        { id: 'step5Review', label: 'Step 5: Review & Workload' },
      ],
    },
    {
      title: 'Core Focus & Schedule',
      items: [
        { id: 'dashboard', label: 'Dashboard (Guilt-Free Focus)' },
        { id: 'todayPlan', label: 'Today Plan (Your Planning)' },
        { id: 'taskList', label: 'Your Task List' },
        { id: 'addTask', label: 'Add Task Screen / Modal' },
        { id: 'taskDetail', label: 'Task Detail View' },
      ],
    },
  ];

  const currentLabel =
    inspectorView === 'fullFlow'
      ? 'Inspect UI'
      : menuSections
          .flatMap((s) => s.items)
          .find((item) => item.id === inspectorView)?.label || 'Inspect UI';

  return (
    <div className="fixed top-3 right-3 z-50 font-sans">
      {/* Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold shadow-focient-3 backdrop-blur-md border border-slate-700/50 transition-all active:scale-[0.98]"
        aria-expanded={isOpen}
      >
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="max-w-[130px] sm:max-w-none truncate">{currentLabel}</span>
        {isOpen ? <ChevronUpIcon size="xs" /> : <ChevronDownIcon size="xs" />}
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-focient-4 overflow-hidden z-50 text-slate-800 animate-fade-in max-h-[82vh] flex flex-col">
          {/* Menu Header with Controls */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5 text-xs">
            {/* Empty State Switch */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Empty State Mode</span>
              <button
                type="button"
                onClick={() => setEmptyStateMode(!emptyStateMode)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  emptyStateMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                    emptyStateMode ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Device Viewport Preview Switch */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Preview Device Frame</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDevicePreview('responsive')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    devicePreview === 'responsive'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Web
                </button>
                <button
                  type="button"
                  onClick={() => setDevicePreview('mobile')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    devicePreview === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Language Switch */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Language</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    language === 'id' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ID
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="overflow-y-auto p-2 space-y-3 divide-y divide-slate-100">
            {menuSections.map((sec, idx) => (
              <div key={sec.title} className={idx > 0 ? 'pt-2' : ''}>
                <div className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {sec.title}
                </div>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const isSelected = inspectorView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setInspectorView(item.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isSelected && <CheckIcon size="xs" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
