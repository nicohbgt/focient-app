import {
  RippleRescheduleDto,
  RippleRescheduleResponseDto,
  ShiftedTaskResultDto,
  ScheduleBlockDto,
  TaskResponseDto,
} from '@focient/contracts';

export interface RescheduleTriggerCheckResult {
  needsAdjustment: boolean;
  triggers: Array<'HALF_DURATION_BREACH' | 'OVERLAP_COLLISION' | 'CAPACITY_OVERLOAD'>;
  breachedTaskIds: string[];
  collidingTaskIds: string[];
  message: string;
}

/**
 * FoCient Algoritma 3: Guilt-Free Adaptive Rescheduling Engine
 *
 * Anti-Toxic Value:
 * Menghilangkan pelabelan 'Overdue' berwarna merah, mengalihkan tugas yang tertunda ke status NEEDS_ADJUSTMENT.
 *
 * Trigger Conditions:
 * 1. Waktu Terlewat: currentTime > startTime + (durationMinutes / 2) saat status masih TODO.
 * 2. Benturan Waktu (Overlap Collision): pergeseran tugas menabrak jadwal lain di linimasa.
 * 3. Kapasitas Berlebih: kapasitas harian > 90% (OVERLOAD).
 *
 * Focus Protection:
 * - Ripple Shift di Hari yang Sama dengan jeda istirahat (bufferMinutes = 10).
 * - Perlindungan Top 3 Priorities: Jika kapasitas penuh, TOP_3 dipertahankan di hari yang sama,
 *   sedangkan REGULAR dialihkan ke hari berikutnya yang optimal.
 */
export class AdaptiveRescheduleEngine {
  readonly defaultBufferMinutes = 10;

  /**
   * Evaluates the 3 trigger conditions for proactive guilt-free rescheduling alerts.
   */
  evaluateRescheduleTriggers(
    tasks: TaskResponseDto[],
    blocks: ScheduleBlockDto[],
    currentTime = new Date(),
    workloadPercentage = 0
  ): RescheduleTriggerCheckResult {
    const triggers: Array<'HALF_DURATION_BREACH' | 'OVERLAP_COLLISION' | 'CAPACITY_OVERLOAD'> = [];
    const breachedTaskIds: string[] = [];
    const collidingTaskIds: string[] = [];
    const nowMs = currentTime.getTime();

    // 1. Waktu Terlewat: currentTime > startTime + duration/2 while status == TODO
    for (const task of tasks) {
      if (task.status === 'TODO' && task.scheduledStart) {
        const startMs = new Date(task.scheduledStart).getTime();
        const halfDurationMs = (task.durationMinutes / 2) * 60 * 1000;
        if (nowMs > startMs + halfDurationMs) {
          breachedTaskIds.push(task.id);
        }
      }
    }
    if (breachedTaskIds.length > 0) {
      triggers.push('HALF_DURATION_BREACH');
    }

    // 2. Benturan Waktu (Overlap Collision)
    const sortedBlocks = [...blocks].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const current = sortedBlocks[i];
      const next = sortedBlocks[i + 1];
      const currentEnd = new Date(current.endTime).getTime();
      const nextStart = new Date(next.startTime).getTime();

      if (currentEnd > nextStart) {
        if (current.taskId) collidingTaskIds.push(current.taskId);
        if (next.taskId) collidingTaskIds.push(next.taskId);
      }
    }
    if (collidingTaskIds.length > 0) {
      triggers.push('OVERLAP_COLLISION');
    }

    // 3. Kapasitas Berlebih: > 90% (OVERLOAD)
    if (workloadPercentage > 90) {
      triggers.push('CAPACITY_OVERLOAD');
    }

    const needsAdjustment = triggers.length > 0;
    let message = 'Seluruh jadwal berjalan sesuai rencana.';
    if (triggers.includes('CAPACITY_OVERLOAD')) {
      message =
        'Hari ini kapasitas kerjamu sudah optimal. Sebagian tugas dapat dipindahkan ke esok hari agar energimu tetap seimbang.';
    } else if (triggers.includes('HALF_DURATION_BREACH') || triggers.includes('OVERLAP_COLLISION')) {
      message =
        'Ada jadwal yang perlu penataan ulang ringan. Sesuaikan dengan 1-klik tanpa rasa bersalah.';
    }

    return {
      needsAdjustment,
      triggers,
      breachedTaskIds: Array.from(new Set(breachedTaskIds)),
      collidingTaskIds: Array.from(new Set(collidingTaskIds)),
      message,
    };
  }

  /**
   * Computes the ripple shift along the Y-axis timeline, protecting Top-3 priorities
   * and deferring regular overflow tasks to the next day when overloaded.
   */
  calculateRippleShift(
    rescheduleRequest: RippleRescheduleDto,
    existingBlocks: ScheduleBlockDto[],
    dayEndHour = '17:00',
    tasksContext: TaskResponseDto[] = []
  ): RippleRescheduleResponseDto {
    const { delayedTaskId, delayMinutes } = rescheduleRequest;

    // Find the target delayed block
    const delayedBlockIndex = existingBlocks.findIndex((b) => b.taskId === delayedTaskId);
    if (delayedBlockIndex === -1) {
      return {
        success: false,
        message: 'Tugas yang dijadwalkan ulang tidak ditemukan di linimasa.',
        shiftedTasks: [],
        deferredTasks: [],
        requiresConfirmation: false,
        overloadDetected: false,
      };
    }

    const delayedBlock = existingBlocks[delayedBlockIndex];
    const delayMs = delayMinutes * 60 * 1000;

    const prevDelayedStart = new Date(delayedBlock.startTime);
    const prevDelayedEnd = new Date(delayedBlock.endTime);
    const newDelayedEnd = new Date(prevDelayedEnd.getTime() + delayMs);

    // Compute day-end cutoff on the date of the delayed block
    const [endH, endM] = dayEndHour.split(':').map(Number);
    const dayEnd = new Date(prevDelayedEnd);
    dayEnd.setHours(endH, endM, 0, 0);

    let overloadDetected = newDelayedEnd.getTime() > dayEnd.getTime();
    let lockedEncountered = false;

    // Build task priority lookup
    const taskPriorityMap = new Map<string, string>();
    for (const t of tasksContext) {
      taskPriorityMap.set(t.id, t.priority);
    }

    // Include the delayed block's updated duration in shifted tasks
    const shiftedTasks: ShiftedTaskResultDto[] = [
      {
        taskId: delayedBlock.taskId ?? delayedBlock.id,
        taskTitle: delayedBlock.title,
        previousStartTime: prevDelayedStart.toISOString(),
        newStartTime: prevDelayedStart.toISOString(),
        newEndTime: newDelayedEnd.toISOString(),
      },
    ];

    const deferredTasks: ShiftedTaskResultDto[] = [];

    // Downstream blocks that start at or after the delayed task's original scheduled end
    const downstreamBlocks = existingBlocks
      .filter((b, idx) => idx !== delayedBlockIndex && new Date(b.startTime).getTime() >= prevDelayedEnd.getTime())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    let currentShiftMs = delayMs;

    for (const block of downstreamBlocks) {
      if (block.isLocked) {
        // Stop shifting through locked calendar events; flag for user confirmation
        lockedEncountered = true;
        break;
      }

      const prevStart = new Date(block.startTime);
      const prevEnd = new Date(block.endTime);

      const newStart = new Date(prevStart.getTime() + currentShiftMs);
      const newEnd = new Date(prevEnd.getTime() + currentShiftMs);

      const isOverflowingDayEnd = newEnd.getTime() > dayEnd.getTime();
      if (isOverflowingDayEnd) {
        overloadDetected = true;
      }

      const blockTaskId = block.taskId ?? block.id;
      const isTop3 = taskPriorityMap.get(blockTaskId) === 'TOP_3';

      // Top 3 Protection:
      // If day is overloaded, TOP_3 tasks remain shifted on the same day;
      // non-Top3 (REGULAR) overflowing tasks are marked for deferral to the next optimal day
      if (isOverflowingDayEnd && !isTop3 && tasksContext.length > 0) {
        deferredTasks.push({
          taskId: blockTaskId,
          taskTitle: block.title,
          previousStartTime: prevStart.toISOString(),
          newStartTime: newStart.toISOString(),
          newEndTime: newEnd.toISOString(),
        });
      } else {
        shiftedTasks.push({
          taskId: blockTaskId,
          taskTitle: block.title,
          previousStartTime: prevStart.toISOString(),
          newStartTime: newStart.toISOString(),
          newEndTime: newEnd.toISOString(),
        });
      }
    }

    let message = 'Penyesuaian jadwal adaptif berhasil diterapkan tanpa penalti.';
    if (overloadDetected) {
      message =
        'Hari ini kapasitas kerjamu sudah optimal. Mari pindahkan tugas ini ke esok hari agar energimu tetap seimbang.';
    } else if (lockedEncountered) {
      message =
        'Penyesuaian berhenti sebelum agenda terkunci. Kamu dapat menyesuaikan sisa waktu secara fleksibel.';
    }

    return {
      success: true,
      message,
      shiftedTasks,
      deferredTasks,
      requiresConfirmation: lockedEncountered || overloadDetected,
      overloadDetected,
    };
  }
}

export const adaptiveRescheduleEngine = new AdaptiveRescheduleEngine();
export const rescheduleEngine = adaptiveRescheduleEngine;
export { AdaptiveRescheduleEngine as RescheduleEngine };
