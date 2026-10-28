'use client';

import React, { useState } from 'react';
import { useFocient, RebalanceTaskProposal } from '../../state/focient-store';
import {
  SparklesIcon,
  ClockIcon,
  CheckIcon,
} from '../../components/icons';

export const ReschedulingScreen: React.FC = () => {
  const {
    language,
    rebalanceProposal,
    rescheduleOverloadedTasks,
    rescheduleAlertResolved,
    rescheduleAlertDismissed,
    resolveRescheduleNow,
    dismissRescheduleLater,
  } = useFocient();

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const fallbackProposals: RebalanceTaskProposal[] = [
    {
      id: 'prop-1',
      title: 'Implement Color Palette Token',
      previousSchedule: '14:30 - 14:55',
      newSchedule: '15:15 - 15:40',
      taskDurationMinutes: 25,
      restDurationMinutes: 10,
      categoryName: 'Execution',
      categoryColor: '#0284C7',
    },
    {
      id: 'prop-2',
      title: 'Buffer Rest Check & Rhythm Sync',
      previousSchedule: '16:00 - 16:25',
      newSchedule: '16:15 - 16:40',
      taskDurationMinutes: 25,
      restDurationMinutes: 10,
      categoryName: 'Strategic',
      categoryColor: '#7C3AED',
    },
  ];

  const proposals: RebalanceTaskProposal[] = rebalanceProposal
    ? [rebalanceProposal, ...fallbackProposals.filter((p) => p.id !== rebalanceProposal.id)]
    : fallbackProposals;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-focient-3 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
          <SparklesIcon size="xs" />
          <span>{language === 'id' ? 'Penyesuaian Adaptif Bebas Rasa Bersalah' : 'Guilt-Free Adaptive Engine'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {language === 'id' ? 'Penyelarasan Jadwal & Waktu Istirahat' : 'Adaptive Schedule Rebalancing'}
        </h1>
        <p className="text-sm text-amber-100 max-w-xl">
          {language === 'id'
            ? 'Ketika dinamika hari berubah, FoCient menggeser tugas ke celah waktu optimal dengan buffer istirahat tanpa penalti.'
            : 'When your day shifts, FoCient gently places tasks into open slots with recovery buffers, free of guilt.'}
        </p>
      </div>

      {/* Collision & Trigger Status Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900">
              {language === 'id' ? 'Deteksi Benturan Jadwal (Collision Detection)' : 'Detected Schedule Overlap'}
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {rescheduleAlertResolved
              ? (language === 'id' ? 'Terselesaikan' : 'Resolved')
              : (language === 'id' ? 'Perlu Penyesuaian' : 'Adjustment Suggested')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {language === 'id'
              ? 'Tugas "Implement Color Palette Token" (14:30 - 14:55) bertabrakan dengan slot istirahat atau tugas berikutnya. Algoritma Ripple Shift kami siap merelokasi tugas ke slot aman.'
              : 'Task "Implement Color Palette Token" (14:30 - 14:55) overlaps with downstream activities. Our ripple shift algorithm can safely reposition tasks with full rest buffers.'}
          </p>
        </div>
      </div>

      {/* Ripple Shift Proposals */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {language === 'id' ? 'Daftar Usulan Pergeseran Waktu' : 'Proposed Ripple Shift Schedule'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'id'
                ? 'Jeda kognitif 10-20 menit disisipkan secara otomatis antar tugas'
                : '10-20 minute cognitive rest buffers are automatically preserved'}
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {proposals.length} {language === 'id' ? 'Tugas Digeser' : 'Tasks Shifted'}
          </span>
        </div>

        <div className="space-y-3">
          {proposals.map((prop: RebalanceTaskProposal) => (
            <div
              key={prop.id}
              onClick={() => setSelectedProposalId(prop.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                selectedProposalId === prop.id
                  ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: prop.categoryColor }}
                  />
                  <span className="text-sm font-bold text-slate-900">{prop.title}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {prop.categoryName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ClockIcon size="xs" />
                  <span>
                    {language === 'id' ? 'Durasi:' : 'Duration:'} {prop.taskDurationMinutes}m + {prop.restDurationMinutes}m {language === 'id' ? 'Istirahat' : 'Rest'}
                  </span>
                </div>
              </div>

              {/* Time Comparison Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs line-through tabular-nums">
                  {prop.previousSchedule}
                </span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold tabular-nums">
                  {prop.newSchedule}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Global Confirmation CTAs */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={dismissRescheduleLater}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            {language === 'id' ? 'Pertahankan Jadwal Saat Ini' : 'Keep Current Schedule'}
          </button>

          <button
            type="button"
            onClick={() => {
              resolveRescheduleNow();
              rescheduleOverloadedTasks();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition-all"
          >
            <CheckIcon size="xs" />
            <span>{language === 'id' ? 'Terapkan Penjadwalan Ulang Sekarang' : 'Apply Adaptive Reschedule Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReschedulingScreen;
