import { CapacityStatus, WorkloadSummaryDto } from '@focient/contracts';

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
}

export const workloadEngine = new WorkloadEngine();
