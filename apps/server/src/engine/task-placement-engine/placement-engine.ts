import { ScheduleBlockDto, TaskResponseDto } from '@focient/contracts';

export interface PlacementOptions {
  workHourStart?: string;
  workHourEnd?: string;
  bufferMinutes?: number;
  minStartTimeMs?: number;
}

export interface PlacedTaskResult {
  task: TaskResponseDto;
  slot: { start: Date; end: Date };
}

export interface BatchPlacementResult {
  placed: PlacedTaskResult[];
  unplaced: TaskResponseDto[];
  totalPlacedMinutes: number;
}

/**
 * FoCient Task Placement Engine
 *
 * Implements the Guilt-Free Daily Plan Auto-Placement:
 * Scans open time slots between existing calendar events and locked commitments
 * to find optimal contiguous slots for unscheduled tasks within daily working hours.
 */
export class TaskPlacementEngine {
  /**
   * Finds the next available non-fragmenting slot for a single task.
   */
  findNextAvailableSlot(
    task: { durationMinutes: number },
    existingBlocks: ScheduleBlockDto[],
    date: string, // YYYY-MM-DD
    workHourStart = '09:00',
    workHourEnd = '17:00',
    bufferMinutes = 10,
    minStartTimeMs?: number
  ): { start: Date; end: Date } | null {
    const [startH, startM] = workHourStart.split(':');
    const [endH, endM] = workHourEnd.split(':');

    const dayStart = new Date(
      `${date}T${startH.padStart(2, '0')}:${startM.padStart(2, '0')}:00.000Z`
    );
    const dayEnd = new Date(
      `${date}T${endH.padStart(2, '0')}:${endM.padStart(2, '0')}:00.000Z`
    );

    const taskDurationMs = task.durationMinutes * 60 * 1000;
    const bufferMs = bufferMinutes * 60 * 1000;

    // Filter and sort existing blocks for this day chronologically
    const sorted = [...existingBlocks]
      .filter((b) => {
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        return bEnd > dayStart.getTime() && bStart < dayEnd.getTime();
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    let cursor = dayStart.getTime();

    // Guilt-Free: Avoid placing new tasks in the past for today's plan
    const todayStr = new Date().toISOString().split('T')[0];
    if (date === todayStr) {
      const nowMs = Date.now();
      const remainder = new Date().getUTCMinutes() % 5;
      const roundedNowMs = nowMs + (remainder > 0 ? (5 - remainder) * 60 * 1000 : 0);
      cursor = Math.max(cursor, roundedNowMs);
    }

    if (minStartTimeMs !== undefined) {
      cursor = Math.max(cursor, minStartTimeMs);
    }

    for (const block of sorted) {
      const blockStart = new Date(block.startTime).getTime();
      const blockEnd = new Date(block.endTime).getTime();

      // If the block ended before our cursor, keep advancing
      if (blockEnd <= cursor) {
        continue;
      }

      // Check if candidate slot fits before this block
      if (cursor + taskDurationMs <= blockStart) {
        const slotEnd = cursor + taskDurationMs;
        if (slotEnd <= dayEnd.getTime()) {
          return { start: new Date(cursor), end: new Date(slotEnd) };
        }
      }

      // Advance cursor past the block with buffer
      cursor = Math.max(cursor, blockEnd + bufferMs);
    }

    // Check slot after all blocks before day end
    if (cursor + taskDurationMs <= dayEnd.getTime()) {
      return { start: new Date(cursor), end: new Date(cursor + taskDurationMs) };
    }

    return null; // Day capacity is full for this task
  }

  /**
   * Sequentially places multiple tasks into available slots,
   * prioritizing Top-3 focus tasks and approaching deadlines.
   */
  batchPlaceTasks(
    tasks: TaskResponseDto[],
    existingBlocks: ScheduleBlockDto[],
    date: string,
    options: PlacementOptions = {}
  ): BatchPlacementResult {
    const {
      workHourStart = '09:00',
      workHourEnd = '17:00',
      bufferMinutes = 10,
      minStartTimeMs,
    } = options;

    // Prioritize tasks: TOP_3 first, then deadline proximity, then duration
    const prioritized = [...tasks].sort((a, b) => {
      if (a.priority === 'TOP_3' && b.priority !== 'TOP_3') return -1;
      if (b.priority === 'TOP_3' && a.priority !== 'TOP_3') return 1;

      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;

      return a.durationMinutes - b.durationMinutes;
    });

    const activeBlocks = [...existingBlocks];
    const placed: PlacedTaskResult[] = [];
    const unplaced: TaskResponseDto[] = [];
    let totalPlacedMinutes = 0;

    for (const task of prioritized) {
      const slot = this.findNextAvailableSlot(
        task,
        activeBlocks,
        date,
        workHourStart,
        workHourEnd,
        bufferMinutes,
        minStartTimeMs
      );

      if (slot) {
        placed.push({ task, slot });
        totalPlacedMinutes += task.durationMinutes;

        // Register candidate block so subsequent tasks account for it
        activeBlocks.push({
          id: `temp_${task.id}`,
          userId: task.userId,
          taskId: task.id,
          title: task.title,
          startTime: slot.start.toISOString(),
          endTime: slot.end.toISOString(),
          isLocked: false,
          type: 'TASK',
        });
      } else {
        unplaced.push(task);
      }
    }

    return {
      placed,
      unplaced,
      totalPlacedMinutes,
    };
  }
}

export const taskPlacementEngine = new TaskPlacementEngine();

