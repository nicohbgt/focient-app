'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Shield,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  Sliders,
  Calendar,
  Zap,
  Activity,
  Layers,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { authClient } from '../../../../../lib/auth-client';

interface UserDetailResponse {
  success: boolean;
  data: {
    user: {
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
      workingRhythm: string;
      schedulingStyle: string;
      dailyCapacityMinutes: number;
      workHourStart: string;
      workHourEnd: string;
      restTimePerTask: number;
      createdAt: string;
    };
    tasks: Array<{
      id: string;
      title: string;
      status: string;
      durationMinutes: number;
      priority: string;
      focusType: string;
      restMinutes: number;
      createdAt: string;
      completedAt: string | null;
    }>;
    rescheduleAuditLogs: Array<{
      id: string;
      reasonMessage: string;
      appliedAt: string;
      previousStartTime: string | null;
      newStartTime: string | null;
    }>;
    workloads: Array<{
      date: string;
      status: string;
      capacityPercentage: number;
      allocatedMinutes: number;
      capacityMinutes: number;
    }>;
  };
}

export default function UserDeepInspectorPage() {
  const pathname = usePathname();
  const router = useRouter();
  const userId = pathname ? pathname.split('/').pop() || '' : '';

  const [detail, setDetail] = useState<UserDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states for overrides
  const [newRole, setNewRole] = useState<'USER' | 'INTERNAL_OPERATOR' | 'SUPERADMIN'>('USER');
  const [newTier, setNewTier] = useState<'FREE' | 'FOUNDERS_PASS' | 'PRO_MONTHLY'>('FREE');
  const [savingAction, setSavingAction] = useState(false);

  const fetchDetail = async () => {
    try {
      const token = authClient.getToken();
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json: UserDetailResponse = await res.json();
        setDetail(json.data);
        setNewRole(json.data.user.role);
        setNewTier(json.data.user.subscriptionTier);
      } else {
        router.push('/ops-console/users');
      }
    } catch (err) {
      console.error('Failed to load user detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDetail();
  }, [userId]);

  const handleUpdateRole = async () => {
    setSavingAction(true);
    try {
      const token = authClient.getToken();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setFeedback({ message: `Role berhasil diubah ke ${newRole}.`, type: 'success' });
        fetchDetail();
      } else {
        const err = await res.json();
        setFeedback({ message: err.error || 'Gagal mengubah role.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setSavingAction(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleUpdateTier = async () => {
    setSavingAction(true);
    try {
      const token = authClient.getToken();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionTier: newTier }),
      });
      if (res.ok) {
        setFeedback({ message: `Lisensi langganan berhasil diubah ke ${newTier}.`, type: 'success' });
        fetchDetail();
      }
    } catch {
      setFeedback({ message: 'Gagal memperbarui status lisensi.', type: 'error' });
    } finally {
      setSavingAction(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleToggleOnboarding = async () => {
    if (!detail) return;
    setSavingAction(true);
    const targetState = !detail.user.isOnboardingCompleted;
    try {
      const token = authClient.getToken();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isOnboardingCompleted: targetState }),
      });
      if (res.ok) {
        setFeedback({
          message: `Status onboarding diubah menjadi: ${targetState ? 'Selesai' : 'Belum Selesai'}.`,
          type: 'success',
        });
        fetchDetail();
      }
    } catch {
      setFeedback({ message: 'Gagal mengubah status onboarding.', type: 'error' });
    } finally {
      setSavingAction(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Memuat Detail Audit & Telemetri Pengguna...
        </p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Pengguna tidak ditemukan.</p>
        <Link href="/ops-console/users" className="text-xs text-indigo-400 underline mt-2 inline-block">
          Kembali ke Daftar Pengguna
        </Link>
      </div>
    );
  }

  const { user, tasks, workloads, rescheduleAuditLogs } = detail;

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/ops-console/users"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Pengguna</span>
        </Link>
      </div>

      {/* User Header Profile */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center font-bold text-xl text-indigo-300">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white tracking-tight">{user.name}</h1>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                  user.role === 'SUPERADMIN'
                    ? 'bg-violet-950 border border-violet-700 text-violet-300'
                    : user.role === 'INTERNAL_OPERATOR'
                    ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{user.email}</span>
              <span>•</span>
              <span>Arketipe: {user.roleArchetype || user.occupancy}</span>
              <span>•</span>
              <span>
                Terdaftar:{' '}
                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user.subscriptionTier === 'FOUNDERS_PASS' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono text-xs font-bold shadow-sm">
              <Award className="w-4 h-4" />
              Founder’s Pass #{user.founderPassClaimNumber || '-'}
            </span>
          ) : user.subscriptionTier === 'PRO_MONTHLY' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-xs font-bold shadow-sm">
              <CreditCard className="w-4 h-4" />
              Pro Monthly
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs">
              Free Tier
            </span>
          )}

          {user.isOnboardingCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950/80 border border-teal-800 text-teal-300 font-mono text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Onboarding Selesai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 font-mono text-xs">
              <Clock className="w-3.5 h-3.5" />
              Onboarding Tertunda
            </span>
          )}
        </div>
      </div>

      {/* Alert Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 shadow-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-700 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Operational Overrides Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">
            Kendali Operasional & Override Akun (Superadmin / Operator)
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Ubah hak akses RBAC, status lisensi komersial, atau reset progres onboarding pengguna ini secara instan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Override 1: Role RBAC */}
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hak Akses / Role RBAC
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="USER">USER (Pengguna Biasa)</option>
                <option value="INTERNAL_OPERATOR">INTERNAL_OPERATOR (Operator Internal)</option>
                <option value="SUPERADMIN">SUPERADMIN (Administrator Penuh)</option>
              </select>
            </div>
            <button
              onClick={handleUpdateRole}
              disabled={savingAction || newRole === user.role}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              Simpan Role
            </button>
          </div>

          {/* Override 2: Subscription Tier */}
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Lisensi / Subscription Tier
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="FREE">FREE (Gratis Standar)</option>
                <option value="FOUNDERS_PASS">FOUNDERS_PASS (Seumur Hidup)</option>
                <option value="PRO_MONTHLY">PRO_MONTHLY (Bulanan)</option>
              </select>
            </div>
            <button
              onClick={handleUpdateTier}
              disabled={savingAction || newTier === user.subscriptionTier}
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              Simpan Lisensi
            </button>
          </div>

          {/* Override 3: Onboarding State */}
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status Onboarding
              </label>
              <p className="text-xs text-slate-400">
                Saat ini:{' '}
                <strong className="text-slate-200">
                  {user.isOnboardingCompleted ? 'Selesai' : 'Belum Selesai'}
                </strong>
              </p>
            </div>
            <button
              onClick={handleToggleOnboarding}
              disabled={savingAction}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {user.isOnboardingCompleted ? 'Reset Onboarding ke Pending' : 'Tandai Onboarding Selesai'}
            </button>
          </div>
        </div>
      </div>

      {/* Productivity & Rhythm Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Ritme Kerja</span>
          <span className="text-base font-semibold text-white">{user.workingRhythm || 'Early Bird'}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Gaya Penjadwalan</span>
          <span className="text-base font-semibold text-white">{user.schedulingStyle || 'Structured'}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Jam Kerja Harian</span>
          <span className="text-base font-semibold font-mono text-white">
            {user.workHourStart} - {user.workHourEnd}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Kapasitas Harian</span>
          <span className="text-base font-semibold font-mono text-white">
            {user.dailyCapacityMinutes} menit ({Math.round((user.dailyCapacityMinutes / 60) * 10) / 10} jam)
          </span>
        </div>
      </div>

      {/* Recent Tasks & Execution History */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Riwayat Tugas & Eksekusi Jadwal ({tasks.length} total)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {tasks.filter((t) => t.status === 'COMPLETED').length} tugas selesai
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 font-mono">
            Pengguna ini belum memiliki riwayat tugas yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-3">Judul Tugas</th>
                  <th className="py-3 px-3">Prioritas</th>
                  <th className="py-3 px-3">Intensitas Fokus</th>
                  <th className="py-3 px-3">Durasi</th>
                  <th className="py-3 px-3">Silent Buffer</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-200">{task.title}</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {task.priority === 'TOP_3' ? (
                        <span className="text-amber-400 font-bold">TOP 3</span>
                      ) : (
                        <span className="text-slate-400">REGULAR</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                          task.focusType === 'High'
                            ? 'bg-violet-950 border border-violet-800 text-violet-300 font-semibold'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {task.focusType} Focus
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">{task.durationMinutes}m</td>
                    <td className="py-3 px-3 font-mono text-teal-300">
                      {task.restMinutes ? `${task.restMinutes}m` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                      {new Date(task.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Logs & Workload History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Capacity Records */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              Log Kesehatan Beban Kerja Harian
            </h2>
          </div>

          {workloads.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              Belum ada riwayat beban kerja harian.
            </div>
          ) : (
            <div className="space-y-2.5">
              {workloads.slice(0, 5).map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-200">{w.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">
                      {w.allocatedMinutes}/{w.capacityMinutes}m ({w.capacityPercentage}%)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        w.status === 'OPTIMAL'
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                          : w.status === 'LIGHT'
                          ? 'bg-blue-950 border border-blue-800 text-blue-300'
                          : w.status === 'NEAR_CAPACITY'
                          ? 'bg-amber-950 border border-amber-800 text-amber-300'
                          : 'bg-rose-950 border border-rose-800 text-rose-300'
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reschedule Audit Logs */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">
              Log Rescheduling & Pergeseran Tugas
            </h2>
          </div>

          {rescheduleAuditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              Belum ada riwayat reschedule otomatis untuk akun ini.
            </div>
          ) : (
            <div className="space-y-2.5">
              {rescheduleAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                    <span>
                      {new Date(log.appliedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-amber-400 font-semibold">Rescheduled</span>
                  </div>
                  <div className="text-slate-200">
                    {log.reasonMessage || 'Jadwal disesuaikan adaptif tanpa penalti guilt.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
