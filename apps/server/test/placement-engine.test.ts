import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { taskPlacementEngine } from '../src/engine/task-placement-engine/placement-engine.js';
import { ScheduleBlockDto, TaskResponseDto } from '@focient/contracts';

describe('TaskPlacementEngine', () => {
  const date = '2026-11-01'; // Future date to avoid "now" time cutoff in tests

  it('places a single task at the start of work hours when schedule is empty', () => {
    const task = { durationMinutes: 60 };
    const existingBlocks: ScheduleBlockDto[] = [];

    const slot = taskPlacementEngine.findNextAvailableSlot(
      task,
      existingBlocks,
      date,
      '09:00',
      '17:00',
      10,
      new Date(`${date}T09:00:00.000Z`).getTime()
    );

    assert.ok(slot);
    const startH = slot.start.getUTCHours();
    const startM = slot.start.getUTCMinutes();
    assert.strictEqual(startH, 9);
    assert.strictEqual(startM, 0);

    const endH = slot.end.getUTCHours();
    const endM = slot.end.getUTCMinutes();
    assert.strictEqual(endH, 10);
    assert.strictEqual(endM, 0);
  });

  it('places task with a 10-minute buffer after an existing schedule block', () => {
    const task = { durationMinutes: 45 };
    const existingBlocks: ScheduleBlockDto[] = [
      {
        id: 'block_1',
        userId: 'user_1',
        title: 'Morning Meeting',
        startTime: new Date(`${date}T09:00:00.000Z`).toISOString(),
        endTime: new Date(`${date}T10:00:00.000Z`).toISOString(),
        isLocked: true,
        type: 'TASK',
      },
    ];

    const slot = taskPlacementEngine.findNextAvailableSlot(
      task,
      existingBlocks,
      date,
      '09:00',
      '17:00',
      10,
      new Date(`${date}T09:00:00.000Z`).getTime()
    );

    assert.ok(slot);
    // Should start at 10:10 (10:00 + 10m buffer)
    const blockEndMs = new Date(existingBlocks[0].endTime).getTime();
    assert.strictEqual(slot.start.getTime(), blockEndMs + 10 * 60 * 1000);
    assert.strictEqual(slot.end.getTime() - slot.start.getTime(), 45 * 60 * 1000);
  });

  it('returns null when task exceeds the daily workHourEnd', () => {
    const task = { durationMinutes: 120 };
    // Day ends at 17:00, block until 16:00, only 60m remaining
    const existingBlocks: ScheduleBlockDto[] = [
      {
        id: 'block_1',
        userId: 'user_1',
        title: 'Late Meeting',
        startTime: new Date(`${date}T09:00:00.000Z`).toISOString(),
        endTime: new Date(`${date}T16:00:00.000Z`).toISOString(),
        isLocked: true,
        type: 'TASK',
      },
    ];

    const slot = taskPlacementEngine.findNextAvailableSlot(
      task,
      existingBlocks,
      date,
      '09:00',
      '17:00',
      10,
      new Date(`${date}T09:00:00.000Z`).getTime()
    );

    assert.strictEqual(slot, null);
  });

  it('batch places multiple tasks prioritizing TOP_3 and deadlines', () => {
    const tasks: TaskResponseDto[] = [
      {
        id: 'task_regular',
        userId: 'user_1',
        title: 'Regular Task',
        durationMinutes: 60,
        priority: 'REGULAR',
        status: 'TODO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task_top3',
        userId: 'user_1',
        title: 'Focus Top 3 Task',
        durationMinutes: 60,
        priority: 'TOP_3',
        status: 'TODO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = taskPlacementEngine.batchPlaceTasks(tasks, [], date, {
      workHourStart: '09:00',
      workHourEnd: '17:00',
      bufferMinutes: 10,
      minStartTimeMs: new Date(`${date}T09:00:00.000Z`).getTime(),
    });

    assert.strictEqual(result.placed.length, 2);
    assert.strictEqual(result.unplaced.length, 0);
    // Top 3 should be placed first
    assert.strictEqual(result.placed[0].task.id, 'task_top3');
    assert.strictEqual(result.placed[1].task.id, 'task_regular');
  });
});
