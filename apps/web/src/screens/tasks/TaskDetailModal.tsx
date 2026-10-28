'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { XIcon, ClockIcon, CalendarIcon, PencilIcon, TrashIcon, SparklesIcon } from '../../components/icons';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskForDetail,
    setSelectedTaskForDetail,
    openAddTaskModal,
    removeTask,
    language,
  } = useFocient();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!selectedTaskForDetail) return null;

  const task = selectedTaskForDetail;

  const handleDelete = () => {
    removeTask(task.id);
    setIsConfirmDeleteOpen(false);
    setSelectedTaskForDetail(null);
  };

  const handleEdit = () => {
    setSelectedTaskForDetail(null);
    openAddTaskModal(task);
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white rounded-2xl shadow-focient-3 max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {language === 'id' ? 'Detail Tugas' : 'Task Detail'}
              </span>
              {task.priority === 'top3' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Top 3
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedTaskForDetail(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <XIcon size="sm" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: task.categoryColor }}
                />
                <span className="text-xs font-semibold text-slate-600">{task.categoryName}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {task.focusType}
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
                  <span>{task.dateDisplay}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">
                  {language === 'id' ? 'Jam Mulai' : 'Start Time'}
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 tabular-nums">
                  <ClockIcon size="xs" />
                  <span>{task.startHourDisplay}</span>
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
            </div>

            {/* Status notice */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
              <span className="text-base">🧘</span>
              <span>
                {language === 'id'
                  ? 'Tugas ini dapat disesuaikan jadwalnya kapan pun tanpa mempengaruhi skor atau rasa bersalah.'
                  : 'You can adjust or re-sequence this task anytime without punitive impact or guilt.'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
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
              onClick={handleEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PencilIcon size="xs" />
              <span>{language === 'id' ? 'Ubah Tugas' : 'Edit Task'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guilt-Free Delete Confirmation Dialog */}
      {isConfirmDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl shadow-focient-4 max-w-sm w-full p-6 text-center border border-slate-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <TrashIcon size="sm" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {language === 'id' ? 'Hapus Tugas?' : 'Cancel Task?'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {language === 'id'
                ? 'Tugas ini akan dihapus dari jadwal Anda tanpa rasa bersalah. Anda selalu dapat menambahkannya kembali nanti.'
                : 'This task will be removed from your schedule without guilt. You can always add it back later.'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                {language === 'id' ? 'Batal' : 'Keep Task'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm"
              >
                {language === 'id' ? 'Hapus Sekarang' : 'Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
