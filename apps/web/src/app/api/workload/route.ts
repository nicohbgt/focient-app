import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import { getDayOfWeekIndex, getDayOfWeekName } from '@/lib/date-utils';
import { extractTokenFromRequest, verifySession } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Header otorisasi Bearer diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user, message } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: message || 'Sesi otorisasi telah berakhir.' },
        { status: 401 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id, isBacklog: false },
    });

    const totalMinutes = tasks
      .filter((t) => t.status !== 'COMPLETED')
      .reduce((sum, t) => sum + t.durationMinutes, 0);

    const capacityMinutes = user.dailyCapacityMinutes || 480;
    const percentage = Math.min(100, Math.round((totalMinutes / capacityMinutes) * 100));

    const dayKeys = [
      { dayKey: 'Mon', index: 0 },
      { dayKey: 'Tue', index: 1 },
      { dayKey: 'Wed', index: 2 },
      { dayKey: 'Thu', index: 3 },
      { dayKey: 'Fri', index: 4 },
      { dayKey: 'Sat', index: 5 },
      { dayKey: 'Sun', index: 6 },
    ];

    const weeklyWorkloads = dayKeys.map((d) => {
      const dayTasks = tasks.filter((t) => {
        const taskDay = getDayOfWeekIndex(t.dateDisplay);
        return taskDay === d.index;
      });
      const dayMinutes = dayTasks.reduce((sum, t) => sum + t.durationMinutes + (t.restMinutes || 0), 0);
      const dayPct = Math.min(100, Math.round((dayMinutes / capacityMinutes) * 100));
      return {
        dayKey: d.dayKey,
        fullDayName: getDayOfWeekName(d.index, 'en'),
        percentage: dayPct,
      };
    });

    return NextResponse.json({
      allocatedMinutes: totalMinutes,
      capacityMinutes,
      percentage,
      isOverloaded: percentage > 90,
      status: percentage > 90 ? 'NEAR_CAPACITY' : percentage > 50 ? 'OPTIMAL' : 'LIGHT',
      weeklyWorkloads,
    });
  } catch (error) {
    console.error('GET /api/workload error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat beban kerja.' },
      { status: 500 }
    );
  }
}
