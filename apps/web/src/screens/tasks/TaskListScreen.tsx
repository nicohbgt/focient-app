'use client';

import React, { useState } from 'react';
import { useFocient, MobileTask } from '../../state/focient-store';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckIcon,
  ClockIcon,
  RepeatIcon,
} from '../../components/icons';
import {
  getCurrentMonthYear,
  getDaysInMonth,
  getFirstDayOfWeek,
  formatCurrentDate,
  isTaskOnDate,
} from '../../lib/date-utils';

export const TaskListScreen: React.FC = () => {
  const {
    tasks,
    selectedCalendarDay,
    setSelectedCalendarDay,
    selectedDateTitle,
    setSelectedTaskForDetail,
    toggleTaskComplete,
    openAddTaskModal,
    language,
    weekStartDay,
  } = useFocient();

  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const currentMonth = getCurrentMonthYear(viewDate, language);
  const daysInMonth = getDaysInMonth(year, month);
  const startDayOfWeek = getFirstDayOfWeek(year, month);
  const emptyOffset =
    weekStartDay === 'sunday' ? startDayOfWeek : startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const weekdays =
    weekStartDay === 'sunday'
      ? language === 'id'
        ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : language === 'id'
      ? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Current selected full date for the active month view
  const validSelectedDay = Math.min(Math.max(1, selectedCalendarDay), daysInMonth);
  const selectedDate = new Date(year, month, validSelectedDay);
  const activeSelectedDateTitle = formatCurrentDate(selectedDate, language);

  // Filter tasks for the selected day dynamically using exact date matching and recurrence logic, sorted chronologically
  const dayTasks = tasks
    .filter((t) => {
      if (t.isBacklog) return false;
      return isTaskOnDate(t.dateDisplay, selectedDate, t);
    })
    .sort((a, b) => {
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

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-fade-in max-w-6xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'id' ? 'Daftar Tugas' : 'Your Task List'}
          </h2>
          <p className="text-xs text-slate-500">{activeSelectedDateTitle}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(validSelectedDay).padStart(2, '0')}`;
            openAddTaskModal(undefined, dStr);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
        >
          <PlusIcon size="xs" />
          <span>{language === 'id' ? 'Tambah Tugas' : 'Add Task'}</span>
        </button>
      </div>

      {/* Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar Grid & Schedule Legend (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Month Navigator & Calendar Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Month Navigator Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Previous month"
          >
            <ChevronLeftIcon size="sm" />
          </button>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{currentMonth}</h3>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Next month"
          >
            <ChevronRightIcon size="sm" />
          </button>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs sm:text-sm font-bold text-slate-400 py-1.5">
          {weekdays.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* Calendar Day Cells - Spacious Large Design */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {/* Empty prefix cells before 1st of month */}
          {Array.from({ length: emptyOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[48px] sm:min-h-[54px]" />
          ))}

          {/* Month Days 1..daysInMonth */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = validSelectedDay === dayNum;
            const cellDate = new Date(year, month, dayNum);
            const hasTasks = tasks.some(
              (t) => !t.isBacklog && isTaskOnDate(t.dateDisplay, cellDate, t)
            );

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedCalendarDay(dayNum)}
                className={`min-h-[48px] sm:min-h-[54px] rounded-2xl font-bold text-sm sm:text-base flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="tabular-nums">{dayNum}</span>
                {hasTasks && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-white' : 'bg-blue-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Card in Left Column */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
        <h4 className="font-bold text-slate-900 text-sm">
          {language === 'id' ? 'Keterangan Jadwal' : 'Schedule Legend'}
        </h4>
        <div className="space-y-2 text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <span>{language === 'id' ? 'Hari dengan tugas aktif terencana' : 'Days with active planned tasks'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
            <span>{language === 'id' ? 'Jeda istirahat regeneratif otomatis' : 'Automated restorative rest buffers'}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Right Column: Selected Day Schedule Section (7 cols on lg) */}
    <div className="lg:col-span-7 space-y-6">
      {/* Selected Day Schedule Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">{activeSelectedDateTitle}</h3>
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
              onClick={() => {
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(validSelectedDay).padStart(2, '0')}`;
                openAddTaskModal(undefined, dStr);
              }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(t.id);
                        }}
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
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            t.focusType === 'High' || t.focusType === 'Deep Focus'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : t.focusType === 'Medium'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {t.focusType === 'Deep Focus'
                              ? (language === 'id' ? 'Tinggi' : 'High')
                              : t.focusType === 'High'
                              ? (language === 'id' ? 'Tinggi' : 'High')
                              : t.focusType === 'Medium'
                              ? (language === 'id' ? 'Sedang' : 'Medium')
                              : (language === 'id' ? 'Rendah' : 'Low')}
                          </span>
                          {t.isRecurring && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              {t.recurrencePattern === 'daily'
                                ? (language === 'id' ? 'Harian' : 'Daily')
                                : t.recurrencePattern === 'weekdays'
                                ? (language === 'id' ? 'Hari Kerja' : 'Weekdays')
                                : t.recurrencePattern === 'weekly'
                                ? (language === 'id' ? 'Mingguan' : 'Weekly')
                                : (language === 'id' ? 'Pilihan' : 'Custom')}
                            </span>
                          )}
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
                              +{t.restMinutes}m {language === 'id' ? 'jeda istirahat' : 'rest'}
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
  </div>
</div>
  );
};
