'use client';

import React, { useState } from 'react';
import { useFocient, MobileTask, FocusType } from '../../state/focient-store';
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon, ClockIcon } from '../../components/icons';

export const Step4TaskScreen: React.FC = () => {
  const {
    categories,
    tasks,
    addTask,
    removeTask,
    restMinutesPerTask,
    setOnboardingStep,
    language,
  } = useFocient();

  const [title, setTitle] = useState('Create the Annual OKR');
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.name || 'Strategic'
  );
  const [duration, setDuration] = useState(25);
  const [focusType, setFocusType] = useState<FocusType>('Deep Focus');
  const [needRest, setNeedRest] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const durations = [10, 15, 20, 25, 30, 45, 60];

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'id' ? 'Judul tugas tidak boleh kosong' : 'Task title cannot be empty');
      return;
    }

    const catObj = categories.find((c) => c.name === selectedCategory) || categories[0];
    const newTask: Omit<MobileTask, 'id'> = {
      title: title.trim(),
      durationMinutes: duration,
      priority: 'top3',
      energyLevel: focusType === 'Deep Focus' ? 'high' : focusType === 'Light' ? 'low' : 'medium',
      status: 'todo',
      categoryName: catObj?.name || 'Strategic',
      categoryColor: catObj?.colorHex || '#7C3AED',
      restMinutes: needRest ? restMinutesPerTask || 15 : 0,
      dateDisplay: 'October, 5th 2026',
      startHourDisplay: '10:00',
      focusType,
      needRestAfter: needRest,
    };

    addTask(newTask);
    setTitle('');
    setError(null);
  };

  const handleNext = () => {
    if (tasks.length === 0) {
      setError(
        language === 'id'
          ? 'Tambahkan minimal 1 tugas untuk memulai rencana harian Anda'
          : 'Please add at least 1 focus task to generate your plan'
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
          {language === 'id' ? 'Masukkan Tugas Pertama' : 'Enter your first task'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Tentukan tugas fokus utama untuk membangun jadwal hari pertama Anda.'
            : 'Add your primary focus task to generate your initial daily schedule.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Quick Add Form */}
        <form onSubmit={handleAddNewTask} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="task-title">
              {language === 'id' ? 'Nama Tugas' : 'Task Title'}
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder={language === 'id' ? 'Contoh: Selesaikan Laporan Mingguan' : 'e.g. Create the Annual OKR'}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Pilih Kategori' : 'Select Category'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
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

          {/* Duration Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Durasi Tugas' : 'Task Duration'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all tabular-nums ${
                    duration === d
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Focus Type & Rest */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              {(['Light', 'Medium', 'Deep Focus'] as FocusType[]).map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFocusType(ft)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                    focusType === ft
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={needRest}
                onChange={(e) => setNeedRest(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] font-medium">{language === 'id' ? 'Jeda Istirahat' : 'Rest After'}</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
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
                      <div className="text-xs font-bold text-slate-900 truncate">{t.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{t.categoryName}</span>
                        <span>•</span>
                        <span className="tabular-nums font-semibold">{t.durationMinutes}m</span>
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
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>{language === 'id' ? 'Tinjau Beban Kerja' : 'Review Workload'}</span>
          <ArrowRightIcon size="sm" />
        </button>
      </div>
    </div>
  );
};
