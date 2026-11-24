'use client';

import React, { useEffect, useState } from 'react';
import {
  Gauge,
  Zap,
  Coffee,
  CheckCircle2,
  RefreshCw,
  Clock,
  BatteryCharging,
  PieChart,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { authClient } from '../../../../lib/auth-client';

interface ProductivityData {
  success: boolean;
  workloadHealth: {
    totalDays: number;
    light: { count: number; percentage: number };
    optimal: { count: number; percentage: number };
    nearCapacity: { count: number; percentage: number };
    overload: { count: number; percentage: number };
  };
  rescheduling: {
    totalTriggers: number;
    acceptedCount: number;
    deferredCount: number;
    acceptanceRate: number;
  };
  taskMetrics: {
    totalTasks: number;
    completedTasks: number;
    dailyCompletionRate: number;
    deepFocusTasks: number;
    deepFocusRatio: number;
    routineTasks: number;
    routineRatio: number;
  };
  silentBuffer: {
    utilizationCount: number;
    utilizationRate: number;
    averageRestMinutes: number;
  };
}

export default function ProductivityDashboard() {
  const [data, setData] = useState<ProductivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProductivity = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const token = authClient.getToken();
      const res = await fetch('/api/admin/productivity', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load productivity metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductivity();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Menganalisis Pola Adaptabilitas & Beban Kerja FoCient...
        </p>
      </div>
    );
  }

  const { workloadHealth, rescheduling, taskMetrics, silentBuffer } = data || {
    workloadHealth: {
      totalDays: 0,
      light: { count: 0, percentage: 0 },
      optimal: { count: 0, percentage: 0 },
      nearCapacity: { count: 0, percentage: 0 },
      overload: { count: 0, percentage: 0 },
    },
    rescheduling: {
      totalTriggers: 0,
      acceptedCount: 0,
      deferredCount: 0,
      acceptanceRate: 0,
    },
    taskMetrics: {
      totalTasks: 0,
      completedTasks: 0,
      dailyCompletionRate: 0,
      deepFocusTasks: 0,
      deepFocusRatio: 0,
      routineTasks: 0,
      routineRatio: 0,
    },
    silentBuffer: {
      utilizationCount: 0,
      utilizationRate: 0,
      averageRestMinutes: 10,
    },
  };

  return (
    <div className="space-y-8">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[10px] font-bold">
              MODUL 3
            </span>
            <span className="text-xs font-mono text-slate-400">
              ADAPTABILITY & EXECUTION BEHAVIOR ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Metrik Produktivitas & Adaptabilitas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Agregasi data perilaku eksekusi jadwal harian, kesehatan beban kerja, pemicu reschedule, dan jeda silent buffer tanpa pelanggaran privasi.
          </p>
        </div>

        <button
          onClick={() => fetchProductivity(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Section 1: Workload Health Distribution (4 Tiers) */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <BatteryCharging className="w-4 h-4" />
              <span>Distribusi Kesehatan Beban Kerja (Workload Health)</span>
            </div>
            <h2 className="text-base font-semibold text-white">
              Persentase Hari Kerja Pengguna Berdasarkan Utilisasi Kapasitas
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total {workloadHealth.totalDays} Hari Terobservasi
          </span>
        </div>

        {/* 4 Health Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status 1: LIGHT (<60%) */}
          <div className="p-4 rounded-xl bg-slate-850/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-300">LIGHT (&lt;60%)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                  Rendah
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white mb-0.5">
                {workloadHealth.light.percentage}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {workloadHealth.light.count} hari kerja
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
              <div
                className="bg-blue-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, workloadHealth.light.percentage)}%` }}
              />
            </div>
          </div>

          {/* Status 2: OPTIMAL (60-85%) - Target */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-emerald-300">OPTIMAL (60-85%)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                  Zona Ideal
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-300 mb-0.5">
                {workloadHealth.optimal.percentage}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {workloadHealth.optimal.count} hari kerja
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, workloadHealth.optimal.percentage)}%` }}
              />
            </div>
          </div>

          {/* Status 3: NEAR_CAPACITY (85-100%) */}
          <div className="p-4 rounded-xl bg-slate-850/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-amber-300">NEAR CAPACITY (85-100%)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
                  Waspada
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white mb-0.5">
                {workloadHealth.nearCapacity.percentage}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {workloadHealth.nearCapacity.count} hari kerja
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, workloadHealth.nearCapacity.percentage)}%` }}
              />
            </div>
          </div>

          {/* Status 4: OVERLOAD (>100%) */}
          <div className="p-4 rounded-xl bg-slate-850/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-rose-300">OVERLOAD (&gt;100%)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                  Beban Lebih
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-300 mb-0.5">
                {workloadHealth.overload.percentage}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {workloadHealth.overload.count} hari kerja
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
              <div
                className="bg-rose-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, workloadHealth.overload.percentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stacked Capacity Composition Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Komposisi Keseluruhan Hari Kerja</span>
            <span>{workloadHealth.optimal.percentage}% Berada di Zona Ideal</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden border border-slate-700/60 p-0.5">
            <div
              style={{ width: `${workloadHealth.light.percentage}%` }}
              className="bg-blue-400 h-full rounded-l-full transition-all"
              title={`Light: ${workloadHealth.light.percentage}%`}
            />
            <div
              style={{ width: `${workloadHealth.optimal.percentage}%` }}
              className="bg-emerald-400 h-full transition-all"
              title={`Optimal: ${workloadHealth.optimal.percentage}%`}
            />
            <div
              style={{ width: `${workloadHealth.nearCapacity.percentage}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Near Capacity: ${workloadHealth.nearCapacity.percentage}%`}
            />
            <div
              style={{ width: `${workloadHealth.overload.percentage}%` }}
              className="bg-rose-400 h-full rounded-r-full transition-all"
              title={`Overload: ${workloadHealth.overload.percentage}%`}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Guilt-Free Rescheduling & Adaptability Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reschedule Metrics */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">
              Guilt-Free Rescheduling Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Frekuensi pemicu rekomendasi penjadwalan ulang adaptif versus respon pengguna (menerima vs menunda/mengabaikan).
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Total Pemicu Reschedule
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {rescheduling.totalTriggers} <span className="text-xs text-slate-400 font-normal">kali</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Tingkat Penerimaan Rekomendasi
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {rescheduling.acceptanceRate}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Rekomendasi Diterima Langsung
              </span>
              <span className="font-mono text-white font-bold">
                {rescheduling.acceptedCount} ({rescheduling.acceptanceRate}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Ditunda / Diabaikan
              </span>
              <span className="font-mono text-slate-400">
                {rescheduling.deferredCount} ({Math.round(100 - rescheduling.acceptanceRate)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-400 h-full transition-all"
                style={{ width: `${rescheduling.acceptanceRate}%` }}
              />
              <div
                className="bg-slate-600 h-full transition-all"
                style={{ width: `${100 - rescheduling.acceptanceRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Task Execution & Silent Buffer Utilization */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-5">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              Kedalaman Kognitif & Jeda Istirahat (Silent Buffer)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Rasio pengerjaan tugas fokus tinggi, tingkat penyelesaian harian, serta pemanfaatan jeda istirahat 10 menit.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Tingkat Penyelesaian Tugas
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {taskMetrics.dailyCompletionRate}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                {taskMetrics.completedTasks} dari {taskMetrics.totalTasks} tugas selesai
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Pemanfaatan Silent Buffer (&ge;10m)
              </span>
              <span className="text-2xl font-bold font-mono text-teal-300">
                {silentBuffer.utilizationRate}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                Rata-rata {silentBuffer.averageRestMinutes} menit jeda/tugas
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div className="text-xs font-medium text-slate-300 mb-2">
              Rasio Kognitif: Deep Focus vs Rutinitas
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                Deep Focus (High Intensity)
              </span>
              <span className="font-mono text-violet-300 font-bold">
                {taskMetrics.deepFocusTasks} ({taskMetrics.deepFocusRatio}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Admin & Rutinitas (Medium/Low)
              </span>
              <span className="font-mono text-slate-400">
                {taskMetrics.routineTasks} ({taskMetrics.routineRatio}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-violet-400 h-full transition-all"
                style={{ width: `${taskMetrics.deepFocusRatio}%` }}
              />
              <div
                className="bg-slate-500 h-full transition-all"
                style={{ width: `${taskMetrics.routineRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
