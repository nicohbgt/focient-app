'use client';

import React, { useState, useMemo } from 'react';
import { useFocient } from '../../state/focient-store';
import {
  SparklesIcon,
  ClockIcon,
  CalendarIcon,
  CheckIcon,
} from '../../components/icons';
import {
  calculateCapacityMinutes,
  getWeekDayDate,
  getWeekDayKeys,
  getDayOfWeekName,
  getWeekRangeBadge,
  isTaskOnDate,
} from '../../lib/date-utils';

const formatCardDuration = (minutes: number, lang: 'id' | 'en') => {
  const m = Math.max(0, Math.round(minutes));
  if (m === 0) {
    return {
      value: '0',
      unit: lang === 'id' ? 'menit' : 'mins',
    };
  }
  const hrs = Math.floor(m / 60);
  const remaining = m % 60;

  if (hrs === 0) {
    return {
      value: `${remaining}`,
      unit: lang === 'id' ? 'menit' : 'mins',
    };
  }
  if (remaining === 0) {
    return {
      value: `${hrs}`,
      unit: lang === 'id' ? 'jam' : hrs === 1 ? 'hr' : 'hrs',
    };
  }
  return {
    value: lang === 'id' ? `${hrs}j ${remaining}m` : `${hrs}h ${remaining}m`,
    unit: '',
  };
};

const formatDurationText = (minutes: number, lang: 'id' | 'en'): string => {
  const m = Math.max(0, Math.round(minutes));
  if (m === 0) {
    return lang === 'id' ? '0 menit' : '0 mins';
  }
  const hrs = Math.floor(m / 60);
  const remaining = m % 60;
  if (hrs === 0) {
    return lang === 'id' ? `${remaining} menit` : `${remaining} mins`;
  }
  if (remaining === 0) {
    return lang === 'id' ? `${hrs} jam` : `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
  }
  return lang === 'id' ? `${hrs} jam ${remaining} mnt` : `${hrs}h ${remaining}m`;
};

const formatCompactTime = (minutes: number, lang: 'id' | 'en'): string => {
  const m = Math.max(0, Math.round(minutes));
  if (m === 0) {
    return lang === 'id' ? '0 mnt' : '0m';
  }
  const hrs = Math.floor(m / 60);
  const remaining = m % 60;
  if (hrs === 0) {
    return lang === 'id' ? `${remaining} mnt` : `${remaining}m`;
  }
  if (remaining === 0) {
    return lang === 'id' ? `${hrs} jam` : `${hrs}h`;
  }
  return lang === 'id' ? `${hrs}j ${remaining}m` : `${hrs}h ${remaining}m`;
};

export const InsightsScreen: React.FC = () => {
  const { language, user, tasks, weekStartDay } = useFocient();
  const [selectedRange, setSelectedRange] = useState<'thisWeek' | 'lastWeek'>('thisWeek');

  // Real user capacity baseline
  const capacityMinutes = calculateCapacityMinutes(user?.workHourStart, user?.workHourEnd);
  const dailyLimitFormatted = formatDurationText(capacityMinutes, language);

  // Reference date for range ('thisWeek' or 'lastWeek')
  const referenceDate = useMemo(() => {
    const today = new Date();
    if (selectedRange === 'lastWeek') {
      const past = new Date(today);
      past.setDate(today.getDate() - 7);
      return past;
    }
    return today;
  }, [selectedRange]);

  // 7 calendar dates for the active week cycle (respecting user's weekStartDay)
  const weekDates = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((i) => getWeekDayDate(i, referenceDate, weekStartDay));
  }, [referenceDate, weekStartDay]);

  // Range-driven user tasks: filter tasks that fall within the 7 calendar days of the selected week
  const currentRangeTasks = useMemo(() => {
    const matching = tasks.filter((t) => {
      if (t.isBacklog) return false;
      return weekDates.some((dayDate) => isTaskOnDate(t.dateDisplay, dayDate, t));
    });
    if (selectedRange === 'lastWeek') {
      return matching.filter((t) => t.status === 'completed');
    }
    return matching;
  }, [tasks, weekDates, selectedRange]);

  const completedTasks = currentRangeTasks.filter((t) => t.status === 'completed');
  const totalAllocatedMinutes = currentRangeTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const totalRestMinutes = currentRangeTasks.reduce((sum, t) => sum + (t.restMinutes || 0), 0);
  const focusTimeDisplay = formatCardDuration(totalAllocatedMinutes, language);
  const restTimeDisplay = formatCardDuration(totalRestMinutes, language);

  const timeSavedMinutes =
    user?.rescheduleTimeSavedMinutes ||
    (completedTasks.length > 0 ? completedTasks.length * 15 : 0);
  const savedTimeDisplay = formatCardDuration(timeSavedMinutes, language);

  // Dynamic 7-day keys respecting user's chosen weekStartDay
  const dayKeyList = useMemo(() => getWeekDayKeys(weekStartDay, language), [weekStartDay, language]);
  const dayKeys = useMemo(() => dayKeyList.map((key, index) => ({ key, index })), [dayKeyList]);

  const dailyMetrics = useMemo(() => {
    return dayKeys.map((d) => {
      const weekDayDate = getWeekDayDate(d.index, referenceDate, weekStartDay);
      const dayTasks = currentRangeTasks.filter((t) => {
        if (t.isBacklog) return false;
        return isTaskOnDate(t.dateDisplay, weekDayDate, t);
      });

      const dayMinutes = dayTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      const timeDisplay = formatCompactTime(dayMinutes, language);
      const percentage = capacityMinutes > 0 ? Math.min(100, Math.round((dayMinutes / capacityMinutes) * 100)) : 0;
      const status =
        percentage === 0
          ? 'EMPTY'
          : percentage <= 50
          ? 'LIGHT'
          : percentage <= 75
          ? 'OPTIMAL'
          : percentage <= 90
          ? 'NEAR_CAPACITY'
          : 'OVERLOAD';

      return {
        day: d.key,
        fullDayName: getDayOfWeekName(d.index, language, weekStartDay),
        percentage,
        timeDisplay,
        tasksCount: dayTasks.length,
        status,
      };
    });
  }, [currentRangeTasks, dayKeys, referenceDate, weekStartDay, capacityMinutes, language]);

  // Intensity Distribution (Low=Green, Medium=Blue, High=Red)
  const lowTasks = currentRangeTasks.filter((t) => t.focusType === 'Low' || t.focusType === 'Light');
  const mediumTasks = currentRangeTasks.filter((t) => t.focusType === 'Medium');
  const highTasks = currentRangeTasks.filter((t) => t.focusType === 'High' || t.focusType === 'Deep Focus');

  const totalFocusTasksCount = currentRangeTasks.length;
  const lowPct = totalFocusTasksCount > 0 ? Math.round((lowTasks.length / totalFocusTasksCount) * 100) : 0;
  const medPct = totalFocusTasksCount > 0 ? Math.round((mediumTasks.length / totalFocusTasksCount) * 100) : 0;
  const highPct = totalFocusTasksCount > 0 ? Math.max(0, 100 - lowPct - medPct) : 0;

  const lowMinutes = lowTasks.reduce((s, t) => s + (t.durationMinutes || 0), 0);
  const medMinutes = mediumTasks.reduce((s, t) => s + (t.durationMinutes || 0), 0);
  const highMinutes = highTasks.reduce((s, t) => s + (t.durationMinutes || 0), 0);

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-fade-in max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'id' ? 'Refleksi Mingguan' : 'Weekly Insights & Reflection'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'id'
              ? 'Lihat perkembangan dan ritme kerjamu dengan santai.'
              : 'Take a relaxed look at your focus and rest rhythm.'}
          </p>
        </div>

        {/* Range Switcher: Minggu Lalu / Minggu Ini */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedRange('lastWeek')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedRange === 'lastWeek'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'id' ? 'Minggu Lalu' : 'Last Week'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('thisWeek')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedRange === 'thisWeek'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'id' ? 'Minggu Ini' : 'This Week'}
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Focus Hours */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'id' ? 'Waktu Fokus' : 'Focus Hours'}
            </span>
            <ClockIcon size="xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{focusTimeDisplay.value}</span>
            {focusTimeDisplay.unit && (
              <span className="text-xs font-medium text-slate-500">{focusTimeDisplay.unit}</span>
            )}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {language === 'id' ? 'Kapasitas kerja pas' : 'Comfortable pace'}
          </p>
        </div>

        {/* Card 2: Rest Buffers */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'id' ? 'Jeda Istirahat' : 'Rest Buffers'}
            </span>
            <ClockIcon size="xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{restTimeDisplay.value}</span>
            {restTimeDisplay.unit && (
              <span className="text-xs font-medium text-slate-500">{restTimeDisplay.unit}</span>
            )}
          </div>
          <p className="text-[11px] text-blue-600 font-semibold">
            {language === 'id' ? 'Istirahat tetap terjaga' : 'Rest time protected'}
          </p>
        </div>

        {/* Card 3: Tasks Completed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'id' ? 'Tugas Selesai' : 'Completed'}
            </span>
            <CheckIcon size="xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {completedTasks.length}
            </span>
            <span className="text-xs font-medium text-slate-500">/ {currentRangeTasks.length}</span>
          </div>
          <p className="text-[11px] text-slate-600 font-semibold">
            {selectedRange === 'lastWeek'
              ? (language === 'id' ? 'Selesai pekan lalu' : 'Completed last week')
              : (language === 'id' ? 'Selesai pekan ini' : 'Completed this week')}
          </p>
        </div>

        {/* Card 4: Reschedule Savings */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'id' ? 'Waktu Dihemat' : 'Time Saved'}
            </span>
            <CalendarIcon size="xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {savedTimeDisplay.value}
            </span>
            {savedTimeDisplay.unit && (
              <span className="text-xs font-medium text-slate-500">{savedTimeDisplay.unit}</span>
            )}
          </div>
          <p className="text-[11px] text-violet-600 font-semibold">
            {language === 'id' ? 'Waktu hemat dari atur jadwal' : 'Saved from reschedules'}
          </p>
        </div>
      </div>

      {/* Workload Distribution & Task Intensity Breakdown */}
      <div className="space-y-6">
          {/* Weekly Capacity Breakdown Chart */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'id' ? 'Distribusi Beban Kerja Harian' : 'Daily Workload Distribution'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'id'
                    ? 'Beban kerja harian dibanding batas jam kerjamu'
                    : 'Daily workload compared to your target hours'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {getWeekRangeBadge(weekStartDay, language)}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {language === 'id' ? 'Beban Seimbang' : 'Balanced'}
                </span>
              </div>
            </div>

            {/* Bar Visualization */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-4 pb-2 items-end h-48 border-b border-slate-100">
              {dailyMetrics.map((item) => {
                const isNearCapacity = item.percentage >= 75;
                const barBg = isNearCapacity
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : item.percentage >= 50
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-500 hover:bg-emerald-600';

                return (
                  <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-600 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.percentage}%
                    </span>
                    <div
                      className={`w-full max-w-[32px] rounded-t-xl transition-all ${barBg}`}
                      style={{ height: `${Math.max(item.percentage, item.percentage > 0 ? 10 : 3)}%` }}
                      title={`${item.fullDayName}: ${item.percentage}% (${item.timeDisplay})`}
                    />
                    <span className="text-xs font-semibold text-slate-700">{item.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
              <div className="flex flex-wrap items-center gap-3">
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
                  {language === 'id' ? 'Mendekati Batas (76-90%)' : 'Near Capacity (76-90%)'}
                </span>
              </div>
              <span className="text-slate-500 font-semibold">
                {language === 'id' ? `Batas: ${dailyLimitFormatted}` : `Limit: ${dailyLimitFormatted}`}
              </span>
            </div>
          </div>

          {/* Task Intensity Breakdown Diagram */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'id' ? 'Distribusi Intensitas Tugas' : 'Task Intensity Breakdown'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'id'
                    ? 'Komposisi beban fokus dari seluruh aktivitas.'
                    : 'Cognitive load distribution across all focus activities.'}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {totalFocusTasksCount} {language === 'id' ? 'Total Tugas' : 'Total Tasks'}
              </span>
            </div>

            {/* Multi-Segment Horizontal Stacked Bar */}
            <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${lowPct}%` }}
                title={`Low: ${lowPct}%`}
              />
              <div
                className="h-full bg-sky-600 transition-all duration-500"
                style={{ width: `${medPct}%` }}
                title={`Medium: ${medPct}%`}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${highPct}%` }}
                title={`High: ${highPct}%`}
              />
            </div>

            {/* 3 Intensity Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Low Intensity */}
              <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{language === 'id' ? 'Fokus Ringan' : 'Low Focus'}</span>
                  </span>
                  <span className="text-lg font-black text-emerald-900 tabular-nums">{lowPct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-800/80 pt-1 border-t border-emerald-100">
                  <span className="font-medium">{lowTasks.length} {language === 'id' ? 'tugas' : 'tasks'}</span>
                  <span className="font-bold tabular-nums">{formatDurationText(lowMinutes, language)}</span>
                </div>
              </div>

              {/* Medium Intensity */}
              <div className="p-3.5 rounded-xl bg-sky-50/40 border border-sky-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                    <span>{language === 'id' ? 'Fokus Sedang' : 'Medium Focus'}</span>
                  </span>
                  <span className="text-lg font-black text-sky-900 tabular-nums">{medPct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-sky-800/80 pt-1 border-t border-sky-100">
                  <span className="font-medium">{mediumTasks.length} {language === 'id' ? 'tugas' : 'tasks'}</span>
                  <span className="font-bold tabular-nums">{formatDurationText(medMinutes, language)}</span>
                </div>
              </div>

              {/* High Intensity */}
              <div className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{language === 'id' ? 'Fokus Tinggi' : 'High Focus'}</span>
                  </span>
                  <span className="text-lg font-black text-rose-900 tabular-nums">{highPct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-rose-800/80 pt-1 border-t border-rose-100">
                  <span className="font-medium">{highTasks.length} {language === 'id' ? 'tugas' : 'tasks'}</span>
                  <span className="font-bold tabular-nums">{formatDurationText(highMinutes, language)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default InsightsScreen;