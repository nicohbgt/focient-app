import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CompleteOnboardingSchema,
  CreateTaskSchema,
  ApplyRescheduleSchema,
  BatchApplyRescheduleSchema,
  MarkTaskCompleteSchema,
  checkTop3Quota,
} from '@focient/contracts';
import { workloadEngine } from '../src/engine/workload.engine.js';
import { silentPlacementEngine } from '../src/engine/silent-placement.engine.js';
import { adaptiveRescheduleEngine } from '../src/engine/adaptive-reschedule.engine.js';
import { top3PrioritiesEngine } from '../src/engine/top3-priorities.engine.js';

describe('FoCient System Flow & Business Logic (DFD Level 1 & Activity Diagram)', () => {
  // ==========================================
  // Process 1.0: Account Management & Onboarding
  // ==========================================
  describe('Process 1.0: Onboarding & Setup (D1: users, D2: categories, D4: user_capacities)', () => {
    it('validates CompleteOnboardingSchema with valid inputs', () => {
      const validPayload = {
        roleArchetype: 'Software Engineer',
        workHoursLimit: 7.5,
        startWorkTime: '08:30',
        endWorkTime: '17:00',
        selectedCategories: ['Coding', 'Architecture', 'Team Sync'],
      };

      const result = CompleteOnboardingSchema.safeParse(validPayload);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.workHoursLimit, 7.5);
        // maxDailyMinutes = 7.5 * 60 = 450
        const maxDailyMinutes = Math.round(result.data.workHoursLimit * 60);
        assert.strictEqual(maxDailyMinutes, 450);
      }
    });

    it('rejects invalid work hours range where endWorkTime <= startWorkTime', () => {
      const invalidPayload = {
        roleArchetype: 'Product Manager',
        workHoursLimit: 8,
        startWorkTime: '18:00',
        endWorkTime: '09:00',
        selectedCategories: ['Planning'],
      };

      const result = CompleteOnboardingSchema.safeParse(invalidPayload);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error?.issues[0].path[0], 'endWorkTime');
    });

    it('rejects selectedCategories count exceeding 5', () => {
      const invalidPayload = {
        roleArchetype: 'Designer',
        workHoursLimit: 8,
        startWorkTime: '09:00',
        endWorkTime: '17:00',
        selectedCategories: ['UI', 'UX', 'Research', 'Prototype', 'Design System', 'Handoff'],
      };

      const result = CompleteOnboardingSchema.safeParse(invalidPayload);
      assert.strictEqual(result.success, false);
    });
  });

  // ==========================================
  // Process 2.0: Task Management & Activity Flow
  // ==========================================
  describe('Process 2.0: Task Quick Input & Decision Diamond Flow', () => {
    const maxDailyMinutes = 480; // 8 hours * 60
    const today = '2026-10-26';

    it('evaluates Decision Diamond [Kapasitas Overload? (> 90%)] - Case: Normal (<= 90%)', () => {
      // Existing: 240 mins (50%) + New: 60 mins -> 300 mins (62.5% <= 90%)
      const workload = workloadEngine.calculateWorkload(today, 300, maxDailyMinutes, 3, 0);
      assert.strictEqual(workload.isOverloaded, false);
      assert.strictEqual(workload.percentage, 62.5);
      assert.strictEqual(workload.status, 'OPTIMAL');

      // In the activity diagram, if NOT overloaded, SilentPlacementEngine places task into first available gap
      const slot = silentPlacementEngine.findNextAvailableSlot(
        { durationMinutes: 60 },
        [],
        today,
        '09:00',
        '17:00',
        10
      );
      assert.notStrictEqual(slot, null);
      assert.strictEqual(slot?.start.toISOString(), `${today}T09:00:00.000Z`);
    });

    it('evaluates Decision Diamond [Kapasitas Overload? (> 90%)] - Case: Overload (> 90%)', () => {
      // Existing: 420 mins + New: 60 mins -> 480 mins (100% > 90%)
      const workload = workloadEngine.calculateWorkload(today, 480, maxDailyMinutes, 5, 0);
      assert.strictEqual(workload.isOverloaded, true);
      assert.strictEqual(workload.percentage, 100);
      assert.strictEqual(workload.status, 'OVERLOAD');

      const alert = workloadEngine.getOverloadAlert(workload);
      assert.strictEqual(alert.shouldAlert, true);
      assert.strictEqual(alert.isAmberBanner, true);
      assert.strictEqual(alert.severity, 'WARNING');
      assert.strictEqual(alert.recommendedAction, 'REBALANCE');
    });

    it('enforces Top 3 Priorities Quota and Swap resolution', () => {
      const activeTasks = [
        { id: 't1', title: 'Task 1', priority: 'TOP_3', status: 'TODO' },
        { id: 't2', title: 'Task 2', priority: 'TOP_3', status: 'TODO' },
        { id: 't3', title: 'Task 3', priority: 'TOP_3', status: 'IN_PROGRESS' },
      ];

      // Adding 4th Top-3 task without swap should be rejected
      const checkWithoutSwap = checkTop3Quota('TOP_3', activeTasks);
      assert.strictEqual(checkWithoutSwap.isValid, false);
      assert.strictEqual(checkWithoutSwap.activeTop3Count, 3);

      const allTasks = [
        ...activeTasks.map((t) => ({
          id: t.id,
          userId: 'u1',
          title: t.title,
          durationMinutes: 30,
          priority: t.priority as any,
          status: t.status as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        {
          id: 't4',
          userId: 'u1',
          title: 'Urgent System Patch',
          durationMinutes: 45,
          priority: 'REGULAR' as const,
          status: 'TODO' as const,
          category: 'Deep Focus',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Priority swap should promote candidate and demote selected task
      const swapResult = top3PrioritiesEngine.swapTop3Priority('t4', 't1', allTasks);

      assert.notStrictEqual(swapResult, null);
      assert.strictEqual(swapResult?.candidate.priority, 'TOP_3');
      assert.strictEqual(swapResult?.demoted.priority, 'REGULAR');
      assert.strictEqual(swapResult?.demoted.id, 't1');
    });
  });

  // ==========================================
  // Process 3.0: Scheduling & Adaptive Engine
  // ==========================================
  describe('Process 3.0: Guilt-Free Adaptive Engine (D6: reschedule_audit_logs)', () => {
    it('validates ApplyRescheduleSchema and BatchApplyRescheduleSchema contracts', () => {
      const singleShift = {
        taskId: '11111111-1111-4111-a111-111111111111',
        suggestedStartTime: '2026-10-26T14:00:00.000Z',
        reasonMessage: 'Perpanjangan sesi riset.',
      };

      const singleParsed = ApplyRescheduleSchema.safeParse(singleShift);
      assert.strictEqual(singleParsed.success, true);

      const batchShift = {
        shifts: [
          singleShift,
          {
            taskId: '22222222-2222-4222-a222-222222222222',
            suggestedStartTime: '2026-10-26T15:00:00.000Z',
            reasonMessage: 'Pergeseran downstream.',
          },
        ],
      };

      const batchParsed = BatchApplyRescheduleSchema.safeParse(batchShift);
      assert.strictEqual(batchParsed.success, true);
    });

    it('calculates ripple shift with 10-minute buffer without punitive words', () => {
      const blocks = [
        {
          id: 'b1',
          userId: 'u1',
          taskId: 't1',
          title: 'Code Refactoring',
          startTime: '2026-10-26T10:00:00.000Z',
          endTime: '2026-10-26T11:00:00.000Z',
          isLocked: false,
          type: 'TASK' as const,
        },
        {
          id: 'b2',
          userId: 'u1',
          taskId: 't2',
          title: 'API Integration',
          startTime: '2026-10-26T11:10:00.000Z',
          endTime: '2026-10-26T12:00:00.000Z',
          isLocked: false,
          type: 'TASK' as const,
        },
      ];

      const tasks = [
        {
          id: 't1',
          userId: 'u1',
          title: 'Code Refactoring',
          durationMinutes: 60,
          priority: 'TOP_3' as const,
          status: 'IN_PROGRESS' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't2',
          userId: 'u1',
          title: 'API Integration',
          durationMinutes: 50,
          priority: 'REGULAR' as const,
          status: 'TODO' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Delayed by 30 mins
      const ripple = adaptiveRescheduleEngine.calculateRippleShift(
        {
          delayedTaskId: 't1',
          actualDurationMinutes: 90,
          delayMinutes: 30,
          reason: 'Sesi debugging mendalam',
        },
        blocks,
        '17:00',
        tasks
      );

      assert.strictEqual(ripple.success, true);
      // Downstream task t2 must be shifted by 30 mins
      const shiftedT2 = ripple.shiftedTasks.find((s) => s.taskId === 't2');
      assert.notStrictEqual(shiftedT2, undefined);
      // Original 11:10 + 30m = 11:40
      assert.strictEqual(shiftedT2?.newStartTime, '2026-10-26T11:40:00.000Z');
      assert.strictEqual(shiftedT2?.newEndTime, '2026-10-26T12:30:00.000Z');
    });
  });

  // ==========================================
  // Process 4.0: Productivity Tracking & Execution
  // ==========================================
  describe('Process 4.0: Today Plan & Execution Logging (D4: user_capacities, D5: activity_logs)', () => {
    it('validates MarkTaskCompleteSchema for D5 activity logging', () => {
      const validComplete = {
        completedAt: '2026-10-26T16:45:00.000Z',
        actualDurationMinutes: 55,
      };

      const result = MarkTaskCompleteSchema.safeParse(validComplete);
      assert.strictEqual(result.success, true);
    });

    it('partitions today tasks correctly into timeline, unscheduled, and top-3', () => {
      const dayTasks = [
        {
          id: 't1',
          userId: 'u1',
          title: 'Scheduled Top 3',
          durationMinutes: 60,
          priority: 'TOP_3' as const,
          status: 'TODO' as const,
          startTime: '2026-10-26T09:00:00.000Z',
          endTime: '2026-10-26T10:00:00.000Z',
          createdAt: '2026-10-26T08:00:00.000Z',
          updatedAt: '2026-10-26T08:00:00.000Z',
        },
        {
          id: 't2',
          userId: 'u1',
          title: 'Unscheduled Regular Backlog',
          durationMinutes: 45,
          priority: 'REGULAR' as const,
          status: 'TODO' as const,
          createdAt: '2026-10-26T08:05:00.000Z',
          updatedAt: '2026-10-26T08:05:00.000Z',
        },
        {
          id: 't3',
          userId: 'u1',
          title: 'Scheduled Regular Task',
          durationMinutes: 30,
          priority: 'REGULAR' as const,
          status: 'TODO' as const,
          startTime: '2026-10-26T11:00:00.000Z',
          endTime: '2026-10-26T11:30:00.000Z',
          createdAt: '2026-10-26T08:10:00.000Z',
          updatedAt: '2026-10-26T08:10:00.000Z',
        },
      ];

      const timelineSchedule = dayTasks
        .filter((t) => Boolean(t.startTime))
        .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());

      const unscheduledTasks = dayTasks.filter((t) => !t.startTime && t.status !== 'COMPLETED');
      const top3Priorities = top3PrioritiesEngine.selectTop3(dayTasks);

      assert.strictEqual(timelineSchedule.length, 2);
      assert.strictEqual(timelineSchedule[0].id, 't1');
      assert.strictEqual(timelineSchedule[1].id, 't3');

      assert.strictEqual(unscheduledTasks.length, 1);
      assert.strictEqual(unscheduledTasks[0].id, 't2');

      assert.strictEqual(top3Priorities.length, 3);
      assert.strictEqual(top3Priorities[0].id, 't1'); // Explicit TOP_3
    });
  });

  // ==========================================
  // Process 5.0: Evaluation & Weekly Analytics
  // ==========================================
  describe('Process 5.0: Evaluation & Weekly Analytics (Aggregating D4 & D5)', () => {
    it('accurately computes weekly summary metrics with supportive reflection', () => {
      const mockActivityLogs = [
        { actualDurationMinutes: 60, category: 'Engineering' },
        { actualDurationMinutes: 45, category: 'Engineering' },
        { actualDurationMinutes: 30, category: 'Design' },
        { actualDurationMinutes: 50, category: 'Deep Focus' },
      ];

      const totalFocusMinutes = mockActivityLogs.reduce((s, l) => s + l.actualDurationMinutes, 0);
      assert.strictEqual(totalFocusMinutes, 185); // 60 + 45 + 30 + 50

      const completedTasks = mockActivityLogs.length;
      assert.strictEqual(completedTasks, 4);

      const totalScheduled = 5;
      const overallCompletionRate = Math.round((completedTasks / totalScheduled) * 100);
      assert.strictEqual(overallCompletionRate, 80);

      // Category breakdown
      const categoryMap = new Map<string, number>();
      for (const log of mockActivityLogs) {
        categoryMap.set(log.category, (categoryMap.get(log.category) || 0) + log.actualDurationMinutes);
      }
      const categoryDistribution = Array.from(categoryMap.entries()).map(([category, minutes]) => ({
        category,
        minutes,
        percentage: Math.round((minutes / totalFocusMinutes) * 100),
      }));

      const engCategory = categoryDistribution.find((c) => c.category === 'Engineering');
      assert.strictEqual(engCategory?.minutes, 105);
      // 105 / 185 = 56.75% -> 57%
      assert.strictEqual(engCategory?.percentage, 57);

      // Guilt-free score: Base 80 + 10 (rate >= 65%) + 10 (focus 180-2400) - 0 overloaded days = 100
      let balanceScore = 80;
      if (overallCompletionRate >= 65) balanceScore += 10;
      if (totalFocusMinutes >= 180 && totalFocusMinutes <= 2400) balanceScore += 10;
      const finalScore = Math.max(50, Math.min(100, balanceScore));
      assert.strictEqual(finalScore, 100);
    });
  });
});
