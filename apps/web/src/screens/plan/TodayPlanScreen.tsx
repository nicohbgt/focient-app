'use client';

import React, { useState, useMemo } from 'react';
import { useFocient, BacklogTaskItem, MobileTask } from '../../state/focient-store';
import { isTaskOnDate, formatCurrentDate, normalizeToISODate, getWeekRangeBadge, getWeekDayDate } from '../../lib/date-utils';
import {
  BellIcon,
  SparklesIcon,
  RotateCcwIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
} from '../../components/icons';

export const TodayPlanScreen: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    setIsAddTaskModalOpen,
    openAddTaskModal,
    categoryBudgets,
    weeklyWorkloads,
    weekStartDay,
    rebalanceProposal,
    rescheduleOverloadedTasks,
    keepCurrentSchedule,
    backlogTasks,
    scheduleBacklogTask,
    language,
  } = useFocient();

  const [selectedBacklogTask, setSelectedBacklogTask] = useState<BacklogTaskItem | null>(null);

  const formatMinutes = (mins: number) => {
    if (!mins || mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const today = new Date();
  const rawTodayTasks = tasks.filter((t) => !t.isBacklog && isTaskOnDate(t.dateDisplay, today, t));
  const todayTasks = [...rawTodayTasks].sort((a, b) => {
    // 1. Sort by Priority: Top 3 Focus (0) -> Normal (1) -> Low (2)
    const priorityWeight: Record<string, number> = { top3: 0, normal: 1, low: 2 };
    const pA = priorityWeight[a.priority] ?? 1;
    const pB = priorityWeight[b.priority] ?? 1;
    if (pA !== pB) return pA - pB;

    // 2. Uncompleted tasks before completed tasks
    const isCompA = a.status === 'completed' ? 1 : 0;
    const isCompB = b.status === 'completed' ? 1 : 0;
    if (isCompA !== isCompB) return isCompA - isCompB;

    // 3. Chronologically by start time
    const parseMinutes = (timeStr?: string) => {
      if (!timeStr) return 9999;
      const clean = timeStr.trim().toUpperCase();
      const isPm = clean.includes('PM');
      const isAm = clean.includes('AM');
      const parts = clean.replace(/AM|PM/g, '').trim().split(':');
      let h = parseInt(parts[0], 10);
      const m = parseInt(parts[1] || '0', 10);
      if (isNaN(h)) return 9999;
      if (isPm && h < 12) h += 12;
      if (isAm && h === 12) h = 0;
      return h * 60 + (isNaN(m) ? 0 : m);
    };
    const diff = parseMinutes(a.startHourDisplay) - parseMinutes(b.startHourDisplay);
    if (diff !== 0) return diff;

    return (a.title || '').localeCompare(b.title || '');
  });
  const allTasksCompleted = todayTasks.length > 0 && todayTasks.every((t) => t.status === 'completed');
  const activeTasksCount = todayTasks.filter((t) => t.status !== 'completed').length;

  const distinctCategories = useMemo(
    () => Array.from(new Set(todayTasks.map((t) => t.categoryName).filter(Boolean))),
    [todayTasks]
  );

  const totalTodayAllocatedMinutes = useMemo(
    () => todayTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0),
    [todayTasks]
  );

  const currentWeekDays = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((i) => getWeekDayDate(i, undefined, weekStartDay));
  }, [weekStartDay]);

  const weeklyScheduledTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.isBacklog && currentWeekDays.some((dayDate) => isTaskOnDate(t.dateDisplay, dayDate, t))
    );
  }, [tasks, currentWeekDays]);

  const weeklyActiveTasks = useMemo(
    () => weeklyScheduledTasks.filter((t) => t.status !== 'completed'),
    [weeklyScheduledTasks]
  );
  const weeklyActiveMinutes = useMemo(
    () => weeklyActiveTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0),
    [weeklyActiveTasks]
  );
  const weeklyBufferMinutes = useMemo(
    () => weeklyActiveTasks.reduce((sum, t) => sum + (t.restMinutes || 0), 0),
    [weeklyActiveTasks]
  );

  const categoryMetrics = useMemo(() => {
    return distinctCategories.map((catName) => {
      const catTasks = todayTasks.filter((t) => t.categoryName === catName);
      const catMinutes = catTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      const colorHex = catTasks[0]?.categoryColor || '#7C3AED';
      const catPct = totalTodayAllocatedMinutes > 0 ? Math.round((catMinutes / totalTodayAllocatedMinutes) * 100) : 0;
      return {
        name: catName,
        minutes: catMinutes,
        timeDisplay: formatMinutes(catMinutes),
        percentage: catPct,
        colorHex,
        count: catTasks.length,
      };
    });
  }, [todayTasks, distinctCategories, totalTodayAllocatedMinutes]);

  const handleScheduleBacklogManual = (b: BacklogTaskItem) => {
    const existingTask = tasks.find((t) => t.id === b.id);
    const targetTask: MobileTask = existingTask
      ? {
          ...existingTask,
          isBacklog: false,
          dateDisplay: '',
          startHourDisplay: '',
        }
      : {
          id: b.id,
          title: b.title,
          durationMinutes: b.durationMinutes,
          priority: 'normal',
          energyLevel: b.focusType === 'High' || b.focusType === 'Deep Focus' ? 'high' : 'medium',
          status: 'todo',
          categoryName: b.categoryName,
          categoryColor: b.categoryColor,
          restMinutes: b.restMinutes ?? 10,
          dateDisplay: '',
          startHourDisplay: '',
          focusType: b.focusType,
          needRestAfter: true,
          isBacklog: false,
        };
    openAddTaskModal(targetTask, '');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-fade-in max-w-6xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'id' ? 'Rencana Hari Ini' : 'Your Planning'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'id' ? 'Optimalisasi kapasitas & keseimbangan beban kerja' : 'Capacity optimization & workload balance'}
          </p>
        </div>
      </div>

      {/* Today Focus Tasks Section: 4 Data-Driven UI States */}
      {todayTasks.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {language === 'id' ? 'Mulai Hari dengan Ritme Tenang' : 'Start Your Day in a Calm Rhythm'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'id'
                ? 'Belum ada agenda terencana. Tambahkan aktivitas pertamamu untuk memulai fokus.'
                : 'No scheduled agenda yet. Add your first activity to start your focus.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
          >
            <PlusIcon size="xs" />
            <span>{language === 'id' ? 'Buat Rencana Pertama' : 'Create First Plan'}</span>
          </button>
        </div>
      ) : allTasksCompleted ? (
        /* All-Tasks-Completed State (Zero Inbox) */
        <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-[#A7F3D0] text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#059669]">
            <CheckIcon size="md" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-[#065F46]">
              {language === 'id' ? 'Fokus Hari Ini Telah Tuntas' : "Today's Focus Is Complete"}
            </h3>
            <p className="text-xs text-[#047857] leading-relaxed">
              {language === 'id'
                ? 'Semua agenda terencana telah diselesaikan dengan tenang. Nikmati waktu istirahat tanpa rasa bersalah.'
                : 'All planned activities are completed calmly. Enjoy your well-deserved break without guilt.'}
            </p>
          </div>
        </div>
      ) : (
        /* Populated State */
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'id' ? 'Rencana Fokus Hari Ini' : "Today's Focus Tasks"}
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {activeTasksCount} {language === 'id' ? 'Aktif' : 'Active'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(true)}
              className="text-xs font-bold text-[#0D9488] hover:text-[#0f766e] flex items-center gap-1 transition-colors"
            >
              <PlusIcon size="xs" />
              <span>{language === 'id' ? '+ Tambah' : '+ Add'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {todayTasks.map((task) => {
              const isTop3 = task.priority === 'top3';
              const isCompleted = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl transition-all duration-150 flex items-center justify-between ${
                    isTop3
                      ? 'border-2 border-[#2563EB] bg-blue-50/20 shadow-sm'
                      : 'border border-slate-200 bg-white hover:border-slate-300'
                  } ${isCompleted ? 'opacity-60' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 border ${
                        isCompleted
                          ? 'bg-[#0D9488] border-[#0D9488] text-white'
                          : 'border-slate-300 hover:border-[#0D9488] bg-white'
                      }`}
                    >
                      {isCompleted && <CheckIcon size="xs" />}
                    </button>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        {isTop3 && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                            Top 3 Focus
                          </span>
                        )}
                        <span
                          className={`text-xs font-bold truncate ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: task.categoryColor || '#7C3AED' }}
                          />
                          <span>{task.categoryName}</span>
                        </span>
                        <span>•</span>
                        <span className="tabular-nums font-semibold">{task.durationMinutes}m</span>
                        {task.focusType === 'Deep Focus' && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-semibold">Deep Focus</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 1: Category Allocation (Gambar 3 UI with Proportion Bars) */}
      {categoryMetrics.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'id' ? 'Alokasi per Kategori' : 'Category Allocation'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'id'
                  ? 'Waktu fokus berdasarkan kategori tugas'
                  : 'Focus time proportion invested in each category'}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {categoryMetrics.length} {language === 'id' ? 'Kategori' : 'Categories'}
            </span>
          </div>

          <div className="space-y-3.5">
            {categoryMetrics.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.colorHex }} />
                    <span className="font-bold text-slate-800 truncate">{cat.name}</span>
                    <span className="text-slate-400">({cat.count})</span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums font-semibold text-slate-700 shrink-0">
                    <span>{cat.timeDisplay}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-slate-900">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.colorHex,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Weekly Workload Distribution */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'id' ? 'Distribusi Beban Kerja Mingguan' : 'Weekly Workload Distribution'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'id' ? 'Pantauan kapasitas 7 hari' : '7-day capacity monitoring'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {getWeekRangeBadge(weekStartDay, language)}
          </span>
        </div>

        {/* 7-Day Bar Chart */}
        <div className="grid grid-cols-7 gap-2 pt-2 pb-1 items-end h-36">
          {weeklyWorkloads.map((day) => {
            const isOverloaded = day.percentage > 80;
            const barBg = isOverloaded
              ? 'bg-amber-500'
              : day.percentage >= 70
              ? 'bg-emerald-500'
              : day.percentage >= 50
              ? 'bg-blue-600'
              : 'bg-emerald-400';

            return (
              <div key={day.dayKey} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-600 tabular-nums">
                  {day.percentage}%
                </span>
                <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg h-24 flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${barBg}`}
                    style={{ height: `${day.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700">{day.dayKey}</span>
              </div>
            );
          })}
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">
              {language === 'id' ? 'Jam Fokus Aktif' : 'Active Hours'}
            </span>
            <span className="text-sm font-extrabold text-slate-900 tabular-nums">
              {formatMinutes(weeklyActiveMinutes)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">
              {language === 'id' ? 'Jeda Istirahat' : 'Buffer Hours'}
            </span>
            <span className="text-sm font-extrabold text-teal-700 tabular-nums">
              {formatMinutes(weeklyBufferMinutes)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">
              {language === 'id' ? 'Tugas Terjadwal' : 'Scheduled Tasks'}
            </span>
            <span className="text-sm font-extrabold text-slate-900 tabular-nums">
              {weeklyScheduledTasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Smart Rebalancer Card */}
      {rebalanceProposal ? (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <SparklesIcon size="sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {language === 'id' ? 'Penyeimbang Jadwal Otomatis' : 'Smart Rebalancer'}
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {language === 'id'
                  ? 'Saran adaptif: Sesuaikan jadwal tugas agar ritme kerja tetap seimbang dan bebas dari risiko kelelahan atau jadwal bentrok.'
                  : 'Adaptive suggestion: Adjust task schedule so your work rhythm remains balanced and free of overlap or burnout.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: rebalanceProposal.categoryColor }}
              />
              <span className="font-bold text-slate-900">{rebalanceProposal.title}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span className="line-through text-slate-400">{rebalanceProposal.previousSchedule}</span>
              <span>→</span>
              <span className="font-bold text-emerald-700">{rebalanceProposal.newSchedule}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={keepCurrentSchedule}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              {language === 'id' ? 'Pertahankan Jadwal' : 'Keep The Schedule'}
            </button>
            <button
              type="button"
              onClick={rescheduleOverloadedTasks}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <RotateCcwIcon size="xs" />
              <span>{language === 'id' ? 'Seimbangkan Jadwal' : 'Reschedule Task'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Section 4: Backlog Scheduler Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'id' ? 'Tugas Dalam Backlog' : 'Backlog Scheduler'} ({backlogTasks.length})
          </h3>
          <span className="text-xs text-slate-400">
            {language === 'id' ? 'Belum dijadwalkan' : 'Not yet scheduled'}
          </span>
        </div>

        {backlogTasks.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            {language === 'id' ? 'Backlog kosong.' : 'No backlog tasks.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {backlogTasks.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: b.categoryColor }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">{b.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{b.categoryName}</span>
                      <span>•</span>
                      <span className="tabular-nums font-semibold">{b.durationMinutes}m</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-medium">{b.focusType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleScheduleBacklogManual(b)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
                  >
                    {language === 'id' ? 'Atur Waktu' : 'Set Schedule'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
