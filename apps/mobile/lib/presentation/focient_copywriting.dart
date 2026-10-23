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
