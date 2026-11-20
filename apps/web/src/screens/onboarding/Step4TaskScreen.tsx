'use client';

import React, { useState } from 'react';
import { useFocient, MobileTask, FocusType, RecurrencePattern, resolveCategoryFocusType } from '../../state/focient-store';
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon, ClockIcon, RepeatIcon, MoonIcon } from '../../components/icons';
import { formatCurrentDate, isTimeOverlappingQuietHours } from '../../lib/date-utils';
import { TimePicker24 } from '../../components/primitive/TimePicker24';
import { DatePickerField } from '../../components/primitive/DatePickerField';

export const Step4TaskScreen: React.FC = () => {
  const {
    user,
    categories,
    tasks,
    addTask,
    removeTask,
    restMinutesPerTask,
    quietHourStart,
    quietHourEnd,
    quietHourEnabled,
    setOnboardingStep,
    language,
  } = useFocient();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [duration, setDuration] = useState<number | null>(null);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');

  const [focusType, setFocusType] = useState<FocusType | null>(null);
  const [dateDisplay, setDateDisplay] = useState('');
  const [startHourDisplay, setStartHourDisplay] = useState('');
  const [isBacklog, setIsBacklog] = useState(false);
  const [needRestAfter, setNeedRestAfter] = useState(false);
  const [restDuration, setRestDuration] = useState<number>(() => restMinutesPerTask > 0 ? restMinutesPerTask : (user?.restTimePerTask || 10));
  const [isCustomRest, setIsCustomRest] = useState(false);
  const [customRestInput, setCustomRestInput] = useState('');

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [error, setError] = useState<string | null>(null);

  const TASK_DURATION_PRESETS = [10, 15, 30, 45, 50, 60] as const;
  const REST_BUFFER_PRESETS = [0, 5, 10, 15, 30, 45] as const;
  const configuredRest = restMinutesPerTask > 0 ? restMinutesPerTask : (user?.restTimePerTask || 10);

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'id' ? 'Nama tugas wajib diisi' : 'Task name is required');
      return;
    }
    if (!selectedCategory) {
      setError(language === 'id' ? 'Kategori tugas wajib dipilih' : 'Task category is required');
      return;
    }
    if (!duration || duration <= 0) {
      setError(language === 'id' ? 'Durasi tugas wajib dipilih' : 'Task duration is required');
      return;
    }
    if (!focusType) {
      setError(language === 'id' ? 'Intensitas tugas wajib dipilih' : 'Task intensity is required');
      return;
    }
    // Start date and start hour are only required for scheduled tasks (not backlog)
    if (!isBacklog) {
      if (!dateDisplay) {
        setError(language === 'id' ? 'Tanggal mulai wajib dipilih' : 'Start date is required');
        return;
      }
      if (!startHourDisplay) {
        setError(language === 'id' ? 'Jam mulai wajib dipilih' : 'Start hour is required');
        return;
      }
      // Check Quiet Hours restriction
      if (
        quietHourEnabled &&
        isTimeOverlappingQuietHours(
          startHourDisplay,
          duration,
          quietHourStart,
          quietHourEnd,
          quietHourEnabled
        )
      ) {
        setError(
          language === 'id'
            ? `Jam ${startHourDisplay} berada dalam rentang Jam Tenang (${quietHourStart} - ${quietHourEnd}) untuk istirahat. Tugas tidak dapat dijadwalkan pada jam ini.`
            : `Time ${startHourDisplay} falls within your configured Quiet Hours (${quietHourStart} - ${quietHourEnd}) reserved for rest. Tasks cannot be scheduled during quiet hours.`
        );
        return;
      }
    }

    const catObj = categories.find((c) => c.name === selectedCategory) || categories[0];
    const categoryColor = catObj?.colorHex || '#2563EB';

    const newTask: Omit<MobileTask, 'id'> = {
      title: title.trim(),
      durationMinutes: duration,
      priority: focusType === 'High' || focusType === 'Deep Focus' ? 'top3' : 'normal',
      energyLevel: focusType === 'High' || focusType === 'Deep Focus' ? 'high' : focusType === 'Low' || focusType === 'Light' ? 'low' : 'medium',
      status: 'todo',
      categoryName: catObj?.name || selectedCategory,
      categoryColor,
      restMinutes: needRestAfter ? restDuration : 0,
      dateDisplay: isBacklog ? '' : dateDisplay,
      startHourDisplay: isBacklog ? '' : startHourDisplay,
      focusType,
      needRestAfter,
      isBacklog,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      recurrenceDays: isRecurring && recurrencePattern === 'custom' ? recurrenceDays : undefined,
    };

    addTask(newTask);
    setTitle('');
    setSelectedCategory('');
    setDuration(null);
    setIsCustomDuration(false);
    setCustomDurationInput('');
    setRestDuration(configuredRest);
    setIsCustomRest(false);
    setCustomRestInput('');
    setFocusType(null);
    setDateDisplay('');
    setStartHourDisplay('');
    setIsBacklog(false);
    setNeedRestAfter(false);
    setIsRecurring(false);
    setRecurrencePattern('daily');
    setRecurrenceDays([1, 2, 3, 4, 5]);
    setError(null);
  };

  const handleNext = () => {
    if (tasks.length === 0) {
      setError(
        language === 'id'
          ? 'Tambahkan minimal 1 tugas untuk memulai rencana harianmu'
          : 'Please add at least 1 focus task to start your plan'
      );
      return;
    }
    setError(null);
    setOnboardingStep(5);
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-lg mx-auto w-full animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>{language === 'id' ? 'Langkah 4 dari 5' : 'Step 4 of 5'}</span>
          <button
            type="button"
            onClick={() => setOnboardingStep(3)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeftIcon size="xs" />
            <span>{language === 'id' ? 'Sebelumnya' : 'Back'}</span>
          </button>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full w-4/5 transition-all duration-300 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Tambah Tugas Pertamamu' : 'Add Your First Task'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Tulis tugas yang ingin kamu selesaikan, lengkap dengan jam mulai dan jeda istirahat.'
            : 'Set up a task you want to work on, complete with start time and breaks.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* First Task Form (Identical to Add Task in Main Feature) */}
        <form onSubmit={handleAddNewTask} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 mb-6">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="task-title">
              {language === 'id' ? 'Nama Tugas *' : 'Task Name *'}
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder={language === 'id' ? 'Tulis nama tugas di sini...' : 'Input task title here...'}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            />
          </div>

          {/* Category Chips (Consistent Component Size & Horizontally Scrollable) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Kategori Tugas *' : 'Task Category *'}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const catIntensity = resolveCategoryFocusType(cat);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setFocusType(catIntensity);
                    }}
                    className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 min-w-[96px] h-10 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.colorHex }} />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Chips (10, 15, 30, 45, 50, 60, custom) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {language === 'id' ? 'Durasi Tugas *' : 'Task Duration *'}
              </label>
              {duration && (
                <span className="text-xs font-bold text-blue-600 tabular-nums">
                  {duration} {language === 'id' ? 'Menit' : 'Minutes'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
              {TASK_DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDuration(d);
                    setIsCustomDuration(false);
                    setCustomDurationInput('');
                    setError(null);
                  }}
                  className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 min-w-[80px] h-10 rounded-xl text-xs font-semibold border transition-all tabular-nums text-center ${
                    !isCustomDuration && duration === d
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {d} {language === 'id' ? 'Menit' : 'Min'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCustomDuration(true);
                  if (!customDurationInput && duration) {
                    setCustomDurationInput(String(duration));
                  }
                  setError(null);
                }}
                className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 min-w-[80px] h-10 rounded-xl text-xs font-semibold border transition-all text-center ${
                  isCustomDuration
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {language === 'id' ? 'Kustom' : 'Custom'}
              </button>
            </div>
            {isCustomDuration && (
              <div className="mt-2 flex items-center gap-2 animate-fade-in">
                <input
                  type="number"
                  min="1"
                  max="480"
                  autoFocus
                  value={customDurationInput}
                  onChange={(e) => {
                    setCustomDurationInput(e.target.value);
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      setDuration(parsed);
                      setError(null);
                    }
                  }}
                  placeholder={language === 'id' ? 'Masukkan durasi (menit)' : 'Enter duration (minutes)'}
                  className="w-48 h-9 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'id' ? 'Menit' : 'Minutes'}
                </span>
              </div>
            )}
          </div>

          {/* Task Intensity (Consistent Component Size: Low=Green, Medium=Blue, High=Red) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Intensitas Tugas *' : 'Task Intensity *'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  type: 'Low' as FocusType,
                  label: language === 'id' ? 'Rendah' : 'Low',
                  color: '#16A34A',
                  active: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs',
                },
                {
                  type: 'Medium' as FocusType,
                  label: language === 'id' ? 'Sedang' : 'Medium',
                  color: '#0284C7',
                  active: 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20 shadow-2xs',
                },
                {
                  type: 'High' as FocusType,
                  label: language === 'id' ? 'Tinggi' : 'High',
                  color: '#DC2626',
                  active: 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20 shadow-2xs',
                },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setFocusType(opt.type)}
                  className={`w-full h-10 px-3.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center justify-center gap-1.5 text-center ${
                    focusType === opt.type
                      ? opt.active
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot: Start Date & Start Hour (Not required when Backlog is selected) */}
          {!isBacklog ? (
            <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="slot-date">
                  {language === 'id' ? 'Tanggal Mulai *' : 'Start Date *'}
                </label>
                <DatePickerField
                  id="slot-date"
                  value={dateDisplay}
                  onChange={(val) => {
                    setDateDisplay(val);
                    setError(null);
                  }}
                  language={language}
                  size="lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="slot-hour">
                  {language === 'id' ? 'Jam Mulai *' : 'Start Hour *'}
                </label>
                <TimePicker24
                  id="slot-hour"
                  value={startHourDisplay}
                  onChange={(val) => {
                    setStartHourDisplay(val);
                    setError(null);
                  }}
                  language={language}
                  size="lg"
                />
              </div>

              {!isBacklog && quietHourEnabled && quietHourStart && quietHourEnd && !(quietHourStart === '00:00' && quietHourEnd === '00:00') && (
                <div className="col-span-2 flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 animate-fade-in">
                  <MoonIcon size="xs" className="text-slate-600 shrink-0" />
                  <span>
                    {language === 'id'
                      ? `Jam Tenang aktif (${quietHourStart} - ${quietHourEnd}): Waktu istirahat terkunci agar tidak ditambah tugas.`
                      : `Quiet Hours active (${quietHourStart} - ${quietHourEnd}): Locked rest window where tasks cannot be added.`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-800 flex items-center gap-2 animate-fade-in">
              <ClockIcon size="xs" className="shrink-0 text-blue-600" />
              <span>
                {language === 'id'
                  ? 'Tugas Backlog: Tanggal dan jam mulai tidak diperlukan. Tugas disimpan di antrean backlog Anda.'
                  : 'Backlog Task: Start date and hour are not needed. Task is saved to your backlog queue.'}
              </span>
            </div>
          )}

          {/* Toggles: Backlog, Rest Buffer, and Recurring Task */}
          <div className="space-y-2.5 pt-1">
            {/* Backlog Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {language === 'id' ? 'Simpan ke Backlog' : 'Backlog Task'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'id'
                    ? 'Tugas disimpan tanpa slot waktu tetap di jadwal aktif'
                    : 'Save for later without fixed scheduling'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isBacklog}
                onChange={(e) => {
                  setIsBacklog(e.target.checked);
                  setError(null);
                }}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </label>

            {/* Rest Buffer Section (0, 5, 10, 15, 30, 45, custom) */}
            <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2.5 transition-all">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {language === 'id' ? 'Jeda Istirahat Setelah Tugas' : 'Need to Rest After Task'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {language === 'id'
                      ? `Sistem menyisipkan jeda ${needRestAfter ? restDuration : 0}m pasca-tugas untuk memulihkan energi`
                      : `System suggests a ${needRestAfter ? restDuration : 0}m buffer to sustain energy`}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={needRestAfter}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setNeedRestAfter(checked);
                    if (checked && restDuration === 0) {
                      setRestDuration(configuredRest || 10);
                    }
                  }}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {needRestAfter && (
                <div className="pt-2 border-t border-slate-100 animate-fade-in space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-[11px] font-semibold text-slate-600">
                      {language === 'id' ? 'Durasi Jeda Istirahat' : 'Rest Buffer Duration'}
                    </span>
                    <span className="text-xs font-bold text-teal-700 tabular-nums">
                      {restDuration} {language === 'id' ? 'Menit' : 'Minutes'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
                    {REST_BUFFER_PRESETS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRestDuration(r);
                          setIsCustomRest(false);
                          setCustomRestInput('');
                        }}
                        className={`shrink-0 px-2.5 py-1 rounded-lg font-semibold border transition-all tabular-nums text-xs ${
                          !isCustomRest && restDuration === r
                            ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {r}m
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomRest(true);
                        if (!customRestInput && restDuration) {
                          setCustomRestInput(String(restDuration));
                        }
                      }}
                      className={`shrink-0 px-2.5 py-1 rounded-lg font-semibold border transition-all text-xs ${
                        isCustomRest
                          ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {language === 'id' ? 'Kustom' : 'Custom'}
                    </button>
                  </div>
                  {isCustomRest && (
                    <div className="flex items-center gap-2 pt-1 animate-fade-in">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        autoFocus
                        value={customRestInput}
                        onChange={(e) => {
                          setCustomRestInput(e.target.value);
                          const parsed = parseInt(e.target.value, 10);
                          if (!isNaN(parsed) && parsed >= 0) {
                            setRestDuration(parsed);
                          }
                        }}
                        placeholder={language === 'id' ? 'Jeda istirahat (menit)' : 'Rest buffer (minutes)'}
                        className="w-40 h-9 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        {language === 'id' ? 'Menit' : 'Minutes'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recurring Task Checkbox */}
            <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-3 transition-all">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {language === 'id' ? 'Tugas Berulang (Repetitif)' : 'Recurring Task (Repetitive)'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {language === 'id'
                      ? 'Otomatis diulang agar tidak perlu input berulang kali, meringankan beban kognitif'
                      : 'Automatically repeats without manual re-entry to reduce cognitive fatigue'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Repetition Frequency Options */}
              {isRecurring && (
                <div className="pt-2 border-t border-slate-200/80 animate-fade-in space-y-2">
                  <span className="block text-[11px] font-semibold text-slate-600">
                    {language === 'id' ? 'Frekuensi Pengulangan' : 'Repetition Frequency'}
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
                    {[
                      { id: 'daily', labelEn: 'Daily', labelId: 'Setiap Hari' },
                      { id: 'weekdays', labelEn: 'Weekdays (Mon-Fri)', labelId: 'Hari Kerja (Sen-Jum)' },
                      { id: 'weekly', labelEn: 'Weekly', labelId: 'Setiap Minggu' },
                      { id: 'custom', labelEn: 'Custom Days', labelId: 'Pilih Hari' },
                    ].map((pattern) => {
                      const isSelected = recurrencePattern === pattern.id;
                      return (
                        <button
                          key={pattern.id}
                          type="button"
                          onClick={() => setRecurrencePattern(pattern.id as RecurrencePattern)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center ${
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

                  {/* If custom is selected: day selection pills */}
                  {recurrencePattern === 'custom' && (
                    <div className="pt-1 animate-fade-in">
                      <div className="flex items-center gap-1.5">
                        {[
                          { day: 1, nameEn: 'M', nameId: 'Sen', fullEn: 'Mon' },
                          { day: 2, nameEn: 'T', nameId: 'Sel', fullEn: 'Tue' },
                          { day: 3, nameEn: 'W', nameId: 'Rab', fullEn: 'Wed' },
                          { day: 4, nameEn: 'T', nameId: 'Kam', fullEn: 'Thu' },
                          { day: 5, nameEn: 'F', nameId: 'Jum', fullEn: 'Fri' },
                          { day: 6, nameEn: 'S', nameId: 'Sab', fullEn: 'Sat' },
                          { day: 0, nameEn: 'S', nameId: 'Min', fullEn: 'Sun' },
                        ].map((d) => {
                          const active = recurrenceDays.includes(d.day);
                          return (
                            <button
                              key={d.day}
                              type="button"
                              onClick={() => {
                                if (active) {
                                  if (recurrenceDays.length > 1) {
                                    setRecurrenceDays(recurrenceDays.filter((x) => x !== d.day));
                                  }
                                } else {
                                  setRecurrenceDays([...recurrenceDays, d.day].sort());
                                }
                              }}
                              className={`w-8 h-8 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${
                                active
                                  ? 'border-purple-600 bg-purple-100 text-purple-800 ring-1 ring-purple-600/30'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                              title={language === 'id' ? d.nameId : d.fullEn}
                            >
                              {language === 'id' ? d.nameId : d.nameEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <PlusIcon size="xs" />
            <span>{language === 'id' ? 'Tambahkan Tugas Ini' : 'Add Focus Task'}</span>
          </button>
        </form>

        {/* Scheduled Tasks List */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-semibold text-slate-700">
            {language === 'id' ? 'Daftar Tugas Terjadwal' : 'Scheduled Tasks'} ({tasks.length})
          </label>

          {tasks.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
              {language === 'id'
                ? 'Belum ada tugas. Masukkan tugas pertama Anda di atas untuk memulai.'
                : 'No tasks added yet. Enter your first task above to get started.'}
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.categoryColor }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{t.title}</span>
                        {t.isBacklog && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Backlog
                          </span>
                        )}
                        {t.isRecurring && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
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
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{t.categoryName}</span>
                        <span>•</span>
                        <span className="tabular-nums font-semibold">{t.durationMinutes}m</span>
                        {t.startHourDisplay && !t.isBacklog && (
                          <>
                            <span>•</span>
                            <span className="tabular-nums">{t.startHourDisplay}</span>
                          </>
                        )}
                        {t.restMinutes > 0 && (
                          <span className="text-teal-600 font-medium">+{t.restMinutes}m rest</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    title={language === 'id' ? 'Hapus tugas' : 'Remove task'}
                  >
                    <TrashIcon size="xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all text-center"
        >
          <span>{language === 'id' ? 'Lanjut' : 'Continue'}</span>
        </button>
      </div>
    </div>
  );
};
