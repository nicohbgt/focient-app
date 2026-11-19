'use client';

import React, { useState, useEffect } from 'react';
import { useFocient, MobileTask, FocusType, RecurrencePattern } from '../../state/focient-store';
import {
  XIcon,
  ClockIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  RepeatIcon,
} from '../../components/icons';
import { TimePicker24 } from '../../components/primitive/TimePicker24';
import { DatePickerField } from '../../components/primitive/DatePickerField';
import { normalizeToISODate, formatToDisplayDate } from '../../lib/date-utils';

const TASK_DURATION_PRESETS = [10, 15, 30, 45, 50, 60] as const;
const REST_BUFFER_PRESETS = [0, 5, 10, 15, 30, 45] as const;

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskForDetail,
    setSelectedTaskForDetail,
    updateTask,
    removeTask,
    categories,
    user,
    restMinutesPerTask,
    language,
    openAddTaskModal,
  } = useFocient();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDuration, setEditDuration] = useState<number>(30);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');
  const [editFocusType, setEditFocusType] = useState<FocusType>('Medium');
  const [editDate, setEditDate] = useState('');
  const [editStartHour, setEditStartHour] = useState('');
  const [editIsBacklog, setEditIsBacklog] = useState(false);
  const [editNeedRest, setEditNeedRest] = useState(false);
  const [editRestDuration, setEditRestDuration] = useState<number>(10);
  const [isCustomRest, setIsCustomRest] = useState(false);
  const [customRestInput, setCustomRestInput] = useState('');
  const [editIsRecurring, setEditIsRecurring] = useState(false);
  const [editRecurrencePattern, setEditRecurrencePattern] = useState<RecurrencePattern>('daily');
  const [editRecurrenceDays, setEditRecurrenceDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [editError, setEditError] = useState<string | null>(null);

  const configuredRestMinutes = restMinutesPerTask || user?.restTimePerTask || 10;

  // Initialize or reset edit form when selectedTaskForDetail changes
  useEffect(() => {
    if (selectedTaskForDetail) {
      setEditTitle(selectedTaskForDetail.title);
      setEditCategory(selectedTaskForDetail.categoryName);

      if (TASK_DURATION_PRESETS.includes(selectedTaskForDetail.durationMinutes as any)) {
        setEditDuration(selectedTaskForDetail.durationMinutes);
        setIsCustomDuration(false);
        setCustomDurationInput('');
      } else {
        setEditDuration(selectedTaskForDetail.durationMinutes);
        setIsCustomDuration(true);
        setCustomDurationInput(String(selectedTaskForDetail.durationMinutes));
      }

      const mappedFocus: FocusType =
        selectedTaskForDetail.focusType === 'Deep Focus'
          ? 'High'
          : selectedTaskForDetail.focusType === 'Light'
          ? 'Low'
          : selectedTaskForDetail.focusType || 'Medium';
      setEditFocusType(mappedFocus);

      setEditDate(normalizeToISODate(selectedTaskForDetail.dateDisplay || ''));
      setEditStartHour(selectedTaskForDetail.startHourDisplay || '');
      setEditIsBacklog(selectedTaskForDetail.isBacklog || false);
      setEditNeedRest(selectedTaskForDetail.needRestAfter ?? (selectedTaskForDetail.restMinutes > 0));

      const taskRest = selectedTaskForDetail.restMinutes ?? 0;
      if (REST_BUFFER_PRESETS.includes(taskRest as any)) {
        setEditRestDuration(taskRest);
        setIsCustomRest(false);
        setCustomRestInput('');
      } else {
        setEditRestDuration(taskRest);
        setIsCustomRest(true);
        setCustomRestInput(String(taskRest));
      }

      setEditIsRecurring(selectedTaskForDetail.isRecurring || false);
      setEditRecurrencePattern(selectedTaskForDetail.recurrencePattern || 'daily');
      setEditRecurrenceDays(selectedTaskForDetail.recurrenceDays || [1, 2, 3, 4, 5]);
      setEditError(null);
      setIsConfirmDeleteOpen(false);
      setIsEditing(false);
    }
  }, [selectedTaskForDetail, configuredRestMinutes]);

  if (!selectedTaskForDetail) return null;

  const task = selectedTaskForDetail;

  const handleDelete = () => {
    removeTask(task.id);
    setIsConfirmDeleteOpen(false);
    setIsEditing(false);
    setSelectedTaskForDetail(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError(language === 'id' ? 'Nama tugas tidak boleh kosong' : 'Task title cannot be empty');
      return;
    }
    if (!editCategory) {
      setEditError(language === 'id' ? 'Kategori tugas wajib dipilih' : 'Category is required');
      return;
    }
    if (!editIsBacklog && !editDate) {
      setEditError(language === 'id' ? 'Tanggal wajib dipilih' : 'Date is required');
      return;
    }
    if (!editIsBacklog && !editStartHour) {
      setEditError(language === 'id' ? 'Jam mulai wajib dipilih' : 'Start hour is required');
      return;
    }

    const catObj = categories.find((c) => c.name === editCategory) || categories[0];
    const categoryColor = catObj?.colorHex || task.categoryColor || '#2563EB';

    const updatedTask: MobileTask = {
      ...task,
      title: editTitle.trim(),
      categoryName: editCategory,
      categoryColor,
      durationMinutes: editDuration,
      focusType: editFocusType,
      dateDisplay: editIsBacklog ? '' : editDate,
      startHourDisplay: editIsBacklog ? '' : editStartHour,
      isBacklog: editIsBacklog,
      needRestAfter: editNeedRest,
      restMinutes: editNeedRest ? editRestDuration : 0,
      isRecurring: editIsRecurring,
      recurrencePattern: editIsRecurring ? editRecurrencePattern : undefined,
      recurrenceDays: editIsRecurring ? editRecurrenceDays : undefined,
    };

    updateTask(updatedTask);
    setSelectedTaskForDetail(updatedTask);
    setIsEditing(false);
    setEditError(null);
  };

  const handleClose = () => {
    setIsConfirmDeleteOpen(false);
    setIsEditing(false);
    setSelectedTaskForDetail(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-focient-4 max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up max-h-[90vh] flex flex-col">
        {/* State 1: Delete Confirmation View */}
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
                  ? `Tugas "${task.title}" akan dihapus dari jadwalmu. Kamu tetap bisa menambahkannya lagi nanti jika dibutuhkan.`
                  : `"${task.title}" will be removed from your schedule. You can always add it back later if needed.`}
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
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                {language === 'id' ? 'Ya, Hapus' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        ) : isEditing ? (
          /* State 2: Inline Edit Task Form */
          <>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'id' ? 'Ubah Tugas' : 'Edit Your Task'}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close"
              >
                <XIcon size="sm" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {editError}
                </div>
              )}

              {/* Task Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'id' ? 'Nama Tugas *' : 'Task Name *'}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setEditError(null);
                  }}
                  placeholder={language === 'id' ? 'Tulis nama tugas di sini...' : 'Enter task title...'}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                />
              </div>

              {/* Category Chips */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {language === 'id' ? 'Kategori Tugas *' : 'Category *'}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
                  {categories.map((cat) => {
                    const isSelected = editCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setEditCategory(cat.name);
                          if (cat.focusType) {
                            const mapped =
                              cat.focusType === 'Deep Focus'
                                ? 'High'
                                : cat.focusType === 'Light'
                                ? 'Low'
                                : cat.focusType;
                            setEditFocusType(mapped);
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

              {/* Duration Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700">
                    {language === 'id' ? 'Durasi Fokus *' : 'Focus Duration *'}
                  </label>
                  <span className="text-xs font-bold text-blue-600 tabular-nums">
                    {editDuration} {language === 'id' ? 'Menit' : 'Minutes'}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
                  {TASK_DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setEditDuration(d);
                        setIsCustomDuration(false);
                        setCustomDurationInput('');
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-lg font-semibold border transition-all tabular-nums text-xs ${
                        !isCustomDuration && editDuration === d
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
                      if (!customDurationInput && editDuration) {
                        setCustomDurationInput(String(editDuration));
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
                      value={customDurationInput}
                      onChange={(e) => {
                        setCustomDurationInput(e.target.value);
                        const parsed = parseInt(e.target.value, 10);
                        if (!isNaN(parsed) && parsed > 0) setEditDuration(parsed);
                      }}
                      placeholder="30"
                      className="w-32 h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">
                      {language === 'id' ? 'Menit' : 'Minutes'}
                    </span>
                  </div>
                )}
              </div>

              {/* Task Intensity */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {language === 'id' ? 'Intensitas Fokus *' : 'Task Intensity *'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'Low' as FocusType, label: language === 'id' ? 'Rendah' : 'Low', active: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs' },
                    { type: 'Medium' as FocusType, label: language === 'id' ? 'Sedang' : 'Medium', active: 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20 shadow-xs' },
                    { type: 'High' as FocusType, label: language === 'id' ? 'Tinggi' : 'High', active: 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20 shadow-xs' },
                  ].map((opt) => {
                    const isSelected = editFocusType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setEditFocusType(opt.type)}
                        className={`py-2 px-2 rounded-xl border font-bold text-center transition-all ${
                          isSelected ? opt.active : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Start Hour */}
              {!editIsBacklog ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'id' ? 'Tanggal *' : 'Date *'}
                    </label>
                    <DatePickerField
                      value={editDate}
                      onChange={(val) => setEditDate(val)}
                      language={language}
                      size="lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'id' ? 'Jam Mulai *' : 'Start Hour *'}
                    </label>
                    <TimePicker24
                      value={editStartHour}
                      onChange={(val) => setEditStartHour(val)}
                      language={language}
                      size="lg"
                    />
                  </div>
                </div>
              ) : null}

              {/* Backlog Task Checkbox matching Image 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {language === 'id' ? 'Tugas Dalam Backlog' : 'Backlog Task'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {language === 'id' ? 'Simpan untuk nanti tanpa jadwal pasti' : 'Save for later without fixed scheduling'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsBacklog}
                    onChange={(e) => setEditIsBacklog(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Rest Buffer matching Image 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {language === 'id' ? 'Butuh Istirahat Setelah Tugas' : 'Need to Rest After Task'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {language === 'id' ? 'Beri jeda istirahat setelah tugas untuk pulihkan energi' : 'System suggests a buffer to sustain energy'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editNeedRest}
                    onChange={(e) => setEditNeedRest(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                </label>

                {editNeedRest && (
                  <div className="pt-2 border-t border-slate-200/80 animate-fade-in">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                      {REST_BUFFER_PRESETS.filter((r) => r > 0).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setEditRestDuration(r);
                            setIsCustomRest(false);
                            setCustomRestInput('');
                          }}
                          className={`shrink-0 px-2.5 py-1 rounded-lg font-semibold border text-xs tabular-nums transition-all ${
                            !isCustomRest && editRestDuration === r
                              ? 'border-teal-600 bg-teal-600 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {r}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recurrence matching Image 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {language === 'id' ? 'Tugas Berulang (Repetitif)' : 'Recurring Task (Repetitive)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {language === 'id' ? 'Ulangi tugas secara otomatis tanpa perlu input manual' : 'Automatically repeats without manual re-entry to reduce cognitive fatigue'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsRecurring}
                    onChange={(e) => setEditIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                </label>

                {editIsRecurring && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2 animate-fade-in">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { key: 'daily' as RecurrencePattern, label: language === 'id' ? 'Setiap Hari' : 'Daily' },
                        { key: 'weekdays' as RecurrencePattern, label: language === 'id' ? 'Hari Kerja' : 'Weekdays' },
                        { key: 'weekly' as RecurrencePattern, label: language === 'id' ? 'Mingguan' : 'Weekly' },
                      ].map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setEditRecurrencePattern(p.key)}
                          className={`py-1.5 px-2 rounded-lg font-semibold border text-[11px] text-center transition-all ${
                            editRecurrencePattern === p.key
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Footer with Hapus Tugas + Batal + Simpan Perubahan */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <TrashIcon size="xs" />
                <span>{language === 'id' ? 'Hapus Tugas' : 'Delete Task'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2 px-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all text-center"
                >
                  {language === 'id' ? 'Simpan' : 'Save'}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* State 3: Task Detail View (Gambar 1) */
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {language === 'id' ? 'Detail Tugas' : 'Task Detail'}
                </span>
                {task.priority === 'top3' && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Top 3
                  </span>
                )}
                {task.isRecurring && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {task.recurrencePattern === 'daily'
                      ? language === 'id' ? 'Setiap Hari' : 'Daily'
                      : task.recurrencePattern === 'weekdays'
                      ? language === 'id' ? 'Hari Kerja (Sen-Jum)' : 'Weekdays'
                      : task.recurrencePattern === 'weekly'
                      ? language === 'id' ? 'Setiap Minggu' : 'Weekly'
                      : language === 'id' ? 'Pilihan' : 'Custom'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close"
              >
                <XIcon size="sm" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.categoryColor }}
                  />
                  <span className="text-xs font-semibold text-slate-600">{task.categoryName}</span>
                  <span className="text-slate-300">•</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    task.focusType === 'High' || task.focusType === 'Deep Focus'
                      ? 'text-red-700 bg-red-50 border border-red-200'
                      : task.focusType === 'Medium'
                      ? 'text-sky-700 bg-sky-50 border border-sky-200'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  }`}>
                    {task.focusType === 'Deep Focus'
                      ? (language === 'id' ? 'Tinggi' : 'High')
                      : task.focusType === 'High'
                      ? (language === 'id' ? 'Tinggi' : 'High')
                      : task.focusType === 'Medium'
                      ? (language === 'id' ? 'Sedang' : 'Medium')
                      : (language === 'id' ? 'Rendah' : 'Low')}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h2>
                {task.notes && <p className="text-xs text-slate-500 mt-1">{task.notes}</p>}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">
                    {language === 'id' ? 'Tanggal' : 'Task Date'}
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <CalendarIcon size="xs" />
                    <span>{formatToDisplayDate(task.dateDisplay) || '-'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">
                    {language === 'id' ? 'Jam Mulai' : 'Start Time'}
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 tabular-nums">
                    <ClockIcon size="xs" />
                    <span>{task.startHourDisplay || '-'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">
                    {language === 'id' ? 'Durasi Fokus' : 'Duration'}
                  </span>
                  <div className="font-semibold text-slate-800 tabular-nums">
                    {task.durationMinutes} {language === 'id' ? 'Menit' : 'Minutes'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">
                    {language === 'id' ? 'Jeda Istirahat' : 'Rest Buffer'}
                  </span>
                  <div className="font-semibold text-teal-700 tabular-nums">
                    {task.restMinutes > 0 ? `${task.restMinutes}m Buffer` : 'None'}
                  </div>
                </div>

                {task.isRecurring && (
                  <div className="col-span-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-purple-900">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <RepeatIcon size="xs" className="text-purple-600" />
                      <span>{language === 'id' ? 'Jadwal Repetitif' : 'Repetitive Schedule'}</span>
                    </div>
                    <span className="font-bold text-[11px]">
                      {task.recurrencePattern === 'daily'
                        ? language === 'id' ? 'Setiap Hari' : 'Every Day'
                        : task.recurrencePattern === 'weekdays'
                        ? language === 'id' ? 'Hari Kerja (Senin - Jumat)' : 'Weekdays (Mon - Fri)'
                        : task.recurrencePattern === 'weekly'
                        ? language === 'id' ? 'Setiap Minggu' : 'Every Week'
                        : language === 'id' ? 'Hari Pilihan' : 'Selected Days'}
                    </span>
                  </div>
                )}
              </div>

              {/* Natural schedule explanation */}
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200 leading-relaxed">
                {language === 'id'
                  ? 'Jadwal tugas ini fleksibel dan bisa kamu atur ulang kapan saja sesuai kebutuhanmu.'
                  : 'You can adjust or reschedule this task anytime whenever you need.'}
              </div>
            </div>

            {/* Actions: Hapus Tugas & Ubah Tugas */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <TrashIcon size="xs" />
                <span>{language === 'id' ? 'Hapus Tugas' : 'Delete Task'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openAddTaskModal(task, normalizeToISODate(task.dateDisplay));
                  setSelectedTaskForDetail(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
              >
                <PencilIcon size="xs" />
                <span>{language === 'id' ? 'Ubah Tugas' : 'Edit Task'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
