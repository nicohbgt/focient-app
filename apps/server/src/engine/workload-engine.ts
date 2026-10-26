import { CapacityStatus, WorkloadSummaryDto } from '@focient/contracts';

export interface OverloadAlertInfo {
  shouldAlert: boolean;
  severity: 'INFO' | 'SUCCESS' | 'WARNING';
  title: string;
  message: string;
  recommendedAction: 'REBALANCE' | 'LOCK_TOP_3' | 'NONE';
}

/**
 * FoCient Workload & Capacity Engine
 *
 * Implements guilt-free workload balancing:
 * - Light: < 50%
 * - Optimal: 50% - 75%
 * - Near Capacity: 76% - 90%
 * - Overload: > 90% (triggers empathetic suggestion banner without punitive red)
 */
export class WorkloadEngine {
  calculateWorkload(
    date: string,
    allocatedMinutes: number,
    capacityMinutes = 480,
    taskCount = 0,
    completedCount = 0
  ): WorkloadSummaryDto {
    const safeCapacity = Math.max(1, capacityMinutes);
    const percentage = Math.round((allocatedMinutes / safeCapacity) * 100);

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

    return {
      date,
      allocatedMinutes,
      capacityMinutes: safeCapacity,
      percentage,
      status,
      taskCount,
      completedCount,
    };
  }

  /**
   * Generates empathetic, guilt-free advisory alerts based on current daily workload.
   */
  getOverloadAlert(summary: WorkloadSummaryDto): OverloadAlertInfo {
    switch (summary.status) {
      case 'OVERLOAD':
        return {
          shouldAlert: true,
          severity: 'WARNING',
          title: 'Kapasitas Harian Terlampaui',
          message:
            'Alokasi fokus melebihi batas jam kerja harianmu. Pertimbangkan untuk menggeser tugas non-kritis ke besok tanpa beban.',
          recommendedAction: 'REBALANCE',
        };
      case 'NEAR_CAPACITY':
        return {
          shouldAlert: true,
          severity: 'INFO',
          title: 'Mendekati Kapasitas Penuh',
          message:
            'Jadwal harianmu hampir terisi penuh. Kunci 3 prioritas utamamu sebelum menambah komitmen baru.',
          recommendedAction: 'LOCK_TOP_3',
        };
      case 'OPTIMAL':
        return {
          shouldAlert: false,
          severity: 'SUCCESS',
          title: 'Ritme Fokus Seimbang',
          message:
            'Beban kerjamu berada di titik optimal. Produktivitas tinggi tanpa risiko kelelahan kognitif.',
          recommendedAction: 'NONE',
        };
      case 'LIGHT':
      default:
        return {
          shouldAlert: false,
          severity: 'INFO',
          title: 'Kapasitas Lapang',
          message:
            'Masih ada ruang lapang untuk eksplorasi fokus atau istirahat berkualitas.',
          recommendedAction: 'NONE',
        };
    }
  }
}

export const workloadEngine = new WorkloadEngine();

