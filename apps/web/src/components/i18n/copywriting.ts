/**
 * FoCient Design System - Copywriting & Internationalization Dictionary
 *
 * Built upon FoCient's core philosophies:
 * - Focus & Efficiency (cognitive clarity)
 * - Guilt-Free & Anti-Toxic Productivity (no punitive vocabulary like "Terlambat", "Late", "Gagal", "Failed")
 *
 * Supported primary languages:
 * 1. Indonesian (id) - Default
 * 2. English (en)
 */

export type SupportedLocale = 'id' | 'en';

export interface FoCientCopywriting {
  locale: SupportedLocale;
  localeName: string;

  // Actions & Buttons
  actions: {
    apply: string;
    applyAdjustment: string;
    applyNewSchedule: string;
    balanceRhythm: string;
    shiftToNextSlot: string;
    saveToTimeline: string;
    addToToday: string;
    adjust: string;
    edit: string;
    delete: string;
    cancel: string;
    save: string;
    close: string;
    pause: string;
    resume: string;
    complete: string;
    undo: string;
    dismissOrLater: string;
    clear: string;
    showPassword: string;
    hidePassword: string;
    search: string;
  };

  // Status & Priority Badges
  status: {
    inProgress: string;
    topPriority: string;
    priorityRank: (rank: number) => string;
    needsAdjustment: string;
    completed: string;
    markCompleted: (title: string) => string;
    markIncomplete: (title: string) => string;
    subtask: string;
    light: string;
    optimal: string;
    nearCapacity: string;
    fullCapacity: string;
  };

  // Guilt-Free Adaptive Guidance & Rescheduling
  adaptive: {
    rescheduleNotice: string;
    rescheduleDescription: string;
    capacityWarning: string;
    overloadAdvice: string;
    gentleReminder: string;
    focusGuidance: string;
    rescheduleGuidance: string;
  };

  // Daily Capacity Meter & Analytics
  capacity: {
    dailyWorkload: string;
    allocatedVsTotal: (allocated: string, total: string, percent: number) => string;
    formatHoursMins: (hours: number, minutes: number) => string;
    minutesShort: string;
    hoursShort: string;
  };

  // Navigation & Headers
  navigation: {
    todayPlan: string;
    timeline: string;
    tasks: string;
    inbox: string;
    insights: string;
    settings: string;
    searchPlaceholder: string;
    workloadShort: (percent: number) => string;
    notifications: string;
    switchLanguage: string;
    toggleTheme: string;
    sidebarExpand: string;
    sidebarCollapse: string;
  };

  // Card Suite Titles & Placeholders
  cards: {
    singleFocusTitle: string;
    top3Title: string;
    timelineTitle: string;
    adaptiveTitle: string;
    backlogTitle: string;
    completedTitle: string;
    capacityTitle: string;
  };

  // Forms & Inputs
  forms: {
    taskTitleLabel: string;
    taskTitlePlaceholder: string;
    durationLabel: string;
    durationPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    projectCategoryLabel: string;
    projectCategoryPlaceholder: string;
    selectPlaceholder: string;
    requiredHelper: string;
    realisticDurationHelper: string;
  };

  // Dialogs & Modals
  dialogs: {
    adaptiveRescheduleHeading: string;
    quickTaskHeading: string;
    deleteHeading: string;
    deleteConfirmation: string;
    deleteAction: string;
  };

  // Toasts
  toasts: {
    taskCompleted: (title: string) => string;
    taskAdjusted: string;
    taskAdded: (title: string) => string;
    scheduleSaved: string;
  };

  // Virtual Keyboard (Mobile Number & General)
  keyboard: {
    done: string;
    space: string;
    delete: string;
    clear: string;
    shift: string;
    symbols: string;
    letters: string;
    numbers: string;
    inputNumberPlaceholder: string;
    inputTextPlaceholder: string;
    quickDurationPresets: string;
    preset15m: string;
    preset30m: string;
    preset45m: string;
    preset60m: string;
  };

  // Empathetic Validation Messages (Client & Server Matrix)
  validations: {
    taskTitle: string;
    taskDuration: string;
    taskCategory: string;
    taskStartTime: string;
    taskTop3Quota: string;
    workHoursLimit: string;
    workHoursRange: string;
    workHoursFormat: string;
    selectedCategories: string;
    confirmedStartTime: string;
    endTimeCalculated: string;
  };

  // Error & Fail States (Guilt-Free, Anti-Accusatory, One-Click Recovery)
  errorStates: {
    microFailToast: string;
    retryAction: string;
    moduleFailTitle: string;
    moduleFailBody: string;
    reloadModuleAction: string;
    syncConflictTitle: string;
    syncConflictBody: string;
    useLatestVersionAction: string;
    keepDraftAction: string;
    fullViewTitle: string;
    fullViewBody: string;
    fullViewAction: string;
  };
}

export const idCopywriting: FoCientCopywriting = {
  locale: 'id',
  localeName: 'Bahasa Indonesia',

  actions: {
    apply: 'Terapkan',
    applyAdjustment: 'Terapkan Penyesuaian',
    applyNewSchedule: 'Terapkan Jadwal Baru',
    balanceRhythm: 'Seimbangkan Ritme',
    shiftToNextSlot: 'Geser ke Jam Berikutnya',
    saveToTimeline: 'Simpan ke Linimasa',
    addToToday: '+ Hari Ini',
    adjust: 'Sesuaikan',
    edit: 'Ubah',
    delete: 'Hapus',
    cancel: 'Batal',
    save: 'Simpan',
    close: 'Tutup',
    pause: 'Jeda',
    resume: 'Lanjutkan',
    complete: 'Selesai',
    undo: 'Urungkan',
    dismissOrLater: 'Nanti Saja / Abaikan',
    clear: 'Hapus teks',
    showPassword: 'Tampilkan kata sandi',
    hidePassword: 'Sembunyikan kata sandi',
    search: 'Cari',
  },

  status: {
    inProgress: 'SEDANG BERJALAN',
    topPriority: 'Prioritas Utama',
    priorityRank: (rank: number) => `#${rank} Prioritas`,
    needsAdjustment: 'Perlu Penyesuaian Jadwal',
    completed: 'Selesai',
    markCompleted: (title: string) => `Tandai "${title}" sebagai tuntas`,
    markIncomplete: (title: string) => `Tandai "${title}" sebagai belum tuntas`,
    subtask: 'Subtugas',
    light: 'Ringan',
    optimal: 'Optimal',
    nearCapacity: 'Mendekati Kapasitas',
    fullCapacity: 'Kapasitas Penuh',
  },

  adaptive: {
    rescheduleNotice: 'Perlu Penyesuaian Jadwal',
    rescheduleDescription:
      'Kapasitas harian memerlukan penyeimbangan alur waktu agar fokus tetap tenang.',
    capacityWarning: 'Beban kerja mendekati batas harian yang nyaman.',
    overloadAdvice:
      'Saran Adaptif: Alokasikan tugas berlebih ke esok hari tanpa rasa bersalah.',
    gentleReminder: 'Istirahat sejenak untuk menjaga kejelasan pikiran.',
    focusGuidance: 'Fokus pada satu tugas untuk hasil terbaik dan kejernihan mental.',
    rescheduleGuidance:
      'Jadwal fleksibel yang menyesuaikan ritme kerja Anda secara adaptif.',
  },

  capacity: {
    dailyWorkload: 'Beban Kerja Harian',
    allocatedVsTotal: (allocated: string, total: string, percent: number) =>
      `${allocated} / ${total} (${percent}%)`,
    formatHoursMins: (hours: number, minutes: number) => {
      if (hours === 0) return `${minutes}mnt`;
      if (minutes === 0) return `${hours}j`;
      return `${hours}j ${minutes}m`;
    },
    minutesShort: 'mnt',
    hoursShort: 'jam',
  },

  navigation: {
    todayPlan: 'Rencana Hari Ini',
    timeline: 'Linimasa',
    tasks: 'Daftar Tugas',
    inbox: 'Kotak Masuk',
    insights: 'Metrik & Refleksi',
    settings: 'Pengaturan',
    searchPlaceholder: 'Cari tugas... (Cmd+K)',
    workloadShort: (percent: number) => `⚡ ${percent}%`,
    notifications: 'Notifikasi Adaptif',
    switchLanguage: 'Pilih Bahasa',
    toggleTheme: 'Ganti Tema Latar',
    sidebarExpand: 'Perluas Navigasi',
    sidebarCollapse: 'Ciutkan Navigasi',
  },

  cards: {
    singleFocusTitle: 'Fokus Utama Saat Ini',
    top3Title: 'Top 3 Prioritas Hari Ini',
    timelineTitle: 'Jadwal Linimasa',
    adaptiveTitle: 'Penyesuaian Adaptif',
    backlogTitle: 'Antrean Tugas Bebas',
    completedTitle: 'Tugas Diselesaikan',
    capacityTitle: 'Meter Kapasitas & Ritme',
  },

  forms: {
    taskTitleLabel: 'Judul Tugas',
    taskTitlePlaceholder: 'Apa yang ingin Anda selesaikan?',
    durationLabel: 'Estimasi Durasi',
    durationPlaceholder: 'Contoh: 45',
    notesLabel: 'Catatan Konteks (Opsional)',
    notesPlaceholder: 'Detail atau tautan pendukung...',
    projectCategoryLabel: 'Kategori Proyek',
    projectCategoryPlaceholder: 'Pilih pilar atau tag proyek',
    selectPlaceholder: 'Pilih opsi...',
    requiredHelper: 'Judul tugas dibutuhkan untuk fokus Anda.',
    realisticDurationHelper: 'Masukkan durasi yang realistis tanpa membebani jadwal.',
  },

  dialogs: {
    adaptiveRescheduleHeading: 'Penyesuaian Ritme Jadwal',
    quickTaskHeading: 'Tambah Tugas ke Linimasa',
    deleteHeading: 'Hapus Tugas',
    deleteConfirmation:
      'Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.',
    deleteAction: 'Hapus Permanen',
  },

  toasts: {
    taskCompleted: (title: string) => `Tuntas: "${title}" telah diselesaikan.`,
    taskAdjusted: 'Jadwal berhasil disesuaikan dengan ritme baru Anda.',
    taskAdded: (title: string) => `"${title}" disimpan ke linimasa.`,
    scheduleSaved: 'Ritme harian berhasil diperbarui.',
  },

  keyboard: {
    done: 'Selesai',
    space: 'Spasi',
    delete: 'Hapus',
    clear: 'Bersihkan',
    shift: 'Huruf Besar',
    symbols: '?123',
    letters: 'ABC',
    numbers: '123',
    inputNumberPlaceholder: 'Ketik angka durasi...',
    inputTextPlaceholder: 'Ketik teks tugas...',
    quickDurationPresets: 'Preset Cepat',
    preset15m: '+15m',
    preset30m: '+30m',
    preset45m: '+45m',
    preset60m: '+60m',
  },

  validations: {
    taskTitle: 'Beri nama tugas singkat agar fokus kerjamu lebih terarah.',
    taskDuration: 'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).',
    taskCategory: 'Pilih satu pilar kategori agar pembagian fokusmu tercatat rapi.',
    taskStartTime: 'Format jam mulai belum pas. Pilih slot waktu yang tersedia.',
    taskTop3Quota:
      '3 tugas fokus utama sudah penuh. Selesaikan salah satunya terlebih dahulu atau alihkan prioritas.',
    workHoursLimit: 'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.',
    workHoursRange: 'Rentang jam kerja belum sesuai. Pastikan jam selesai setelah jam mulai.',
    workHoursFormat: 'Format waktu belum pas. Gunakan format 24 jam HH:mm (contoh: 09:00).',
    selectedCategories: 'Pilih minimal satu kategori kerja untuk memulai rencana pertamamu.',
    confirmedStartTime: 'Slot waktu ini sudah terlewat. Pilih jam saat ini atau slot berikutnya.',
    endTimeCalculated: 'Waktu selesai dihitung otomatis oleh sistem',
  },

  errorStates: {
    microFailToast: 'Perubahan belum tersimpan. Draf kamu tetap aman di perangkat.',
    retryAction: 'Coba Lagi',
    moduleFailTitle: 'Modul Belum Dapat Dimuat',
    moduleFailBody: 'Data analitik sedang tidak dapat dijangkau. Aktivitas utama tetap dapat kamu jalankan seperti biasa.',
    reloadModuleAction: 'Muat Ulang Modul',
    syncConflictTitle: 'Ditemukan Penyesuaian Jadwal Terbaru',
    syncConflictBody: 'Ada pembaruan linimasa dari perangkat lain. Pilih versi yang ingin kamu jadikan acuan fokus.',
    useLatestVersionAction: 'Gunakan Versi Terkini',
    keepDraftAction: 'Pertahankan Draf Ini',
    fullViewTitle: 'Sistem Sedang Menyesuaikan Diri',
    fullViewBody: 'Layanan FoCient sedang mengalami kendala sinkronisasi singkat. Tenang, seluruh tugas lokalmu tetap aman di perangkat ini.',
    fullViewAction: 'Periksa Jaringan & Muat Ulang',
  },
};

export const enCopywriting: FoCientCopywriting = {
  locale: 'en',
  localeName: 'English',

  actions: {
    apply: 'Apply',
    applyAdjustment: 'Apply Adjustment',
    applyNewSchedule: 'Apply New Schedule',
    balanceRhythm: 'Balance Rhythm',
    shiftToNextSlot: 'Shift to Next Slot',
    saveToTimeline: 'Save to Timeline',
    addToToday: '+ Today',
    adjust: 'Adjust',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    pause: 'Pause',
    resume: 'Resume',
    complete: 'Complete',
    undo: 'Undo',
    dismissOrLater: 'Later / Dismiss',
    clear: 'Clear text',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    search: 'Search',
  },

  status: {
    inProgress: 'IN PROGRESS',
    topPriority: 'Top Priority',
    priorityRank: (rank: number) => `#${rank} Priority`,
    needsAdjustment: 'Schedule Adjustment Needed',
    completed: 'Completed',
    markCompleted: (title: string) => `Mark "${title}" as completed`,
    markIncomplete: (title: string) => `Mark "${title}" as incomplete`,
    subtask: 'Subtask',
    light: 'Light',
    optimal: 'Optimal',
    nearCapacity: 'Near Capacity',
    fullCapacity: 'Full Capacity',
  },

  adaptive: {
    rescheduleNotice: 'Schedule Adjustment Needed',
    rescheduleDescription:
      'Daily capacity needs a balanced flow so your focus stays calm and guilt-free.',
    capacityWarning: 'Workload is approaching the comfortable daily threshold.',
    overloadAdvice:
      'Adaptive Advice: Gently shift excess tasks to tomorrow without guilt.',
    gentleReminder: 'Take a short pause to maintain mental clarity.',
    focusGuidance: 'Focus on one single task for optimal clarity and results.',
    rescheduleGuidance:
      'Flexible scheduling that adapts seamlessly to your pace.',
  },

  capacity: {
    dailyWorkload: 'Daily Workload',
    allocatedVsTotal: (allocated: string, total: string, percent: number) =>
      `${allocated} / ${total} (${percent}%)`,
    formatHoursMins: (hours: number, minutes: number) => {
      if (hours === 0) return `${minutes}min`;
      if (minutes === 0) return `${hours}h`;
      return `${hours}h ${minutes}m`;
    },
    minutesShort: 'min',
    hoursShort: 'hr',
  },

  navigation: {
    todayPlan: "Today's Plan",
    timeline: 'Timeline',
    tasks: 'Tasks',
    inbox: 'Inbox',
    insights: 'Insights & Reflection',
    settings: 'Settings',
    searchPlaceholder: 'Search tasks... (Cmd+K)',
    workloadShort: (percent: number) => `⚡ ${percent}%`,
    notifications: 'Adaptive Notifications',
    switchLanguage: 'Select Language',
    toggleTheme: 'Toggle Theme',
    sidebarExpand: 'Expand Navigation',
    sidebarCollapse: 'Collapse Navigation',
  },

  cards: {
    singleFocusTitle: 'Active Single-Task Focus',
    top3Title: 'Top 3 Daily Priorities',
    timelineTitle: 'Scheduled Timeline',
    adaptiveTitle: 'Adaptive Reschedule',
    backlogTitle: 'Unscheduled Backlog',
    completedTitle: 'Completed Tasks',
    capacityTitle: 'Capacity Meter & Rhythm',
  },

  forms: {
    taskTitleLabel: 'Task Title',
    taskTitlePlaceholder: 'What would you like to accomplish?',
    durationLabel: 'Estimated Duration',
    durationPlaceholder: 'e.g. 45',
    notesLabel: 'Context Notes (Optional)',
    notesPlaceholder: 'Helpful details or reference links...',
    projectCategoryLabel: 'Project Category',
    projectCategoryPlaceholder: 'Select project pillar or tag',
    selectPlaceholder: 'Select option...',
    requiredHelper: 'A task title is needed for your focus.',
    realisticDurationHelper: 'Enter a realistic duration to keep your schedule calm.',
  },

  dialogs: {
    adaptiveRescheduleHeading: 'Schedule Rhythm Adjustment',
    quickTaskHeading: 'Add Task to Timeline',
    deleteHeading: 'Delete Task',
    deleteConfirmation:
      'Are you sure you want to delete this task? This action cannot be undone.',
    deleteAction: 'Permanently Delete',
  },

  toasts: {
    taskCompleted: (title: string) => `Completed: "${title}" is done.`,
    taskAdjusted: 'Schedule has been smoothly adapted to your new rhythm.',
    taskAdded: (title: string) => `"${title}" saved to your timeline.`,
    scheduleSaved: 'Daily rhythm updated successfully.',
  },

  keyboard: {
    done: 'Done',
    space: 'Space',
    delete: 'Delete',
    clear: 'Clear',
    shift: 'Shift',
    symbols: '?123',
    letters: 'ABC',
    numbers: '123',
    inputNumberPlaceholder: 'Enter duration number...',
    inputTextPlaceholder: 'Type task text...',
    quickDurationPresets: 'Quick Presets',
    preset15m: '+15m',
    preset30m: '+30m',
    preset45m: '+45m',
    preset60m: '+60m',
  },

  validations: {
    taskTitle: 'Give your task a short title to guide your focus.',
    taskDuration: 'Set a duration between 5 and 480 minutes (e.g., 30m or 45m).',
    taskCategory: 'Select a category pillar to keep your focus organized.',
    taskStartTime: 'Start time format is not quite right. Select an available time slot.',
    taskTop3Quota:
      'The 3 main focus tasks are full. Complete one first or switch priority.',
    workHoursLimit: 'Set a realistic daily work hour limit between 1 and 16 hours.',
    workHoursRange: 'Work hour range is not aligned. Make sure end time is after start time.',
    workHoursFormat: 'Time format is not aligned. Use 24-hour HH:mm (e.g., 09:00).',
    selectedCategories: 'Select at least one work category to start your first plan.',
    confirmedStartTime: 'This time slot has already passed. Choose the current time or the next available slot.',
    endTimeCalculated: 'End time is automatically calculated by the system',
  },

  errorStates: {
    microFailToast: "Changes couldn't be saved. Your draft remains safe on this device.",
    retryAction: 'Try Again',
    moduleFailTitle: 'Module Temporarily Unavailable',
    moduleFailBody: "Analytics data couldn't be reached right now. Your main activities can continue smoothly.",
    reloadModuleAction: 'Reload Module',
    syncConflictTitle: 'Newer Schedule Adjustments Detected',
    syncConflictBody: "Timeline updates were found from another device. Choose which version you'd like to use as your focus baseline.",
    useLatestVersionAction: 'Use Latest Version',
    keepDraftAction: 'Keep This Draft',
    fullViewTitle: 'System Is Adjusting',
    fullViewBody: 'FoCient services are experiencing a brief synchronization hiccup. All your local tasks remain completely safe on this device.',
    fullViewAction: 'Check Network & Reload',
  },
};

export const dictionaries: Record<SupportedLocale, FoCientCopywriting> = {
  id: idCopywriting,
  en: enCopywriting,
};

/**
 * Format minutes into localized hours and minutes string with tabular figures.
 */
export function formatMinutesLocalized(minutes: number, copywriting: FoCientCopywriting): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return copywriting.capacity.formatHoursMins(hours, mins);
}
