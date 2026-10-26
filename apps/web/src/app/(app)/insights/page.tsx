'use client';

import { TopNavBar } from '../../../components/organism/NavBar.js';
import Link from 'next/link';

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-neutral-canvas">
      <TopNavBar pageTitle="Refleksi & Wawasan" dateLabel="Senin, 26 Okt 2026" workloadPercentage={68} />

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
            className="text-sm font-medium text-neutral-text/70 hover:text-neutral-text pb-3 -mb-3.5 px-1 transition-colors"
          >
            Manajemen Tugas
          </Link>
          <Link
            href="/insights"
            className="text-sm font-semibold text-focus border-b-2 border-focus pb-3 -mb-3.5 px-1"
          >
            Refleksi & Wawasan
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-neutral-text">Refleksi Produktivitas Mingguan</h1>
          <p className="text-sm text-neutral-text/70 mt-1">
            Wawasan tanpa rasa bersalah (guilt-free insights) untuk menjaga keseimbangan energi jangka panjang.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-focient-1">
            <span className="text-xs font-semibold text-focus uppercase tracking-wider">Total Jam Fokus</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-neutral-text tabular-nums">28.5</span>
              <span className="text-xs text-neutral-text/60">jam minggu ini</span>
            </div>
            <p className="mt-2 text-xs text-neutral-text/75 font-normal leading-relaxed">
              Konsistensi optimal tercapai di paruh pertama hari kerja.
            </p>
          </div>

          <div className="bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-focient-1">
            <span className="text-xs font-semibold text-efficient uppercase tracking-wider">Top 3 Penyelesaian</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-neutral-text tabular-nums">85%</span>
              <span className="text-xs text-neutral-text/60">rata-rata harian</span>
            </div>
            <p className="mt-2 text-xs text-neutral-text/75 font-normal leading-relaxed">
              Fokus tunggal berhasil meminimalisir fragmentasi kognitif.
            </p>
          </div>

          <div className="bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-focient-1">
            <span className="text-xs font-semibold text-warning uppercase tracking-wider">Penyesuaian Adaptif</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-neutral-text tabular-nums">4</span>
              <span className="text-xs text-neutral-text/60">ripple shifts tenang</span>
            </div>
            <p className="mt-2 text-xs text-neutral-text/75 font-normal leading-relaxed">
              Jadwal downstream disesuaikan tanpa menambah stres.
            </p>
          </div>
        </div>

        <section className="bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-focient-1">
          <h2 className="text-lg font-semibold text-neutral-text mb-2">Catatan Refleksi Empatik</h2>
          <p className="text-sm text-neutral-text/80 leading-relaxed font-normal">
            &ldquo;Anda telah menyelesaikan sebagian besar prioritas utama minggu ini dengan ritme yang stabil.
            Ingatlah bahwa istirahat dan penyesuaian jadwal adalah bagian integral dari efisiensi yang sehat.&rdquo;
          </p>
        </section>
      </main>
    </div>
  );
}
