import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adaptiveRescheduleEngine } from '../src/engine/adaptive-reschedule.engine.js';
import { ScheduleBlockDto, RippleRescheduleDto, TaskResponseDto } from '@focient/contracts';

describe('AdaptiveRescheduleEngine (Algoritma 3: Guilt-Free Adaptive Rescheduling)', () => {
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
    start.setUTCHours(startHour, startMin, 0, 0);

    const end = new Date(`${date}T00:00:00.000Z`);
    end.setUTCHours(endHour, endMin, 0, 0);

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

  it('detects Trigger 1: Waktu Terlewat (Half-Duration Breach) when task is still TODO', () => {
    // Task: 09:00 - 10:00 (60m). Half-duration is 09:30.
    const start = new Date(`${date}T09:00:00.000Z`);
    const tasks: TaskResponseDto[] = [
      {
        id: 'task_breached',
        userId: 'user_1',
        title: 'Breached Task',
        durationMinutes: 60,
        priority: 'REGULAR',
        status: 'TODO',
        scheduledStart: start.toISOString(),
        createdAt: start.toISOString(),
        updatedAt: start.toISOString(),
      },
    ];

    // Current time is 09:35 (past 09:30 half-duration)
    const currentTime = new Date(`${date}T09:35:00.000Z`);
    const assessment = adaptiveRescheduleEngine.evaluateRescheduleTriggers(tasks, [], currentTime, 40);

    assert.strictEqual(assessment.needsAdjustment, true);
    assert.ok(assessment.triggers.includes('HALF_DURATION_BREACH'));
    assert.deepStrictEqual(assessment.breachedTaskIds, ['task_breached']);
  });

  it('detects Trigger 2: Benturan Waktu (Overlap Collision)', () => {
    const blocks: ScheduleBlockDto[] = [
      makeBlock('b1', 't1', 9, 0, 10, 30), // ends at 10:30
      makeBlock('b2', 't2', 10, 0, 11, 0),  // starts at 10:00 -> Collides!
    ];

    const assessment = adaptiveRescheduleEngine.evaluateRescheduleTriggers(
      [],
      blocks,
      new Date(`${date}T08:00:00.000Z`),
      50
    );

    assert.strictEqual(assessment.needsAdjustment, true);
    assert.ok(assessment.triggers.includes('OVERLAP_COLLISION'));
    assert.ok(assessment.collidingTaskIds.includes('t1'));
    assert.ok(assessment.collidingTaskIds.includes('t2'));
  });

  it('detects Trigger 3: Kapasitas Berlebih (> 90%)', () => {
    const assessment = adaptiveRescheduleEngine.evaluateRescheduleTriggers(
      [],
      [],
      new Date(`${date}T08:00:00.000Z`),
      95 // > 90%
    );

    assert.strictEqual(assessment.needsAdjustment, true);
    assert.ok(assessment.triggers.includes('CAPACITY_OVERLOAD'));
    assert.ok(assessment.message.includes('optimal'));
  });

  it('shifts downstream blocks and extends delayed task without punitive warnings', () => {
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

    const result = adaptiveRescheduleEngine.calculateRippleShift(request, blocks, '17:00');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.shiftedTasks.length, 3);

    const t1 = result.shiftedTasks.find((s) => s.taskId === 't1');
    assert.ok(t1);
    const t1End = new Date(t1.newEndTime);
    assert.strictEqual(t1End.getUTCHours(), 10);
    assert.strictEqual(t1End.getUTCMinutes(), 30);

    const t2 = result.shiftedTasks.find((s) => s.taskId === 't2');
    assert.ok(t2);
    const t2Start = new Date(t2.newStartTime);
    assert.strictEqual(t2Start.getUTCHours(), 10);
    assert.strictEqual(t2Start.getUTCMinutes(), 30);
  });

  it('protects Top 3 Priorities on same day while deferring REGULAR tasks on overload', () => {
    const blocks: ScheduleBlockDto[] = [
      makeBlock('b1', 't_delayed', 15, 0, 16, 0),
      makeBlock('b2', 't_regular', 16, 0, 17, 0),
    ];

    const tasks: TaskResponseDto[] = [
      {
        id: 't_delayed',
        userId: 'user_1',
        title: 'Delayed Task',
        durationMinutes: 60,
        priority: 'TOP_3', // Top 3
        status: 'TODO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't_regular',
        userId: 'user_1',
        title: 'Regular Task',
        durationMinutes: 60,
        priority: 'REGULAR', // Regular
        status: 'TODO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const request: RippleRescheduleDto = {
      delayedTaskId: 't_delayed',
      delayMinutes: 30, // Pushes downstream task to end at 17:30 (> 17:00)
      actualDurationMinutes: 90,
    };

    const result = adaptiveRescheduleEngine.calculateRippleShift(request, blocks, '17:00', tasks);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.overloadDetected, true);
    // Regular task overflowing dayEnd is marked in deferredTasks
    assert.strictEqual(result.deferredTasks?.length, 1);
    assert.strictEqual(result.deferredTasks[0].taskId, 't_regular');
    assert.ok(result.message.includes('esok hari'));
  });

  it('stops ripple shift before locked block and sets requiresConfirmation', () => {
    const blocks: ScheduleBlockDto[] = [
      makeBlock('b1', 't1', 9, 0, 10, 0),
      makeBlock('b2', 't2', 10, 30, 11, 30, true), // locked calendar meeting
      makeBlock('b3', 't3', 11, 30, 12, 30),
    ];

    const request: RippleRescheduleDto = {
      delayedTaskId: 't1',
      delayMinutes: 30,
      actualDurationMinutes: 90,
    };

    const result = adaptiveRescheduleEngine.calculateRippleShift(request, blocks, '17:00');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.requiresConfirmation, true);
    assert.strictEqual(result.shiftedTasks.length, 1);
    assert.strictEqual(result.shiftedTasks[0].taskId, 't1');
  });
});
