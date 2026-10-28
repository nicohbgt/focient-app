'use client';

import React, { useState } from 'react';
import { useFocient, MobileTask } from '../../state/focient-store';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckIcon,
  ClockIcon,
} from '../../components/icons';

export const TaskListScreen: React.FC = () => {
  const {
    tasks,
    selectedCalendarDay,
    setSelectedCalendarDay,
    selectedDateTitle,
    setSelectedTaskForDetail,
    toggleTaskComplete,
    openAddTaskModal,
    setActiveNavTab,
    language,
  } = useFocient();

  const [currentMonth] = useState('October 2026');

  // Days in October: starts on Thursday (index 4) for 2026
  // Days with tasks: 3, 5, 10
  const daysInMonth = 31;
  const startDayOfWeek = 4; // Thursday = 4 (0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat)

  const weekdays = language === 'id' ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter tasks for the selected day
  const dayTasks = tasks.filter((t) => {
    if (t.isBacklog) return false;
    if (selectedCalendarDay === 3) {
      return t.dateDisplay.includes('3rd') || t.dateDisplay.includes('October, 3');
    }
    if (selectedCalendarDay === 5) {
      return t.dateDisplay.includes('5th') || t.dateDisplay.includes('October, 5');
    }
    if (selectedCalendarDay === 10) {
      return t.dateDisplay.includes('10th') || t.dateDisplay.includes('October, 10');
    }
    return t.dateDisplay.includes(`${selectedCalendarDay}`);
  });

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
              {language === 'id' ? 'Daftar Tugas' : 'Your Task List'}
            </h2>
            <p className="text-xs text-slate-500">{selectedDateTitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openAddTaskModal()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
        >
          <PlusIcon size="xs" />
          <span>{language === 'id' ? 'Tambah Tugas' : 'Add Task'}</span>
        </button>
      </div>

      {/* Month Navigator & Calendar Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Month Navigator Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <ChevronLeftIcon size="sm" />
          </button>
          <h3 className="text-sm font-extrabold text-slate-900">{currentMonth}</h3>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <ChevronRightIcon size="sm" />
          </button>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-1">
          {weekdays.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {/* Empty prefix cells before October 1st */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="py-2 text-slate-300">
              {27 + i}
            </div>
          ))}

          {/* Month Days 1..31 */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedCalendarDay === dayNum;
            const hasTasks = dayNum === 3 || dayNum === 5 || dayNum === 10;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedCalendarDay(dayNum)}
                className={`py-2 rounded-xl font-bold flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="tabular-nums">{dayNum}</span>
                {hasTasks && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white' : 'bg-blue-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Schedule Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">{selectedDateTitle}</h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {dayTasks.length} {language === 'id' ? 'Tugas' : 'Tasks'}
          </span>
        </div>

        {dayTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl space-y-2">
            <p>
              {language === 'id'
                ? 'Tidak ada tugas yang dijadwalkan pada hari ini.'
                : 'No tasks scheduled for this day.'}
            </p>
            <button
              type="button"
              onClick={() => openAddTaskModal()}
              className="font-bold text-blue-600 hover:underline"
            >
              + {language === 'id' ? 'Tambahkan tugas sekarang' : 'Add a task now'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayTasks.map((t, idx) => {
              const isCompleted = t.status === 'completed';
              return (
                <React.Fragment key={t.id}>
                  <div
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
                        className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-blue-600'
                        }`}
                        aria-label="Toggle Complete"
                      >
                        {isCompleted && <CheckIcon size="xs" strokeWidth={3} />}
                      </button>

                      <div
                        className="flex-1 cursor-pointer overflow-hidden"
                        onClick={() => setSelectedTaskForDetail(t)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: t.categoryColor }}
                          />
                          <span className="text-[11px] font-semibold text-slate-500">
                            {t.categoryName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {t.focusType}
                          </span>
                        </div>

                        <div
                          className={`text-sm font-bold text-slate-900 truncate ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {t.title}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 tabular-nums">
                            <ClockIcon size="xs" />
                            {t.startHourDisplay} ({t.durationMinutes}m)
                          </span>
                          {t.restMinutes > 0 && (
                            <span className="text-teal-600 font-medium">
                              +{t.restMinutes}m rest buffer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rest Interval Indicator */}
                  {idx < dayTasks.length - 1 && t.restMinutes > 0 && (
                    <div className="flex items-center gap-2.5 pl-8 text-[11px] text-teal-700 font-semibold py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <span>
                        {language === 'id'
                          ? `Istirahat ${t.restMinutes} menit setelah ${t.title}`
                          : `Resting ${t.restMinutes}m after ${t.title}`}
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
