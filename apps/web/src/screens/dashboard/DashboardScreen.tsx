'use client';

import React, { useState, useEffect } from 'react';
import { useFocient, MobileTask, RecurrencePattern } from '../../state/focient-store';
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
  TargetIcon,
  CalendarIcon,
  ActivityIcon,
  RepeatIcon,
} from '../../components/icons';
import { calculateCapacityMinutes, formatCurrentDate, isTaskOnDate } from '../../lib/date-utils';
import { TimePicker24 } from '../../components/primitive/TimePicker24';
import { DatePickerField } from '../../components/primitive/DatePickerField';
import { getAvatarInitial } from '../../lib/utils';

export const DashboardScreen: React.FC = () => {
  const {
    user,
    tasks,
    categories: storeCategories,
    addTask,
    toggleTaskComplete,
    setSelectedTaskForDetail,
    openAddTaskModal,
    rescheduleAlertResolved,
    rescheduleAlertDismissed,
    resolveRescheduleNow,
    dismissRescheduleLater,
    setActiveNavTab,
    restMinutesPerTask,
    language,
    logout,
    openNotificationPanel,
    unreadNotificationCount,
    startHour,
    endHour,
    selectedRhythm,
  } = useFocient();

  const [showDetailedTop3, setShowDetailedTop3] = useState(true);
  const [quickTitle, setQuickTitle] = useState('');

  // Helper to get today's date formatted for HTML date picker (YYYY-MM-DD)
  const getTodayIsoDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to get current hour or next 15m slot today (HH:MM)
  const getCurrentHourSlot = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(Math.ceil(now.getMinutes() / 15) * 15 % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [quickDate, setQuickDate] = useState('');
  const [quickStartHour, setQuickStartHour] = useState('');
  const [quickNeedRest, setQuickNeedRest] = useState(false);
  const configuredRestMinutes = restMinutesPerTask || user?.restTimePerTask || 10;

  const userCategories =
    storeCategories && storeCategories.length > 0
      ? storeCategories
      : [
          { id: 'c1', name: 'Strategic', colorHex: '#7C3AED', focusType: 'High' as const, isDefault: true },
          { id: 'c2', name: 'Execution', colorHex: '#0284C7', focusType: 'Medium' as const, isDefault: true },
          { id: 'c3', name: 'Meeting', colorHex: '#B45309', focusType: 'Medium' as const, isDefault: true },
          { id: 'c4', name: 'Personal', colorHex: '#059669', focusType: 'Low' as const, isDefault: true },
        ];

  const [quickCategory, setQuickCategory] = useState<string>('');
  const [quickDuration, setQuickDuration] = useState<number | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickIsRecurring, setQuickIsRecurring] = useState(false);
  const [quickRecurrencePattern, setQuickRecurrencePattern] = useState<RecurrencePattern>('daily');

  const durations = [10, 15, 20, 25, 30, 45, 60];

  // Workload calculations: strictly filter tasks for TODAY only
  const today = new Date();
  const todayTasks = tasks.filter((t) => !t.isBacklog && isTaskOnDate(t.dateDisplay, today, t));
  const allocatedMinutes = todayTasks
    .filter((t) => t.status !== 'completed')
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  const capacityMinutes = calculateCapacityMinutes(
    user?.workHourStart || user?.startWorkTime || startHour || '09:00',
    user?.workHourEnd || user?.endWorkTime || endHour || '17:00'
  );
  const workloadPercent = todayTasks.length === 0 ? 0 : Math.min(100, Math.round((allocatedMinutes / capacityMinutes) * 100));

  // Real schedule collision and overload detection
  const scheduledTasks = todayTasks
    .filter((t) => t.startHourDisplay && t.startHourDisplay.includes(':') && t.status !== 'completed')
    .map((t) => {
      const parts = t.startHourDisplay.split(':');
      const startMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      return {
        ...t,
        startMin,
        endMin: startMin + t.durationMinutes,
      };
    })
    .sort((a, b) => a.startMin - b.startMin);

  let overlappingTasks: [MobileTask, MobileTask] | null = null;
  for (let i = 0; i < scheduledTasks.length - 1; i++) {
    const cur = scheduledTasks[i];
    const next = scheduledTasks[i + 1];
    if (cur.endMin > next.startMin) {
      overlappingTasks = [cur, next];
      break;
    }
  }

  const isOverloaded = workloadPercent > 90;
  const hasCollision = overlappingTasks !== null;
  const shouldShowReschedule =
    (isOverloaded || hasCollision) && !rescheduleAlertResolved && !rescheduleAlertDismissed;

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
    if (!quickTitle.trim()) {
      setQuickError(language === 'id' ? 'Judul tugas tidak boleh kosong' : 'Task title cannot be empty');
      return;
    }
    if (!quickCategory) {
      setQuickError(language === 'id' ? 'Kategori tugas wajib dipilih' : 'Task category is required');
      return;
    }
    if (!quickDuration || quickDuration <= 0) {
      setQuickError(language === 'id' ? 'Durasi tugas wajib dipilih' : 'Task duration is required');
      return;
    }
    setQuickError(null);

    const foundCat = userCategories.find((c) => c.name === quickCategory);
    const categoryColor = foundCat?.colorHex || '#2563EB';
    const focusType = foundCat?.focusType || 'Medium';

    // Format dateDisplay from quickDate input
    let formattedDate = formatCurrentDate(new Date(), language);
    if (quickDate) {
      try {
        const d = new Date(`${quickDate}T00:00:00`);
        if (!isNaN(d.getTime())) {
          formattedDate = formatCurrentDate(d, language);
        }
      } catch {}
    }

    addTask({
      title: quickTitle.trim(),
      categoryName: quickCategory,
      categoryColor,
      durationMinutes: quickDuration,
      priority: focusType === 'High' ? 'top3' : 'normal',
      energyLevel: focusType === 'High' ? 'high' : focusType === 'Low' ? 'low' : 'medium',
      status: 'todo',
      focusType,
      dateDisplay: formattedDate,
      startHourDisplay: quickStartHour || '14:00',
      needRestAfter: quickNeedRest,
      restMinutes: quickNeedRest ? configuredRestMinutes : 0,
      isRecurring: quickIsRecurring,
      recurrencePattern: quickIsRecurring ? quickRecurrencePattern : undefined,
    });

    setQuickTitle('');
    setQuickCategory('');
    setQuickDuration(null);
    setQuickDate('');
    setQuickStartHour('');
    setQuickNeedRest(false);
    setQuickIsRecurring(false);
    setQuickRecurrencePattern('daily');
    setQuickError(null);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-fade-in max-w-6xl mx-auto w-full">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0 overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              getAvatarInitial(user?.name)
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {language === 'id' ? 'Halo' : 'Hi'}, {user?.name || (language === 'id' ? 'Pengguna FoCient' : 'FoCient Member')}
            </h2>
            <p className="text-xs text-slate-500">{formatCurrentDate(new Date(), language)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openNotificationPanel}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title={language === 'id' ? 'Pusat Pemberitahuan' : 'Notifications'}
          >
            <BellIcon size="sm" />
            {unreadNotificationCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotificationCount}
              </span>
            ) : shouldShowReschedule ? (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
            ) : null}
          </button>
        </div>
      </div>

      {/* Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Primary Focus Column (8 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Card 1: Today Workload */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">
              {language === 'id' ? 'Beban Kerja Hari Ini' : 'Today Workload'}
            </span>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {workloadPercent}%
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

        {/* Intensity breakdown tags: Low = Green, Medium = Blue, High = Red */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-semibold border border-red-200">
            {highCount} {language === 'id' ? 'Tinggi' : 'High'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-semibold border border-sky-200">
            {mediumCount} {language === 'id' ? 'Sedang' : 'Medium'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            {lowCount} {language === 'id' ? 'Rendah' : 'Low'}
          </span>
        </div>
      </div>

      {/* Card 2: Empathetic Reschedule Suggestion Alert (Shown ONLY when workload is unbalanced or overlapping) */}
      {shouldShowReschedule && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangleIcon size="sm" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                {hasCollision
                  ? (language === 'id' ? 'Ada Jadwal yang Bertabrakan' : 'Schedule Overlap Detected')
                  : (language === 'id' ? 'Beban Hari Ini Cukup Padat' : 'Today Is Getting Full')}
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {hasCollision && overlappingTasks
                  ? (language === 'id'
                      ? `Jadwal "${overlappingTasks[0].title}" (${overlappingTasks[0].startHourDisplay}) dan "${overlappingTasks[1].title}" (${overlappingTasks[1].startHourDisplay}) bertabrakan. Yuk rapikan jadwalmu agar tetap santai.`
                      : `"${overlappingTasks[0].title}" (${overlappingTasks[0].startHourDisplay}) and "${overlappingTasks[1].title}" (${overlappingTasks[1].startHourDisplay}) overlap. Let's adjust your schedule so you stay relaxed.`)
                  : (language === 'id'
                      ? `Beban kerja hari ini sudah ${workloadPercent}% dari kapasitasmu. Kamu bisa geser sebagian tugas ke besok tanpa beban.`
                      : `Today's schedule has reached ${workloadPercent}% capacity. Consider moving a few tasks to tomorrow.`)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={dismissRescheduleLater}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              {language === 'id' ? 'Nanti Saja' : 'Maybe Later'}
            </button>
            <button
              type="button"
              onClick={() => setActiveNavTab('plan')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              {language === 'id' ? 'Lihat Jadwal' : 'Check Schedule'}
            </button>
          </div>
        </div>
      )}

      {/* Card 3: Top 3 Priority Tasks */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'id' ? 'Fokus Utama Hari Ini (Top 3)' : 'Today Priority Focus (Top 3)'}
          </h3>

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
                              +{t.restMinutes}m {language === 'id' ? 'jeda istirahat' : 'rest'}
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
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'id' ? 'Lini Masa Hari Ini' : 'Today Timeline'}
          </h3>
          <button
            type="button"
            onClick={() => setActiveNavTab('tasks')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {language === 'id' ? 'Lihat Semua' : 'View All'}
          </button>
        </div>

        <div className="space-y-3">
          {todayTasks.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              {language === 'id' ? 'Belum ada jadwal tugas untuk hari ini.' : 'No scheduled tasks for today.'}
            </div>
          ) : (
            (scheduledTasks.length > 0 ? scheduledTasks : todayTasks).slice(0, 6).map((t, idx) => (
              <React.Fragment key={t.id}>
                <div
                  onClick={() => setSelectedTaskForDetail(t)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm cursor-pointer transition-all"
                >
                  <div className="text-xs font-bold text-slate-600 w-12 tabular-nums">
                    {t.startHourDisplay || '09:00'}
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
                {idx < 5 && t.restMinutes > 0 && (
                  <div className="flex items-center gap-3 pl-14 text-[11px] text-teal-700 font-semibold py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>
                      {t.restMinutes} {language === 'id' ? 'Menit Jeda Istirahat' : 'Min Rest Buffer'}
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Right / Secondary Column (4-5 cols on lg) */}
    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        {/* Card 5: Quick Add Task */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'id' ? 'Tambah Cepat Tugas Hari Ini' : 'Quick Add Task to Today'}
          </h3>

          <form onSubmit={handleQuickAdd} className="space-y-3.5">
            {quickError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {quickError}
              </div>
            )}
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => {
                setQuickTitle(e.target.value);
                if (quickError) setQuickError(null);
              }}
              placeholder={
                language === 'id' ? 'Ketik nama tugas baru di sini...' : 'Type a task name here...'
              }
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            />

            {/* Category selection: horizontally scrollable pills */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                {language === 'id' ? 'Kategori Tugas *' : 'Category *'}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
                {userCategories.map((c) => {
                  const isSelected = quickCategory === c.name;
                  return (
                    <button
                      key={c.id || c.name}
                      type="button"
                      onClick={() => {
                        setQuickCategory(isSelected ? '' : c.name);
                        if (quickError) setQuickError(null);
                      }}
                      className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 min-w-[96px] h-9 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.colorHex }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration selection: horizontally scrollable pills */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                {language === 'id' ? 'Durasi Waktu *' : 'Duration *'}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
                {durations.map((d) => {
                  const isSelected = quickDuration === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setQuickDuration(isSelected ? null : d);
                        if (quickError) setQuickError(null);
                      }}
                      className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 min-w-[76px] h-9 rounded-xl text-xs font-semibold tabular-nums border transition-all text-center ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {d} {language === 'id' ? 'menit' : 'min'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Date & Start Hour (Adjusted for Today) */}
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1" htmlFor="quick-date">
                  {language === 'id' ? 'Tanggal (Hari Ini) *' : 'Date (Today) *'}
                </label>
                <DatePickerField
                  id="quick-date"
                  value={quickDate}
                  onChange={(val) => setQuickDate(val)}
                  language={language}
                  size="lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1" htmlFor="quick-hour">
                  {language === 'id' ? 'Jam Mulai *' : 'Start Hour *'}
                </label>
                <TimePicker24
                  id="quick-hour"
                  value={quickStartHour}
                  onChange={(val) => setQuickStartHour(val)}
                  language={language}
                  size="lg"
                />
              </div>
            </div>

            {/* Checkbox for Rest Time */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {language === 'id' ? 'Jeda Istirahat Setelah Tugas' : 'Rest Buffer After Task'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'id'
                    ? `Sistem menyisipkan jeda ${configuredRestMinutes}m untuk memulihkan energi`
                    : `System suggests a ${configuredRestMinutes}m buffer to sustain energy`}
                </span>
              </div>
              <input
                type="checkbox"
                checked={quickNeedRest}
                onChange={(e) => setQuickNeedRest(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
              />
            </label>

            {/* Checkbox for Recurring Task */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 transition-all">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {language === 'id' ? 'Tugas Berulang (Repetitif)' : 'Recurring Task (Repetitive)'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {language === 'id'
                      ? 'Otomatis diulang setiap jadwal untuk menghemat waktu input'
                      : 'Automatically repeats to reduce friction and save time'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={quickIsRecurring}
                  onChange={(e) => setQuickIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {quickIsRecurring && (
                <div className="pt-2 border-t border-slate-200/80 animate-fade-in flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
                  {[
                    { id: 'daily', labelEn: 'Daily', labelId: 'Setiap Hari' },
                    { id: 'weekdays', labelEn: 'Weekdays', labelId: 'Hari Kerja' },
                    { id: 'weekly', labelEn: 'Weekly', labelId: 'Mingguan' },
                  ].map((pattern) => {
                    const isSelected = quickRecurrencePattern === pattern.id;
                    return (
                      <button
                        key={pattern.id}
                        type="button"
                        onClick={() => setQuickRecurrencePattern(pattern.id as RecurrencePattern)}
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {language === 'id' ? pattern.labelId : pattern.labelEn}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusIcon size="xs" />
                <span>{language === 'id' ? 'Konfirmasi Tugas Baru' : 'Confirm New Task'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 6: Cognitive Energy & Recovery Buffer Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {language === 'id' ? 'Ritme Energi Kognitif' : 'Cognitive Energy Rhythm'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {user?.workingRhythm || selectedRhythm || 'Steady Pacer'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="font-semibold">{language === 'id' ? 'Jeda Istirahat Otomatis' : 'Auto Rest Buffer'}</span>
              </div>
              <span className="font-bold text-slate-900 tabular-nums">
                {configuredRestMinutes} min / task
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold">{language === 'id' ? 'Rentang Jam Kerja' : 'Schedule Window'}</span>
              </div>
              <span className="font-bold text-slate-900 tabular-nums">
                {user?.workHourStart || user?.startWorkTime || startHour || '09:00'} - {user?.workHourEnd || user?.endWorkTime || endHour || '17:00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
