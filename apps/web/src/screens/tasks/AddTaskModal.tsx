'use client';

import React, { useState, useEffect } from 'react';
import { useFocient, MobileTask, FocusType } from '../../state/focient-store';
import { XIcon, PlusIcon, CheckIcon } from '../../components/icons';

export const AddTaskModal: React.FC = () => {
  const {
    isAddTaskModalOpen,
    closeAddTaskModal,
    taskToEdit,
    addTask,
    updateTask,
    categories,
    restMinutesPerTask,
    language,
  } = useFocient();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Strategic');
  const [duration, setDuration] = useState(25);
  const [focusType, setFocusType] = useState<FocusType>('Deep Focus');
  const [dateDisplay, setDateDisplay] = useState('October, 5th 2026');
  const [startHourDisplay, setStartHourDisplay] = useState('14:30');
  const [isBacklog, setIsBacklog] = useState(false);
  const [needRestAfter, setNeedRestAfter] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setSelectedCategory(taskToEdit.categoryName);
      setDuration(taskToEdit.durationMinutes);
      setFocusType(taskToEdit.focusType);
      setDateDisplay(taskToEdit.dateDisplay);
      setStartHourDisplay(taskToEdit.startHourDisplay);
      setIsBacklog(taskToEdit.isBacklog || false);
      setNeedRestAfter(taskToEdit.needRestAfter ?? true);
    } else {
      setTitle('');
      setSelectedCategory(categories[0]?.name || 'Strategic');
      setDuration(25);
      setFocusType('Deep Focus');
      setDateDisplay('October, 5th 2026');
      setStartHourDisplay('14:30');
      setIsBacklog(false);
      setNeedRestAfter(true);
    }
    setError(null);
  }, [taskToEdit, isAddTaskModalOpen, categories]);

  if (!isAddTaskModalOpen) return null;

  const durations = [10, 15, 20, 25, 30, 45, 60];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'id' ? 'Judul tugas tidak boleh kosong' : 'Task title cannot be empty');
      return;
    }

    const catObj = categories.find((c) => c.name === selectedCategory) || categories[0];
    const categoryColor = catObj?.colorHex || '#7C3AED';

    if (taskToEdit) {
      updateTask({
        ...taskToEdit,
        title: title.trim(),
        categoryName: selectedCategory,
        categoryColor,
        durationMinutes: duration,
        focusType,
        energyLevel: focusType === 'Deep Focus' ? 'high' : focusType === 'Light' ? 'low' : 'medium',
        dateDisplay,
        startHourDisplay,
        isBacklog,
        needRestAfter,
        restMinutes: needRestAfter ? 10 : 0,
      });
    } else {
      addTask({
        title: title.trim(),
        categoryName: selectedCategory,
        categoryColor,
        durationMinutes: duration,
        priority: focusType === 'Deep Focus' ? 'top3' : 'normal',
        energyLevel: focusType === 'Deep Focus' ? 'high' : focusType === 'Light' ? 'low' : 'medium',
        status: 'todo',
        focusType,
        dateDisplay,
        startHourDisplay,
        isBacklog,
        needRestAfter,
        restMinutes: needRestAfter ? restMinutesPerTask || 10 : 0,
      });
    }

    closeAddTaskModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-focient-3 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
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
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1" htmlFor="add-task-title">
              {language === 'id' ? 'Nama Tugas' : 'Task Name'}
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Kategori Tugas' : 'Task Categories'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.colorHex }} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Chips */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Durasi Tugas' : 'Task Duration'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg font-semibold border transition-all tabular-nums ${
                    duration === d
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {d} {language === 'id' ? 'Menit' : 'Minute'}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Tingkat Fokus' : 'Focus Type'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Light', 'Medium', 'Deep Focus'] as FocusType[]).map((ft) => {
                const isSelected = focusType === ft;
                return (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setFocusType(ft)}
                    className={`py-2 px-2 rounded-xl border font-bold text-center transition-all ${
                      isSelected
                        ? ft === 'Deep Focus'
                          ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-sm'
                          : ft === 'Medium'
                          ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm'
                          : 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ft}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot: Date & Start Hour */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1" htmlFor="slot-date">
                {language === 'id' ? 'Tanggal' : 'Date'}
              </label>
              <input
                id="slot-date"
                type="text"
                value={dateDisplay}
                onChange={(e) => setDateDisplay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1" htmlFor="slot-hour">
                {language === 'id' ? 'Jam Mulai' : 'Start Hour'}
              </label>
              <input
                id="slot-hour"
                type="text"
                value={startHourDisplay}
                onChange={(e) => setStartHourDisplay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 tabular-nums"
              />
            </div>
          </div>

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

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">
                  {language === 'id' ? 'Jeda Istirahat Setelah Tugas' : 'Need to Rest After Task'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'id'
                    ? 'Sistem menyarankan jeda 10-15m untuk menjaga stamina'
                    : 'System suggests a 10m buffer to sustain energy'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={needRestAfter}
                onChange={(e) => setNeedRestAfter(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeAddTaskModal}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all"
            >
              {taskToEdit
                ? language === 'id'
                  ? 'Simpan Perubahan'
                  : 'Save Changes'
                : language === 'id'
                ? 'Tambah Tugas Baru'
                : 'Confirm New Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
