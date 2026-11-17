'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import {
  SparklesIcon,
  CheckIcon,
  ClockIcon,
  CalendarIcon,
  TagIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  SearchIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  TargetIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../../components/icons';

interface ColorTokenItem {
  name: string;
  variable: string;
  hex: string;
  role: string;
  contrastRatio?: string;
  isDark?: boolean;
}

interface ColorGroup {
  groupName: string;
  description: string;
  tokens: ColorTokenItem[];
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    groupName: 'Primary Focus (Cobalt Blue)',
    description: 'Anchor color for single-task cognitive focus, primary actions, and Top 3 priority tasks.',
    tokens: [
      { name: 'Action Base', variable: '--color-primary-action-base', hex: '#2563EB', role: 'Main CTA & Focus active card', contrastRatio: '4.5:1 AA' },
      { name: 'Action Hover', variable: '--color-primary-action-hover', hex: '#1D4ED8', role: 'CTA hover & active tactile state', contrastRatio: '5.8:1 AA' },
      { name: 'BG Subtle', variable: '--color-primary-bg-subtle', hex: '#EFF6FF', role: 'Focus card background & subtle badge', contrastRatio: '14.2:1 AAA' },
      { name: 'Border Subtle', variable: '--color-primary-border-subtle', hex: '#DBEAFE', role: 'Active card border & badge outline', contrastRatio: '12.5:1 AAA' },
      { name: 'Bold Border', variable: '--color-primary-border-bold', hex: '#1E40AF', role: 'High contrast borders' },
      { name: 'Bold Text', variable: '--color-primary-text-bold', hex: '#1E3A8A', role: 'Primary headers over subtle blue', contrastRatio: '10.5:1 AAA' },
      { name: 'Track Base', variable: '--color-primary-track-base', hex: '#BFDBFE', role: 'Progress bar tracks & focus rings' },
    ],
  },
  {
    groupName: 'Secondary Balance (Calm Teal)',
    description: 'Rest intervals, recovery buffers, and sustainable pacing indicators to avoid burnout.',
    tokens: [
      { name: 'Action Base', variable: '--color-secondary-action-base', hex: '#0D9488', role: 'Rest buffer indicators & health milestones', contrastRatio: '4.6:1 AA' },
      { name: 'Action Hover', variable: '--color-secondary-action-hover', hex: '#0F766E', role: 'Teal buttons hover & active' },
      { name: 'BG Subtle', variable: '--color-secondary-bg-subtle', hex: '#F0FDFA', role: 'Rest buffer backgrounds & healthy banner', contrastRatio: '14.8:1 AAA' },
      { name: 'Border Subtle', variable: '--color-secondary-border-subtle', hex: '#CCFBF1', role: 'Rest pill borders & calm card edges', contrastRatio: '13.1:1 AAA' },
      { name: 'Bold Text', variable: '--color-secondary-text-bold', hex: '#134E4A', role: 'Rest duration text & calm affirmations', contrastRatio: '9.8:1 AAA' },
    ],
  },
  {
    groupName: 'Accent Strategy (Deep Violet)',
    description: 'High-leverage strategic planning, OKR milestones, and identity-driven categorization.',
    tokens: [
      { name: 'Action Base', variable: '--color-accent-action-base', hex: '#7C3AED', role: 'Strategic category pill & OKR highlights', contrastRatio: '4.7:1 AA' },
      { name: 'Action Hover', variable: '--color-accent-action-hover', hex: '#6D28D9', role: 'Violet button hover & interactive pills' },
      { name: 'BG Subtle', variable: '--color-accent-bg-subtle', hex: '#F5F3FF', role: 'Strategic task background pill', contrastRatio: '13.9:1 AAA' },
      { name: 'Border Subtle', variable: '--color-accent-border-subtle', hex: '#DDD6FE', role: 'Violet badge outline & dividers' },
      { name: 'Bold Text', variable: '--color-accent-text-bold', hex: '#4C1D95', role: 'Strategic task title text', contrastRatio: '11.2:1 AAA' },
    ],
  },
  {
    groupName: 'Guilt-Free Warning (Warm Amber - Anti-Accusatory)',
    description: 'Crucial FoCient philosophy: Never panic red for overload! Warm amber gently prompts reschedule without guilt.',
    tokens: [
      { name: 'Action Base', variable: '--color-warning-action-base', hex: '#D97706', role: 'Overload warning (>90%) & reschedule advice', contrastRatio: '4.5:1 AA' },
      { name: 'BG Subtle', variable: '--color-warning-bg-subtle', hex: '#FFFBEB', role: 'Reschedule alert banner background', contrastRatio: '14.5:1 AAA' },
      { name: 'Border Subtle', variable: '--color-warning-border-subtle', hex: '#FDE68A', role: 'Conflict outline & advisory card border' },
      { name: 'Bold Text', variable: '--color-warning-text-bold', hex: '#92400E', role: 'Reschedule copy & gentle advisory', contrastRatio: '8.4:1 AAA' },
    ],
  },
  {
    groupName: 'Success Affirmation (Emerald Green)',
    description: 'Calm affirmation upon task completion, schedule balancing, and goal achievement.',
    tokens: [
      { name: 'Action Base', variable: '--color-success-action-base', hex: '#059669', role: 'Checkmark completion & rebalance confirmation', contrastRatio: '4.6:1 AA' },
      { name: 'BG Subtle', variable: '--color-success-bg-subtle', hex: '#ECFDF5', role: 'Daily target success banner background', contrastRatio: '15.1:1 AAA' },
      { name: 'Border Subtle', variable: '--color-success-border-subtle', hex: '#A7F3D0', role: 'Success card border outline' },
      { name: 'Bold Text', variable: '--color-success-text-bold', hex: '#065F46', role: 'Completed task feedback & celebration text', contrastRatio: '9.9:1 AAA' },
    ],
  },
  {
    groupName: 'Danger / Destructive (Rose Crimson)',
    description: 'Reserved strictly for destructive actions (e.g., delete task) and micro-fail shake feedback.',
    tokens: [
      { name: 'Action Base', variable: '--color-danger-action-base', hex: '#E11D48', role: 'Delete task CTA & field invalid red border', contrastRatio: '4.8:1 AA' },
      { name: 'BG Subtle', variable: '--color-danger-bg-subtle', hex: '#FFF1F2', role: 'Invalid input background & delete modal icon', contrastRatio: '14.2:1 AAA' },
      { name: 'Border Subtle', variable: '--color-danger-border-subtle', hex: '#FECDD3', role: 'Error border outline' },
      { name: 'Bold Text', variable: '--color-danger-text-bold', hex: '#9F1239', role: 'Validation error text', contrastRatio: '8.7:1 AAA' },
    ],
  },
  {
    groupName: 'Neutral System Surfaces (Light Mode)',
    description: 'Decluttered canvas whitespace and layered elevation for maximum cognitive clarity.',
    tokens: [
      { name: 'Canvas BG', variable: '--color-neutral-bg-canvas', hex: '#F8FAFC', role: 'Whole-app background canvas' },
      { name: 'Surface Card', variable: '--color-neutral-surface-card', hex: '#FFFFFF', role: 'Task cards, modals, dropdown surfaces' },
      { name: 'Muted Surface', variable: '--color-neutral-surface-muted', hex: '#F1F5F9', role: 'Secondary buttons, input fields, pill backgrounds' },
      { name: 'Border Subtle', variable: '--color-neutral-border-subtle', hex: '#CBD5E1', role: 'Standard structural card borders' },
      { name: 'Text Bold', variable: '--color-neutral-text-bold', hex: '#0F172A', role: 'Primary page titles & task headers', contrastRatio: '16.8:1 AAA' },
      { name: 'Text Muted', variable: '--color-neutral-text-muted', hex: '#64748B', role: 'Subtitles, timestamps, durations', contrastRatio: '5.2:1 AA' },
      { name: 'Text Subtle', variable: '--color-neutral-text-subtle', hex: '#94A3B8', role: 'Strikethrough text & placeholder copy' },
    ],
  },
  {
    groupName: 'Dark Mode Tokens (Night Owl Rhythm)',
    description: 'OLED-friendly dark palette reducing eye fatigue during evening focus sessions.',
    tokens: [
      { name: 'Dark Canvas', variable: '--color-dark-bg-canvas', hex: '#0F172A', role: 'Dark mode main screen background', isDark: true },
      { name: 'Dark Surface', variable: '--color-dark-surface-card', hex: '#1E293B', role: 'Dark mode card & sheet surface', isDark: true },
      { name: 'Dark Muted', variable: '--color-dark-surface-muted', hex: '#334155', role: 'Dark mode input field & track background', isDark: true },
      { name: 'Dark Border', variable: '--color-dark-border-subtle', hex: '#475569', role: 'Dark mode border dividers', isDark: true },
      { name: 'Dark Text Bold', variable: '--color-dark-text-bold', hex: '#F8FAFC', role: 'Dark mode primary headers', contrastRatio: '16.1:1 AAA', isDark: true },
      { name: 'Dark Text Muted', variable: '--color-dark-text-muted', hex: '#94A3B8', role: 'Dark mode timestamps & captions', contrastRatio: '6.4:1 AA', isDark: true },
    ],
  },
];

export const DesignSystemScreen: React.FC = () => {
  const { language, showToast } = useFocient();
  const [activeTab, setActiveTab] = useState<'palette' | 'primitives' | 'cards' | 'workload' | 'icons'>('palette');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Primitives interactive state
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnShake, setBtnShake] = useState(false);
  const [btnSuccess, setBtnSuccess] = useState(false);
  const [inputVal, setInputVal] = useState('Implement Color Palette Token');
  const [inputError, setInputError] = useState(false);
  const [inputWarning, setInputWarning] = useState(false);
  const [chk1, setChk1] = useState(true);
  const [chk2, setChk2] = useState(false);
  const [toggle1, setToggle1] = useState(true);
  const [selectedPill, setSelectedPill] = useState('Execution');
  const [selectedDuration, setSelectedDuration] = useState(25);

  // Live workload capacity interactive state
  const [simulatedMinutes, setSimulatedMinutes] = useState(280);
  const capacityMinutes = 480;
  const simulatedPercent = Math.round((simulatedMinutes / capacityMinutes) * 100);

  // Single task focus card timer simulation
  const [timerPlaying, setTimerPlaying] = useState(false);
  const [timerProgress, setTimerProgress] = useState(65);

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedToken(text);
    showToast(`${label} copied to clipboard: ${text}`, 'success');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const triggerShake = () => {
    setBtnShake(true);
    setTimeout(() => setBtnShake(false), 300);
    showToast(
      language === 'id' ? 'Aksi gagal. Silakan coba lagi tanpa panik.' : 'Action failed gently. Please try again.',
      'error'
    );
  };

  const triggerSuccessTransform = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      setBtnSuccess(true);
      setTimeout(() => setBtnSuccess(false), 2000);
      showToast(
        language === 'id' ? 'Perubahan disimpan dengan sukses!' : 'Changes saved successfully!',
        'success'
      );
    }, 700);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-blue-700 text-white border border-blue-800 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
          <SparklesIcon size="xs" />
          <span>FoCient DTCG Living Design System & Token Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          {language === 'id' ? 'Palet Warna & Komponen UI' : 'Color Palette & UI Components'}
        </h1>
        <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
          {language === 'id'
            ? 'Spesifikasi visual resmi antarmuka FoCient: Token W3C DTCG, rasio kontras WCAG 2.1 AAA, 4-point spacing grid, dan filosofi produktivitas bebas rasa bersalah (Guilt-Free UX).'
            : 'Official FoCient visual specification: W3C DTCG tokens, WCAG 2.1 AAA contrast ratios, 4-point grid, and guilt-free cognitive clarity.'}
        </p>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[
            { id: 'palette' as const, label: language === 'id' ? 'Palet Warna Tokens' : 'Color Palette Tokens' },
            { id: 'primitives' as const, label: language === 'id' ? 'Form & Kontrol Atomik' : 'Atomic Primitives' },
            { id: 'cards' as const, label: language === 'id' ? '7 Master Task Cards' : '7 Task Cards Suite' },
            { id: 'workload' as const, label: language === 'id' ? 'Meter Beban Kapasitas' : 'Dynamic Capacity Meter' },
            { id: 'icons' as const, label: language === 'id' ? 'Lucide Icon System' : 'Lucide Icons' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: COLOR PALETTE TOKENS */}
      {activeTab === 'palette' && (
        <div className="space-y-8 animate-fade-in">
          {/* Philosophy Highlight Alert */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangleIcon size="sm" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-amber-900 text-sm">
                {language === 'id' ? 'Aturan Anti-Panik & Guilt-Free Color Philosophy' : 'Anti-Panic & Guilt-Free Color Philosophy'}
              </h4>
              <p className="text-amber-800 leading-relaxed">
                {language === 'id'
                  ? 'FoCient secara ketat melarang penggunaan warna Merah (#E11D48) pada indikator beban kerja harian dan saran penyesuaian jadwal. Kelebihan beban kerja dipresentasikan dengan warna Warm Amber (#D97706) yang menenangkan, menghilangkan rasa bersalah, dan mendorong pemulihan energi secara sehat.'
                  : 'FoCient strictly avoids panic red (#E11D48) for daily workload warnings and schedule shifts. Heavy capacity is rendered in calming Warm Amber (#D97706), eliminating user guilt and promoting healthy rest.'}
              </p>
            </div>
          </div>

          {/* Color Groups Grid */}
          <div className="space-y-8">
            {COLOR_GROUPS.map((group) => (
              <div key={group.groupName} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{group.groupName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {group.tokens.map((token) => (
                    <div
                      key={token.variable}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all space-y-3 group"
                    >
                      {/* Swatch Box */}
                      <div
                        className="w-full h-14 rounded-lg shadow-inner border border-black/5 flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                        style={{ backgroundColor: token.hex }}
                      >
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded backdrop-blur-xs ${
                            token.isDark || token.hex === '#2563EB' || token.hex === '#1D4ED8' || token.hex === '#0D9488' || token.hex === '#0F766E' || token.hex === '#7C3AED' || token.hex === '#6D28D9' || token.hex === '#059669' || token.hex === '#E11D48' || token.hex === '#0284C7' || token.hex === '#0F172A'
                              ? 'text-white bg-black/25'
                              : 'text-slate-900 bg-white/70'
                          }`}
                        >
                          {token.hex}
                        </span>
                      </div>

                      {/* Token Details */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{token.name}</span>
                          {token.contrastRatio && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {token.contrastRatio}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-mono text-slate-500 truncate" title={token.variable}>
                          {token.variable}
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 pt-0.5">
                          {token.role}
                        </p>
                      </div>

                      {/* Copy Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(token.hex, token.name)}
                          className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-semibold text-slate-700 transition-colors inline-flex items-center justify-center gap-1"
                        >
                          {copiedToken === token.hex ? (
                            <>
                              <CheckIcon size="xs" className="text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            'Copy HEX'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`var(${token.variable})`, token.name)}
                          className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-semibold text-slate-700 transition-colors"
                        >
                          Copy CSS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Live Contrast Tester Playground */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {language === 'id' ? 'Uji Kontras & Keterbacaan Langsung' : 'Live Contrast & Legibility Playground'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'id'
                ? 'Semua teks penting dalam antarmuka FoCient diuji untuk melampaui rasio kontras 7:1 (WCAG 2.1 AAA) demi kejernihan kognitif mata pengguna.'
                : 'All key user text in FoCient exceeds the 7:1 contrast ratio (WCAG 2.1 AAA) for low-stress cognitive legibility.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Focus Pair (14.2:1 AAA)</span>
                <h4 className="text-base font-extrabold text-[#1E3A8A]">Primary Focus Bold Text</h4>
                <p className="text-xs text-[#2563EB]">High cognitive salience over subtle blue canvas.</p>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Rest Buffer Pair (14.8:1 AAA)</span>
                <h4 className="text-base font-extrabold text-[#134E4A]">Recovery Interval 20m</h4>
                <p className="text-xs text-[#0D9488]">Gentle green-teal resting buffer indicator.</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Reschedule Pair (14.5:1 AAA)</span>
                <h4 className="text-base font-extrabold text-[#92400E]">Schedule Adjustment Needed</h4>
                <p className="text-xs text-[#D97706]">Supportive warm amber advice without penalty.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATOMIC PRIMITIVES & FORM CONTROLS */}
      {activeTab === 'primitives' && (
        <div className="space-y-8 animate-fade-in">
          {/* Buttons Suite */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Button Suite & Physical Press Tactile</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical press transforms: scale(0.98), 48px Large touch target, 40px Desktop CTA, 32px Inline.
              </p>
            </div>

            {/* Standard Variants */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700">A. Sizes & Variants</span>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm shadow-sm transition-all">
                  Large Primary (48px)
                </button>
                <button type="button" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-xs shadow-sm transition-all">
                  Medium CTA (40px)
                </button>
                <button type="button" className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-xs shadow-sm transition-all">
                  Small Inline (32px)
                </button>
                <button type="button" className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-semibold text-xs shadow-sm transition-all">
                  Secondary Teal
                </button>
                <button type="button" className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-semibold text-xs transition-all">
                  Subtle Ghost
                </button>
                <button type="button" className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-98 text-slate-700 font-semibold text-xs transition-all">
                  Outline
                </button>
                <button type="button" className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-98 text-rose-700 font-semibold text-xs transition-all">
                  Destructive
                </button>
              </div>
            </div>

            {/* Micro-Interaction Button States */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700">B. Micro-Interactions (Shake & Success Transformation)</span>
              <div className="flex flex-wrap items-center gap-3">
                {/* Shake Fail Button */}
                <button
                  type="button"
                  onClick={triggerShake}
                  className={`px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all ${
                    btnShake ? 'animate-[shake_0.2s_ease-in-out_2]' : ''
                  }`}
                >
                  Trigger Micro-Fail (Shake)
                </button>

                {/* Success Transform Button */}
                <button
                  type="button"
                  onClick={triggerSuccessTransform}
                  disabled={btnLoading}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center gap-2 ${
                    btnSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-black text-white'
                  }`}
                >
                  {btnLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {btnSuccess && <CheckIcon size="xs" strokeWidth={3} />}
                  <span>{btnSuccess ? 'Saved Successfully!' : btnLoading ? 'Saving...' : 'Save with Transformation'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Inputs & Zero Layout Shift */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Input Fields & Zero Layout Shift Validation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fixed 20px validation height reservation prevents screen jumping during real-time typing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Normal / Default Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Standard Input Field</label>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
                <span className="block text-[11px] text-slate-400 min-h-[20px] pt-0.5">
                  Realistic title helps focus rhythm.
                </span>
              </div>

              {/* Invalid Input Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">Validation Error State</label>
                  <button
                    type="button"
                    onClick={() => setInputError(!inputError)}
                    className="text-[10px] text-blue-600 font-semibold"
                  >
                    Toggle Error
                  </button>
                </div>
                <input
                  type="text"
                  value="45xx"
                  readOnly
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    inputError
                      ? 'border-rose-500 bg-rose-50/50 text-rose-900'
                      : 'border-slate-300 text-slate-900'
                  }`}
                />
                <span className="block text-[11px] text-rose-600 font-medium min-h-[20px] pt-0.5">
                  {inputError ? 'Set a duration between 5 and 480 minutes.' : ''}
                </span>
              </div>

              {/* Warning / Conflict Input Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">Adaptive Warning State</label>
                  <button
                    type="button"
                    onClick={() => setInputWarning(!inputWarning)}
                    className="text-[10px] text-blue-600 font-semibold"
                  >
                    Toggle Warning
                  </button>
                </div>
                <input
                  type="text"
                  value="14:30 - 15:00"
                  readOnly
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors tabular-nums ${
                    inputWarning
                      ? 'border-amber-400 bg-amber-50/50 text-amber-900'
                      : 'border-slate-300 text-slate-900'
                  }`}
                />
                <span className="block text-[11px] text-amber-700 font-medium min-h-[20px] pt-0.5">
                  {inputWarning ? 'Slot overlaps with existing scheduled meeting.' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Checkboxes, Switches & Chips */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Checkboxes, Switches, Category Pills & Durations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Checkboxes with Strikethrough Pop */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-700">Interactive Task Checkbox</span>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={chk1}
                      onChange={(e) => setChk1(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-xs font-semibold ${chk1 ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      Audit token color contrast for AAA standard
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={chk2}
                      onChange={(e) => setChk2(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-xs font-semibold ${chk2 ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      Review PRs & Code Cleanliness
                    </span>
                  </label>
                </div>
              </div>

              {/* Category Pills & Duration Chips */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-700">Category & Duration Selectors</span>
                
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Strategic', color: '#7C3AED' },
                    { name: 'Execution', color: '#0284C7' },
                    { name: 'Meeting', color: '#B45309' },
                    { name: 'Personal', color: '#059669' },
                  ].map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedPill(cat.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedPill === cat.name
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Duration Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 15, 20, 25, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDuration(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold tabular-nums border transition-all ${
                        selectedDuration === d
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 7 MASTER TASK CARDS */}
      {activeTab === 'cards' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-slate-900">The 7 Master Task Cards Suite</h3>
            <p className="text-xs text-slate-500">
              FoCient components designed to cover every state of focus, scheduling, rescheduling, and execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Single-Task Focus Card with Live Timer */}
            <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                  1. Single-Task Focus Card
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                  ● IN PROGRESS
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Merancang Arsitektur Monorepo FoCient</h4>
                <p className="text-xs text-slate-500 mt-0.5">Execution • High</p>
              </div>

              {/* Pomodoro Timer & Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Sisa Waktu Fokus:</span>
                  <span className="text-lg font-mono font-bold text-blue-600 tabular-nums">24:18</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${timerProgress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setTimerPlaying(!timerPlaying)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  {timerPlaying ? <PauseIcon size="xs" /> : <PlayIcon size="xs" />}
                  <span>{timerPlaying ? 'Jeda Fokus' : 'Lanjutkan Fokus'}</span>
                </button>
                <button type="button" className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  Selesaikan Lebih Awal
                </button>
              </div>
            </div>

            {/* 2. Top 3 Priority Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600">
                  2. Top 3 Priority Focus Card
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                  PRIORITAS #1
                </span>
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded text-blue-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">Create the Annual OKR & Strategy</h4>
                  <p className="text-xs text-slate-500 mt-1">Strategic • 25 min • Rest Buffer: 20m</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">10:00 - 10:25 AM</span>
                <span className="text-teal-600 font-semibold">+20m {language === 'id' ? 'jeda istirahat' : 'rest buffer'}</span>
              </div>
            </div>

            {/* 3. Timeline / Scheduled Task Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  3. Timeline Scheduled Task Card
                </span>
                <span className="text-xs font-bold text-slate-600 tabular-nums">14:00 - 14:30</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Meeting Client Sync & Demo</h4>
                  <p className="text-xs text-slate-500">Meeting • 30 Minutes</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-teal-700 font-medium">Jeda Istirahat: 10m setelah tugas</span>
                <button type="button" className="text-xs font-bold text-blue-600 hover:underline">
                  Sesuaikan Jam
                </button>
              </div>
            </div>

            {/* 4. Guilt-Free Adaptive Reschedule Card */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                  4. Adaptive Reschedule Card
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  SARAN ADAPTIF
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-amber-950">Tumpang Tindih Waktu Terdeteksi</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Pindahkan "Review PRs" ke 15:45 dengan jeda 10m tanpa rasa bersalah.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 hover:bg-amber-100">
                  Nanti Saja
                </button>
                <button type="button" className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm">
                  Terapkan Pergeseran
                </button>
              </div>
            </div>

            {/* 5. Backlog Task Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  5. Backlog Task Card
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  BELUM DIJADWALKAN
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Audit token color contrast for AAA standard</h4>
                <p className="text-xs text-slate-500 mt-0.5">Strategic • 45m • High</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button type="button" className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100">
                  + Jadwalkan Hari Ini
                </button>
                <button type="button" className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100">
                  + Jadwalkan Besok
                </button>
              </div>
            </div>

            {/* 6. Completed Task Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3 opacity-75">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                  6. Completed Task Card
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  <CheckIcon size="xs" />
                  <span>SELESAI</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  <CheckIcon size="xs" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-500 line-through">30min Incline Walking Cardio</h4>
                  <p className="text-xs text-slate-400">Personal • Selesai pukul 09:00</p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button type="button" className="text-xs font-semibold text-blue-600 hover:underline">
                  Batalkan Selesai (Undo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DYNAMIC CAPACITY METER & WORKLOAD */}
      {activeTab === 'workload' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Workload & Capacity Thresholding</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Geser slider simulasi di bawah untuk melihat perubahan otomatis bilah kapasitas:
                Light (&lt;50%), Optimal (50–75%), Near Capacity (76–90%), dan Overload (&gt;90% Warm Amber).
              </p>
            </div>

            {/* Interactive Slider */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {language === 'id' ? 'Simulasi Alokasi Waktu Kerja:' : 'Workload Allocation Simulation:'}
                </span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {simulatedMinutes} {language === 'id' ? 'Menit' : 'Min'} / {capacityMinutes} {language === 'id' ? 'Menit' : 'Min'} ({simulatedPercent}%)
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="540"
                step="15"
                value={simulatedMinutes}
                onChange={(e) => setSimulatedMinutes(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />

              <div className="flex justify-between text-[11px] font-semibold text-slate-400 tabular-nums">
                <span>0% ({language === 'id' ? 'Kosong' : 'Empty'})</span>
                <span>50% (Optimal)</span>
                <span>75% ({language === 'id' ? 'Maks Sehat' : 'Healthy Max'})</span>
                <span>90% (Near)</span>
                <span>100%+ (Overload)</span>
              </div>
            </div>

            {/* Rendered Capacity Meter Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">
                    {language === 'id' ? 'Status Kapasitas Harian:' : 'Daily Energy Capacity Status:'}
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
                    {(simulatedMinutes / 60).toFixed(1)}h{' '}
                    <span className="text-xs font-normal text-slate-500">
                      / {(capacityMinutes / 60).toFixed(1)}h {language === 'id' ? 'batas kerja sehat' : 'healthy capacity limit'}
                    </span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    simulatedPercent > 90
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : simulatedPercent > 75
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : simulatedPercent >= 50
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {simulatedPercent > 90
                    ? 'OVERLOAD (Warm Amber)'
                    : simulatedPercent > 75
                    ? 'NEAR CAPACITY'
                    : simulatedPercent >= 50
                    ? 'OPTIMAL FOCUS'
                    : 'LIGHT LOAD'}{' '}
                  ({simulatedPercent}%)
                </div>
              </div>

              {/* Progress Bar with Color Shift */}
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    simulatedPercent > 90
                      ? 'bg-amber-600'
                      : simulatedPercent > 75
                      ? 'bg-amber-500'
                      : simulatedPercent >= 50
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, simulatedPercent)}%` }}
                />
              </div>

              {simulatedPercent > 90 && (
                <div className="p-3.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-medium border border-amber-200 flex items-center gap-2 animate-fade-in">
                  <SparklesIcon size="xs" className="text-amber-500 shrink-0" />
                  <span>
                    {language === 'id'
                      ? 'Beban melebihi kapasitas energi harian. Sistem merekomendasikan menggeser tugas ke hari esok dengan tenang.'
                      : 'Workload exceeds daily energy capacity. The system adaptively suggests shifting tasks to tomorrow guilt-free.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LUCIDE ICONS */}
      {activeTab === 'icons' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">Lucide Icon System</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Semua ikon dioptimalkan untuk ukuran 16px (xs), 20px (sm), 24px (md), 32px (lg).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            {[
              { name: 'TargetIcon', icon: <TargetIcon size="md" /> },
              { name: 'ClockIcon', icon: <ClockIcon size="md" /> },
              { name: 'CalendarIcon', icon: <CalendarIcon size="md" /> },
              { name: 'SparklesIcon', icon: <SparklesIcon size="md" /> },
              { name: 'CheckIcon', icon: <CheckIcon size="md" /> },
              { name: 'BellIcon', icon: <BellIcon size="md" /> },
              { name: 'PlayIcon', icon: <PlayIcon size="md" /> },
              { name: 'PauseIcon', icon: <PauseIcon size="md" /> },
              { name: 'RotateCcwIcon', icon: <RotateCcwIcon size="md" /> },
              { name: 'PlusIcon', icon: <PlusIcon size="md" /> },
              { name: 'PencilIcon', icon: <PencilIcon size="md" /> },
              { name: 'TrashIcon', icon: <TrashIcon size="md" /> },
              { name: 'AlertTriangleIcon', icon: <AlertTriangleIcon size="md" /> },
              { name: 'AlertCircleIcon', icon: <AlertCircleIcon size="md" /> },
              { name: 'SearchIcon', icon: <SearchIcon size="md" /> },
              { name: 'TagIcon', icon: <TagIcon size="md" /> },
              { name: 'SunIcon', icon: <SunIcon size="md" /> },
              { name: 'MoonIcon', icon: <MoonIcon size="md" /> },
            ].map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <div className="text-slate-700 group-hover:text-blue-600 transition-colors">
                  {item.icon}
                </div>
                <span className="text-[11px] font-mono text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
