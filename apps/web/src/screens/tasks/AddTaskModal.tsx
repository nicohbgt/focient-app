'use client';

import React, { useState, useEffect } from 'react';
import { useFocient, MobileTask, FocusType, RecurrencePattern } from '../../state/focient-store';
import { XIcon, PlusIcon, CheckIcon, RepeatIcon, MoonIcon, TrashIcon } from '../../components/icons';
import { formatCurrentDate, isTimeOverlappingQuietHours, normalizeToISODate, formatToDisplayDate, parseTime24ToMinutes } from '../../lib/date-utils';
import { TimePicker24 } from '../../components/primitive/TimePicker24';
import { DatePickerField } from '../../components/primitive/DatePickerField';

export const AddTaskModal: React.FC = () => {
  const {
    user,
    isAddTaskModalOpen,
    closeAddTaskModal,
    taskToEdit,
    initialTaskDate,
    addTask,
    updateTask,
    removeTask,
    categories,
    startHour,
    restMinutesPerTask,
    quietHourStart,
    quietHourEnd,
    quietHourEnabled,
    tasks,
    language,
    weekStartDay,
  } = useFocient();

  const configuredRestMinutes = restMinutesPerTask || user?.restTimePerTask || 10;

  const TASK_DURATION_PRESETS = [10, 15, 30, 45, 50, 60] as const;
  const REST_BUFFER_PRESETS = [0, 5, 10, 15, 30, 45] as const;

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');

  const [focusType, setFocusType] = useState<FocusType | null>(null);
  const [dateDisplay, setDateDisplay] = useState('');
  const [startHourDisplay, setStartHourDisplay] = useState('');
  const [isBacklog, setIsBacklog] = useState(false);
  const [needRestAfter, setNeedRestAfter] = useState(false);
  const [restDuration, setRestDuration] = useState<number>(configuredRestMinutes || 10);
  const [isCustomRest, setIsCustomRest] = useState(false);
  const [customRestInput, setCustomRestInput] = useState('');

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedTime, setSuggestedTime] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setSelectedCategory(taskToEdit.categoryName);
      if (TASK_DURATION_PRESETS.includes(taskToEdit.durationMinutes as any)) {
        setDuration(taskToEdit.durationMinutes);
        setIsCustomDuration(false);
        setCustomDurationInput('');
      } else {
        setDuration(taskToEdit.durationMinutes);
        setIsCustomDuration(true);
        setCustomDurationInput(String(taskToEdit.durationMinutes));
      }

      setFocusType(taskToEdit.focusType === 'Deep Focus' ? 'High' : taskToEdit.focusType === 'Light' ? 'Low' : taskToEdit.focusType);
      setDateDisplay(taskToEdit.isBacklog ? '' : normalizeToISODate(taskToEdit.dateDisplay || ''));
      setStartHourDisplay(taskToEdit.isBacklog ? '' : (taskToEdit.startHourDisplay || ''));
      setIsBacklog(taskToEdit.isBacklog || false);
      setNeedRestAfter(taskToEdit.needRestAfter ?? false);

      const taskRest = taskToEdit.restMinutes ?? (taskToEdit.needRestAfter ? configuredRestMinutes : 0);
      if (REST_BUFFER_PRESETS.includes(taskRest as any)) {
        setRestDuration(taskRest);
        setIsCustomRest(false);
        setCustomRestInput('');
      } else {
        setRestDuration(taskRest);
        setIsCustomRest(true);
        setCustomRestInput(String(taskRest));
      }

      setIsRecurring(taskToEdit.isRecurring || false);
      setRecurrencePattern(taskToEdit.recurrencePattern || 'daily');
      setRecurrenceDays(taskToEdit.recurrenceDays || [1, 2, 3, 4, 5]);
    } else {
      setTitle('');
      setSelectedCategory('');
      setDuration(30);
      setIsCustomDuration(false);
      setCustomDurationInput('');
      setRestDuration(configuredRestMinutes || 10);
      setIsCustomRest(false);
      setCustomRestInput('');
      setFocusType(null);
      setDateDisplay(normalizeToISODate(initialTaskDate || ''));
      setStartHourDisplay('');
      setIsBacklog(false);
      setNeedRestAfter(false);
      setIsRecurring(false);
      setRecurrencePattern('daily');
      setRecurrenceDays([1, 2, 3, 4, 5]);
    }
    setIsConfirmDeleteOpen(false);
    setError(null);
    setSuggestedTime(null);
  }, [taskToEdit, initialTaskDate, isAddTaskModalOpen, categories, startHour, language, configuredRestMinutes]);

  if (!isAddTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'id' ? 'Judul tugas tidak boleh kosong' : 'Task title cannot be empty');
      return;
    }

    if (!selectedCategory) {
      setError(language === 'id' ? 'Kategori tugas wajib dipilih' : 'Task category is required');
      return;
    }

    if (!focusType) {
      setError(language === 'id' ? 'Intensitas tugas wajib dipilih' : 'Task intensity is required');
      return;
    }

    if (!isBacklog) {
      if (!dateDisplay) {
        setError(language === 'id' ? 'Tanggal mulai wajib dipilih' : 'Start date is required');
        return;
      }
      if (!startHourDisplay) {
        setError(language === 'id' ? 'Jam mulai wajib dipilih' : 'Start hour is required');
        return;
      }

      // Prevention System: Prevent scheduling tasks at overlapping time slots on the same date
      const taskStartMin = parseTime24ToMinutes(startHourDisplay);
      if (taskStartMin !== null) {
        const taskEndMin = taskStartMin + (duration || 30);
        const targetISODate = normalizeToISODate(dateDisplay);

        const conflictingTask = tasks.find((t) => {
          if (t.isBacklog || t.status === 'completed') return false;
          if (taskToEdit && t.id === taskToEdit.id) return false;
          if (!t.startHourDisplay || !t.dateDisplay) return false;

          const existingISODate = normalizeToISODate(t.dateDisplay);
          if (existingISODate !== targetISODate) return false;

          const existingStartMin = parseTime24ToMinutes(t.startHourDisplay);
          if (existingStartMin === null) return false;
          const existingEndMin = existingStartMin + (t.durationMinutes || 30);

          return taskStartMin < existingEndMin && taskEndMin > existingStartMin;
        });

        if (conflictingTask) {
          const exStart = parseTime24ToMinutes(conflictingTask.startHourDisplay) ?? 0;
          const exDuration = conflictingTask.durationMinutes || 30;
          const exBuffer = conflictingTask.restMinutes ?? (configuredRestMinutes || 10);
          const freeMin = exStart + exDuration + exBuffer;
          const suggestedHour = String(Math.floor(freeMin / 60) % 24).padStart(2, '0');
          const suggestedMin = String(freeMin % 60).padStart(2, '0');
          const suggestedSlot = `${suggestedHour}:${suggestedMin}`;

          setSuggestedTime(suggestedSlot);
          setError(
            language === 'id'
              ? `Jadwal bentrok: Tugas "${conflictingTask.title}" sudah dijadwalkan pada jam ${conflictingTask.startHourDisplay}. Saran waktu: Kerjakan tugas ini pada jam ${suggestedSlot} (setelah jeda istirahat selesai).`
              : `Schedule conflict: Task "${conflictingTask.title}" is already scheduled at ${conflictingTask.startHourDisplay}. Suggested time: Work on this task at ${suggestedSlot} (after the rest buffer).`
          );
          return;
        }
      }
    }

    const catObj = categories.find((c) => c.name === selectedCategory) || categories[0];
    const categoryColor = catObj?.colorHex || '#7C3AED';

    // Quiet Hours Validation
    if (
      !isBacklog &&
      startHourDisplay &&
      quietHourEnabled &&
      isTimeOverlappingQuietHours(startHourDisplay, duration, quietHourStart, quietHourEnd, quietHourEnabled)
    ) {
      const suggestedSlot = quietHourEnd || '07:00';
      setSuggestedTime(suggestedSlot);
      setError(
        language === 'id'
          ? `Jam ${startHourDisplay} berada dalam rentang Jam Tenang (${quietHourStart} - ${quietHourEnd}) untuk istirahat. Saran waktu: Jadwalkan tugas setelah jam tenang pada jam ${suggestedSlot}.`
          : `Time ${startHourDisplay} falls within your configured Quiet Hours (${quietHourStart} - ${quietHourEnd}) reserved for rest. Suggested time: Schedule this task after quiet hours at ${suggestedSlot}.`
      );
      return;
    }

    const resolvedFocusType = focusType || 'Medium';

    if (taskToEdit) {
      updateTask({
        ...taskToEdit,
        title: title.trim(),
        categoryName: selectedCategory,
        categoryColor,
        durationMinutes: duration,
        focusType: resolvedFocusType,
        energyLevel: (resolvedFocusType === 'High' || resolvedFocusType === 'Deep Focus') ? 'high' : (resolvedFocusType === 'Low' || resolvedFocusType === 'Light') ? 'low' : 'medium',
        dateDisplay: isBacklog ? '' : dateDisplay,
        startHourDisplay: isBacklog ? '' : startHourDisplay,
        isBacklog,
        needRestAfter,
        restMinutes: needRestAfter ? restDuration : 0,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : undefined,
        recurrenceDays: isRecurring && recurrencePattern === 'custom' ? recurrenceDays : undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        categoryName: selectedCategory,
        categoryColor,
        durationMinutes: duration,
        priority: (resolvedFocusType === 'High' || resolvedFocusType === 'Deep Focus') ? 'top3' : 'normal',
        energyLevel: (resolvedFocusType === 'High' || resolvedFocusType === 'Deep Focus') ? 'high' : (resolvedFocusType === 'Low' || resolvedFocusType === 'Light') ? 'low' : 'medium',
        status: 'todo',
        focusType: resolvedFocusType,
        dateDisplay: isBacklog ? '' : dateDisplay,
        startHourDisplay: isBacklog ? '' : startHourDisplay,
        isBacklog,
        needRestAfter,
        restMinutes: needRestAfter ? restDuration : 0,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : undefined,
        recurrenceDays: isRecurring && recurrencePattern === 'custom' ? recurrenceDays : undefined,
      });
    }

    closeAddTaskModal();
  };

  const handleDeleteTask = () => {
    if (taskToEdit) {
      removeTask(taskToEdit.id);
      setIsConfirmDeleteOpen(false);
      closeAddTaskModal();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-focient-3 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {isConfirmDeleteOpen ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <TrashIcon size="md" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {language === 'id' ? 'Hapus Tugas Ini?' : 'Delete This Task?'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {language === 'id'
                  ? `Tugas "${taskToEdit?.title}" akan dihapus dari jadwalmu. Kamu tetap bisa menambahkannya lagi nanti jika dibutuhkan.`
                  : `"${taskToEdit?.title}" will be removed from your schedule. You can always add it back later if needed.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                {language === 'id' ? 'Ya, Hapus' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {taskToEdit
                  ? language === 'id'
                    ? 'Ubah Tugas'
                    : 'Edit Your Task'
                  : language === 'id'
                  ? 'Tambah Tugas Baru'
                  : 'Add Your Task'}
              </h2>
              <button
                type="button"
                onClick={closeAddTaskModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XIcon size="sm" />
              </button>
            </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium space-y-2">
              <p>{error}</p>
              {suggestedTime && (
                <div className="pt-2 flex items-center justify-between border-t border-red-200/60">
                  <span className="text-[11px] text-red-800 font-semibold">
                    {language === 'id' ? `Terapkan saran (${suggestedTime})?` : `Apply suggested time (${suggestedTime})?`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStartHourDisplay(suggestedTime);
                      setSuggestedTime(null);
                      setError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                  >
                    {language === 'id' ? `Gunakan ${suggestedTime}` : `Use ${suggestedTime}`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1" htmlFor="add-task-title">
              {language === 'id' ? 'Nama Tugas *' : 'Task Name *'}
            </label>
            <input
              id="add-task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder={language === 'id' ? 'Tulis nama tugas di sini...' : 'Input in here!'}
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            />
          </div>

          {/* Category Chips (Horizontally Scrollable) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Kategori Tugas *' : 'Task Categories *'}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      if (cat.focusType) {
                        const mapped = cat.focusType === 'Deep Focus' ? 'High' : cat.focusType === 'Light' ? 'Low' : cat.focusType;
                        setFocusType(mapped);
                      }
                    }}
                    className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.colorHex }} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Chips (10, 15, 30, 45, 50, 60, custom) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700">
                {language === 'id' ? 'Durasi Tugas *' : 'Task Duration *'}
              </label>
              <span className="text-xs font-bold text-blue-600 tabular-nums">
                {duration} {language === 'id' ? 'Menit' : 'Minutes'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {TASK_DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDuration(d);
                    setIsCustomDuration(false);
                    setCustomDurationInput('');
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-lg font-semibold border transition-all tabular-nums text-xs ${
                    !isCustomDuration && duration === d
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
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
                }}
                className={`shrink-0 px-3 py-1.5 rounded-lg font-semibold border transition-all text-xs ${
                  isCustomDuration
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
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
                    }
                  }}
                  placeholder={language === 'id' ? 'Masukkan durasi (menit)' : 'Enter duration (minutes)'}
                  className="w-44 h-9 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'id' ? 'Menit' : 'Minutes'}
                </span>
              </div>
            )}
          </div>

          {/* Task Intensity: Low (Green), Medium (Blue), High (Red) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Intensitas Tugas *' : 'Task Intensity *'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'Low' as FocusType, label: language === 'id' ? 'Rendah' : 'Low', active: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs' },
                { type: 'Medium' as FocusType, label: language === 'id' ? 'Sedang' : 'Medium', active: 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20 shadow-xs' },
                { type: 'High' as FocusType, label: language === 'id' ? 'Tinggi' : 'High', active: 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20 shadow-xs' },
              ].map((opt) => {
                const isSelected = focusType === opt.type || (opt.type === 'High' && focusType === 'Deep Focus') || (opt.type === 'Low' && focusType === 'Light');
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setFocusType(opt.type)}
                    className={`py-2 px-2 rounded-xl border font-bold text-center transition-all ${
                      isSelected
                        ? opt.active
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot: Date & Start Hour */}
          {!isBacklog ? (
            <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="slot-date">
                  {language === 'id' ? 'Tanggal *' : 'Date *'}
                </label>
                <DatePickerField
                  id="slot-date"
                  value={dateDisplay}
                  onChange={(val) => setDateDisplay(val)}
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
                  onChange={(val) => setStartHourDisplay(val)}
                  language={language}
                  size="lg"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-800 flex items-center gap-2 animate-fade-in">
              <span>
                {language === 'id'
                  ? 'Tugas Backlog: Tanggal dan jam mulai tidak diperlukan sekarang. Tugas tersimpan di antrean backlog Anda.'
                  : 'Backlog Task: Start date and hour are not needed now. Task is saved to your backlog queue.'}
              </span>
            </div>
          )}

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">
                  {language === 'id' ? 'Simpan ke Backlog' : 'Backlog Task'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'id'
                    ? 'Tugas belum dimasukkan ke jadwal aktif'
                    : 'Save for later without fixed scheduling'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isBacklog}
                onChange={(e) => setIsBacklog(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </label>

            {/* Rest Buffer (0, 5, 10, 15, 30, 45, custom) */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2.5 transition-all">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block text-xs">
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
                      setRestDuration(configuredRestMinutes || 10);
                    }
                  }}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {needRestAfter && (
                <div className="pt-2 border-t border-slate-200/80 animate-fade-in space-y-2">
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
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-3 transition-all">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">
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

              {/* Repetition Frequency Options (Shown when isRecurring is true) */}
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
                        {(weekStartDay === 'sunday'
                          ? [
                              { day: 0, nameEn: 'S', nameId: 'Min', fullEn: 'Sun' },
                              { day: 1, nameEn: 'M', nameId: 'Sen', fullEn: 'Mon' },
                              { day: 2, nameEn: 'T', nameId: 'Sel', fullEn: 'Tue' },
                              { day: 3, nameEn: 'W', nameId: 'Rab', fullEn: 'Wed' },
                              { day: 4, nameEn: 'T', nameId: 'Kam', fullEn: 'Thu' },
                              { day: 5, nameEn: 'F', nameId: 'Jum', fullEn: 'Fri' },
                              { day: 6, nameEn: 'S', nameId: 'Sab', fullEn: 'Sat' },
                            ]
                          : [
                              { day: 1, nameEn: 'M', nameId: 'Sen', fullEn: 'Mon' },
                              { day: 2, nameEn: 'T', nameId: 'Sel', fullEn: 'Tue' },
                              { day: 3, nameEn: 'W', nameId: 'Rab', fullEn: 'Wed' },
                              { day: 4, nameEn: 'T', nameId: 'Kam', fullEn: 'Thu' },
                              { day: 5, nameEn: 'F', nameId: 'Jum', fullEn: 'Fri' },
                              { day: 6, nameEn: 'S', nameId: 'Sab', fullEn: 'Sat' },
                              { day: 0, nameEn: 'S', nameId: 'Min', fullEn: 'Sun' },
                            ]
                        ).map((d) => {
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

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {taskToEdit ? (
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <TrashIcon size="xs" />
                <span>{language === 'id' ? 'Hapus Tugas' : 'Delete Task'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeAddTaskModal}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all text-center"
              >
                {taskToEdit
                  ? language === 'id'
                    ? 'Simpan'
                    : 'Save'
                  : language === 'id'
                  ? 'Tambah Tugas'
                  : 'Add Task'}
              </button>
            </div>
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  );
};
