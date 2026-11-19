'use client';

import React, { useState } from 'react';
import { useFocient, NotificationCategory } from '../../state/focient-store';
import {
  BellIcon,
  XIcon,
  CheckCircleIcon,
  ClockIcon,
  TargetIcon,
  ActivityIcon,
  SparklesIcon,
  TrashIcon,
  RotateCcwIcon,
} from '../../components/icons';

export const NotificationCenterModal: React.FC = () => {
  const {
    notifications,
    isNotificationPanelOpen,
    closeNotificationPanel,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    pwaPermission,
    requestPwaPermission,
    triggerTaskReminder,
    triggerTaskLeadReminder,
    triggerTop3DailyReminder,
    triggerDailyQuietTimeSummary,
    triggerScheduleRecommendation,
    triggerWorkloadAlert,
    triggerDailySummary,
    triggerRestBufferAlert,
    triggerWebPushTest,
    safeNavigate,
    allocatedMinutes,
    user,
    language,
  } = useFocient();

  const [filterCategory, setFilterCategory] = useState<'all' | NotificationCategory>('all');
  const [isTesting, setIsTesting] = useState(false);
  const [isPushTesting, setIsPushTesting] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);

  if (!isNotificationPanelOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filterCategory === 'all') return true;
    return n.category === filterCategory;
  });

  const handleActionClick = (actionUrl?: string, id?: string) => {
    if (id) markNotificationAsRead(id);
    closeNotificationPanel();
    if (!actionUrl) return;

    const lower = actionUrl.toLowerCase();
    if (lower.includes('task')) {
      safeNavigate('tasks');
    } else if (lower.includes('plan')) {
      safeNavigate('plan');
    } else if (lower.includes('resched')) {
      safeNavigate('reschedule');
    } else if (lower.includes('insight')) {
      safeNavigate('insights');
    } else if (lower.includes('setting')) {
      safeNavigate('settings');
    } else if (lower.includes('dashboard')) {
      safeNavigate('dashboard');
    } else {
      safeNavigate('dashboard');
    }
  };

  const handleTestTrigger = async (type: string) => {
    setIsTesting(true);
    try {
      const capacity = user?.dailyCapacityMinutes || 480;
      if (type === 'lead-1h') {
        await triggerTaskLeadReminder('Arrange Meeting', '14:00', 1);
      } else if (type === 'lead-3h') {
        await triggerTaskLeadReminder('Design System Review', '16:00', 3);
      } else if (type === 'lead-6h') {
        await triggerTaskLeadReminder('Sprint Retrospective', '19:00', 6);
      } else if (type === 'top3') {
        await triggerTop3DailyReminder([
          { title: 'Arrange Meeting' },
          { title: 'API Integration' },
          { title: 'Security Audit' },
        ]);
      } else if (type === 'summary') {
        await triggerDailyQuietTimeSummary(4, 30);
      } else if (type === 'workload-high') {
        await triggerWorkloadAlert(95, 460, capacity, 'high');
      } else if (type === 'workload-low') {
        await triggerWorkloadAlert(20, 95, capacity, 'low');
      } else if (type === 'recommendation') {
        await triggerScheduleRecommendation(75, 360, capacity);
      } else if (type === 'rest') {
        await triggerRestBufferAlert(10);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return language === 'id' ? 'Baru saja' : 'Just now';
      if (diffMins < 60) return `${diffMins}m ${language === 'id' ? 'lalu' : 'ago'}`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ${language === 'id' ? 'lalu' : 'ago'}`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ${language === 'id' ? 'lalu' : 'ago'}`;
    } catch {
      return '';
    }
  };

  const getCategoryConfig = (category: NotificationCategory) => {
    switch (category) {
      case 'task':
        return {
          label: language === 'id' ? 'Tugas Fokus' : 'Focus Task',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-600',
        };
      case 'workload':
        return {
          label: language === 'id' ? 'Beban Kerja' : 'Workload',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500',
        };
      case 'summary':
        return {
          label: language === 'id' ? 'Rangkuman' : 'Summary',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-600',
        };
      case 'rest':
      default:
        return {
          label: language === 'id' ? 'Jeda Istirahat' : 'Rest Buffer',
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
          dotClass: 'bg-teal-600',
        };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      {/* Backdrop click dismiss */}
      <div className="absolute inset-0" onClick={closeNotificationPanel} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-md flex flex-col border-l border-slate-200 z-10 animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <BellIcon size="xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'id' ? 'Pusat Pemberitahuan' : 'Notifications'}
                </h3>
                {unreadNotificationCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white tabular-nums">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                title={language === 'id' ? 'Tandai semua telah dibaca' : 'Mark all as read'}
              >
                {language === 'id' ? 'Tandai Dibaca' : 'Mark All Read'}
              </button>
            )}
            <button
              type="button"
              onClick={closeNotificationPanel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close"
            >
              <XIcon size="xs" />
            </button>
          </div>
        </div>

        {/* PWA & Web Push Status Banner */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/40">
          {pwaPermission === 'granted' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold">
                    {language === 'id' ? 'Notifikasi PWA & Browser Aktif' : 'PWA & Push Notifications Active'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                  {language === 'id' ? 'Siap' : 'Ready'}
                </span>
              </div>
              <button
                type="button"
                disabled={isPushTesting}
                onClick={async () => {
                  setIsPushTesting(true);
                  setPushFeedback(null);
                  try {
                    const res = await triggerWebPushTest();
                    setPushFeedback(
                      language === 'id'
                        ? res.success
                          ? 'Notifikasi berhasil dikirim via Web Push latar belakang.'
                          : 'Uji coba terkirim secara lokal.'
                        : res.success
                        ? 'Notification successfully sent via background Web Push.'
                        : 'Test delivered locally.'
                    );
                    setTimeout(() => setPushFeedback(null), 4000);
                  } finally {
                    setIsPushTesting(false);
                  }
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isPushTesting
                    ? (language === 'id' ? 'Mengirim...' : 'Sending...')
                    : (language === 'id' ? 'Uji Notifikasi Web Push' : 'Test Background Push')}
                </span>
              </button>
              {pushFeedback && (
                <div className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center">
                  {pushFeedback}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-blue-900">
                    {language === 'id' ? 'Aktifkan Notifikasi PWA' : 'Enable PWA Notifications'}
                  </h4>
                  <p className="text-[11px] text-blue-700 leading-relaxed mt-0.5">
                    {language === 'id'
                      ? 'Dapatkan pengingat tugas tunggal dan rangkuman harian di desktop maupun perangkat mobile Anda.'
                      : 'Get gentle reminders and workload alerts on desktop and mobile even when backgrounded.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={requestPwaPermission}
                className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center"
              >
                <span>{language === 'id' ? 'Izinkan Notifikasi' : 'Allow Notifications'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Test Triggers (Demo & Verification) */}
        <div className="px-5 py-2.5 border-b border-slate-100">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            {language === 'id' ? 'Uji Coba Notifikasi' : 'Test Notifications'}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('lead-1h')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 transition-colors"
            >
              1 Jam
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('lead-3h')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 transition-colors"
            >
              3 Jam
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('lead-6h')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 transition-colors"
            >
              6 Jam
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('top3')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 transition-colors"
            >
              Top 3
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('summary')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-slate-600 transition-colors"
            >
              {language === 'id' ? 'Rekap Malam' : 'Night Recap'}
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('workload-high')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-600 transition-colors"
            >
              {language === 'id' ? 'Beban Tinggi' : 'High Load'}
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('workload-low')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-600 transition-colors"
            >
              {language === 'id' ? 'Beban Rendah' : 'Low Load'}
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('recommendation')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 transition-colors"
            >
              {language === 'id' ? 'Rekomendasi' : 'Allocation Tip'}
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestTrigger('rest')}
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-slate-600 transition-colors"
            >
              {language === 'id' ? 'Istirahat' : 'Rest'}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
            {[
              { id: 'all', labelEn: 'All', labelId: 'Semua' },
              { id: 'task', labelEn: 'Tasks', labelId: 'Tugas' },
              { id: 'workload', labelEn: 'Workload', labelId: 'Beban' },
              { id: 'summary', labelEn: 'Summary', labelId: 'Rangkuman' },
              { id: 'rest', labelEn: 'Rest', labelId: 'Istirahat' },
            ].map((tab) => {
              const isSelected = filterCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterCategory(tab.id as any)}
                  className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {language === 'id' ? tab.labelId : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <CheckCircleIcon size="sm" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">
                {language === 'id' ? 'Semua Tenang & Seimbang' : 'All Calm & In Rhythm'}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                {language === 'id'
                  ? 'Tidak ada pemberitahuan yang memerlukan perhatian saat ini.'
                  : 'No pending alerts. Pacing is sustainable and on track.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const catConfig = getCategoryConfig(n.category);
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.actionUrl) {
                      handleActionClick(n.actionUrl, n.id);
                    } else if (!n.read) {
                      markNotificationAsRead(n.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    n.actionUrl ? 'cursor-pointer hover:border-blue-300 hover:shadow-xs' : ''
                  } ${
                    !n.read
                      ? 'bg-white border-blue-200/80 shadow-xs ring-1 ring-blue-500/10'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${catConfig.badgeClass}`}
                      >
                        {catConfig.label}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[10px] tabular-nums">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title={language === 'id' ? 'Hapus' : 'Delete'}
                      >
                        <TrashIcon size="xs" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {n.title}
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {n.actionUrl ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(n.actionUrl, n.id);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <span>{n.actionLabel || (language === 'id' ? 'Buka' : 'Open')}</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(n.id);
                        }}
                        className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        {language === 'id' ? 'Tandai telah dibaca' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>{language === 'id' ? 'Standar anti-panik FoCient' : 'FoCient Anti-Panic Standard'}</span>
          <button
            type="button"
            onClick={closeNotificationPanel}
            className="font-bold text-slate-700 hover:text-slate-900"
          >
            {language === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
