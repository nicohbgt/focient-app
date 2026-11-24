'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useFocient, FocusType } from '../../../../state/focient-store';
import {
  ArrowLeftIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
} from '../../../../components/icons';

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [resolvedId, setResolvedId] = useState<string>('');

  useEffect(() => {
    let active = true;
    params.then((p) => {
      if (active && p?.id) {
        setResolvedId(p.id);
      }
    });
    return () => {
      active = false;
    };
  }, [params]);

  // Extract ID from path or resolved Promise
  const pathParts = pathname.split('/');
  const taskId = resolvedId || pathParts[pathParts.length - 1];

  const {
    tasks,
    updateTask,
    removeTask,
    categories,
    language,
    toggleTaskComplete,
  } = useFocient();

  const task = tasks.find((t) => t.id === taskId);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editFocusType, setEditFocusType] = useState<FocusType>('Medium');
  const [editDate, setEditDate] = useState('');
  const [editStartHour, setEditStartHour] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditCategory(task.categoryName || '');
      setEditDuration(task.durationMinutes || 30);
      setEditFocusType(task.focusType || 'Medium');
      setEditDate(task.dateDisplay || '');
      setEditStartHour(task.startHourDisplay || '');
    }
  }, [task]);

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <ClockIcon size="md" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'id' ? 'Tugas Tidak Ditemukan' : 'Task Not Found'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {language === 'id'
            ? 'Tugas ini mungkin telah diselesaikan, dihapus, atau tautan tidak lagi valid.'
            : 'This task may have been removed, completed, or the link is expired.'}
        </p>
        <div className="pt-2">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
          >
            <ArrowLeftIcon size="xs" />
            <span>{language === 'id' ? 'Kembali ke Daftar Tugas' : 'Back to Tasks'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!editTitle.trim()) {
      setEditError(language === 'id' ? 'Judul tugas tidak boleh kosong' : 'Task title cannot be empty');
      return;
    }

    updateTask({
      ...task,
      title: editTitle.trim(),
      categoryName: editCategory || task.categoryName,
      durationMinutes: editDuration,
      focusType: editFocusType,
      dateDisplay: editDate || task.dateDisplay,
      startHourDisplay: editStartHour || task.startHourDisplay,
    });

    setIsEditing(false);
    setEditError(null);
  };

  const handleDelete = () => {
    removeTask(task.id);
    router.push('/tasks');
  };

  const isCompleted = task.status === 'completed';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 font-sans">
      {/* Top Breadcrumb Nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon size="xs" />
          <span>{language === 'id' ? 'Kembali ke Daftar Tugas' : 'Back to Tasks'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <PencilIcon size="xs" />
            <span>{isEditing ? (language === 'id' ? 'Batal' : 'Cancel') : (language === 'id' ? 'Edit Tugas' : 'Edit')}</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <TrashIcon size="xs" />
            <span>{language === 'id' ? 'Hapus' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Main Task Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {editError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {editError}
          </div>
        )}

        {isEditing ? (
          /* Edit Form */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                {language === 'id' ? 'Judul Tugas' : 'Task Title'}
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  {language === 'id' ? 'Kategori' : 'Category'}
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  {language === 'id' ? 'Durasi (Menit)' : 'Duration (Minutes)'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={editDuration}
                  onChange={(e) => setEditDuration(parseInt(e.target.value) || 30)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                  {task.categoryName || 'General'}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {task.title}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => toggleTaskComplete(task.id)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'border-slate-300 hover:border-blue-600 text-transparent hover:text-slate-300'
                }`}
                title={isCompleted ? 'Selesai' : 'Tandai selesai'}
              >
                <CheckIcon size="sm" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">{language === 'id' ? 'Status' : 'Status'}</span>
                <span className="font-semibold text-slate-800">
                  {isCompleted ? (language === 'id' ? 'Selesai' : 'Completed') : (language === 'id' ? 'Belum Selesai' : 'Pending')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">{language === 'id' ? 'Prioritas' : 'Priority'}</span>
                <span className="font-semibold text-slate-800 capitalize">{task.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">{language === 'id' ? 'Durasi' : 'Duration'}</span>
                <span className="font-semibold text-slate-800">{task.durationMinutes} menit</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">{language === 'id' ? 'Fokus' : 'Focus Mode'}</span>
                <span className="font-semibold text-slate-800">{task.focusType || 'Medium'}</span>
              </div>
            </div>

            {task.startHourDisplay && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <ClockIcon size="xs" className="text-slate-400" />
                <span>
                  {language === 'id' ? 'Dijadwalkan pukul ' : 'Scheduled at '}
                  <strong>{task.startHourDisplay}</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
