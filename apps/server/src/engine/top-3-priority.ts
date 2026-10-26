import { TaskResponseDto } from '@focient/contracts';

export const MAX_TOP_3_TASKS = 3;

/**
 * FoCient Top-3 Priority Engine
 *
 * Implements the single-task focus principle:
 * 1. Isolates and ranks the top 3 highest-leverage tasks from the user's backlog.
 * 2. Shields the user from cognitive overload by enforcing a strict active quota of 3.
 * 3. Provides calm, guilt-free ranking based on deadline proximity and scheduling status.
 */
export class Top3PriorityEngine {
  readonly maxTop3Quota = MAX_TOP_3_TASKS;

  /**
   * Validates whether a new active TOP_3 task can be added given the current active count.
   * Enforces the hard rule: Maximum 3 active Top-3 priorities simultaneously.
   */
  canAcceptTop3(currentActiveTop3Count: number): boolean {
    return currentActiveTop3Count < this.maxTop3Quota;
  }

  /**
   * Selects and orders the top 3 focus tasks from an active task list.
   */
  selectTop3(tasks: TaskResponseDto[]): TaskResponseDto[] {
    const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');

    const scored = activeTasks.map((task) => {
      let score = 0;

      // Priority base score
      if (task.priority === 'TOP_3') score += 1000;
      else if (task.priority === 'NORMAL') score += 500;
      else score += 100;

      // Deadline proximity score
      if (task.deadline) {
        const msUntilDeadline = new Date(task.deadline).getTime() - Date.now();
        const hoursUntilDeadline = msUntilDeadline / (1000 * 60 * 60);

        if (hoursUntilDeadline < 0) {
          score += 300; // Passed deadline, calm recovery priority
        } else if (hoursUntilDeadline <= 24) {
          score += 200; // Due today
        } else if (hoursUntilDeadline <= 48) {
          score += 100; // Due tomorrow
        }
      }

      // Scheduled time bonus
      if (task.scheduledStart) {
        score += 50;
      }

      return { task, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, this.maxTop3Quota).map((item) => item.task);
  }
}

export const top3PriorityEngine = new Top3PriorityEngine();

