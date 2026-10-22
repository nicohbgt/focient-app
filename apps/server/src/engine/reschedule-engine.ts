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
        message: 'Tugas yang dijadwalkan ulang tidak ditemukan di linimasa',
        shiftedTasks: [],
        requiresConfirmation: false,
        overloadDetected: false,
      };
    }

    const delayedBlock = existingBlocks[delayedBlockIndex];
    const delayMs = delayMinutes * 60 * 1000;

    // Downstream blocks that start at or after the delayed task's scheduled end
    const delayedEndMs = new Date(delayedBlock.endTime).getTime();
    const downstreamBlocks = existingBlocks
      .filter((b, idx) => idx !== delayedBlockIndex && new Date(b.startTime).getTime() >= delayedEndMs)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const shiftedTasks: ShiftedTaskResultDto[] = [];
    let currentShiftMs = delayMs;
    let overloadDetected = false;

    for (const block of downstreamBlocks) {
      if (block.isLocked) {
        // Stop shifting through locked calendar events; flag for user confirmation
        break;
      }

      const prevStart = new Date(block.startTime);
      const prevEnd = new Date(block.endTime);

      const newStart = new Date(prevStart.getTime() + currentShiftMs);
      const newEnd = new Date(prevEnd.getTime() + currentShiftMs);

      // Check against work day end
      const [endH, endM] = dayEndHour.split(':').map(Number);
      const dayEnd = new Date(newEnd);
      dayEnd.setHours(endH, endM, 0, 0);

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

    return {
      success: true,
      message: 'Penyesuaian jadwal adaptif berhasil dihitung.',
      shiftedTasks,
      requiresConfirmation: overloadDetected,
      overloadDetected,
    };
  }
}

export const rescheduleEngine = new RescheduleEngine();
