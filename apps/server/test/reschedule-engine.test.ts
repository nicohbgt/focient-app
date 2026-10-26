import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rescheduleEngine } from '../src/engine/reschedule-engine.js';
import { ScheduleBlockDto, RippleRescheduleDto } from '@focient/contracts';

describe('RescheduleEngine', () => {
  const date = '2026-10-26';

  const makeBlock = (
    id: string,
    taskId: string,
    startHour: number,
    startMin: number,
    endHour: number,
    endMin: number,
    isLocked = false
  ): ScheduleBlockDto => {
    const start = new Date(`${date}T00:00:00.000Z`);
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date(`${date}T00:00:00.000Z`);
    end.setHours(endHour, endMin, 0, 0);

    return {
      id,
      userId: 'user_1',
      taskId,
      title: `Block ${id}`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      isLocked,
      type: 'TASK',
    };
  };

  it('shifts downstream blocks by delayMinutes and extends the delayed task', () => {
    // Task 1: 09:00 - 10:00
    // Task 2: 10:00 - 11:00
    // Task 3: 11:30 - 12:30
    const blocks: ScheduleBlockDto[] = [
      makeBlock('b1', 't1', 9, 0, 10, 0),
      makeBlock('b2', 't2', 10, 0, 11, 0),
      makeBlock('b3', 't3', 11, 30, 12, 30),
    ];

    const request: RippleRescheduleDto = {
      delayedTaskId: 't1',
      delayMinutes: 30,
      actualDurationMinutes: 90,
    };

    const result = rescheduleEngine.calculateRippleShift(request, blocks, '17:00');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.shiftedTasks.length, 3);

    // Delayed task t1: new endTime extended by 30 mins
    const t1Shift = result.shiftedTasks.find((s) => s.taskId === 't1');
    assert.ok(t1Shift);
    const t1End = new Date(t1Shift.newEndTime);
    assert.strictEqual(t1End.getMinutes(), 30);
    assert.strictEqual(t1End.getHours(), 10);

    // Downstream t2: shifted 30 mins -> starts at 10:30, ends at 11:30
    const t2Shift = result.shiftedTasks.find((s) => s.taskId === 't2');
    assert.ok(t2Shift);
    const t2Start = new Date(t2Shift.newStartTime);
    assert.strictEqual(t2Start.getHours(), 10);
    assert.strictEqual(t2Start.getMinutes(), 30);

    // Downstream t3: shifted 30 mins -> starts at 12:00, ends at 13:00
    const t3Shift = result.shiftedTasks.find((s) => s.taskId === 't3');
    assert.ok(t3Shift);
    const t3Start = new Date(t3Shift.newStartTime);
    assert.strictEqual(t3Start.getHours(), 12);
    assert.strictEqual(t3Start.getMinutes(), 0);
  });

  it('stops ripple shift before locked block and requires confirmation', () => {
    // Task 1: 09:00 - 10:00 (delayed by 30 min)
    // Task 2 (Locked Meeting): 10:30 - 11:30
    // Task 3: 11:30 - 12:30
    const blocks: ScheduleBlockDto[] = [
      makeBlock('b1', 't1', 9, 0, 10, 0),
      makeBlock('b2', 't2', 10, 30, 11, 30, true), // locked
      makeBlock('b3', 't3', 11, 30, 12, 30),
    ];

    const request: RippleRescheduleDto = {
      delayedTaskId: 't1',
      delayMinutes: 30,
      actualDurationMinutes: 90,
    };

    const result = rescheduleEngine.calculateRippleShift(request, blocks, '17:00');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.requiresConfirmation, true);
    // Locked block t2 and downstream t3 are NOT shifted automatically
    assert.strictEqual(result.shiftedTasks.length, 1);
    assert.strictEqual(result.shiftedTasks[0].taskId, 't1');
  });

  it('detects overload when shifted tasks exceed workHourEnd', () => {
    // Task 1: 15:00 - 16:00
    // Task 2: 16:00 - 17:00
    const blocks: ScheduleBlockDto[] = [
      makeBlock('b1', 't1', 15, 0, 16, 0),
      makeBlock('b2', 't2', 16, 0, 17, 0),
    ];

    const request: RippleRescheduleDto = {
      delayedTaskId: 't1',
      delayMinutes: 30, // pushes Task 2 to end at 17:30 (> 17:00)
      actualDurationMinutes: 90,
    };

    const result = rescheduleEngine.calculateRippleShift(request, blocks, '17:00');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.overloadDetected, true);
    assert.strictEqual(result.requiresConfirmation, true);
    assert.ok(result.message.includes('esok hari'));
  });
});
