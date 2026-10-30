'use client';

import React, { useState } from 'react';
import { useFocient, BacklogTaskItem } from '../../state/focient-store';
import {
  ArrowLeftIcon,
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
    categoryBudgets,
    weeklyWorkloads,
    rebalanceProposal,
    rescheduleOverloadedTasks,
    keepCurrentSchedule,
    backlogTasks,
    scheduleBacklogTask,
    setActiveNavTab,
    language,
  } = useFocient();

  const [selectedBacklogTask, setSelectedBacklogTask] = useState<BacklogTaskItem | null>(null);

  const formatMinutes = (mins: number) => {
    const h = (mins / 60).toFixed(mins % 60 === 0 ? 0 : 1);
    return `${h}h`;
  };

  const allTasksCompleted = tasks.length > 0 && tasks.every((t) => t.status === 'completed');
  const activeTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveNavTab('dashboard')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeftIcon size="sm" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'id' ? 'Rencana Kerja' : 'Your Planning'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'id' ? 'Optimasi kapasitas dan distribusi beban' : 'Capacity optimization & workload balance'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            ⚡ 65% {language === 'id' ? 'Optimal' : 'Optimal'}
          </span>
        </div>
      </div>

      {/* Today Focus Tasks Section: 4 Data-Driven UI States */}
      {tasks.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]">
            <SparklesIcon size="md" />
          </div>
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
            className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <PlusIcon size="xs" />
            <span>{language === 'id' ? '+ Buat Rencana Pertama' : '+ Create First Plan'}</span>
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
            {tasks.map((task) => {
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
                      onClick={() => toggleTaskComplete(task.id)}
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

      {/* Section 1: Task Category Budgets */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 px-1">
          {language === 'id' ? 'Alokasi Berdasarkan Kategori' : 'Category Allocation vs Budget'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryBudgets.map((b) => (
            <div
              key={b.name}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.colorHex || '#7C3AED' }} />
                <span className="text-xs font-bold text-slate-800">{b.name}</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 tabular-nums">
                {formatMinutes(b.allocatedMinutes)}{' '}
                {b.maxMinutes && (
                  <span className="text-[11px] font-normal text-slate-500">
                    / max {formatMinutes(b.maxMinutes)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Weekly Workload Distribution */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'id' ? 'Distribusi Beban Kerja Mingguan' : 'Weekly Workload Distribution'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'id' ? 'Monitoring kapasitas 7 hari' : '7-day capacity monitoring'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            Mon - Sun
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
            <span className="text-sm font-extrabold text-slate-900 tabular-nums">28.5h</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">
              {language === 'id' ? 'Jeda Istirahat' : 'Buffer Hours'}
            </span>
            <span className="text-sm font-extrabold text-teal-700 tabular-nums">5.0h</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">
              {language === 'id' ? 'Total Terjadwal' : 'Scheduled Tasks'}
            </span>
            <span className="text-sm font-extrabold text-slate-900 tabular-nums">14</span>
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
                {language === 'id' ? 'Smart Rebalancer (Kapasitas Rabu 92%)' : 'Smart Rebalancer (Wednesday 92%)'}
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {language === 'id'
                  ? 'Beban hari Rabu mendekati kapasitas maksimal. Saran adaptif: Pindahkan 1 tugas ke Kamis pagi agar ritme kerja tetap santai dan bebas beban.'
                  : 'Wednesday workload is approaching limit. Recommended adjustment: Move 1 task to Thursday morning.'}
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
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs">
          <span className="text-lg">🌿</span>
          <span className="font-medium">
            {language === 'id'
              ? 'Semua jadwal minggu ini berada dalam rentang kapasitas optimal tanpa risiko kelelahan!'
              : 'All days this week are balanced within healthy capacity limits! No burnout risk detected.'}
          </span>
        </div>
      )}

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
                    onClick={() => scheduleBacklogTask(b.id, 'Today, 15:00')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
                  >
                    + {language === 'id' ? 'Hari Ini' : 'Today'}
                  </button>
                  <button
                    type="button"
                    onClick={() => scheduleBacklogTask(b.id, 'Tomorrow, 10:00')}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px] transition-colors"
                  >
                    + {language === 'id' ? 'Besok' : 'Tomorrow'}
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
