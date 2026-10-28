'use client';

import React, { useState } from 'react';
import { useFocient, MobileTask } from '../../state/focient-store';
import {
  BellIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  RotateCcwIcon,
} from '../../components/icons';

export const DashboardScreen: React.FC = () => {
  const {
    user,
    tasks,
    addTask,
    toggleTaskComplete,
    setSelectedTaskForDetail,
    openAddTaskModal,
    rescheduleAlertResolved,
    rescheduleAlertDismissed,
    resolveRescheduleNow,
    dismissRescheduleLater,
    setActiveNavTab,
    language,
    logout,
  } = useFocient();

  const [showDetailedTop3, setShowDetailedTop3] = useState(true);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('Strategic');
  const [quickDuration, setQuickDuration] = useState(20);

  const categories = ['Strategic', 'Execution', 'Meeting', 'Operation', 'Personal'];
  const categoryColors: Record<string, string> = {
    Strategic: '#7C3AED',
    Execution: '#0284C7',
    Meeting: '#B45309',
    Operation: '#0D9488',
    Personal: '#059669',
  };

  const durations = [10, 15, 20, 25, 30];

  // Workload calculations
  const todayTasks = tasks.filter((t) => !t.isBacklog);
  const allocatedMinutes = todayTasks
    .filter((t) => t.status !== 'completed')
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  const capacityMinutes = 480;
  const workloadPercent = todayTasks.length === 0 ? 0 : Math.min(100, Math.round((allocatedMinutes / capacityMinutes) * 100));

  let workloadStatus = 'Optimal';
  let workloadBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  let barColor = 'bg-blue-600';

  if (workloadPercent === 0) {
    workloadStatus = language === 'id' ? 'Kosong' : 'Empty Plan';
    workloadBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
    barColor = 'bg-slate-300';
  } else if (workloadPercent < 50) {
    workloadStatus = language === 'id' ? 'Ringan' : 'Light';
    workloadBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    barColor = 'bg-emerald-500';
  } else if (workloadPercent <= 80) {
    workloadStatus = language === 'id' ? 'Optimal' : 'Optimal';
    workloadBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    barColor = 'bg-blue-600';
  } else if (workloadPercent <= 95) {
    workloadStatus = language === 'id' ? 'Mendekati Batas' : 'Near Capacity';
    workloadBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    barColor = 'bg-amber-500';
  } else {
    workloadStatus = language === 'id' ? 'Kapasitas Penuh' : 'Heavy Load';
    workloadBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    barColor = 'bg-amber-600';
  }

  const top3Tasks = todayTasks.filter((t) => t.priority === 'top3').slice(0, 3);
  const highCount = todayTasks.filter((t) => t.priority === 'top3' || t.energyLevel === 'high').length;
  const mediumCount = todayTasks.filter((t) => t.priority === 'normal' || t.energyLevel === 'medium').length;
  const lowCount = todayTasks.filter((t) => t.priority === 'low' || t.energyLevel === 'low').length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      categoryName: quickCategory,
      categoryColor: categoryColors[quickCategory] || '#7C3AED',
      durationMinutes: quickDuration,
      priority: 'normal',
      energyLevel: 'medium',
      status: 'todo',
      focusType: 'Medium',
      dateDisplay: 'October, 5th 2026',
      startHourDisplay: '14:30',
      needRestAfter: true,
      restMinutes: 10,
    });

    setQuickTitle('');
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-4xl mx-auto">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || 'AJ'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {language === 'id' ? 'Halo' : 'Hi'}, {user?.name || 'Alex Johnson'}
              </h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${workloadBadgeColor}`}>
                ⚡ {workloadPercent}% {workloadStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500">Monday, October 5th 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveNavTab('plan')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title={language === 'id' ? 'Notifikasi Jadwal' : 'Notifications'}
          >
            <BellIcon size="sm" />
            {!rescheduleAlertResolved && !rescheduleAlertDismissed && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            {language === 'id' ? 'Keluar' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Card 1: Today Workload */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">
              {language === 'id' ? 'Beban Kerja Hari Ini' : 'Today Workload'}
            </span>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {allocatedMinutes}{' '}
              <span className="text-xs font-medium text-slate-500">/ {capacityMinutes} min limit</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${workloadBadgeColor}`}>
            {workloadStatus} ({workloadPercent}%)
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${barColor}`}
            style={{ width: `${workloadPercent}%` }}
          />
        </div>

        {/* Priority breakdown tags */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-100">
            {highCount} {language === 'id' ? 'Fokus Tinggi' : 'High Focus'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-100">
            {mediumCount} {language === 'id' ? 'Sedang' : 'Medium'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
            {lowCount} {language === 'id' ? 'Ringan' : 'Low'}
          </span>
        </div>
      </div>

      {/* Card 2: Empathetic Reschedule Suggestion Alert */}
      {!rescheduleAlertResolved && !rescheduleAlertDismissed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangleIcon size="sm" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                {language === 'id' ? 'Penyesuaian Jadwal Disarankan' : 'Schedule Adjustment Needed'}
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {language === 'id'
                  ? 'Terdapat tumpang tindih waktu antara "Implement Color Palette Token" dan "Review PRs". Disarankan geser 25 menit dengan jeda istirahat 10 menit tanpa rasa bersalah.'
                  : 'Time collision detected between "Implement Color Palette Token" and "Review PRs". Adaptive suggestion: Shift 25m with a 10m buffer.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={dismissRescheduleLater}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              {language === 'id' ? 'Nanti Saja' : 'Reschedule Later'}
            </button>
            <button
              type="button"
              onClick={resolveRescheduleNow}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              {language === 'id' ? 'Terapkan Penyesuaian Sekarang' : 'Reschedule Now'}
            </button>
          </div>
        </div>
      )}

      {/* Card 3: Top 3 Priority Tasks */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              🎯
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'id' ? 'Fokus Utama Hari Ini (Top 3)' : 'Today Priority Focus (Top 3)'}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowDetailedTop3(!showDetailedTop3)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>{showDetailedTop3 ? (language === 'id' ? 'Ringkas' : 'Compact') : (language === 'id' ? 'Detail' : 'Detailed')}</span>
            {showDetailedTop3 ? <ChevronUpIcon size="xs" /> : <ChevronDownIcon size="xs" />}
          </button>
        </div>

        {top3Tasks.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            {language === 'id' ? 'Belum ada tugas Top 3 hari ini.' : 'No active Top 3 tasks for today.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {top3Tasks.map((t, idx) => {
              const isCompleted = t.status === 'completed';
              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(t.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-blue-600'
                      }`}
                      aria-label="Toggle Complete"
                    >
                      {isCompleted && <CheckIcon size="xs" strokeWidth={3} />}
                    </button>

                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedTaskForDetail(t)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-extrabold text-blue-600 tabular-nums">
                          #{idx + 1}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.categoryColor }}
                        />
                        <span className="text-[11px] font-semibold text-slate-500">
                          {t.categoryName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                          {t.focusType}
                        </span>
                      </div>

                      <div
                        className={`text-sm font-bold text-slate-900 ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {t.title}
                      </div>

                      {showDetailedTop3 && (
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1 tabular-nums">
                            <ClockIcon size="xs" />
                            {t.startHourDisplay} ({t.durationMinutes}m)
                          </span>
                          {t.restMinutes > 0 && (
                            <span className="text-teal-600 font-medium">
                              +{t.restMinutes}m rest buffer
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4: Today Timeline */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'id' ? 'Lini Masa Hari Ini (13:30 - 17:30)' : 'Today Timeline (13:30 - 17:30)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveNavTab('tasks')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {language === 'id' ? 'Lihat Semua' : 'View All'}
          </button>
        </div>

        <div className="space-y-3">
          {todayTasks.slice(2, 6).map((t, idx) => (
            <React.Fragment key={t.id}>
              <div
                onClick={() => setSelectedTaskForDetail(t)}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm cursor-pointer transition-all"
              >
                <div className="text-xs font-bold text-slate-600 w-12 tabular-nums">
                  {t.startHourDisplay}
                </div>
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: t.categoryColor }} />
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">{t.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{t.categoryName}</span>
                    <span>•</span>
                    <span className="tabular-nums font-semibold">{t.durationMinutes} min</span>
                  </div>
                </div>
              </div>

              {/* Resting buffer representation */}
              {idx < 3 && t.restMinutes > 0 && (
                <div className="flex items-center gap-3 pl-14 text-[11px] text-teal-700 font-semibold py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>
                    {t.restMinutes} {language === 'id' ? 'Menit Jeda Istirahat' : 'Min Rest Buffer'}
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Card 5: Quick Add Task */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {language === 'id' ? 'Tambah Cepat Tugas Hari Ini' : 'Quick Add Task to Today'}
        </h3>

        <form onSubmit={handleQuickAdd} className="space-y-3">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder={
              language === 'id' ? 'Ketik nama tugas baru di sini...' : 'Type a task name here...'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 4).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setQuickCategory(c)}
                  className={`px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                    quickCategory === c
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setQuickDuration(d)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold tabular-nums border ${
                    quickDuration === d
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <PlusIcon size="xs" />
              <span>{language === 'id' ? 'Konfirmasi Tugas Baru' : 'Confirm New Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
