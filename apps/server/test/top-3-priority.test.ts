import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { top3PrioritiesEngine } from '../src/engine/top3-priorities.engine.js';
import { TaskResponseDto } from '@focient/contracts';

describe('Top3PrioritiesEngine (Algoritma 4: Resolusi Top 3 Priorities)', () => {
  const baseTask = (
    id: string,
    priority: TaskResponseDto['priority'] = 'REGULAR',
    category = 'General',
    durationMinutes = 30,
    createdAt = new Date('2026-10-26T08:00:00.000Z').toISOString(),
    status: TaskResponseDto['status'] = 'TODO'
  ): TaskResponseDto => ({
    id,
    userId: 'user_1',
    title: `Task ${id}`,
    durationMinutes,
    priority,
    status,
    category,
    createdAt,
    updatedAt: createdAt,
  });

  it('enforces maximum 3 active Top-3 priorities quota', () => {
    assert.strictEqual(top3PrioritiesEngine.canAcceptTop3(0), true);
    assert.strictEqual(top3PrioritiesEngine.canAcceptTop3(1), true);
    assert.strictEqual(top3PrioritiesEngine.canAcceptTop3(2), true);
    assert.strictEqual(top3PrioritiesEngine.canAcceptTop3(3), false);
    assert.strictEqual(top3PrioritiesEngine.canAcceptTop3(4), false);
  });

  it('filters out completed tasks', () => {
    const tasks: TaskResponseDto[] = [
      baseTask('1', 'TOP_3', 'General', 30, undefined, 'COMPLETED'),
      baseTask('2', 'TOP_3', 'General', 30, undefined, 'TODO'),
      baseTask('3', 'REGULAR', 'General', 30, undefined, 'COMPLETED'),
      baseTask('4', 'REGULAR', 'General', 30, undefined, 'TODO'),
    ];

    const top3 = top3PrioritiesEngine.selectTop3(tasks);
    assert.strictEqual(top3.length, 2);
    assert.strictEqual(top3[0].id, '2');
    assert.strictEqual(top3[1].id, '4');
  });

  it('strictly respects Precedence 1: Explicit User Pin (TOP_3)', () => {
    const tasks: TaskResponseDto[] = [
      baseTask('1', 'REGULAR', 'Coding', 120), // Deep focus + high duration
      baseTask('2', 'TOP_3', 'General', 15),   // Explicitly pinned TOP_3
    ];

    const top3 = top3PrioritiesEngine.selectTop3(tasks);
    assert.strictEqual(top3[0].id, '2'); // Explicit user pin takes top priority
  });

  it('strictly respects Precedence 2: Kategori Deep Focus / High Cognitive Load', () => {
    const tasks: TaskResponseDto[] = [
      baseTask('1', 'REGULAR', 'Umum', 90),
      baseTask('2', 'REGULAR', 'Fokus Inti', 45), // Deep focus category
      baseTask('3', 'REGULAR', 'Pengembangan', 30), // Deep focus category
      baseTask('4', 'REGULAR', 'Admin', 60),
    ];

    const top3 = top3PrioritiesEngine.selectTop3(tasks);
    // 'Fokus Inti' and 'Pengembangan' should precede 'Umum' and 'Admin'
    assert.strictEqual(top3[0].category, 'Fokus Inti');
    assert.strictEqual(top3[1].category, 'Pengembangan');
  });

  it('strictly respects Precedence 3: Durasi Pengerjaan Terbesar (High Energy)', () => {
    const tasks: TaskResponseDto[] = [
      baseTask('1', 'REGULAR', 'Umum', 30),
      baseTask('2', 'REGULAR', 'Umum', 90), // Largest duration
      baseTask('3', 'REGULAR', 'Umum', 60),
    ];

    const top3 = top3PrioritiesEngine.selectTop3(tasks);
    assert.strictEqual(top3[0].id, '2'); // 90 min
    assert.strictEqual(top3[1].id, '3'); // 60 min
    assert.strictEqual(top3[2].id, '1'); // 30 min
  });

  it('strictly respects Precedence 4: Urutan Pembuatan Awal (FIFO)', () => {
    const tasks: TaskResponseDto[] = [
      baseTask('task_newer', 'REGULAR', 'Umum', 30, '2026-10-26T10:00:00.000Z'),
      baseTask('task_older', 'REGULAR', 'Umum', 30, '2026-10-26T08:00:00.000Z'),
    ];

    const top3 = top3PrioritiesEngine.selectTop3(tasks);
    assert.strictEqual(top3[0].id, 'task_older');
    assert.strictEqual(top3[1].id, 'task_newer');
  });

  it('correctly executes priority swap between candidate and demoted task', () => {
    const tasks: TaskResponseDto[] = [
      baseTask('top_1', 'TOP_3'),
      baseTask('top_2', 'TOP_3'),
      baseTask('top_3', 'TOP_3'),
      baseTask('candidate_4', 'REGULAR'),
    ];

    const swapResult = top3PrioritiesEngine.swapTop3Priority('candidate_4', 'top_2', tasks);
    assert.ok(swapResult);
    assert.strictEqual(swapResult.candidate.priority, 'TOP_3');
    assert.strictEqual(swapResult.demoted.priority, 'REGULAR');
  });
});
