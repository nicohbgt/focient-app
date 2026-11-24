'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Shield,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react';
import { authClient } from '../../../../lib/auth-client';

interface UserAuditItem {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: 'USER' | 'INTERNAL_OPERATOR' | 'SUPERADMIN';
  subscriptionTier: 'FREE' | 'FOUNDERS_PASS' | 'PRO_MONTHLY';
  subscriptionExpiresAt: string | null;
  founderPassClaimNumber: number | null;
  isOnboardingCompleted: boolean;
  roleArchetype: string;
  occupancy: string;
  createdAt: string;
  totalTasks: number;
  completedTasks: number;
  deepFocusTasks: number;
  routineTasks: number;
  silentBufferTasks: number;
  rescheduleCount: number;
}

export default function UsersAuditDashboard() {
  const [users, setUsers] = useState<UserAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [onboardingFilter, setOnboardingFilter] = useState('ALL');

  const fetchUsers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const token = authClient.getToken();
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (tierFilter !== 'ALL') params.set('tier', tierFilter);
      if (onboardingFilter !== 'ALL') params.set('onboarding', onboardingFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, tierFilter, onboardingFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(true);
  };

  return (
    <div className="space-y-8">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-violet-950 border border-violet-800 text-violet-300 font-mono text-[10px] font-bold">
              MODUL 4
            </span>
            <span className="text-xs font-mono text-slate-400">
              AUDIT & DEEP USAGE INSPECTOR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Audit Pengguna & Deep Usage Inspector
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Inspeksi interaksi akun, riwayat eksekusi jadwal, tingkat kepatuhan fokus, serta kendali peran RBAC individual.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, email, atau arketipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">Semua Role</option>
            <option value="USER">User Standar</option>
            <option value="INTERNAL_OPERATOR">Internal Operator</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">Semua Lisensi</option>
            <option value="FOUNDERS_PASS">Founder’s Pass</option>
            <option value="PRO_MONTHLY">Pro Monthly</option>
            <option value="FREE">Free Tier</option>
          </select>

          {/* Onboarding Filter */}
          <select
            value={onboardingFilter}
            onChange={(e) => setOnboardingFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">Semua Onboarding</option>
            <option value="COMPLETED">Selesai Onboarding</option>
            <option value="PENDING">Proses Onboarding</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-slate-400">
            Ditemukan {users.length} akun pengguna
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Memuat Data Audit Pengguna...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            Tidak ada pengguna yang cocok dengan kriteria pencarian atau filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-3">Pengguna</th>
                  <th className="py-3 px-3">Role RBAC</th>
                  <th className="py-3 px-3">Lisensi</th>
                  <th className="py-3 px-3">Arketipe Kerja</th>
                  <th className="py-3 px-3 text-center">Tugas Selesai</th>
                  <th className="py-3 px-3 text-center">Onboarding</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          u.role === 'SUPERADMIN'
                            ? 'bg-violet-950 border border-violet-700 text-violet-300'
                            : u.role === 'INTERNAL_OPERATOR'
                            ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {u.subscriptionTier === 'FOUNDERS_PASS' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono text-[10px] font-bold">
                          <Award className="w-3 h-3" />
                          Founder’s Pass #{u.founderPassClaimNumber || '-'}
                        </span>
                      ) : u.subscriptionTier === 'PRO_MONTHLY' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[10px] font-bold">
                          <CreditCard className="w-3 h-3" />
                          Pro Monthly
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
                          Free Tier
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                      {u.roleArchetype || u.occupancy || 'General'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap font-mono">
                      <span className="text-slate-200 font-semibold">{u.completedTasks}</span>
                      <span className="text-slate-400">/{u.totalTasks}</span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {u.isOnboardingCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300 font-mono text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono text-[10px]">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link
                        href={`/ops-console/users/${u.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-600/40 text-[11px] font-medium transition-colors"
                      >
                        <span>Inspeksi Akun</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
