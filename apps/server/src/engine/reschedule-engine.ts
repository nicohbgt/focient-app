import {
  RippleRescheduleDto,
  RippleRescheduleResponseDto,
  ShiftedTaskResultDto,
  ScheduleBlockDto,
} from '@focient/contracts';

/**
 * FoCient Ripple Rescheduling Engine
 *
 * Automatically shifts downstream schedule blocks along the timeline Y-axis
 * when a preceding task extends in duration.
 *
 * Guilt-Free Planning:
 * Adjustments happen quietly without error modals or guilt-inducing messages.
 * Downstream tasks shift fluidly; if day-end is exceeded, provides calm recommendations.
 */
export class RescheduleEngine {
  calculateRippleShift(
    rescheduleRequest: RippleRescheduleDto,
    existingBlocks: ScheduleBlockDto[],
    dayEndHour = '17:00'
  ): RippleRescheduleResponseDto {
    const { delayedTaskId, delayMinutes } = rescheduleRequest;

    // Find the target delayed block
    const delayedBlockIndex = existingBlocks.findIndex((b) => b.taskId === delayedTaskId);
    if (delayedBlockIndex === -1) {
      return {
        success: false,
        message: 'Tugas yang dijadwalkan ulang tidak ditemukan di linimasa.',
        shiftedTasks: [],
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

      if (newEnd.getTime() > dayEnd.getTime()) {
        overloadDetected = true;
      }

      shiftedTasks.push({
        taskId: block.taskId ?? block.id,
        taskTitle: block.title,
        previousStartTime: prevStart.toISOString(),
        newStartTime: newStart.toISOString(),
        newEndTime: newEnd.toISOString(),
      });
    }

    let message = 'Penyesuaian jadwal adaptif berhasil diterapkan.';
    if (overloadDetected) {
      message =
        'Jadwal telah digeser otomatis. Sebagian fokus melewati jam kerja idealmu — kamu dapat mengalihkan sisa tugas ke esok hari dengan santai.';
    } else if (lockedEncountered) {
      message =
        'Penyesuaian berhenti sebelum agenda terkunci. Kamu dapat menyesuaikan sisa waktu secara fleksibel.';
    }

    return {
      success: true,
      message,
      shiftedTasks,
      requiresConfirmation: lockedEncountered || overloadDetected,
      overloadDetected,
    };
  }
}

export const rescheduleEngine = new RescheduleEngine();

