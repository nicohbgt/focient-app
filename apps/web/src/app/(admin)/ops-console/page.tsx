'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Activity,
  TrendingUp,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { authClient } from '../../../lib/auth-client';

interface ArchetypeMetric {
  name: string;
  count: number;
  percentage: number;
}

interface CohortData {
  cohortName: string;
  cohortWeekIndex: number;
  size: number;
  retention: (number | null)[];
}

interface MetricsResponse {
  success: boolean;
  traction: {
    totalUsers: number;
    onboardingCompletedCount: number;
    onboardingCompletionRate: number;
    avgTimeToFirstPlanSeconds: number;
    avgTimeToFirstPlanFormatted: string;
    archetypeDistribution: ArchetypeMetric[];
  };
  retention: {
    dau: number;
    wau: number;
    stickinessRatio: number;
    cohorts: CohortData[];
  };
}

export default function TractionRetentionDashboard() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const token = authClient.getToken();
      const res = await fetch('/api/admin/metrics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getRetentionBg = (val: number | null) => {
    if (val === null) return 'bg-slate-900/40 text-slate-400';
    if (val >= 80) return 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/40';
    if (val >= 65) return 'bg-teal-950/80 text-teal-300 border border-teal-800/40';
    if (val >= 50) return 'bg-blue-950/80 text-blue-300 border border-blue-800/40';
    if (val >= 35) return 'bg-amber-950/80 text-amber-300 border border-amber-800/40';
    return 'bg-rose-950/80 text-rose-300 border border-rose-800/40';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Mengagregasi Data Traksi & Retensi FoCient...
        </p>
      </div>
    );
  }

  const { traction, retention } = data || {
    traction: {
      totalUsers: 0,
      onboardingCompletedCount: 0,
      onboardingCompletionRate: 0,
      avgTimeToFirstPlanSeconds: 0,
      avgTimeToFirstPlanFormatted: '0m 0s',
      archetypeDistribution: [],
    },
    retention: {
      dau: 0,
      wau: 0,
      stickinessRatio: 0,
      cohorts: [],
    },
  };

  return (
    <div className="space-y-8">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-[10px] font-bold">
              MODUL 1
            </span>
            <span className="text-xs font-mono text-slate-400">
              GROWTH & ENGAGEMENT AGGREGATOR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Traksi, Akuisisi & Retensi Pengguna
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Agregasi data pertumbuhan riil, konversi onboarding, dan kohort retensi 8 minggu tanpa visibilitas publik.
          </p>
        </div>

        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Pengguna Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-white mb-1">
            {traction.totalUsers}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Organic Traction Active</span>
          </div>
        </div>

        {/* Metric 2: Onboarding Completion Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Tingkat Penyelesaian Onboarding</span>
            <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-800/60 flex items-center justify-center text-teal-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold font-mono text-white">
              {traction.onboardingCompletionRate}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({traction.onboardingCompletedCount}/{traction.totalUsers})
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-teal-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, traction.onboardingCompletionRate)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Time to First Plan */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Time to First Plan</span>
            <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-violet-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-white mb-1">
            {traction.avgTimeToFirstPlanFormatted}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Rata-rata registrasi s.d. jadwal pertama ({traction.avgTimeToFirstPlanSeconds}s)
          </p>
        </div>

        {/* Metric 4: DAU / WAU & Stickiness */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">DAU / WAU Stickiness</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold font-mono text-white">
              {retention.stickinessRatio}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              (DAU {retention.dau} / WAU {retention.wau})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Habitual Engagement</span>
          </div>
        </div>
      </div>

      {/* Distribution Section: Arketipe Kerja */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">
            Distribusi Arketipe Kerja Pengguna
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Segmentasi pengguna berdasarkan kategori peran kerja yang dipilih saat onboarding.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {traction.archetypeDistribution.map((arch) => (
            <div
              key={arch.name}
              className="p-4 rounded-xl bg-slate-850/60 border border-slate-800/90 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-medium text-slate-300 block truncate">
                  {arch.name}
                </span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {arch.count} <span className="text-xs text-slate-400 font-normal">user</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Porsi</span>
                  <span>{arch.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, arch.percentage)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort Retention Grid (Week 1 to Week 8) */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              Cohort Retention Matrix (Week 1 s.d. Week 8 Pasca Registrasi)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Nilai dalam % pengguna aktif kembali
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Mengukur retensi mingguan pengguna baru sejak registrasi akun hingga 8 minggu berikutnya.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">Kohort Pendaftaran</th>
                <th className="py-3 px-3 text-center">Ukuran (User)</th>
                <th className="py-3 px-2 text-center">W1</th>
                <th className="py-3 px-2 text-center">W2</th>
                <th className="py-3 px-2 text-center">W3</th>
                <th className="py-3 px-2 text-center">W4</th>
                <th className="py-3 px-2 text-center">W5</th>
                <th className="py-3 px-2 text-center">W6</th>
                <th className="py-3 px-2 text-center">W7</th>
                <th className="py-3 px-2 text-center">W8</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {retention.cohorts.map((cohort) => (
                <tr key={cohort.cohortName} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-sans text-slate-200 font-medium whitespace-nowrap">
                    {cohort.cohortName}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300 font-bold">
                    {cohort.size}
                  </td>
                  {cohort.retention.map((val, idx) => (
                    <td key={idx} className="py-2 px-1 text-center">
                      <div
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-mono transition-all ${getRetentionBg(
                          val
                        )}`}
                      >
                        {val !== null ? `${val}%` : '-'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <span>Tingkat Retensi:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-800" />
            <span>&ge; 80% (Sangat Kuat)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-950 border border-teal-800" />
            <span>65% - 79% (Optimal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-950 border border-blue-800" />
            <span>50% - 64% (Sedang)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-950 border border-amber-800" />
            <span>35% - 49% (Perlu Perhatian)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-950 border border-rose-800" />
            <span>&lt; 35% (Kritis)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
