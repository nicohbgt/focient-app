import { TaskResponseDto } from '@focient/contracts';

/**
 * FoCient Top-3 Priority Engine
 *
 * Implements the single-task focus principle:
 * Isolates and ranks the top 3 highest-leverage tasks from the user's backlog,
 * shielding the user from cognitive overload.
 */
export class Top3PriorityEngine {
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

    return scored.slice(0, 3).map((item) => item.task);
  }
}

export const top3PriorityEngine = new Top3PriorityEngine();
