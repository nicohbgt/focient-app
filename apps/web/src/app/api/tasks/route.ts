import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import { formatCurrentDate } from '@/lib/date-utils';
import {
  extractTokenFromRequest,
  verifySession,
  saveTaskToLocalDb,
  getTasksFromLocalDb,
} from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Token otorisasi diperlukan.' },
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

    // 1. Try PostgreSQL first
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: user.id },
        orderBy: { scheduledStart: 'asc' },
        take: 200,
      });

      if (tasks && tasks.length > 0) {
        return NextResponse.json(tasks);
      }
    } catch {
      // PostgreSQL is offline
    }

    // 2. Fall back to local persistent store
    const localTasks = getTasksFromLocalDb(user.id);
    return NextResponse.json(localTasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Token otorisasi diperlukan.' },
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

    const body = await request.json();
    const {
      id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      durationMinutes = 25,
      categoryId,
      categoryName = 'Strategic',
      categoryColor = '#7C3AED',
      priority = 'REGULAR',
      energyLevel = 'MEDIUM',
      focusType = 'High',
      restMinutes = 10,
      isBacklog = false,
      isRecurring = false,
      recurrencePattern = 'daily',
      recurrenceDays,
      startHourDisplay = '10:00 AM',
      dateDisplay = formatCurrentDate(new Date()),
    } = body;

    const taskPayload = {
      id,
      userId: user.id,
      title: title || 'Tugas Baru',
      durationMinutes: Number(durationMinutes),
      categoryName,
      categoryColor,
      priority: priority === 'top3' || priority === 'TOP_3' ? 'TOP_3' : 'REGULAR',
      energyLevel: energyLevel === 'high' ? 'HIGH' : energyLevel === 'low' ? 'LOW' : 'MEDIUM',
      focusType,
      restMinutes: Number(restMinutes),
      needRestAfter: Boolean(body.needRestAfter !== undefined ? body.needRestAfter : true),
      isBacklog: Boolean(isBacklog),
      isRecurring: Boolean(isRecurring),
      recurrencePattern: recurrencePattern ? String(recurrencePattern) : null,
      recurrenceDays: recurrenceDays ? (typeof recurrenceDays === 'string' ? recurrenceDays : JSON.stringify(recurrenceDays)) : null,
      startHourDisplay,
      dateDisplay,
      status: 'TODO',
      createdAt: new Date().toISOString(),
    };

    // Always persist to local DB for resilience
    saveTaskToLocalDb(taskPayload);

    // Also attempt PostgreSQL write
    try {
      const newTask = await prisma.task.create({
        data: {
          id: taskPayload.id,
          userId: user.id,
          categoryId: categoryId || null,
          title: taskPayload.title,
          durationMinutes: taskPayload.durationMinutes,
          categoryName: taskPayload.categoryName,
          categoryColor: taskPayload.categoryColor,
          priority: (taskPayload.priority === 'TOP_3' ? 'TOP_3' : 'REGULAR') as any,
          energyLevel: (taskPayload.energyLevel === 'HIGH' ? 'HIGH' : taskPayload.energyLevel === 'LOW' ? 'LOW' : 'MEDIUM') as any,
          focusType: taskPayload.focusType,
          restMinutes: taskPayload.restMinutes,
          isBacklog: taskPayload.isBacklog,
          isRecurring: taskPayload.isRecurring,
          recurrencePattern: taskPayload.recurrencePattern,
          recurrenceDays: taskPayload.recurrenceDays,
          startHourDisplay: taskPayload.startHourDisplay,
          dateDisplay: taskPayload.dateDisplay,
          status: 'TODO',
        },
      });
      return NextResponse.json(newTask, { status: 201 });
    } catch {
      // Prisma offline: return resilient local task
      return NextResponse.json(taskPayload, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat tugas di database.' },
      { status: 500 }
    );
  }
}
