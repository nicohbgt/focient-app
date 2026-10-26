import { prisma, TaskStatus } from '@focient/database';
import {
  WeeklyReflectionDto,
  WeeklyInsightSummaryDto,
  CapacityStatus,
  SuccessMetricsDto,
} from '@focient/contracts';
import { workloadEngine } from '../../engine/workload.engine.js';

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

  /**
   * Proses 5.0: Evaluation & Weekly Analytics
   * Aggregates D5 (activity_logs) and D4 (user_capacities) across the 7-day period.
   */
  async getWeeklyInsightSummary(userId: string): Promise<WeeklyInsightSummaryDto> {
    const today = new Date();
    // 7 days window: today and previous 6 days
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const startDateStr = dates[0];
    const endDateStr = dates[dates.length - 1];

    const windowStart = new Date(`${startDateStr}T00:00:00.000Z`);
    const windowEnd = new Date(`${endDateStr}T23:59:59.999Z`);

    // Fetch D5: activity_logs with task details
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId,
        completedAt: { gte: windowStart, lte: windowEnd },
      },
      include: {
        task: true,
      },
    });

    // Fetch D4: user_capacities (WorkloadDaily)
    const capacities = await prisma.workloadDaily.findMany({
      where: {
        userId,
        date: { in: dates },
      },
    });

    // Fetch all tasks active or targeted in the 7-day window
    const windowTasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { targetDate: { gte: windowStart, lte: windowEnd } },
          { scheduledStart: { gte: windowStart, lte: windowEnd } },
          { completedAt: { gte: windowStart, lte: windowEnd } },
        ],
      },
    });

    const totalFocusMinutes = activityLogs.reduce((sum, log) => sum + log.actualDurationMinutes, 0);
    const completedTasks = activityLogs.length;
    const totalTasksCount = windowTasks.length;
    const overallCompletionRate =
      totalTasksCount > 0
        ? Math.min(100, Math.round((completedTasks / totalTasksCount) * 100))
        : completedTasks > 0
        ? 100
        : 0;

    // Daily rhythms aggregation
    const dailyRhythms = dates.map((dateStr) => {
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

      const dayLogs = activityLogs.filter((log) => {
        const logTime = log.completedAt.getTime();
        return logTime >= dayStart.getTime() && logTime <= dayEnd.getTime();
      });

      const dayTasks = windowTasks.filter((t) => {
        const target = t.targetDate ? t.targetDate.toISOString().split('T')[0] : null;
        const start = t.scheduledStart ? t.scheduledStart.toISOString().split('T')[0] : null;
        return target === dateStr || start === dateStr;
      });

      const dayFocusMinutes = dayLogs.reduce((sum, l) => sum + l.actualDurationMinutes, 0);
      const dayCompletedCount = dayLogs.length;
      const dayTotal = Math.max(dayTasks.length, dayCompletedCount);
      const dayCompletionRate =
        dayTotal > 0 ? Math.min(100, Math.round((dayCompletedCount / dayTotal) * 100)) : 0;

      return {
        date: dateStr,
        focusMinutes: dayFocusMinutes,
        completedCount: dayCompletedCount,
        completionRate: dayCompletionRate,
      };
    });

    // Category Distribution breakdown
    const categoryMinutesMap = new Map<string, number>();
    for (const log of activityLogs) {
      const cat = log.task?.category || 'Umum';
      categoryMinutesMap.set(cat, (categoryMinutesMap.get(cat) || 0) + log.actualDurationMinutes);
    }

    const categoryDistribution = Array.from(categoryMinutesMap.entries())
      .map(([category, minutes]) => ({
        category,
        minutes,
        percentage:
          totalFocusMinutes > 0 ? Math.round((minutes / totalFocusMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    // Guilt-Free Balance Score calculation:
    // Base 80, +10 for completion rate > 65%, -5 per overloaded day recorded in D4
    const overloadedDaysCount = capacities.filter((c) => c.isOverloaded).length;
    let balanceScore = 80;
    if (overallCompletionRate >= 65) balanceScore += 10;
    if (totalFocusMinutes >= 180 && totalFocusMinutes <= 2400) balanceScore += 10;
    balanceScore -= overloadedDaysCount * 5;
    const guiltFreeBalanceScore = Math.max(50, Math.min(100, balanceScore));

    // Formulate supportive, non-punitive reflection note
    let reflectionNote =
      'Ritme produktivitas mingguanmu seimbang dan terkendali. Tetap jaga konsistensi tanpa memaksakan diri.';
    if (totalFocusMinutes === 0 && completedTasks === 0) {
      reflectionNote =
        'Minggu ini belum tercatat aktivitas fokus. Tidak apa-apa, kamu bisa memulai kembali dengan satu langkah kecil hari ini.';
    } else if (overallCompletionRate >= 85) {
      reflectionNote =
        'Luar biasa! Penyelesaian tugasmu sangat tinggi minggu ini. Pertahankan ritme kerja yang tenang dan istirahat berkualitas.';
    } else if (overloadedDaysCount > 2) {
      reflectionNote =
        'Beberapa hari tercatat mendekati kapasitas maksimal. Manfaatkan fitur adaptive reschedule untuk menjaga energi tetap prima.';
    } else if (guiltFreeBalanceScore >= 80) {
      reflectionNote =
        'Keseimbangan waktu fokus dan jeda istirahatmu berjalan sangat baik. Pendekatan bebas rasa bersalah mendukung konsistensimu.';
    }

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      totalFocusMinutes,
      completedTasks,
      overallCompletionRate,
      guiltFreeBalanceScore,
      dailyRhythms,
      categoryDistribution,
      reflectionNote,
    };
  }

  /**
   * Evaluates the 3 MVP Success Metrics defined in FoCient PRD:
   * 1. Activation: Time to first plan (seconds) & activation state.
   * 2. Execution (Core): Task completion rate & consistent plan days.
   * 3. Efficiency: Reduction of manual rescheduling effort & saved minutes.
   */
  async getSuccessMetrics(userId: string): Promise<SuccessMetricsDto> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const [totalTasks, completedTasks, rescheduleAuditCount] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: TaskStatus.COMPLETED } }),
      prisma.rescheduleAuditLog.count({ where: { userId } }),
    ]);

    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Estimate ~15 minutes saved per automatic ripple adjustment
    const rescheduleTimeSavedMinutes = rescheduleAuditCount * 15;

    return {
      activation: {
        timeToFirstPlanSeconds: user?.timeToFirstPlanSeconds ?? null,
        isActivated: Boolean(user?.isOnboardingCompleted || user?.timeToFirstPlanSeconds),
      },
      execution: {
        taskCompletionRate,
        consistentPlanDays: user?.consistentPlanDays ?? 0,
        activeStreak: Math.max(1, user?.consistentPlanDays ?? 0),
      },
      efficiency: {
        rescheduleTimeSavedMinutes,
        manualAdjustmentsReducedCount: rescheduleAuditCount,
      },
    };
  }
}

export const insightService = new InsightService();
