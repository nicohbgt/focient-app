/// FoCient Design System - Mobile Copywriting & Localization
///
/// Built on the core FoCient philosophy:
/// - Single-task cognitive focus & friction-free efficiency
/// - Guilt-free, anti-toxic productivity (no punitive words like "Terlambat", "Gagal", "Late")
enum FoCientLanguage { id, en }

class FoCientCopywriting {
  final FoCientLanguage language;
  final String localeName;

  // Actions
  final String apply;
  final String applyAdjustment;
  final String applyNewSchedule;
  final String balanceRhythm;
  final String shiftToNextSlot;
  final String saveToTimeline;
  final String addToToday;
  final String adjust;
  final String edit;
  final String delete;
  final String cancel;
  final String save;
  final String close;
  final String pause;
  final String resume;
  final String complete;
  final String undo;
  final String dismissOrLater;
  final String space;

  // Status & Adaptive
  final String inProgress;
  final String topPriority;
  final String needsAdjustment;
  final String completed;
  final String light;
  final String optimal;
  final String nearCapacity;
  final String fullCapacity;

  final String rescheduleNotice;
  final String rescheduleDescription;
  final String overloadAdvice;

  // Capacity & Units
  final String dailyWorkload;
  final String minutesShort;
  final String hoursShort;

  // Empathetic Validation Messages (Client & Server Contract)
  final String taskTitleValidation;
  final String taskDurationValidation;
  final String taskCategoryValidation;
  final String taskStartTimeValidation;
  final String taskTop3QuotaValidation;
  final String workHoursLimitValidation;
  final String workHoursRangeValidation;
  final String workHoursFormatValidation;
  final String selectedCategoriesValidation;
  final String confirmedStartTimeValidation;
  final String endTimeCalculatedNotice;

  // Welcome Screen
  final String welcomeTagline;
  final String welcomeSubtitle;
  final String welcomePillar1;
  final String welcomePillar2;
  final String welcomePillar3;
  final String getStarted;
  final String alreadyHaveAccountLogin;
  final String chooseLanguage;
  final String englishLabel;
  final String indonesianLabel;

  // Dialogs, Confirmations & SnackBars
  final String cancelTaskQuestion;
  final String cancelTaskDescription;
  final String deleteTask;
  final String taskCancelledWithoutGuilt;
  final String taskAddedSuccess;
  final String taskUpdatedSuccess;
  final String enterTaskNameHint;
  final String scheduleRebalancedSuccess;
  final String scheduleKeptSuccess;
  final String scheduleBacklogTitle;
  final String scheduleTodaySlot;
  final String scheduleTomorrowSlot;
  final String noBacklogTasks;
  final String usernameMinChars;
  final String categoryMinOne;

  const FoCientCopywriting({
    required this.language,
    required this.localeName,
    required this.apply,
    required this.applyAdjustment,
    required this.applyNewSchedule,
    required this.balanceRhythm,
    required this.shiftToNextSlot,
    required this.saveToTimeline,
    required this.addToToday,
    required this.adjust,
    required this.edit,
    required this.delete,
    required this.cancel,
    required this.save,
    required this.close,
    required this.pause,
    required this.resume,
    required this.complete,
    required this.undo,
    required this.dismissOrLater,
    required this.space,
    required this.inProgress,
    required this.topPriority,
    required this.needsAdjustment,
    required this.completed,
    required this.light,
    required this.optimal,
    required this.nearCapacity,
    required this.fullCapacity,
    required this.rescheduleNotice,
    required this.rescheduleDescription,
    required this.overloadAdvice,
    required this.dailyWorkload,
    required this.minutesShort,
    required this.hoursShort,
    required this.taskTitleValidation,
    required this.taskDurationValidation,
    required this.taskCategoryValidation,
    required this.taskStartTimeValidation,
    required this.taskTop3QuotaValidation,
    required this.workHoursLimitValidation,
    required this.workHoursRangeValidation,
    required this.workHoursFormatValidation,
    required this.selectedCategoriesValidation,
    required this.confirmedStartTimeValidation,
    required this.endTimeCalculatedNotice,
    required this.welcomeTagline,
    required this.welcomeSubtitle,
    required this.welcomePillar1,
    required this.welcomePillar2,
    required this.welcomePillar3,
    required this.getStarted,
    required this.alreadyHaveAccountLogin,
    required this.chooseLanguage,
    required this.englishLabel,
    required this.indonesianLabel,
    required this.cancelTaskQuestion,
    required this.cancelTaskDescription,
    required this.deleteTask,
    required this.taskCancelledWithoutGuilt,
    required this.taskAddedSuccess,
    required this.taskUpdatedSuccess,
    required this.enterTaskNameHint,
    required this.scheduleRebalancedSuccess,
    required this.scheduleKeptSuccess,
    required this.scheduleBacklogTitle,
    required this.scheduleTodaySlot,
    required this.scheduleTomorrowSlot,
    required this.noBacklogTasks,
    required this.usernameMinChars,
    required this.categoryMinOne,
  });

  static const FoCientCopywriting en = FoCientCopywriting(
    language: FoCientLanguage.en,
    localeName: 'English',
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
    space: 'Space',
    inProgress: 'IN PROGRESS',
    topPriority: 'Top Priority',
    needsAdjustment: 'Schedule Adjustment Needed',
    completed: 'Completed',
    light: 'Light',
    optimal: 'Optimal',
    nearCapacity: 'Near Capacity',
    fullCapacity: 'Full Capacity',
    rescheduleNotice: 'Schedule Adjustment Needed',
    rescheduleDescription:
        'Daily capacity needs a balanced flow so your focus stays calm and guilt-free.',
    overloadAdvice:
        'Adaptive Advice: Gently shift excess tasks to tomorrow without guilt.',
    dailyWorkload: 'Daily Workload',
    minutesShort: 'min',
    hoursShort: 'hr',
    taskTitleValidation: 'Give your task a short title to guide your focus.',
    taskDurationValidation: 'Set a duration between 5 and 480 minutes (e.g., 30m or 45m).',
    taskCategoryValidation: 'Select a category pillar to keep your focus organized.',
    taskStartTimeValidation: 'Start time format is not quite right. Select an available time slot.',
    taskTop3QuotaValidation:
        'The 3 main focus tasks are full. Complete one first or switch priority.',
    workHoursLimitValidation: 'Set a realistic daily work hour limit between 1 and 16 hours.',
    workHoursRangeValidation: 'Work hour range is not aligned. Make sure end time is after start time.',
    workHoursFormatValidation: 'Time format is not aligned. Use 24-hour HH:mm (e.g., 09:00).',
    selectedCategoriesValidation: 'Select at least one work category to start your first plan.',
    confirmedStartTimeValidation: 'This time slot has already passed. Choose the current time or the next available slot.',
    endTimeCalculatedNotice: 'End time is automatically calculated by the system',
    welcomeTagline: 'Focus & Efficient',
    welcomeSubtitle: 'Guilt-free productivity and adaptive cognitive rhythm for your best work.',
    welcomePillar1: 'Single-task flow without guilt or burnout',
    welcomePillar2: 'Guilt-free adaptive rescheduling',
    welcomePillar3: 'Daily work capacity limits (max 8h standard)',
    getStarted: 'Get Started',
    alreadyHaveAccountLogin: 'Already have an account? Login',
    chooseLanguage: 'Language',
    englishLabel: 'English',
    indonesianLabel: 'Indonesia',
    cancelTaskQuestion: 'Cancel Task?',
    cancelTaskDescription: 'This task will be removed from your schedule without guilt. You can always add it back later.',
    deleteTask: 'Delete Task',
    taskCancelledWithoutGuilt: 'cancelled without guilt.',
    taskAddedSuccess: 'added to schedule successfully!',
    taskUpdatedSuccess: 'updated successfully!',
    enterTaskNameHint: 'Please enter a task name before saving.',
    scheduleRebalancedSuccess: 'Schedule rebalanced successfully! 2 tasks moved to Thursday morning. Wednesday workload reduced to 65% (Optimal).',
    scheduleKeptSuccess: 'Current schedule kept without guilt. You can adjust anytime.',
    scheduleBacklogTitle: 'Schedule Backlog Task',
    scheduleTodaySlot: 'Schedule for Today (15:00)',
    scheduleTomorrowSlot: 'Schedule for Tomorrow (10:00)',
    noBacklogTasks: 'No tasks in the backlog yet.',
    usernameMinChars: 'Username must be at least 2 characters.',
    categoryMinOne: 'Select or add at least 1 category.',
  );

  static const FoCientCopywriting id = FoCientCopywriting(
    language: FoCientLanguage.id,
    localeName: 'Bahasa Indonesia',
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
    space: 'Spasi',
    inProgress: 'SEDANG BERJALAN',
    topPriority: 'Prioritas Utama',
    needsAdjustment: 'Perlu Penyesuaian Jadwal',
    completed: 'Selesai',
    light: 'Ringan',
    optimal: 'Optimal',
    nearCapacity: 'Mendekati Kapasitas',
    fullCapacity: 'Kapasitas Penuh',
    rescheduleNotice: 'Perlu Penyesuaian Jadwal',
    rescheduleDescription:
        'Kapasitas harian memerlukan penyeimbangan alur waktu agar fokus tetap tenang.',
    overloadAdvice:
        'Saran Adaptif: Alokasikan tugas berlebih ke esok hari tanpa rasa bersalah.',
    dailyWorkload: 'Beban Kerja Harian',
    minutesShort: 'mnt',
    hoursShort: 'jam',
    taskTitleValidation: 'Beri nama tugas singkat agar fokus kerjamu lebih terarah.',
    taskDurationValidation: 'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).',
    taskCategoryValidation: 'Pilih satu pilar kategori agar pembagian fokusmu tercatat rapi.',
    taskStartTimeValidation: 'Format jam mulai belum pas. Pilih slot waktu yang tersedia.',
    taskTop3QuotaValidation:
        '3 tugas fokus utama sudah penuh. Selesaikan salah satunya terlebih dahulu atau alihkan prioritas.',
    workHoursLimitValidation: 'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.',
    workHoursRangeValidation: 'Rentang jam kerja belum sesuai. Pastikan jam selesai setelah jam mulai.',
    workHoursFormatValidation: 'Format waktu belum pas. Gunakan format 24 jam HH:mm (contoh: 09:00).',
    selectedCategoriesValidation: 'Pilih minimal satu kategori kerja untuk memulai rencana pertamamu.',
    confirmedStartTimeValidation: 'Slot waktu ini sudah terlewat. Pilih jam saat ini atau slot berikutnya.',
    endTimeCalculatedNotice: 'Waktu selesai dihitung otomatis oleh sistem',
    welcomeTagline: 'Fokus & Efisien',
    welcomeSubtitle: 'Produktivitas tanpa rasa bersalah dan ritme kognitif adaptif untuk performa terbaikmu.',
    welcomePillar1: 'Alur fokus tugas tunggal tanpa rasa bersalah atau burnout',
    welcomePillar2: 'Penjadwalan ulang adaptif tanpa rasa bersalah',
    welcomePillar3: 'Batas kapasitas kerja harian (standar maks 8 jam)',
    getStarted: 'Mulai Sekarang',
    alreadyHaveAccountLogin: 'Sudah punya akun? Masuk',
    chooseLanguage: 'Bahasa',
    englishLabel: 'English',
    indonesianLabel: 'Indonesia',
    cancelTaskQuestion: 'Batalkan Tugas?',
    cancelTaskDescription: 'Tugas ini akan dihapus dari jadwal tanpa rasa bersalah. Anda selalu dapat menambahkannya kembali nanti.',
    deleteTask: 'Hapus Tugas',
    taskCancelledWithoutGuilt: 'dibatalkan tanpa rasa bersalah.',
    taskAddedSuccess: 'berhasil ditambahkan ke jadwal!',
    taskUpdatedSuccess: 'berhasil diperbarui!',
    enterTaskNameHint: 'Beri nama tugas sebelum menyimpannya.',
    scheduleRebalancedSuccess: 'Jadwal berhasil diseimbangkan! 2 tugas dipindahkan ke Kamis pagi. Beban hari Rabu berkurang menjadi 65% (Optimal).',
    scheduleKeptSuccess: 'Jadwal asli tetap dipertahankan tanpa rasa bersalah. Anda dapat menyesuaikannya kapan saja.',
    scheduleBacklogTitle: 'Jadwalkan Tugas Backlog',
    scheduleTodaySlot: 'Jadwalkan Hari Ini (15:00)',
    scheduleTomorrowSlot: 'Jadwalkan Besok Pagi (10:00)',
    noBacklogTasks: 'Belum ada tugas di backlog.',
    usernameMinChars: 'Username minimal 2 karakter.',
    categoryMinOne: 'Pilih atau tambahkan minimal 1 kategori.',
  );

  static FoCientCopywriting of(FoCientLanguage language) {
    switch (language) {
      case FoCientLanguage.en:
        return en;
      case FoCientLanguage.id:
        return id;
    }
  }
}
