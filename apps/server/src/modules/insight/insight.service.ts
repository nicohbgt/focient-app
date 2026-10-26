import { prisma, TaskStatus } from '@focient/database';
import { WeeklyReflectionDto, CapacityStatus } from '@focient/contracts';
import { workloadEngine } from '../../engine/workload-engine.js';

export interface DailyInsightDto {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  allocatedMinutes: number;
  capacityMinutes: number;
  workloadPercentage: number;
  status: CapacityStatus;
  adaptiveNote: string;
  topCategories: Array<{ category: string; minutes: number }>;
}

/**
 * FoCient Insights & Analytics Service
 *
 * Computes daily summaries, weekly reflections, and calm productivity indices:
 * - Total focused minutes
 * - Guilt-free balance score (evaluates consistent pacing without late-night burnout)
 * - Category time distribution & adaptive notes
 */
export class InsightService {
  /**
   * Computes daily insight metrics with empathetic, guilt-free commentary.
   */
  async getDailyInsight(userId: string, dateStr?: string): Promise<DailyInsightDto> {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const dayStart = new Date(`${targetDate}T00:00:00.000Z`);
    const dayEnd = new Date(`${targetDate}T23:59:59.999Z`);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const capacityMinutes = user?.dailyCapacityMinutes ?? 480;

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { scheduledStart: { gte: dayStart, lte: dayEnd } },
          { createdAt: { gte: dayStart, lte: dayEnd } },
        ],
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const allocatedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);

    const workload = workloadEngine.calculateWorkload(
      targetDate,
      allocatedMinutes,
      capacityMinutes,
      totalTasks,
      completedTasks
    );

    // Group by category
    const categoryMap = new Map<string, number>();
    for (const t of tasks) {
      const cat = t.category || 'Umum';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.durationMinutes);
    }

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, minutes]) => ({ category, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    // Generate empathetic adaptive note
    let adaptiveNote = 'Fokus harian berjalan seimbang.';
    if (totalTasks === 0) {
      adaptiveNote = 'Belum ada agenda terdaftar hari ini. Nikmati hari santai atau mulai dengan 1 tugas fokus.';
    } else if (completionRate === 100) {
      adaptiveNote = 'Luar biasa! Seluruh target harianmu terselesaikan dengan tenang dan tuntas.';
    } else if (workload.status === 'OVERLOAD') {
      adaptiveNote =
        'Alokasi jam kerja melebihi kapasitas idealmu. Manfaatkan 1-Click Guilt-Free Reschedule untuk menggeser sisa tugas ke besok tanpa beban.';
    } else if (workload.status === 'OPTIMAL') {
      adaptiveNote = 'Ritme fokusmu berada di zona optimal (50%-75%). Produktivitas tinggi tanpa risiko kelelahan.';
    } else if (workload.status === 'NEAR_CAPACITY') {
      adaptiveNote =
        'Jadwal harianmu hampir terisi penuh. Fokuskan energimu pada 3 prioritas utama sebelum mengambil agenda baru.';
    } else {
      adaptiveNote = 'Kapasitas harianmu masih lapang. Sangat cocok untuk fokus mendalam atau jeda berkualitas.';
    }

    return {
      date: targetDate,
      totalTasks,
      completedTasks,
      completionRate,
      allocatedMinutes,
      capacityMinutes,
      workloadPercentage: workload.percentage,
      status: workload.status,
      adaptiveNote,
      topCategories,
    };
  }

  async getWeeklyReflection(userId: string): Promise<WeeklyReflectionDto> {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const [tasks, rescheduleLogs] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: TaskStatus.COMPLETED,
          completedAt: { gte: start, lte: end },
        },
      }),
      prisma.rescheduleLog.count({
        where: {
          userId,
          appliedAt: { gte: start, lte: end },
        },
      }),
    ]);

    const totalFocusMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);

    // Group by category
    const categoryMap = new Map<string, number>();
    for (const t of tasks) {
      const cat = t.category || 'Umum';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.durationMinutes);
    }

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, minutes]) => ({ category, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    // Calculate a guilt-free balance score: 100 base, balanced by consistent execution
    const guiltFreeBalanceScore = Math.min(
      100,
      Math.max(60, 85 + (tasks.length > 5 ? 10 : 0) - (rescheduleLogs > 10 ? 5 : 0))
    );

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalFocusMinutes,
      completedTasks: tasks.length,
      guiltFreeBalanceScore,
      rescheduleCount: rescheduleLogs,
      topCategories,
    };
  }
}

export const insightService = new InsightService();
