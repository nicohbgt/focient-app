import { ScheduleBlockDto, TaskResponseDto } from '@focient/contracts';

/**
 * FoCient Task Placement Engine
 *
 * Scans open time slots between existing calendar events and locked commitments
 * to find optimal contiguous slots for unscheduled tasks.
 */
export class TaskPlacementEngine {
  findNextAvailableSlot(
    task: TaskResponseDto,
    existingBlocks: ScheduleBlockDto[],
    date: string, // YYYY-MM-DD
    workHourStart = '09:00',
    workHourEnd = '17:00',
    bufferMinutes = 10
  ): { start: Date; end: Date } | null {
    const [startH, startM] = workHourStart.split(':').map(Number);
    const [endH, endM] = workHourEnd.split(':').map(Number);

    const dayStart = new Date(`${date}T00:00:00`);
    dayStart.setHours(startH, startM, 0, 0);

    const dayEnd = new Date(`${date}T00:00:00`);
    dayEnd.setHours(endH, endM, 0, 0);

    const taskDurationMs = task.durationMinutes * 60 * 1000;
    const bufferMs = bufferMinutes * 60 * 1000;

    // Sort existing blocks chronologically
    const sorted = [...existingBlocks].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    let cursor = dayStart.getTime();

    for (const block of sorted) {
      const blockStart = new Date(block.startTime).getTime();
      const blockEnd = new Date(block.endTime).getTime();

      // Check if candidate slot fits before this block
      if (cursor + taskDurationMs <= blockStart) {
        const slotEnd = cursor + taskDurationMs;
        if (slotEnd <= dayEnd.getTime()) {
          return { start: new Date(cursor), end: new Date(slotEnd) };
        }
      }

      // Move cursor past the block with buffer
      cursor = Math.max(cursor, blockEnd + bufferMs);
    }

    // Check slot after all blocks before day end
    if (cursor + taskDurationMs <= dayEnd.getTime()) {
      return { start: new Date(cursor), end: new Date(cursor + taskDurationMs) };
    }

    return null; // Day capacity is full for this task
  }
}

export const taskPlacementEngine = new TaskPlacementEngine();
