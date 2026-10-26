import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { silentPlacementEngine } from '../src/engine/silent-placement.engine.js';
import { ScheduleBlockDto, TaskResponseDto } from '@focient/contracts';

describe('SilentPlacementEngine (Algoritma 2: Silent Placement Engine)', () => {
  const date = '2026-11-01'; // Future date to test deterministic slot arithmetic

  it('evaluates Celah Awal: places task at startWorkTime when schedule is empty', () => {
    const task = { durationMinutes: 60 };
    const existingBlocks: ScheduleBlockDto[] = [];

    const slot = silentPlacementEngine.findNextAvailableSlot(
      task,
      existingBlocks,
      date,
      '09:00',
      '17:00',
      10,
      new Date(`${date}T09:00:00.000Z`).getTime()
    );

    assert.ok(slot);
    assert.strictEqual(slot.start.getUTCHours(), 9);
    assert.strictEqual(slot.start.getUTCMinutes(), 0);
    assert.strictEqual(slot.end.getUTCHours(), 10);
    assert.strictEqual(slot.end.getUTCMinutes(), 0);
  });

  it('evaluates Celah Antar-Tugas: inserts 10-minute cognitive buffer between tasks', () => {
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

    const slot = silentPlacementEngine.findNextAvailableSlot(
      task,
      existingBlocks,
      date,
      '09:00',
      '17:00',
      10,
      new Date(`${date}T09:00:00.000Z`).getTime()
    );

    assert.ok(slot);
    // Starts at 10:10 (10:00 + 10m cognitive buffer)
    const blockEndMs = new Date(existingBlocks[0].endTime).getTime();
    assert.strictEqual(slot.start.getTime(), blockEndMs + 10 * 60 * 1000);
    assert.strictEqual(slot.end.getTime() - slot.start.getTime(), 45 * 60 * 1000);
  });

  it('evaluates Celah Akhir: places task in gap before endWorkTime', () => {
    const task = { durationMinutes: 60 };
    const existingBlocks: ScheduleBlockDto[] = [
      {
        id: 'block_1',
        userId: 'user_1',
        title: 'Afternoon Focus',
        startTime: new Date(`${date}T14:00:00.000Z`).toISOString(),
        endTime: new Date(`${date}T15:00:00.000Z`).toISOString(),
        isLocked: false,
        type: 'TASK',
      },
    ];

    const slot = silentPlacementEngine.findNextAvailableSlot(
      task,
      existingBlocks,
      date,
      '09:00',
      '17:00',
      10,
      new Date(`${date}T15:00:00.000Z`).getTime()
    );

    assert.ok(slot);
    // Starts at 15:10, ends at 16:10, within 17:00
    assert.strictEqual(slot.start.getUTCHours(), 15);
    assert.strictEqual(slot.start.getUTCMinutes(), 10);
    assert.strictEqual(slot.end.getUTCHours(), 16);
    assert.strictEqual(slot.end.getUTCMinutes(), 10);
  });

  it('Fallback Scenario: returns null when task exceeds daily working hours', () => {
    const task = { durationMinutes: 120 };
    // Day ends at 17:00, block until 16:00, remaining gap is only 50m (after buffer)
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

    const slot = silentPlacementEngine.findNextAvailableSlot(
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

  it('batch places tasks sequentially prioritizing Top-3 focus tasks', () => {
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

    const result = silentPlacementEngine.batchPlaceTasks(tasks, [], date, {
      workHourStart: '09:00',
      workHourEnd: '17:00',
      bufferMinutes: 10,
      minStartTimeMs: new Date(`${date}T09:00:00.000Z`).getTime(),
    });

    assert.strictEqual(result.placed.length, 2);
    assert.strictEqual(result.unplaced.length, 0);
    assert.strictEqual(result.placed[0].task.id, 'task_top3');
    assert.strictEqual(result.placed[1].task.id, 'task_regular');
  });
});
