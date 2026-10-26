'use client';

import { useState } from 'react';
import { TopNavBar } from '../../../components/organism/NavBar.js';
import { DailyCapacityMeter } from '../../../components/organism/DailyCapacityMeter.js';
import { TaskCard } from '../../../components/organism/TaskCard.js';
import { RescheduleAlert } from '../../../components/organism/RescheduleAlert.js';
import { AdaptiveScheduleConfirmModal } from '../../../components/organism/AdaptiveScheduleConfirmModal.js';
import Link from 'next/link';

interface DemoTask {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  scheduledTime: string;
  priorityRank: number;
  completed: boolean;
}

const INITIAL_TOP3_TASKS: DemoTask[] = [
  {
    id: 't-1',
    title: 'Selesaikan Desain Arsitektur FoCient Monorepo',
    category: 'Pekerjaan Inti',
    durationMinutes: 90,
    scheduledTime: '09:00 - 10:30',
    priorityRank: 1,
    completed: false,
  },
  {
    id: 't-2',
    title: 'Review Kontrak DTO & Migrasi Database Relasional',
    category: 'Pekerjaan Inti',
    durationMinutes: 60,
    scheduledTime: '10:45 - 11:45',
    priorityRank: 2,
    completed: false,
  },
  {
    id: 't-3',
    title: 'Sinkronisasi Token Visual Inter 100% Multi-Platform',
    category: 'Pengembangan Karir',
    durationMinutes: 45,
    scheduledTime: '13:00 - 13:45',
    priorityRank: 3,
    completed: false,
  },
];

export default function TodayPlanPage() {
  const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_TOP3_TASKS);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-neutral-canvas">
      <TopNavBar pageTitle="Rencana Hari Ini" dateLabel="Senin, 26 Okt 2026" workloadPercentage={68} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-neutral-border pb-3">
          <Link
            href="/today"
            className="text-sm font-semibold text-focus border-b-2 border-focus pb-3 -mb-3.5 px-1"
          >
            Linimasa Hari Ini
          </Link>
          <Link
            href="/tasks"
            className="text-sm font-medium text-neutral-text/70 hover:text-neutral-text pb-3 -mb-3.5 px-1 transition-colors"
          >
            Manajemen Tugas
          </Link>
          <Link
            href="/insights"
            className="text-sm font-medium text-neutral-text/70 hover:text-neutral-text pb-3 -mb-3.5 px-1 transition-colors"
          >
            Refleksi & Wawasan
          </Link>
        </div>

        {/* Guilt-Free Adaptive Reschedule Alert */}
        <RescheduleAlert
          open={showAlert}
          description="Rapat pagi bergeser 20 menit. Jadwal downstream dialihkan secara adaptif agar tetap tenang."
          onApply={() => setIsRescheduleModalOpen(true)}
          onDismiss={() => setShowAlert(false)}
        />

        {/* Workload Capacity Meter */}
        <section className="bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-focient-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-text">Workload Capacity</h2>
              <p className="text-xs text-neutral-text/70 mt-0.5">
                Alokasi waktu vs kapasitas kerja 8 jam
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-semibold text-focus tabular-nums">325</span>
              <span className="text-xs text-neutral-text/60"> / 480 mnt</span>
            </div>
          </div>
          <DailyCapacityMeter allocatedMinutes={325} totalCapacityMinutes={480} />
        </section>

        {/* Top 3 Priorities Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-neutral-text">Top 3 Prioritas Utama</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-focus-subtle text-focus font-semibold tabular-nums">
                {tasks.filter((t) => t.completed).length}/3 Selesai
              </span>
            </div>
            <span className="text-xs text-neutral-text/60 font-medium">Fokus Tunggal & Jernih</span>
          </div>

          <div className="grid gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                projectCategory={task.category}
                duration={`${task.durationMinutes}m`}
                timeSlot={task.scheduledTime}
                priorityRank={task.priorityRank}
                completed={task.completed}
                onToggleComplete={() => toggleTaskStatus(task.id)}
              />
            ))}
          </div>
        </section>

        {/* Timeline Passive Placement Schedule */}
        <section className="bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-focient-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-text">Linimasa Harian (Silent Placement)</h2>
              <p className="text-xs text-neutral-text/70 mt-0.5">
                Penempatan pasif non-fragmentasi otomatis di sisi server
              </p>
            </div>
            <button
              onClick={() => setIsRescheduleModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-canvas border border-neutral-border hover:bg-neutral-muted transition-colors text-neutral-text"
            >
              Simulasi Ripple Shift
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-text/70 border-b border-neutral-border pb-2">
              <span className="w-24 tabular-nums">09:00 - 10:30</span>
              <div className="flex-1 p-2 rounded-lg bg-focus-subtle/50 border border-focus-border text-neutral-text font-normal flex items-center justify-between">
                <span>Selesaikan Desain Arsitektur FoCient Monorepo</span>
                <span className="text-[11px] font-semibold text-focus">Top 3 Aktif</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-neutral-text/70 border-b border-neutral-border pb-2">
              <span className="w-24 tabular-nums">10:30 - 10:45</span>
              <div className="flex-1 p-2 rounded-lg bg-neutral-canvas border border-dashed border-neutral-border text-neutral-text/60 font-normal">
                Jeda Istirahat Mental (Buffer Time 15 mnt)
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-neutral-text/70 border-b border-neutral-border pb-2">
              <span className="w-24 tabular-nums">10:45 - 11:45</span>
              <div className="flex-1 p-2 rounded-lg bg-focus-subtle/50 border border-focus-border text-neutral-text font-normal flex items-center justify-between">
                <span>Review Kontrak DTO & Migrasi Database Relasional</span>
                <span className="text-[11px] font-semibold text-focus">Top 3</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-neutral-text/70">
              <span className="w-24 tabular-nums">13:00 - 13:45</span>
              <div className="flex-1 p-2 rounded-lg bg-efficient-subtle/50 border border-efficient-border text-neutral-text font-normal flex items-center justify-between">
                <span>Sinkronisasi Token Visual Inter 100% Multi-Platform</span>
                <span className="text-[11px] font-semibold text-efficient">Top 3</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Adaptive Reschedule Confirmation Modal */}
      <AdaptiveScheduleConfirmModal
        open={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onConfirm={() => setIsRescheduleModalOpen(false)}
        taskTitle="Rapat Koordinasi Tim"
        durationMinutes={20}
      />
    </div>
  );
}
