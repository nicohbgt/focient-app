'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Award,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertCircle,
  X,
  Search,
  TrendingUp,
} from 'lucide-react';
import { authClient } from '../../../../lib/auth-client';

interface SubscriberRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: 'FREE' | 'FOUNDERS_PASS' | 'PRO_MONTHLY';
  founderPassClaimNumber: number | null;
  status: string;
  expiresAt: string | null;
  isPaid: boolean;
  createdAt: string;
}

interface SubscriptionData {
  success: boolean;
  quota: {
    claimed: number;
    maxQuota: number;
    remaining: number;
    percentageClaimed: number;
  };
  distribution: {
    totalUsers: number;
    freeCount: number;
    freePercentage: number;
    foundersPassCount: number;
    foundersPassPercentage: number;
    proMonthlyCount: number;
    proMonthlyPercentage: number;
    totalPaidCount: number;
    conversionRate: number;
    churnRate: number;
  };
  subscribers: SubscriberRecord[];
}

export default function SubscriptionsDashboard() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Override Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SubscriberRecord | null>(null);
  const [targetTier, setTargetTier] = useState<'FREE' | 'FOUNDERS_PASS' | 'PRO_MONTHLY'>('FOUNDERS_PASS');
  const [extensionDays, setExtensionDays] = useState('30');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSubscriptions = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const token = authClient.getToken();
      const res = await fetch('/api/admin/subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const openOverrideModal = (user: SubscriberRecord) => {
    setSelectedUser(user);
    setTargetTier(user.tier === 'FREE' ? 'FOUNDERS_PASS' : user.tier);
    setExtensionDays('30');
    setAdminNote('Verifikasi Manual Transfer Bank');
    setIsModalOpen(true);
  };

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const token = authClient.getToken();
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          tier: targetTier,
          extensionDays: Number(extensionDays),
          adminNote,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Lisensi untuk ${selectedUser.name} berhasil diperbarui ke ${targetTier}!`);
        setIsModalOpen(false);
        fetchSubscriptions();
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Failed to override subscription:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Mengambil Status Lisensi & Metrik Komersial FoCient...
        </p>
      </div>
    );
  }

  const { quota, distribution, subscribers } = data || {
    quota: { claimed: 0, maxQuota: 50, remaining: 50, percentageClaimed: 0 },
    distribution: {
      totalUsers: 0,
      freeCount: 0,
      freePercentage: 0,
      foundersPassCount: 0,
      foundersPassPercentage: 0,
      proMonthlyCount: 0,
      proMonthlyPercentage: 0,
      totalPaidCount: 0,
      conversionRate: 0,
      churnRate: 0,
    },
    subscribers: [],
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || sub.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-8">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono text-[10px] font-bold">
              MODUL 2
            </span>
            <span className="text-xs font-mono text-slate-400">
              COMMERCIAL VALIDATION & LICENSE OVERRIDES
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Status Langganan & Metrik Komersial
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manajemen alokasi kuota Founder’s Pass, konversi akun berbayar, dan aksi override manual pembayaran bank.
          </p>
        </div>

        <button
          onClick={() => fetchSubscriptions(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Highlighted Feature: Founder’s Pass Quota Tracker */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-900 border border-amber-700/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Pelacak Kuota Founder’s Pass (Komersial Awal)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Klaim Berjalan: <span className="text-amber-400 font-mono">{quota.claimed}</span> / {quota.maxQuota} Lisensi
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1.5 leading-relaxed">
              Alokasi terbatas 50 kursi lisensi seumur hidup (lifetime) untuk validasi pasar awal. Tersisa{' '}
              <strong className="text-slate-200 font-mono">{quota.remaining} slot</strong> sebelum skema berpindah ke Pro Monthly sepenuhnya.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 shrink-0">
            <div>
              <div className="text-[11px] font-mono text-slate-400">Status Alokasi</div>
              <div className="text-2xl font-bold font-mono text-amber-300">
                {quota.percentageClaimed}% Terklaim
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 flex items-center justify-center font-mono text-xs font-bold text-amber-300">
              {quota.remaining}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>{quota.claimed} Lisensi Terdaftar</span>
            <span>Kapasitas Batas {quota.maxQuota} Lisensi</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-700 shadow-md shadow-amber-500/30"
              style={{ width: `${Math.min(100, quota.percentageClaimed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Commercial Breakdown Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Paid Users */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Pengguna Berbayar</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-white mb-1">
            {distribution.totalPaidCount}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {distribution.foundersPassCount} Founder’s Pass + {distribution.proMonthlyCount} Pro Monthly
          </p>
        </div>

        {/* Metric 2: Free Tier Accounts */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Akun Free Tier</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-white mb-1">
            {distribution.freeCount}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {distribution.freePercentage}% dari total {distribution.totalUsers} akun
          </p>
        </div>

        {/* Metric 3: Conversion Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Tingkat Konversi Berbayar</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mb-1">
            {distribution.conversionRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Komersialisasi Terarah</span>
          </div>
        </div>

        {/* Metric 4: Churn Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Tingkat Churn</span>
            <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-violet-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-white mb-1">
            {distribution.churnRate}%
          </div>
          <p className="text-xs text-slate-400 font-mono">
            0% pada Founder’s Pass (Lifetime)
          </p>
        </div>
      </div>

      {/* Subscription List & Manual Override Actions Table */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Daftar Pengguna & Kendali Lisensi Langganan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik tombol override untuk mengubah status langganan secara instan setelah konfirmasi transfer bank manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-48 sm:w-56 font-sans"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="ALL">Semua Tier</option>
              <option value="FOUNDERS_PASS">Founder’s Pass</option>
              <option value="PRO_MONTHLY">Pro Monthly</option>
              <option value="FREE">Free Tier</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">Nama Pengguna</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Tier Lisensi</th>
                <th className="py-3 px-3">Masa Aktif</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-200 whitespace-nowrap">
                    {sub.name}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {sub.email}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {sub.tier === 'FOUNDERS_PASS' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono text-[10px] font-bold">
                        <Award className="w-3 h-3" />
                        Founder’s Pass #{sub.founderPassClaimNumber || '-'}
                      </span>
                    ) : sub.tier === 'PRO_MONTHLY' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[10px] font-bold">
                        <CreditCard className="w-3 h-3" />
                        Pro Monthly
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
                        Free Tier
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {sub.tier === 'FOUNDERS_PASS'
                      ? 'Seumur Hidup (Lifetime)'
                      : sub.expiresAt
                      ? new Date(sub.expiresAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Standar'}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        sub.status === 'Aktif'
                          ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/70 border border-rose-800 text-rose-300'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openOverrideModal(sub)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-600/40 text-[11px] font-medium transition-colors inline-flex items-center gap-1.5"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Override Lisensi</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Override Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Manual License Override</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Pengguna Terpilih</label>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                  <div className="font-semibold text-slate-200">{selectedUser.name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{selectedUser.email}</div>
                  <div className="text-[10px] text-indigo-300 font-mono mt-1">
                    Status saat ini: {selectedUser.tier}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilih Lisensi / Subscription Tier
                </label>
                <select
                  value={targetTier}
                  onChange={(e) => setTargetTier(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="FOUNDERS_PASS">Founder’s Pass (Akses Seumur Hidup & Klaim Terbatas)</option>
                  <option value="PRO_MONTHLY">Pro Monthly (Langganan Berulang Bulanan)</option>
                  <option value="FREE">Free Tier (Gratis Standar)</option>
                </select>
              </div>

              {targetTier === 'PRO_MONTHLY' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Durasi Tambahan Masa Aktif
                  </label>
                  <select
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="30">+30 Hari (1 Bulan)</option>
                    <option value="60">+60 Hari (2 Bulan)</option>
                    <option value="90">+90 Hari (1 Kuartal)</option>
                    <option value="365">+365 Hari (1 Tahun)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Catatan Admin / Referensi Transaksi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bukti Transfer BCA Ref#9281938"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Terapkan Override Instan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
