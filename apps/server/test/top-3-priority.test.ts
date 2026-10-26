import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { top3PriorityEngine } from '../src/engine/top-3-priority.js';
import { TaskResponseDto } from '@focient/contracts';

describe('Top3PriorityEngine', () => {
  const baseTask = (id: string, priority: TaskResponseDto['priority'], status: TaskResponseDto['status'] = 'TODO'): TaskResponseDto => ({
    id,
    userId: 'user_1',
    title: `Task ${id}`,
    durationMinutes: 30,
    priority,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('enforces maximum 3 active Top-3 priorities quota', () => {
    assert.strictEqual(top3PriorityEngine.canAcceptTop3(0), true);
    assert.strictEqual(top3PriorityEngine.canAcceptTop3(1), true);
    assert.strictEqual(top3PriorityEngine.canAcceptTop3(2), true);
    assert.strictEqual(top3PriorityEngine.canAcceptTop3(3), false);
    assert.strictEqual(top3PriorityEngine.canAcceptTop3(4), false);
  });

  it('ranks TOP_3 tasks above NORMAL and LOW priority tasks', () => {
    const tasks: TaskResponseDto[] = [
      baseTask('1', 'LOW'),
      baseTask('2', 'TOP_3'),
      baseTask('3', 'NORMAL'),
      baseTask('4', 'TOP_3'),
      baseTask('5', 'LOW'),
    ];

    const top3 = top3PriorityEngine.selectTop3(tasks);
    assert.strictEqual(top3.length, 3);
    assert.strictEqual(top3[0].id, '2');
    assert.strictEqual(top3[1].id, '4');
    assert.strictEqual(top3[2].id, '3');
  });

  it('filters out completed tasks', () => {
    const tasks: TaskResponseDto[] = [
      baseTask('1', 'TOP_3', 'COMPLETED'),
      baseTask('2', 'TOP_3', 'TODO'),
      baseTask('3', 'NORMAL', 'COMPLETED'),
      baseTask('4', 'NORMAL', 'TODO'),
    ];

    const top3 = top3PriorityEngine.selectTop3(tasks);
    assert.strictEqual(top3.length, 2);
    assert.strictEqual(top3[0].id, '2');
    assert.strictEqual(top3[1].id, '4');
  });

  it('gives score bonus for urgent approaching deadlines', () => {
    const now = Date.now();
    const tasks: TaskResponseDto[] = [
      {
        ...baseTask('1', 'NORMAL'),
        deadline: new Date(now + 3 * 3600 * 1000).toISOString(), // Due in 3 hours
      },
      {
        ...baseTask('2', 'NORMAL'),
        deadline: new Date(now + 96 * 3600 * 1000).toISOString(), // Due in 4 days
      },
    ];

    const top3 = top3PriorityEngine.selectTop3(tasks);
    assert.strictEqual(top3[0].id, '1');
  });
});
