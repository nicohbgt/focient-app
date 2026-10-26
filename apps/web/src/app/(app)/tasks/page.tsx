'use client';

import { useState } from 'react';
import { TopNavBar } from '../../../components/organism/NavBar.js';
import { TaskValidationForm } from '../../../components/organism/TaskValidationForm.js';
import Link from 'next/link';

export default function TasksPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-canvas">
      <TopNavBar pageTitle="Manajemen Tugas" dateLabel="Senin, 26 Okt 2026" workloadPercentage={68} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3 border-b border-neutral-border pb-3">
          <Link
            href="/today"
            className="text-sm font-medium text-neutral-text/70 hover:text-neutral-text pb-3 -mb-3.5 px-1 transition-colors"
          >
            Linimasa Hari Ini
          </Link>
          <Link
            href="/tasks"
            className="text-sm font-semibold text-focus border-b-2 border-focus pb-3 -mb-3.5 px-1"
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-text">Daftar Backlog & Prioritas</h1>
            <p className="text-sm text-neutral-text/70 mt-1">
              Pilih maksimal 3 tugas utama untuk difokuskan hari ini.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-focus hover:bg-focus-hover text-white text-sm font-semibold rounded-lg shadow-focient-1 transition-colors"
          >
            {showAddForm ? 'Tutup Formulir' : '+ Tambah Tugas Baru'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-focient-1">
            <h2 className="text-lg font-semibold text-neutral-text mb-4">Input Tugas Baru</h2>
            <TaskValidationForm
              currentTop3Count={3}
              onSubmit={(_data) => {
                setShowAddForm(false);
              }}
            />
          </div>
        )}

        <div className="bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-focient-1">
          <h2 className="text-lg font-semibold text-neutral-text mb-4">Semua Tugas Aktif</h2>
          <div className="divide-y divide-neutral-border">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-text">
                  Selesaikan Desain Arsitektur FoCient Monorepo
                </p>
                <span className="text-xs text-neutral-text/60">Pekerjaan Inti • 90 mnt</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-focus-subtle text-focus font-semibold">
                Top 3
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-text">
                  Review Kontrak DTO & Migrasi Database Relasional
                </p>
                <span className="text-xs text-neutral-text/60">Pekerjaan Inti • 60 mnt</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-focus-subtle text-focus font-semibold">
                Top 3
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-text">
                  Sinkronisasi Token Visual Inter 100% Multi-Platform
                </p>
                <span className="text-xs text-neutral-text/60">Pengembangan Karir • 45 mnt</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-focus-subtle text-focus font-semibold">
                Top 3
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
