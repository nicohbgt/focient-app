import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Today Plan Screen: 4 Data-Driven Lifecycle States & Web Local-First Optimistic Sync', async (t) => {
  const todayPlanSource = await readFile(new URL('../src/screens/plan/TodayPlanScreen.tsx', import.meta.url), 'utf8');
  const tasksQuerySource = await readFile(new URL('../src/hooks/useTasksQuery.ts', import.meta.url), 'utf8');
  const storeSource = await readFile(new URL('../src/state/focient-store.tsx', import.meta.url), 'utf8');

  await t.test('1. Local-First Storage & TanStack Optimistic Mutator Contract', () => {
    // Canonical query keys and localStorage key in useTasksQuery.ts
    assert.ok(tasksQuerySource.includes("LOCAL_STORAGE_WEB_TASKS = 'focient_web_tasks'"), 'Must export LOCAL_STORAGE_WEB_TASKS');
    assert.ok(tasksQuerySource.includes("TASKS_QUERY_KEY = ['tasks']"), 'Must export TASKS_QUERY_KEY');
    assert.ok(tasksQuerySource.includes("TOP3_QUERY_KEY = ['tasks', 'top-3']"), 'Must export TOP3_QUERY_KEY');

    // Hook implements optimistic updates with onMutate, onError, onSettled
    assert.ok(tasksQuerySource.includes('onMutate: async (newTask'), 'useCreateTaskMutation must define onMutate for 0ms latency');
    assert.ok(tasksQuerySource.includes('queryClient.cancelQueries'), 'Mutations must cancel outgoing queries before writing optimistic data');
    assert.ok(tasksQuerySource.includes('setStoredTasks(updated)'), 'Mutations must persist locally to focient_web_tasks');
    assert.ok(tasksQuerySource.includes('onError:'), 'Mutations must define onError rollback to previousTasks');
    assert.ok(tasksQuerySource.includes('queryClient.invalidateQueries'), 'Mutations must invalidate queries on settled to sync with PostgreSQL');
  });

  await t.test('2. Focient Store Browser LocalStorage Synchronization', () => {
    // Verifies web client mirrors mobile local storage engine per ADR-004
    assert.ok(storeSource.includes("localStorage.getItem('focient_web_tasks')"), 'Store must restore tasks from localStorage on initial load');
    assert.ok(storeSource.includes("localStorage.setItem('focient_web_tasks'"), 'Store must persist tasks to localStorage on change');
  });

  await t.test('3. Today Plan 4 Lifecycle UI States: Empty State Specification', () => {
    // Empty state container (#F0FDFA), soft teal Lucide icon (#0D9488), headline & CTA
    assert.ok(todayPlanSource.includes('Mulai Hari dengan Ritme Tenang'), 'Must render headline Mulai Hari dengan Ritme Tenang');
    assert.ok(todayPlanSource.includes('Belum ada agenda terencana. Tambahkan aktivitas pertamamu untuk memulai fokus.'), 'Must render empty subtitle');
    assert.ok(todayPlanSource.includes('+ Buat Rencana Pertama'), 'Must render CTA + Buat Rencana Pertama');
    assert.ok(todayPlanSource.includes('bg-[#F0FDFA]'), 'Icon ring must use #F0FDFA');
    assert.ok(todayPlanSource.includes('text-[#0D9488]'), 'Icon accent must use soft teal #0D9488');
  });

  await t.test('4. Today Plan 4 Lifecycle UI States: Populated State & Top 3 Priority Visual Highlight', () => {
    // Populated state renders active task cards with Top 3 Cobalt Blue border (#2563EB)
    assert.ok(todayPlanSource.includes("border-[#2563EB]"), 'Top 3 Focus tasks must have Cobalt Blue #2563EB border');
    assert.ok(todayPlanSource.includes('Top 3 Focus'), 'Top 3 Focus badge must be displayed');
    assert.ok(todayPlanSource.includes('opacity-60'), 'Completed task must apply 0.6 opacity per token spec');
    assert.ok(todayPlanSource.includes('line-through'), 'Completed task must apply strikethrough decoration');
    assert.ok(todayPlanSource.includes('duration-150'), 'Micro-interaction must be 150ms');
  });

  await t.test('5. Today Plan 4 Lifecycle UI States: All-Tasks-Completed (Zero Inbox) Calm Affirmation', () => {
    // Calm affirmative card without stress-inducing CTA
    assert.ok(todayPlanSource.includes('Fokus Hari Ini Telah Tuntas'), 'Must render affirmative headline Fokus Hari Ini Telah Tuntas');
    assert.ok(todayPlanSource.includes('Semua agenda terencana telah diselesaikan dengan tenang.'), 'Must render calm, reassuring subtitle');
    assert.ok(todayPlanSource.includes('bg-[#F0FDF4]'), 'Must use soft mint #F0FDF4 background');
    assert.ok(todayPlanSource.includes('border-[#A7F3D0]'), 'Must use gentle #A7F3D0 border');

    // Anti-burnout verification: zero inbox section must not include "+ Tambah Tugas Baru"
    const zeroInboxIndex = todayPlanSource.indexOf('Fokus Hari Ini Telah Tuntas');
    const zeroInboxSection = todayPlanSource.substring(zeroInboxIndex, zeroInboxIndex + 600);
    assert.ok(!zeroInboxSection.includes('+ Buat Rencana'), 'Zero Inbox state must not push user to immediately add new tasks');
  });
});
