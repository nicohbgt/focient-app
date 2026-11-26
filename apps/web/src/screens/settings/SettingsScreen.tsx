'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFocient, FocusType, resolveCategoryFocusType } from '../../state/focient-store.js';
import {
  CheckIcon,
  CheckCircleIcon,
  TrashIcon,
  AlertTriangleIcon,
  TagIcon,
  TargetIcon,
  BellIcon,
  ActivityIcon,
  SunIcon,
  MoonIcon,
} from '../../components/icons/index.js';
import { calculateCapacityMinutes, WeekStartDay } from '../../lib/date-utils.js';
import { TimePicker24 } from '../../components/primitive/TimePicker24.js';
import { getAvatarInitial } from '../../lib/utils.js';
import { supabase } from '../../lib/supabase.js';

export const SettingsScreen: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    categories,
    addCategory,
    removeCategory,
    dbSyncStatus,
    refreshTasksFromDb,
    logout,
    showToast,
    updateSettings,
    loadSettingsFromDb,
    pwaPermission,
    requestPwaPermission,
    triggerWebPushTest,
    selectedRhythm,
    setSelectedRhythm,
    selectedStyle,
    restMinutesPerTask,
    quietHourStart,
    quietHourEnd,
    quietHourEnabled,
    setQuietHours,
    weekStartDay,
    setWeekStartDay,
  } = useFocient();

  // Active sub-navigation section inside settings
  const [activeSection, setActiveSection] = useState<
    'profile' | 'rhythm' | 'categories' | 'notifications' | 'security'
  >('profile');

  // Form states initialized from user / settings
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [roleArchetype, setRoleArchetype] = useState(user?.roleArchetype || user?.occupancy || 'General');
  const [startWorkTime, setStartWorkTime] = useState(user?.workHourStart || '');
  const [endWorkTime, setEndWorkTime] = useState(user?.workHourEnd || '');
  const [dailyCapacityMinutes, setDailyCapacityMinutes] = useState(user?.dailyCapacityMinutes || 480);
  const [restTimePerTask, setRestTimePerTask] = useState<number>(() => user?.restTimePerTask || restMinutesPerTask || 10);
  const [isCustomRest, setIsCustomRest] = useState(false);
  const [customRestInput, setCustomRestInput] = useState('');
  const [workingRhythm, setWorkingRhythm] = useState<string>(() => user?.workingRhythm || selectedRhythm || 'Steady Pacer');
  const [schedulingStyle, setSchedulingStyle] = useState<string>(() => user?.schedulingStyle || selectedStyle || 'Structured');
  const [selectedWeekStart, setSelectedWeekStart] = useState<WeekStartDay>(() => (user?.weekStartDay || weekStartDay || 'monday') as WeekStartDay);

  // Notification Preferences
  const [focusReminders, setFocusReminders] = useState(true);
  const [capacityAlerts, setCapacityAlerts] = useState(true);
  const [rippleSuggestions, setRippleSuggestions] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('21:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  // New Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2563EB');
  const [newCatFocusType, setNewCatFocusType] = useState<FocusType>('Medium');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isPushTesting, setIsPushTesting] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  // Check URL parameters for successful Google OAuth link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('synced') === 'google') {
        showToast(
          language === 'id'
            ? 'Akun Google berhasil ditautkan! Foto profil dan SSO kini aktif.'
            : 'Google account linked successfully! Profile picture and SSO are now active.',
          'success'
        );
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, [language, showToast]);

  const handleSyncGoogle = async () => {
    setIsSyncingGoogle(true);
    try {
      const redirectUri = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?target=/settings`
        : '/auth/callback?target=/settings';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err: any) {
      console.error('Failed to link Google account:', err);
      showToast(
        language === 'id'
          ? 'Gagal menghubungkan dengan Google. Silakan coba lagi.'
          : 'Failed to connect Google account. Please try again.',
        'warning'
      );
      setIsSyncingGoogle(false);
    }
  };

  // Loading & Autosave states
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSyncing, setIsSyncing] = useState(false);
  const isLoadedRef = React.useRef(false);
  const initialUserIdRef = React.useRef<string | null>(null);

  // Synchronization ref: always mirrors the latest user inputs synchronously
  const settingsStateRef = React.useRef({
    name,
    roleArchetype,
    startWorkTime,
    endWorkTime,
    restTimePerTask,
    workingRhythm,
    schedulingStyle,
    selectedWeekStart,
    quietHoursStart,
    quietHoursEnd,
    focusReminders,
    capacityAlerts,
    rippleSuggestions,
    dailySummary,
  });

  const lastSavedSnapshotRef = React.useRef<string | null>(null);

  const getSettingsSnapshot = useCallback(() => {
    return JSON.stringify({
      name,
      roleArchetype,
      startWorkTime,
      endWorkTime,
      restTimePerTask,
      workingRhythm,
      schedulingStyle,
      selectedWeekStart,
      quietHoursStart,
      quietHoursEnd,
      focusReminders,
      capacityAlerts,
      rippleSuggestions,
      dailySummary,
    });
  }, [
    name,
    roleArchetype,
    startWorkTime,
    endWorkTime,
    restTimePerTask,
    workingRhythm,
    schedulingStyle,
    selectedWeekStart,
    quietHoursStart,
    quietHoursEnd,
    focusReminders,
    capacityAlerts,
    rippleSuggestions,
    dailySummary,
  ]);

  // Keep settingsStateRef in sync with React state
  settingsStateRef.current = {
    name,
    roleArchetype,
    startWorkTime,
    endWorkTime,
    restTimePerTask,
    workingRhythm,
    schedulingStyle,
    selectedWeekStart,
    quietHoursStart,
    quietHoursEnd,
    focusReminders,
    capacityAlerts,
    rippleSuggestions,
    dailySummary,
  };

  // Sync state ONLY on initial load or if authenticated user changes (prevents autosave store updates from reverting inputs)
  useEffect(() => {
    if (user && (!isLoadedRef.current || initialUserIdRef.current !== user.id)) {
      initialUserIdRef.current = user.id;
      const loadedName = user.name || '';
      const loadedRole = user.roleArchetype || user.occupancy || 'General';
      const loadedStart = user.workHourStart || '09:00';
      const loadedEnd = user.workHourEnd || '17:00';
      const loadedCapacity = user.dailyCapacityMinutes || 480;
      const loadedRest = user.restTimePerTask || restMinutesPerTask || 10;
      const loadedRhythm = user.workingRhythm || selectedRhythm || 'Steady Pacer';
      const loadedStyle = user.schedulingStyle || selectedStyle || 'Structured';
      const loadedQuietStart = user.quietHourStart || quietHourStart || '22:00';
      const loadedQuietEnd = user.quietHourEnd || quietHourEnd || '07:00';
      const loadedWeekStart = (user.weekStartDay === 'sunday' || user.weekStartDay === 'monday') ? user.weekStartDay : (weekStartDay || 'monday');

      setName(loadedName);
      setRoleArchetype(loadedRole);
      setStartWorkTime(loadedStart);
      setEndWorkTime(loadedEnd);
      setDailyCapacityMinutes(loadedCapacity);
      setRestTimePerTask(loadedRest);
      setWorkingRhythm(loadedRhythm);
      setSchedulingStyle(loadedStyle);
      setQuietHoursStart(loadedQuietStart);
      setQuietHoursEnd(loadedQuietEnd);
      setSelectedWeekStart(loadedWeekStart);

      // Snapshot initialized to strictly match initial state: prevents any automatic PUT on page load!
      lastSavedSnapshotRef.current = JSON.stringify({
        name: loadedName,
        roleArchetype: loadedRole,
        startWorkTime: loadedStart,
        endWorkTime: loadedEnd,
        restTimePerTask: loadedRest,
        workingRhythm: loadedRhythm,
        schedulingStyle: loadedStyle,
        selectedWeekStart: loadedWeekStart,
        quietHoursStart: loadedQuietStart,
        quietHoursEnd: loadedQuietEnd,
        focusReminders: true,
        capacityAlerts: true,
        rippleSuggestions: true,
        dailySummary: true,
      });

      isLoadedRef.current = true;
    }
  }, [user?.id]);

  // Resilient Coalescing Autosave Controller
  const isSavingRef = React.useRef(false);
  const hasQueuedChangeRef = React.useRef(false);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const executeSave = useCallback(async () => {
    if (!isLoadedRef.current) return;
    if (isSavingRef.current) {
      hasQueuedChangeRef.current = true;
      return;
    }

    isSavingRef.current = true;
    hasQueuedChangeRef.current = false;
    setAutoSaveStatus('saving');

    const snap = settingsStateRef.current;
    try {
      setQuietHours(snap.quietHoursStart, snap.quietHoursEnd, true);
      await updateSettings(
        {
          name: snap.name,
          roleArchetype: snap.roleArchetype,
          occupancy: snap.roleArchetype,
          workingRhythm: snap.workingRhythm,
          schedulingStyle: snap.schedulingStyle,
          startWorkTime: snap.startWorkTime,
          endWorkTime: snap.endWorkTime,
          dailyCapacityMinutes: calculateCapacityMinutes(snap.startWorkTime, snap.endWorkTime),
          restTimePerTask: snap.restTimePerTask,
          weekStartDay: snap.selectedWeekStart,
          quietHourStart: snap.quietHoursStart,
          quietHourEnd: snap.quietHoursEnd,
          preferences: {
            focusReminders: snap.focusReminders,
            capacityAlerts: snap.capacityAlerts,
            rippleSuggestions: snap.rippleSuggestions,
            dailySummary: snap.dailySummary,
            quietHoursStart: snap.quietHoursStart,
            quietHoursEnd: snap.quietHoursEnd,
          },
        },
        { silent: true }
      );
      // Update saved snapshot on successful sync
      lastSavedSnapshotRef.current = JSON.stringify({
        name: snap.name,
        roleArchetype: snap.roleArchetype,
        startWorkTime: snap.startWorkTime,
        endWorkTime: snap.endWorkTime,
        restTimePerTask: snap.restTimePerTask,
        workingRhythm: snap.workingRhythm,
        schedulingStyle: snap.schedulingStyle,
        selectedWeekStart: snap.selectedWeekStart,
        quietHoursStart: snap.quietHoursStart,
        quietHoursEnd: snap.quietHoursEnd,
        focusReminders: snap.focusReminders,
        capacityAlerts: snap.capacityAlerts,
        rippleSuggestions: snap.rippleSuggestions,
        dailySummary: snap.dailySummary,
      });

      setAutoSaveStatus('saved');
      setTimeout(() => {
        setAutoSaveStatus((curr) => (curr === 'saved' ? 'idle' : curr));
      }, 1200);
    } catch {
      setAutoSaveStatus('error');
    } finally {
      isSavingRef.current = false;
      // If user modified settings while save was in-flight, flush immediately!
      if (hasQueuedChangeRef.current) {
        hasQueuedChangeRef.current = false;
        executeSave();
      }
    }
  }, [updateSettings, setQuietHours]);

  const scheduleAutoSave = useCallback((immediate = false) => {
    if (!isLoadedRef.current) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (immediate) {
      executeSave();
    } else {
      debounceTimerRef.current = setTimeout(executeSave, 200);
    }
  }, [executeSave]);

  // Autosave trigger for changes across all settings fields (strictly skips if values did not change)
  useEffect(() => {
    if (!isLoadedRef.current) return;
    const currentSnapshot = getSettingsSnapshot();
    if (lastSavedSnapshotRef.current === null) {
      lastSavedSnapshotRef.current = currentSnapshot;
      return;
    }
    // Strict guard: DO NOT trigger autosave if current fields match last saved snapshot
    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }
    scheduleAutoSave(false);
  }, [getSettingsSnapshot, scheduleAutoSave]);

  // Immediate save handlers for direct click actions (Week Start Day & Rhythm)
  const handleSelectWeekStart = (day: WeekStartDay) => {
    setSelectedWeekStart(day);
    setWeekStartDay(day);
    settingsStateRef.current.selectedWeekStart = day;
    scheduleAutoSave(true);
  };

  const handleSelectRhythm = (rhythmId: string) => {
    setWorkingRhythm(rhythmId);
    setSelectedRhythm(rhythmId);
    settingsStateRef.current.workingRhythm = rhythmId;
    scheduleAutoSave(true);
  };

  // Add Category Handler
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsAddingCat(true);
    try {
      const newId = `cat-${Date.now()}`;
      addCategory({
        id: newId,
        name: newCatName.trim(),
        colorHex: newCatColor,
        focusType: newCatFocusType,
        isDefault: false,
      });

      // Persist to PostgreSQL
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          colorToken: newCatColor,
          colorHex: newCatColor,
          focusType: newCatFocusType,
        }),
      });

      setNewCatName('');
      setNewCatFocusType('Medium');
      showToast(
        language === 'id' ? 'Kategori berhasil ditambahkan' : 'Category added successfully',
        'success'
      );
    } catch {
      showToast(
        language === 'id' ? 'Gagal menambah kategori' : 'Failed to add category',
        'error'
      );
    } finally {
      setIsAddingCat(false);
    }
  };

  // Remove Category Handler
  const handleDeleteCategory = async (id: string) => {
    removeCategory(id);
    try {
      await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      showToast(
        language === 'id' ? 'Kategori dihapus' : 'Category removed',
        'info'
      );
    } catch {
      // Local removal already executed
    }
  };

  // Manual Refresh Database
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await refreshTasksFromDb();
      await loadSettingsFromDb();
      showToast(
        language === 'id' ? 'Data berhasil disinkronkan dari database' : 'Data synchronized from database',
        'success'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const occupancyOptions = [
    { id: 'General', labelEn: 'General', labelId: 'Umum' },
    { id: 'Professional', labelEn: 'Professional', labelId: 'Profesional' },
    { id: 'Entrepreneur', labelEn: 'Entrepreneur', labelId: 'Wirausaha' },
    { id: 'Student', labelEn: 'Student', labelId: 'Pelajar / Mahasiswa' },
  ];

  const rhythmOptions = [
    {
      id: 'Early Bird',
      titleEn: 'Early Bird',
      titleId: 'Early Bird',
      badge: '07:00 - 12:00',
      descEn: 'Most alert and focused in the morning. Great for tackling high-priority tasks early.',
      descId: 'Paling berenergi dan fokus di pagi hari. Cocok untuk menyelesaikan tugas utama.',
      icon: <SunIcon size="sm" />,
    },
    {
      id: 'Steady Pacer',
      titleEn: 'Steady Pacer',
      titleId: 'Steady Pacer',
      badge: '09:00 - 15:00',
      descEn: 'Consistent energy throughout the workday with regular short pauses to stay fresh.',
      descId: 'Energi stabil sepanjang jam kerja dengan jeda istirahat teratur agar tetap segar.',
      icon: <ActivityIcon size="sm" />,
    },
    {
      id: 'Night Owl',
      titleEn: 'Night Owl',
      titleId: 'Night Owl',
      badge: '18:00 - 00:00',
      descEn: 'Peak focus in late afternoon and evening when interruptions decline and things quiet down.',
      descId: 'Paling fokus di sore atau malam hari saat suasana lebih hening dan minim gangguan.',
      icon: <MoonIcon size="sm" />,
    },
  ];

  const schedulingStyleOptions = [
    {
      id: 'Structured',
      titleEn: 'Structured',
      titleId: 'Terstruktur',
      descEn: 'Deep work first: high-focus tasks clustered early in peak hours. You maintain full freedom to set any rest buffer per task.',
      descId: 'Fokus utama di awal: tugas penting dikelompokkan di awal jam puncak. Kamu bebas mengatur jeda istirahat per tugas tanpa batas.',
    },
    {
      id: 'Flexible',
      titleEn: 'Flexible',
      titleId: 'Fleksibel',
      descEn: 'Spaced pacing: balances heavy and light tasks across the day with complete control over your rest buffers.',
      descId: 'Ritme mengalir: tugas berat dan ringan diselingi secara seimbang sepanjang hari dengan kontrol penuh atas durasi jeda istirahatmu.',
    },
  ];

  const categoryColorPresets = [
    { hex: '#2563EB', nameEn: 'Ocean Blue', nameId: 'Biru Samudera' },
    { hex: '#0284C7', nameEn: 'Sky Blue', nameId: 'Biru Langit' },
    { hex: '#0D9488', nameEn: 'Teal', nameId: 'Hijau Toska' },
    { hex: '#059669', nameEn: 'Emerald', nameId: 'Hijau Zamrud' },
    { hex: '#7C3AED', nameEn: 'Royal Purple', nameId: 'Ungu' },
    { hex: '#4F46E5', nameEn: 'Indigo', nameId: 'Nila' },
    { hex: '#DB2777', nameEn: 'Pink', nameId: 'Merah Muda' },
    { hex: '#E11D48', nameEn: 'Rose', nameId: 'Mawar' },
    { hex: '#DC2626', nameEn: 'Crimson Red', nameId: 'Merah' },
    { hex: '#D97706', nameEn: 'Amber', nameId: 'Kuning Kunyit' },
    { hex: '#B45309', nameEn: 'Warm Terracotta', nameId: 'Cokelat Hangat' },
    { hex: '#475569', nameEn: 'Slate Grey', nameId: 'Abu-abu Slate' },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-fade-in max-w-6xl mx-auto w-full font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'id' ? 'Pengaturan Ruang Kerja' : 'Workspace Settings'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'id'
              ? 'Kelola profil, ritme fokus, batas kapasitas sehat, kategori, dan preferensi notifikasi Anda.'
              : 'Manage your profile, focus rhythm, healthy capacity boundaries, categories, and notification preferences.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {autoSaveStatus === 'saving' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>{language === 'id' ? 'Menyimpan otomatis...' : 'Autosaving...'}</span>
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 animate-fade-in">
              {language === 'id' ? 'Tersimpan otomatis' : 'Autosaved'}
            </span>
          )}
          {autoSaveStatus === 'idle' && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
              {language === 'id' ? 'Tersimpan otomatis' : 'Autosaved'}
            </span>
          )}
          {autoSaveStatus === 'error' && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 animate-fade-in">
              {language === 'id' ? 'Gagal menyimpan' : 'Save failed'}
            </span>
          )}
        </div>
      </div>

      {/* Main Settings Layout: Left Nav Tabs + Right Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sub-nav Navigation: Horizontal scrollable pills on Mobile (< md), vertical sidebar on Desktop (>= md) */}
        <div className="md:col-span-1 flex flex-row md:flex-col gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-2 md:pb-0 touch-pan-x">
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full text-left ${
              activeSection === 'profile'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <TargetIcon size="xs" />
            <span>{language === 'id' ? 'Profil & Peran' : 'Profile & Role'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('rhythm')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full text-left ${
              activeSection === 'rhythm'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <ActivityIcon size="xs" />
            <span>{language === 'id' ? 'Ritme & Kapasitas' : 'Rhythm & Capacity'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('categories')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full text-left ${
              activeSection === 'categories'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <TagIcon size="xs" />
            <span>{language === 'id' ? 'Kelola Kategori' : 'Categories'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('notifications')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full text-left ${
              activeSection === 'notifications'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <BellIcon size="xs" />
            <span>{language === 'id' ? 'Notifikasi' : 'Notifications'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('security')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full text-left ${
              activeSection === 'security'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <CheckCircleIcon size="xs" />
            <span>{language === 'id' ? 'Akun & Bahasa' : 'Account & Language'}</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-3 space-y-6">
          {/* ---------------- SECTION 1: PROFIL PENGGUNA ---------------- */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  {language === 'id' ? 'Profil Pengguna' : 'User Profile'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'id'
                    ? 'Atur nama dan peran kerjamu.'
                    : 'Set up your name and work role.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prof-name">
                    {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
                  </label>
                  <input
                    id="prof-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prof-email">
                    {language === 'id' ? 'Alamat Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <input
                      id="prof-email"
                      type="email"
                      value={email}
                      disabled
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500 cursor-not-allowed"
                    />
                    {user?.provider === 'google' && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                        Google
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prof-role">
                    {language === 'id' ? 'Profesi / Peran' : 'Occupancy / Role'}
                  </label>
                  <select
                    id="prof-role"
                    value={roleArchetype}
                    onChange={(e) => setRoleArchetype(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {occupancyOptions.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {language === 'id' ? occ.labelId : occ.labelEn}
                      </option>
                    ))}
                    {roleArchetype && !occupancyOptions.some((o) => o.id === roleArchetype) && (
                      <option value={roleArchetype}>{roleArchetype}</option>
                    )}
                  </select>
                </div>

                {/* Google Account Linking / Sync Status */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    {language === 'id' ? 'Tautan & Sinkronisasi Akun' : 'Account Link & Sync'}
                  </label>
                  {user?.provider === 'google' ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                            <span>Google SSO</span>
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-300">
                              {language === 'id' ? 'Tersinkronisasi' : 'Connected'}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            {language === 'id'
                              ? 'Foto profil dan autentikasi tersinkronisasi otomatis dengan akun Google kamu.'
                              : 'Profile picture and authentication are automatically synced with your Google account.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {language === 'id' ? 'Sinkronisasi Akun Google' : 'Sync with Google Account'}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {language === 'id'
                              ? 'Tautkan akun Google untuk menyinkronkan foto profil Google dan mengaktifkan login instan SSO.'
                              : 'Link your Google account to sync your Google profile picture and enable instant SSO.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncGoogle}
                        disabled={isSyncingGoogle}
                        className="h-8.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
                      >
                        {isSyncingGoogle ? (
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        )}
                        <span>{language === 'id' ? 'Hubungkan Google' : 'Connect Google'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SECTION 2: RITME & KAPASITAS ---------------- */}
          {activeSection === 'rhythm' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  {language === 'id' ? 'Ritme Kerja dan Kapasitas' : 'Working Rhythm and Capacity'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'id'
                    ? 'Batas kapasitas maksimal harian menerapkan prinsip anti-burnout FoCient.'
                    : 'Maximum daily capacity enforces FoCient anti-burnout principles.'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Calculated Capacity from Schedule Window */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      {language === 'id' ? 'Kapasitas Kerja Harian Terhitung' : 'Calculated Daily Work Capacity'}
                    </label>
                    <span className="text-xs font-extrabold text-blue-700 tabular-nums">
                      {(calculateCapacityMinutes(startWorkTime, endWorkTime) / 60).toFixed(1).replace('.0', '')} {language === 'id' ? 'Jam' : 'Hours'} ({calculateCapacityMinutes(startWorkTime, endWorkTime)} {language === 'id' ? 'menit' : 'mins'})
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>
                      {language === 'id'
                        ? 'Kapasitas harian dihitung secara otomatis dari jam mulai dan selesai kerja Anda tanpa batas artifisial.'
                        : 'Calculated dynamically from your configured working hours without artificial limits.'}
                    </span>
                    <span className="font-bold text-blue-700 ml-2 shrink-0">
                      {startWorkTime || '00:00'} - {endWorkTime || '00:00'}
                    </span>
                  </div>
                </div>

                {/* Work Hours Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="start-work">
                      {language === 'id' ? 'Jam Mulai Kerja' : 'Start Work Time'}
                    </label>
                    <TimePicker24
                      id="start-work"
                      value={startWorkTime}
                      onChange={(val) => setStartWorkTime(val)}
                      language={language}
                      size="lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="end-work">
                      {language === 'id' ? 'Jam Selesai Kerja' : 'End Work Time'}
                    </label>
                    <TimePicker24
                      id="end-work"
                      value={endWorkTime}
                      onChange={(val) => setEndWorkTime(val)}
                      language={language}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Quiet Hours (Jam Tenang) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-semibold text-slate-800">
                      {language === 'id' ? 'Jam Tenang (Quiet Hours)' : 'Quiet Hours'}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {language === 'id'
                        ? 'Rentang jam istirahat terkunci agar tidak ada tugas yang dapat ditambahkan.'
                        : 'Locked rest window where no tasks can be scheduled to protect your rest.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'id' ? 'Mulai Jam Tenang' : 'Quiet Start Time'}
                      </label>
                      <TimePicker24
                        value={quietHoursStart}
                        onChange={(val) => setQuietHoursStart(val)}
                        language={language}
                        size="lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'id' ? 'Selesai Jam Tenang' : 'Quiet End Time'}
                      </label>
                      <TimePicker24
                        value={quietHoursEnd}
                        onChange={(val) => setQuietHoursEnd(val)}
                        language={language}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Rest Buffer (0, 5, 10, 15, 30, 45, custom) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800">
                        {language === 'id' ? 'Jeda Istirahat Otomatis Per Tugas' : 'Automatic Rest Buffer Per Task'}
                      </label>
                      <p className="text-[11px] text-slate-500">
                        {language === 'id'
                          ? 'Waktu jeda antar tugas untuk pemulihan kognitif dan mencegah kelelahan.'
                          : 'Buffer pause between tasks for cognitive recovery and burnout prevention.'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 tabular-nums">
                      {restTimePerTask} {language === 'id' ? 'menit' : 'mins'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {[0, 5, 10, 15, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setRestTimePerTask(mins);
                          setIsCustomRest(false);
                          setCustomRestInput('');
                        }}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all tabular-nums ${
                          !isCustomRest && restTimePerTask === mins
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomRest(true);
                        if (!customRestInput && restTimePerTask) {
                          setCustomRestInput(String(restTimePerTask));
                        }
                      }}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        isCustomRest
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {language === 'id' ? 'Kustom' : 'Custom'}
                    </button>
                  </div>
                  {isCustomRest && (
                    <div className="flex items-center gap-2 pt-1 animate-fade-in">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        autoFocus
                        value={customRestInput}
                        onChange={(e) => {
                          setCustomRestInput(e.target.value);
                          const parsed = parseInt(e.target.value, 10);
                          if (!isNaN(parsed) && parsed >= 0) {
                            setRestTimePerTask(parsed);
                          }
                        }}
                        placeholder={language === 'id' ? 'Masukkan jeda (menit)' : 'Enter buffer (minutes)'}
                        className="w-44 h-9 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        {language === 'id' ? 'Menit' : 'Minutes'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Daily Energy Rhythm Archetype (Aligned with Step 2) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      {language === 'id' ? 'Ritme Energi Harian' : 'Daily Energy Rhythm'}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {language === 'id'
                        ? 'Puncak fokus kognitif yang selaras dengan ritme biologis harian Anda.'
                        : 'Your biological peak energy window for deep cognitive work.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {rhythmOptions.map((r) => {
                      const isSelected = workingRhythm === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleSelectRhythm(r.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={isSelected ? 'text-blue-600' : 'text-slate-500'}>
                                  {r.icon}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {language === 'id' ? r.titleId : r.titleEn}
                                </span>
                              </div>
                              {isSelected && <CheckCircleIcon size="xs" className="text-blue-600" />}
                            </div>

                            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full mb-2">
                              {r.badge}
                            </span>

                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {language === 'id' ? r.descId : r.descEn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduling Style (Aligned with Step 2) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      {language === 'id' ? 'Gaya Penjadwalan' : 'Scheduling Style'}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {language === 'id'
                        ? 'Pendekatan alokasi waktu kerja yang paling sesuai dengan preferensi Anda.'
                        : 'How you prefer to sequence and structure your working blocks.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {schedulingStyleOptions.map((s) => {
                      const isSelected = schedulingStyle === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSchedulingStyle(s.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900 mb-1">
                              {language === 'id' ? s.titleId : s.titleEn}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {language === 'id' ? s.descId : s.descEn}
                            </p>
                          </div>
                          {isSelected && <CheckCircleIcon size="xs" className="text-blue-600 shrink-0 ml-2 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Week Start Day Setting (Awal Pekan) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      {language === 'id' ? 'Hari Awal Pekan' : 'Week Start Day'}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {language === 'id'
                        ? 'Tentukan hari pertama dalam sepekan untuk pemantauan kapasitas dan kalender.'
                        : 'Choose whether your 7-day schedule cycle begins on Monday or Sunday.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectWeekStart('monday')}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                        selectedWeekStart === 'monday'
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 mb-0.5">
                          {language === 'id' ? 'Senin (Sen - Min)' : 'Monday (Mon - Sun)'}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {language === 'id' ? 'Pekan kerja standar (ISO)' : 'Standard work week cycle'}
                        </p>
                      </div>
                      {selectedWeekStart === 'monday' && <CheckCircleIcon size="xs" className="text-blue-600 shrink-0 ml-2 mt-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectWeekStart('sunday')}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                        selectedWeekStart === 'sunday'
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 mb-0.5">
                          {language === 'id' ? 'Minggu (Min - Sab)' : 'Sunday (Sun - Sat)'}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {language === 'id' ? 'Pekan kalender tradisional' : 'Traditional calendar cycle'}
                        </p>
                      </div>
                      {selectedWeekStart === 'sunday' && <CheckCircleIcon size="xs" className="text-blue-600 shrink-0 ml-2 mt-0.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SECTION 3: KELOLA KATEGORI ---------------- */}
          {activeSection === 'categories' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {language === 'id' ? 'Kategori Fokus Harian' : 'Daily Focus Categories'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'id'
                      ? 'Kelola kategori tugas untuk merapikan aktivitas harianmu.'
                      : 'Manage categories to organize your daily activities.'}
                  </p>
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategorySubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">
                    {language === 'id' ? 'Tambah Kategori Baru' : 'Add New Category'}
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder={
                      language === 'id'
                        ? 'Nama Kategori (cth: Research, Client Review)'
                        : 'Category Name (e.g. Research, Client Review)'
                    }
                    className="flex-1 w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isAddingCat}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all shrink-0 disabled:opacity-50"
                  >
                    {isAddingCat ? '...' : language === 'id' ? 'Tambah Kategori' : 'Add Category'}
                  </button>
                </div>

                {/* Color Selection Palette with generous spacing */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600">
                    {language === 'id' ? 'Pilih Warna Kategori' : 'Select Category Color'}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {categoryColorPresets.map((preset) => {
                      const isSelected = newCatColor.toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setNewCatColor(preset.hex)}
                          title={language === 'id' ? preset.nameId : preset.nameEn}
                          className={`w-7 h-7 rounded-full transition-all relative ${
                            isSelected
                              ? 'scale-110 ring-2 ring-offset-2 ring-blue-600 shadow-xs'
                              : 'hover:scale-105 opacity-90 hover:opacity-100 ring-1 ring-black/10'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                          aria-label={preset.nameEn}
                        />
                      );
                    })}

                    {/* Custom Color Input */}
                    <label
                      title={language === 'id' ? 'Pilih warna kustom lainnya' : 'Custom color picker'}
                      className="relative w-7 h-7 rounded-full border-2 border-dashed border-slate-300 hover:border-blue-500 cursor-pointer flex items-center justify-center transition-all hover:scale-105 shrink-0"
                    >
                      <input
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        aria-label={language === 'id' ? 'Pilih warna kustom' : 'Choose custom color'}
                      />
                      <span className="text-xs font-bold text-slate-400">+</span>
                    </label>
                  </div>
                </div>

                {/* Category Intensity Selection */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600">
                    {language === 'id' ? 'Intensitas Fokus Kategori' : 'Category Focus Intensity'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'Low' as FocusType, label: language === 'id' ? 'Rendah' : 'Low', active: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20' },
                      { type: 'Medium' as FocusType, label: language === 'id' ? 'Sedang' : 'Medium', active: 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20' },
                      { type: 'High' as FocusType, label: language === 'id' ? 'Tinggi' : 'High', active: 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20' },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setNewCatFocusType(opt.type)}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-bold text-center transition-all ${
                          newCatFocusType === opt.type ? opt.active : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* List of Real Categories */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  {language === 'id' ? 'Daftar Kategori Aktif' : 'Active Categories'} ({categories.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categories.map((cat) => {
                    const catIntensity = resolveCategoryFocusType(cat);
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.colorHex }}
                          />
                          <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              catIntensity === 'High'
                                ? 'bg-red-50 text-red-600'
                                : catIntensity === 'Low'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-sky-50 text-sky-600'
                            }`}
                          >
                            {catIntensity === 'High'
                              ? (language === 'id' ? 'Tinggi' : 'High')
                              : catIntensity === 'Low'
                              ? (language === 'id' ? 'Rendah' : 'Low')
                              : (language === 'id' ? 'Sedang' : 'Medium')}
                          </span>
                          {cat.isDefault && (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              {language === 'id' ? 'Bawaan' : 'Default'}
                            </span>
                          )}
                        </div>

                        {!cat.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title={language === 'id' ? 'Hapus Kategori' : 'Delete Category'}
                          >
                            <TrashIcon size="xs" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SECTION 4: NOTIFIKASI & JAM TENANG ---------------- */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  {language === 'id' ? 'Preferensi Notifikasi' : 'Notification Preferences'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'id'
                    ? 'Atur pengingat agar kamu tetap fokus tanpa terganggu.'
                    : 'Set up reminders to help you stay focused calmly.'}
                </p>
              </div>

              {/* PWA & Web Push Notification Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      {language === 'id' ? 'Notifikasi PWA & Browser' : 'PWA & Browser Notifications'}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'id'
                        ? 'Pengingat latar belakang untuk desktop dan perangkat mobile PWA.'
                        : 'Background system reminders across desktop and mobile PWA installations.'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      pwaPermission === 'granted'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : pwaPermission === 'denied'
                        ? 'bg-slate-100 text-slate-600 border-slate-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {pwaPermission === 'granted'
                      ? (language === 'id' ? 'Aktif' : 'Active')
                      : pwaPermission === 'denied'
                      ? (language === 'id' ? 'Diblokir' : 'Blocked')
                      : (language === 'id' ? 'Perlu Izin' : 'Needs Permission')}
                  </span>
                </div>

                {pwaPermission === 'granted' ? (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPushTesting}
                      onClick={async () => {
                        setIsPushTesting(true);
                        try {
                          const res = await triggerWebPushTest();
                          showToast(
                            language === 'id'
                              ? res.success
                                ? 'Notifikasi Web Push berhasil dikirim ke OS!'
                                : 'Pengingat uji coba terkirim secara lokal.'
                              : res.success
                              ? 'Web Push test notification sent to OS!'
                              : 'Test notification triggered locally.',
                            'success'
                          );
                        } finally {
                          setIsPushTesting(false);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <BellIcon size="xs" />
                      <span>
                        {isPushTesting
                          ? (language === 'id' ? 'Mengirim...' : 'Sending...')
                          : (language === 'id' ? 'Uji Web Push Latar Belakang' : 'Test Background Push')}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const result = await requestPwaPermission();
                        if (result === 'granted') {
                          showToast(
                            language === 'id'
                              ? 'Notifikasi PWA berhasil diaktifkan!'
                              : 'PWA notifications enabled successfully!',
                            'success'
                          );
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {language === 'id' ? 'Aktifkan Notifikasi Browser / PWA' : 'Enable Browser / PWA Notifications'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="flex items-start justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                  <div className="pr-4">
                    <div className="text-xs font-bold text-slate-800">
                      {language === 'id' ? 'Pengingat Sesi Fokus' : 'Focus Session Reminders'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {language === 'id'
                        ? 'Pengingat ramah saat waktunya mulai tugas biar kamu fokus tenang satu per satu.'
                        : 'Friendly nudge when it is time to start a task, so you can focus on one thing at a time.'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={focusReminders}
                    onChange={(e) => setFocusReminders(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 mt-0.5"
                  />
                </label>

                <label className="flex items-start justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                  <div className="pr-4">
                    <div className="text-xs font-bold text-slate-800">
                      {language === 'id' ? 'Peringatan Beban Kerja' : 'Workload Alerts'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {language === 'id'
                        ? 'Kasih tahu kamu kalau jadwal mulai terlalu padat, supaya bisa istirahat cukup.'
                        : 'Heads-up when your day gets too packed, helping you protect your rest time.'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={capacityAlerts}
                    onChange={(e) => setCapacityAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 mt-0.5"
                  />
                </label>

                <label className="flex items-start justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                  <div className="pr-4">
                    <div className="text-xs font-bold text-slate-800">
                      {language === 'id' ? 'Saran Geser Jadwal Otomatis' : 'Smart Reschedule Suggestions'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {language === 'id'
                        ? 'Bantu atur ulang sisa jadwal dengan rapi saat ada tugas yang mundur.'
                        : 'Easily shift remaining tasks whenever schedules change, with zero hassle.'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={rippleSuggestions}
                    onChange={(e) => setRippleSuggestions(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 mt-0.5"
                  />
                </label>

                <label className="flex items-start justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                  <div className="pr-4">
                    <div className="text-xs font-bold text-slate-800">
                      {language === 'id' ? 'Rangkuman Santai Sore' : 'Daily Evening Recap'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {language === 'id'
                        ? 'Ringkasan singkat hal-hal yang berhasil kamu selesaikan hari ini.'
                        : 'A quick, calm overview of what you achieved today.'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailySummary}
                    onChange={(e) => setDailySummary(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 mt-0.5"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ---------------- SECTION 5: AKUN & KEAMANAN ---------------- */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  {language === 'id' ? 'Akun & Bahasa' : 'Account & Language'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'id'
                    ? 'Atur akun dan bahasa aplikasi.'
                    : 'Manage your account and app language.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {user?.name || 'FoCient User'}
                  </div>
                  <div className="text-[11px] text-slate-500">{user?.email || '-'}</div>
                </div>

                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200 overflow-hidden shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user?.name || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    getAvatarInitial(user?.name)
                  )}
                </div>
              </div>

              {/* Google Account Linking / Sync Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {language === 'id' ? 'Tautan & Sinkronisasi Akun' : 'Account Link & Sync'}
                </label>
                {user?.provider === 'google' ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <span>Google SSO</span>
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-300">
                            {language === 'id' ? 'Tersinkronisasi' : 'Connected'}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          {language === 'id'
                            ? 'Foto profil dan autentikasi tersinkronisasi otomatis dengan akun Google kamu.'
                            : 'Profile picture and authentication are automatically synced with your Google account.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {language === 'id' ? 'Sinkronisasi Akun Google' : 'Sync with Google Account'}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'id'
                            ? 'Tautkan akun Google untuk menyinkronkan foto profil Google dan mengaktifkan login instan SSO.'
                            : 'Link your Google account to sync your Google profile picture and enable instant SSO.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncGoogle}
                      disabled={isSyncingGoogle}
                      className="h-8.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
                    >
                      {isSyncingGoogle ? (
                        <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      )}
                      <span>{language === 'id' ? 'Hubungkan Google' : 'Connect Google'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Language Switcher in Settings */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {language === 'id' ? 'Bahasa Antarmuka' : 'Interface Language'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('id')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      language === 'id'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Bahasa Indonesia (ID)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      language === 'en'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>

              {/* Sign Out Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {language === 'id' ? 'Keluar dari Akun' : 'Sign Out of Account'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors"
                >
                  {language === 'id' ? 'Keluar Akun' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
