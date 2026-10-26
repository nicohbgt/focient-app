import { CapacityStatus, WorkloadSummaryDto } from '@focient/contracts';

export interface OverloadAlertInfo {
  shouldAlert: boolean;
  severity: 'INFO' | 'WARNING' | 'SUCCESS';
  title: string;
  message: string;
  recommendedAction: 'REBALANCE' | 'LOCK_TOP_3' | 'NONE';
  isAmberBanner: boolean;
}

/**
 * FoCient Algoritma 1: Workload & Daily Capacity Engine
 *
 * Implements deterministic guilt-free workload balancing:
 * 1. maxDailyMinutes = workHoursLimit * 60
 * 2. allocatedMinutes(D) = sum_{t in Tasks(D), t.status != 'COMPLETED'} t.durationMinutes
 * 3. capacityPercentage(D) = round(allocatedMinutes(D) / maxDailyMinutes * 100, 2)
 *
 * Classification:
 * - LIGHT: < 50% (Beban kerja santai, banyak ruang luang)
 * - OPTIMAL: 50% - 75% (Ritme produktif, seimbang, berkelanjutan)
 * - NEAR_CAPACITY: 76% - 90% (Hari padat; kunci 3 prioritas utama)
 * - OVERLOAD: > 90% (Melebihi ambang batas; memicu isOverloaded = true & Amber Banner)
 */
export class WorkloadEngine {
  /**
   * Computes daily workload metrics according to the mathematical formula.
   */
  calculateWorkload(
    date: string,
    allocatedMinutes: number,
    capacityMinutes = 480,
    taskCount = 0,
    completedCount = 0
  ): WorkloadSummaryDto {
    const safeCapacity = Math.max(1, capacityMinutes);
    // capacityPercentage(D) = round(allocatedMinutes(D) / maxDailyMinutes * 100, 2)
    const rawPercentage = (allocatedMinutes / safeCapacity) * 100;
    const percentage = Math.round(rawPercentage * 100) / 100;

    let status: CapacityStatus = 'LIGHT';
    if (percentage < 50) {
      status = 'LIGHT';
    } else if (percentage <= 75) {
      status = 'OPTIMAL';
    } else if (percentage <= 90) {
      status = 'NEAR_CAPACITY';
    } else {
      status = 'OVERLOAD';
    }

    const isOverloaded = status === 'OVERLOAD';

    return {
      date,
      allocatedMinutes,
      capacityMinutes: safeCapacity,
      percentage,
      status,
      taskCount,
      completedCount,
      isOverloaded,
    };
  }

  /**
   * Generates empathetic, guilt-free advisory alerts based on current daily workload.
   * Visual non-punitive approach: warm amber banner when overloaded instead of aggressive red.
   */
  getOverloadAlert(summary: WorkloadSummaryDto): OverloadAlertInfo {
    switch (summary.status) {
      case 'OVERLOAD':
        return {
          shouldAlert: true,
          isAmberBanner: true,
          severity: 'WARNING',
          title: 'Kapasitas Harian Terlampaui',
          message:
            'Alokasi fokus melebihi batas jam kerja harianmu. Pertimbangkan untuk menggeser tugas non-kritis ke besok tanpa beban.',
          recommendedAction: 'REBALANCE',
        };
      case 'NEAR_CAPACITY':
        return {
          shouldAlert: true,
          isAmberBanner: false,
          severity: 'INFO',
          title: 'Mendekati Kapasitas Penuh',
          message:
            'Jadwal harianmu hampir terisi penuh. Kunci 3 prioritas utamamu sebelum menambah komitmen baru.',
          recommendedAction: 'LOCK_TOP_3',
        };
      case 'OPTIMAL':
        return {
          shouldAlert: false,
          isAmberBanner: false,
          severity: 'SUCCESS',
          title: 'Ritme Fokus Seimbang',
          message:
            'Ritme kerja produktif, seimbang, dan berkelanjutan.',
          recommendedAction: 'NONE',
        };
      case 'LIGHT':
      default:
        return {
          shouldAlert: false,
          isAmberBanner: false,
          severity: 'INFO',
          title: 'Kapasitas Lapang',
          message:
            'Beban kerja santai dan menyisakan banyak ruang luang untuk eksplorasi atau istirahat berkualitas.',
          recommendedAction: 'NONE',
        };
    }
  }
}

export const workloadEngine = new WorkloadEngine();
