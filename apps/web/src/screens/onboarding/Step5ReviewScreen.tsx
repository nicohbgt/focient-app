'use client';

import React from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, SparklesIcon, CheckCircleIcon, ClockIcon } from '../../components/icons';

export const Step5ReviewScreen: React.FC = () => {
  const {
    tasks,
    completeOnboarding,
    setOnboardingStep,
    language,
  } = useFocient();

  const allocatedMinutes = tasks
    .filter((t) => t.status !== 'completed')
    .reduce((sum, t) => sum + t.durationMinutes + (t.restMinutes || 0), 0);

  const capacityMinutes = 480; // 8 hours
  const percentage = Math.min(100, Math.round((allocatedMinutes / capacityMinutes) * 100));

  let statusText = 'Optimal';
  let statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
  let barColor = 'bg-blue-600';

  if (percentage === 0) {
    statusText = language === 'id' ? 'Kosong' : 'Empty';
    statusColor = 'text-slate-600 bg-slate-100 border-slate-200';
    barColor = 'bg-slate-400';
  } else if (percentage < 50) {
    statusText = language === 'id' ? 'Ringan' : 'Light';
    statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    barColor = 'bg-emerald-600';
  } else if (percentage <= 80) {
    statusText = language === 'id' ? 'Optimal' : 'Optimal';
    statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
    barColor = 'bg-blue-600';
  } else if (percentage <= 90) {
    statusText = language === 'id' ? 'Mendekati Batas' : 'Near Capacity';
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
    barColor = 'bg-amber-500';
  } else {
    statusText = language === 'id' ? 'Kapasitas Penuh' : 'Heavy Load';
    statusColor = 'text-amber-800 bg-amber-100 border-amber-300';
    barColor = 'bg-amber-600';
  }

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-lg mx-auto w-full animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>{language === 'id' ? 'Langkah 5 dari 5' : 'Step 5 of 5'}</span>
          <button
            type="button"
            onClick={() => setOnboardingStep(4)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeftIcon size="xs" />
            <span>{language === 'id' ? 'Sebelumnya' : 'Back'}</span>
          </button>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full w-full transition-all duration-300 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
          <SparklesIcon size="xs" />
          <span>{language === 'id' ? 'SIAP UNTUK FOKUS' : 'READY TO FOCUS'}</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Tinjauan Beban Kerja' : 'Review & Workload Engine'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Rencana harian Anda telah dihitung secara adaptif agar tetap sehat dan seimbang.'
            : 'Your initial plan has been balanced to preserve energy and prevent overload.'}
        </p>

        {/* Workload Capacity Meter Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">
                {language === 'id' ? 'Total Alokasi Hari Ini' : 'Today Workload Allocation'}
              </span>
              <div className="text-xl font-extrabold text-slate-900 tabular-nums">
                {formatHoursMins(allocatedMinutes)}{' '}
                <span className="text-xs font-semibold text-slate-500">
                  / {formatHoursMins(capacityMinutes)}
                </span>
              </div>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
              {statusText} ({percentage}%)
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>{tasks.length} {language === 'id' ? 'Tugas Terjadwal' : 'Scheduled Tasks'}</span>
            <span>
              {tasks.filter((t) => t.priority === 'top3').length} {language === 'id' ? 'Prioritas Utama' : 'Top 3 Focus'}
            </span>
          </div>
        </div>

        {/* Scheduled Tasks List Preview */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-semibold text-slate-700">
            {language === 'id' ? 'Tugas Siap Dijalankan' : 'Tasks Placed in Today Plan'}
          </label>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {tasks.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.categoryColor }}
                  />
                  <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                </div>
                <div className="text-slate-500 font-medium shrink-0 flex items-center gap-1.5 tabular-nums">
                  <ClockIcon size="xs" />
                  <span>{t.durationMinutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-Burnout Note */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed mb-6">
          💡{' '}
          {language === 'id'
            ? 'Ingat: Anda dapat menjadwalkan ulang atau menggeser tugas kapan saja tanpa rasa bersalah. FoCient akan membantu menyelaraskan ritme kerja Anda.'
            : 'Remember: You can reschedule or shift tasks anytime without guilt. FoCient will gently help balance your daily flow.'}
        </div>

        {/* Start Plan CTA */}
        <button
          type="button"
          onClick={completeOnboarding}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <CheckCircleIcon size="sm" />
          <span>{language === 'id' ? 'Mulai Rencana Hari Ini' : 'Start Your Plan'}</span>
        </button>
      </div>
    </div>
  );
};
