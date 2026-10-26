import { TaskResponseDto } from '@focient/contracts';

export const MAX_TOP_3_TASKS = 3;

// Canonical Deep Focus & High Cognitive Load categories
export const DEEP_FOCUS_CATEGORIES = new Set([
  'deep focus',
  'fokus inti',
  'coding',
  'pengembangan',
  'arsitektur',
  'research',
  'writing',
  'desain',
  'analisis',
  'engineering',
]);

/**
 * FoCient Algoritma 4: Resolusi Top 3 Priorities (Seleksi Tugas Utama)
 *
 * Implements deterministic single-task focus:
 * Top3 = HighPriority + DeepFocusCategories
 *
 * Sorting Precedence:
 * 1. Filter: Status != 'COMPLETED'
 * 2. Precedence 1: Explicit User Pin / Override ('TOP_3')
 * 3. Precedence 2: Kategori Deep Focus / High Cognitive Load
 * 4. Precedence 3: Durasi Pengerjaan Terbesar (High Energy)
 * 5. Precedence 4: Urutan Pembuatan Awal (FIFO)
 * 6. Ambil Top 3 Items Pertama
 *
 * Pencegahan Inflasi Prioritas:
 * Menyediakan mekanisme pertukaran (swap) prioritas jika kuota 3 penuh.
 */
export class Top3PrioritiesEngine {
  readonly maxTop3Quota = MAX_TOP_3_TASKS;

  /**
   * Evaluates if a given category qualifies as Deep Focus / High Cognitive Load.
   */
  isDeepFocusCategory(category?: string | null): boolean {
    if (!category) return false;
    const normalized = category.trim().toLowerCase();
    return (
      DEEP_FOCUS_CATEGORIES.has(normalized) ||
      Array.from(DEEP_FOCUS_CATEGORIES).some((df) => normalized.includes(df))
    );
  }

  /**
   * Validates whether a new active TOP_3 task can be added given the current active count.
   * Enforces the hard rule: Maximum 3 active Top-3 priorities simultaneously.
   */
  canAcceptTop3(currentActiveTop3Count: number): boolean {
    return currentActiveTop3Count < this.maxTop3Quota;
  }

  /**
   * Selects the Top 3 focus tasks following the strict 5-stage sorting precedence.
   */
  selectTop3(tasks: TaskResponseDto[]): TaskResponseDto[] {
    // Stage 1: Filter out completed tasks
    const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');

    // Stage 2 to 5: Deterministic multi-tier sorting precedence
    activeTasks.sort((a, b) => {
      // Precedence 1: Explicit User Pin ('TOP_3')
      const aIsTop3 = a.priority === 'TOP_3';
      const bIsTop3 = b.priority === 'TOP_3';
      if (aIsTop3 && !bIsTop3) return -1;
      if (!aIsTop3 && bIsTop3) return 1;

      // Precedence 2: Kategori Deep Focus / High Cognitive Load
      const aIsDeep = this.isDeepFocusCategory(a.category);
      const bIsDeep = this.isDeepFocusCategory(b.category);
      if (aIsDeep && !bIsDeep) return -1;
      if (!aIsDeep && bIsDeep) return 1;

      // Precedence 3: Durasi Pengerjaan Terbesar (High Energy)
      if (a.durationMinutes !== b.durationMinutes) {
        return b.durationMinutes - a.durationMinutes;
      }

      // Precedence 4: Urutan Pembuatan Awal (FIFO)
      const aCreated = new Date(a.createdAt).getTime();
      const bCreated = new Date(b.createdAt).getTime();
      return aCreated - bCreated;
    });

    // Stage 6: Ambil Top 3 Items Pertama
    return activeTasks.slice(0, this.maxTop3Quota);
  }

  /**
   * Swaps priority between a candidate task and an existing active Top-3 task.
   */
  swapTop3Priority(
    candidateTaskId: string,
    targetToDemoteId: string,
    tasks: TaskResponseDto[]
  ): { candidate: TaskResponseDto; demoted: TaskResponseDto } | null {
    const candidate = tasks.find((t) => t.id === candidateTaskId);
    const demoted = tasks.find((t) => t.id === targetToDemoteId);

    if (!candidate || !demoted) return null;

    return {
      candidate: { ...candidate, priority: 'TOP_3' },
      demoted: { ...demoted, priority: 'REGULAR' },
    };
  }
}

export const top3PrioritiesEngine = new Top3PrioritiesEngine();
export const top3PriorityEngine = top3PrioritiesEngine;
export { Top3PrioritiesEngine as Top3PriorityEngine };
