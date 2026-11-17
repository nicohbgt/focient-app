'use client';

import React, { useState, useMemo } from 'react';
import { useFocient, RebalanceTaskProposal, MobileTask } from '../../state/focient-store';
import {
  SparklesIcon,
  ClockIcon,
  CheckIcon,
} from '../../components/icons';

export const ReschedulingScreen: React.FC = () => {
  const {
    language,
    tasks,
    updateTask,
    rebalanceProposal,
    rescheduleOverloadedTasks,
    rescheduleAlertResolved,
    rescheduleAlertDismissed,
    resolveRescheduleNow,
    dismissRescheduleLater,
  } = useFocient();

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  // Dynamic calculation of ripple shifts from REAL user tasks (Zero dummy data)
  const realProposals = useMemo(() => {
    const list: RebalanceTaskProposal[] = [];
    if (rebalanceProposal && !rescheduleAlertResolved) {
      list.push(rebalanceProposal);
    }

    // Inspect non-completed, scheduled tasks with a valid start time
    const activeTasks = tasks.filter(
      (t) => !t.isBacklog && t.status !== 'completed' && t.startHourDisplay && t.startHourDisplay.includes(':')
    );

    const parsed = activeTasks
      .map((t) => {
        const parts = t.startHourDisplay.split(':');
        const startMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        const duration = t.durationMinutes || 25;
        const rest = t.restMinutes ?? 10;
        return {
          ...t,
          startMin,
          endMin: startMin + duration,
          neededBuffer: rest,
          duration,
        };
      })
      .sort((a, b) => a.startMin - b.startMin);

    for (let i = 0; i < parsed.length - 1; i++) {
      const cur = parsed[i];
      const next = parsed[i + 1];
      const earliestNextStart = cur.endMin + cur.neededBuffer;

      // If next task collides with current task or its restorative rest buffer:
      if (next.startMin < earliestNextStart) {
        const shiftStartMin = earliestNextStart;
        const shiftEndMin = shiftStartMin + next.duration;

        const formatHour = (mins: number) => {
          const hh = String(Math.floor(mins / 60) % 24).padStart(2, '0');
          const mm = String(mins % 60).padStart(2, '0');
          return `${hh}:${mm}`;
        };

        const prevSched = `${formatHour(next.startMin)} - ${formatHour(next.endMin)}`;
        const newSched = `${formatHour(shiftStartMin)} - ${formatHour(shiftEndMin)}`;

        if (!list.some((p) => p.id === next.id || p.title === next.title)) {
          list.push({
            id: next.id,
            title: next.title,
            previousSchedule: prevSched,
            newSchedule: newSched,
            taskDurationMinutes: next.duration,
            restDurationMinutes: next.neededBuffer,
            categoryName: next.categoryName,
            categoryColor: next.categoryColor,
          });
        }
      }
    }

    return list;
  }, [tasks, rebalanceProposal, rescheduleAlertResolved]);

  const hasOverlap = realProposals.length > 0 && !rescheduleAlertResolved;

  const handleApplyReschedule = () => {
    if (realProposals.length > 0) {
      realProposals.forEach((prop) => {
        const target = tasks.find((t) => t.id === prop.id || t.title === prop.title);
        if (target) {
          const startPart = prop.newSchedule.split('-')[0].trim();
          updateTask({
            ...target,
            startHourDisplay: startPart,
          });
        }
      });
    }
    resolveRescheduleNow();
    rescheduleOverloadedTasks();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-fade-in max-w-6xl mx-auto w-full">
      {/* Header Banner - Design Token Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          {language === 'id' ? 'Penyesuaian Adaptif Bebas Rasa Bersalah' : 'Guilt-Free Adaptive Engine'}
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {language === 'id' ? 'Penyelarasan Jadwal & Waktu Istirahat' : 'Adaptive Schedule Rebalancing'}
        </h2>
        <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-2xl">
          {language === 'id'
            ? 'Ketika dinamika hari berubah, FoCient menggeser tugas ke celah waktu optimal dengan buffer istirahat tanpa penalti.'
            : 'When your day shifts, FoCient gently places tasks into open slots with recovery buffers, free of guilt.'}
        </p>
      </div>

      {/* Collision & Trigger Status Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                rescheduleAlertResolved || !hasOverlap
                  ? 'bg-emerald-500'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <h2 className="text-sm font-bold text-slate-900">
              {language === 'id' ? 'Status Penjadwalan Adaptif' : 'Adaptive Schedule Status'}
            </h2>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              rescheduleAlertResolved || !hasOverlap
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {rescheduleAlertResolved || !hasOverlap
              ? (language === 'id' ? 'Terselesaikan & Seimbang' : 'Resolved & Balanced')
              : (language === 'id' ? 'Perlu Penyesuaian' : 'Adjustment Suggested')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {rescheduleAlertResolved || !hasOverlap
              ? (language === 'id'
                  ? 'Seluruh jadwal Anda berada dalam ritme yang teratur dengan jeda istirahat penuh. Tidak ada benturan jadwal yang perlu digeser.'
                  : 'All your planned tasks are comfortably paced with recovery buffers. No ripple shifts are currently needed.')
              : (language === 'id'
                  ? `Tugas "${realProposals[0]?.title}" (${realProposals[0]?.previousSchedule}) bertabrakan dengan slot istirahat atau tugas berikutnya. Algoritma Ripple Shift kami siap merelokasi tugas ke slot aman (${realProposals[0]?.newSchedule}).`
                  : `Task "${realProposals[0]?.title}" (${realProposals[0]?.previousSchedule}) overlaps with downstream activities. Our ripple shift algorithm can safely reposition it with full rest buffers to ${realProposals[0]?.newSchedule}.`)}
          </p>
        </div>
      </div>

      {/* Ripple Shift Proposals */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
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
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              hasOverlap ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-100'
            }`}
          >
            {hasOverlap ? realProposals.length : 0} {language === 'id' ? 'Tugas Digeser' : 'Tasks Shifted'}
          </span>
        </div>

        {!hasOverlap ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckIcon size="sm" />
            </div>
            <p className="font-semibold text-slate-800 text-sm">
              {language === 'id' ? 'Jadwal Anda Tenang dan Teratur' : 'Your Schedule is Calm & In Rhythm'}
            </p>
            <p className="text-slate-500 max-w-md mx-auto">
              {language === 'id'
                ? 'Tidak ada benturan tugas terdeteksi pada rencana kerja Anda. Istirahat dan alokasi energi Anda tetap terjaga.'
                : 'No task collisions detected in your schedule. Your recovery buffers and cognitive pacing are fully protected.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {realProposals.map((prop: RebalanceTaskProposal) => (
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
        )}

        {/* Global Confirmation CTAs */}
        {hasOverlap && (
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
              onClick={handleApplyReschedule}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm active:scale-98 transition-all"
            >
              <CheckIcon size="xs" />
              <span>{language === 'id' ? 'Terapkan Penjadwalan Ulang Sekarang' : 'Apply Adaptive Reschedule Now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReschedulingScreen;
