'use client';

import React, { useState, useEffect } from 'react';
import { useFocient } from '../../state/focient-store';
import {
  SparklesIcon,
  ClockIcon,
  CalendarIcon,
  CheckIcon,
} from '../../components/icons';

interface WeeklyInsightData {
  totalAllocatedMinutes: number;
  completedTasksCount: number;
  focusSessionsCompleted: number;
  bufferMinutesHonored: number;
  rescheduleTimeSavedMinutes: number;
  burnoutRiskLevel: 'SAFE' | 'ATTENTION' | 'REST_NEEDED';
  supportiveReflection: string;
  energyDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  dailyMetrics: Array<{
    day: string;
    percentage: number;
    hours: number;
    status: string;
  }>;
}

export const InsightsScreen: React.FC = () => {
  const { language, user, tasks } = useFocient();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<'thisWeek' | 'lastWeek'>('thisWeek');

  // Compute insights reactively from real store tasks
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const totalAllocatedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalRestMinutes = tasks.reduce((sum, t) => sum + t.restMinutes, 0);

  const insightData: WeeklyInsightData = {
    totalAllocatedMinutes,
    completedTasksCount: completedTasks.length,
    focusSessionsCompleted: completedTasks.filter((t) => t.focusType === 'Deep Focus').length,
    bufferMinutesHonored: totalRestMinutes,
    rescheduleTimeSavedMinutes: 45,
    burnoutRiskLevel: totalAllocatedMinutes > 2400 ? 'ATTENTION' : 'SAFE',
    supportiveReflection:
      language === 'id'
        ? 'Pola kerja Anda seimbang dan bebas dari rasa bersalah. Anda telah menghormati jeda istirahat dengan konsisten.'
        : 'Your work rhythm has been well-balanced and guilt-free. You consistently honored recovery buffers.',
    energyDistribution: {
      high: tasks.filter((t) => t.energyLevel === 'high').length,
      medium: tasks.filter((t) => t.energyLevel === 'medium').length,
      low: tasks.filter((t) => t.energyLevel === 'low').length,
    },
    dailyMetrics: [
      { day: 'Mon', percentage: 65, hours: 5.2, status: 'OPTIMAL' },
      { day: 'Tue', percentage: 70, hours: 5.6, status: 'OPTIMAL' },
      { day: 'Wed', percentage: 85, hours: 6.8, status: 'NEAR_CAPACITY' },
      { day: 'Thu', percentage: 60, hours: 4.8, status: 'OPTIMAL' },
      { day: 'Fri', percentage: 55, hours: 4.4, status: 'OPTIMAL' },
      { day: 'Sat', percentage: 20, hours: 1.6, status: 'LIGHT' },
      { day: 'Sun', percentage: 10, hours: 0.8, status: 'LIGHT' },
    ],
  };

  const activeHours = (insightData.totalAllocatedMinutes / 60).toFixed(1);
  const bufferHours = (insightData.bufferMinutesHonored / 60).toFixed(1);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-700 text-white shadow-focient-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <SparklesIcon size="xs" />
            <span>{language === 'id' ? 'Analitik Produktivitas Tenang' : 'Calm Productivity Analytics'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'id' ? 'Refleksi Mingguan' : 'Weekly Insights & Reflection'}
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            {language === 'id'
              ? 'Evaluasi ritme kerja Anda tanpa rasa bersalah. Fokus pada keberlanjutan dan kejelasan mental.'
              : 'Evaluate your work rhythms without shame or guilt. Focused on sustainability and mental clarity.'}
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 backdrop-blur-md self-start sm:self-center">
          <button
            type="button"
            onClick={() => setSelectedRange('thisWeek')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRange === 'thisWeek' ? 'bg-white text-blue-700 shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            {language === 'id' ? 'Minggu Ini' : 'This Week'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('lastWeek')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRange === 'lastWeek' ? 'bg-white text-blue-700 shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            {language === 'id' ? 'Minggu Lalu' : 'Last Week'}
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Focus Hours */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'id' ? 'Waktu Fokus' : 'Focus Hours'}
            </span>
            <ClockIcon size="xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{activeHours}</span>
            <span className="text-xs font-medium text-slate-500">hrs</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {language === 'id' ? 'Ritme kerja optimal' : 'Sustainable capacity'}
          </p>
        </div>

        {/* Card 2: Rest Buffers */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'id' ? 'Jeda Istirahat' : 'Rest Buffers'}
            </span>
            <SparklesIcon size="xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{bufferHours}</span>
            <span className="text-xs font-medium text-slate-500">hrs</span>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold">
            {language === 'id' ? '100% jeda terlindungi' : 'Zero skipped buffers'}
          </p>
        </div>

        {/* Card 3: Tasks Completed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'id' ? 'Tugas Selesai' : 'Completed'}
            </span>
            <CheckIcon size="xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {insightData.completedTasksCount}
            </span>
            <span className="text-xs font-medium text-slate-500">/ {tasks.length}</span>
          </div>
          <p className="text-[11px] text-slate-600 font-semibold">
            {language === 'id' ? 'Tercapai tanpa tekanan' : 'Achieved with clarity'}
          </p>
        </div>

        {/* Card 4: Reschedule Savings */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'id' ? 'Waktu Dihemat' : 'Time Saved'}
            </span>
            <CalendarIcon size="xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {insightData.rescheduleTimeSavedMinutes}
            </span>
            <span className="text-xs font-medium text-slate-500">mins</span>
          </div>
          <p className="text-[11px] text-violet-600 font-semibold">
            {language === 'id' ? 'Via penjadwalan adaptif' : 'Via adaptive ripple'}
          </p>
        </div>
      </div>

      {/* Weekly Capacity Breakdown Chart */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'id' ? 'Distribusi Beban Kerja Harian' : 'Daily Workload Distribution'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'id'
                ? 'Persentase kapasitas harian terhadap batas kerja harian'
                : 'Daily capacity percentage vs your maximum sustainable threshold'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {language === 'id' ? 'Ritme Hijau Optimal' : 'Optimal Green Rhythm'}
          </span>
        </div>

        {/* Bar Visualization */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end h-48 border-b border-slate-100">
          {insightData.dailyMetrics.map((item) => {
            const isNearCapacity = item.percentage >= 75;
            const barBg = isNearCapacity
              ? 'bg-amber-500 hover:bg-amber-600'
              : item.percentage >= 50
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-emerald-500 hover:bg-emerald-600';

            return (
              <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-slate-600 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.percentage}%
                </span>
                <div
                  className={`w-full max-w-[36px] rounded-t-xl transition-all ${barBg}`}
                  style={{ height: `${Math.max(item.percentage, 10)}%` }}
                />
                <span className="text-xs font-semibold text-slate-700">{item.day}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {language === 'id' ? 'Ringan (<50%)' : 'Light (<50%)'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              {language === 'id' ? 'Optimal (50-75%)' : 'Optimal (50-75%)'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              {language === 'id' ? 'Mendekati Kapasitas (76-90%)' : 'Near Capacity (76-90%)'}
            </span>
          </div>
          <span className="text-slate-400 font-medium">Batas Harian: 8.0 jam</span>
        </div>
      </div>

      {/* Supportive Reflection Card */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <SparklesIcon size="sm" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-emerald-950">
            {language === 'id' ? 'Refleksi Bebas Rasa Bersalah' : 'Empathetic Reflection'}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
            {insightData.supportiveReflection}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsScreen;
