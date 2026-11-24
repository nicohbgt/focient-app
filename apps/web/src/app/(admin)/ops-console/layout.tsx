'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  TrendingUp,
  CreditCard,
  Gauge,
  Users,
  Shield,
  LogOut,
  Radio,
  Lock,
  ChevronRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { authClient, UserSession } from '../../../lib/auth-client';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    title: 'Traksi & Retensi',
    href: '/ops-console',
    icon: TrendingUp,
    badge: 'M1',
    description: 'Pertumbuhan, Akuisisi, & Cohort Retensi',
  },
  {
    title: 'Status Langganan & Lisensi',
    href: '/ops-console/subscriptions',
    icon: CreditCard,
    badge: 'M2',
    description: "Founder's Pass, Churn & Commercials",
  },
  {
    title: 'Produktivitas & Adaptabilitas',
    href: '/ops-console/productivity',
    icon: Gauge,
    badge: 'M3',
    description: 'Workload Health, Reschedule & Silent Buffer',
  },
  {
    title: 'Audit & Inspector Pengguna',
    href: '/ops-console/users',
    icon: Users,
    badge: 'M4',
    description: 'Deep Inspection & Manual Action Overrides',
  },
];

export default function OpsConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify session client-side
    const token = authClient.getToken();
    if (!token) {
      router.replace('/404');
      return;
    }

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (!data.user || (data.user.role !== 'SUPERADMIN' && data.user.role !== 'INTERNAL_OPERATOR')) {
          router.replace('/404');
        } else {
          setCurrentUser(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        router.replace('/404');
      });
  }, [router]);

  const handleExitConsole = () => {
    router.push('/today');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm tracking-wide uppercase font-mono text-slate-500">
          Memverifikasi Akses Internal Stealth...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0 select-none backdrop-blur-md">
        {/* Brand & Stealth Security Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                FoCient <span className="text-indigo-400 font-mono text-xs">OPS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ZERO PUBLIC VISIBILITY
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Internal Subsystems
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/ops-console'
                ? pathname === '/ops-console'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <div>
                    <div>{item.title}</div>
                    <div
                      className={`text-[10px] line-clamp-1 font-normal ${
                        isActive ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Session & Fast Exit */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {currentUser?.name || 'Internal Operator'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email}
                </div>
              </div>
            </div>
            <span
              className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                currentUser?.role === 'SUPERADMIN'
                  ? 'bg-violet-950 border border-violet-700 text-violet-300'
                  : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
              }`}
            >
              {currentUser?.role || 'OPERATOR'}
            </span>
          </div>

          <button
            onClick={handleExitConsole}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kembali ke Aplikasi Utama</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0E17] overflow-y-auto">
        {/* Top Operational Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-slate-300">Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-indigo-400 capitalize">
              {pathname === '/ops-console'
                ? 'Traction & Retention'
                : pathname?.replace('/ops-console/', '').replace(/-/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>DB Sync Active</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Internal Stealth RBAC</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
