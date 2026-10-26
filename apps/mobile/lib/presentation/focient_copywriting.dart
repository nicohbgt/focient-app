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
  });

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
  );

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
