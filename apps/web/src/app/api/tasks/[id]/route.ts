import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  extractTokenFromRequest,
  verifySession,
  updateTaskInLocalDb,
  deleteTaskFromLocalDb,
} from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, user } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    let task: any = null;
    try {
      task = await prisma.task.findFirst({
        where: { id, userId: user.id },
      });
    } catch {}

    if (!task) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Gagal mengambil tugas.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, user } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const patch: any = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.status !== undefined) {
      patch.status = body.status === 'completed' || body.status === 'COMPLETED' ? 'COMPLETED' : 'TODO';
    }
    if (body.durationMinutes !== undefined) patch.durationMinutes = Number(body.durationMinutes);
    if (body.priority !== undefined) {
      patch.priority = body.priority === 'top3' || body.priority === 'TOP_3' ? 'TOP_3' : 'REGULAR';
    }
    if (body.isBacklog !== undefined) patch.isBacklog = Boolean(body.isBacklog);
    if (body.isRecurring !== undefined) patch.isRecurring = Boolean(body.isRecurring);
    if (body.recurrencePattern !== undefined) patch.recurrencePattern = body.recurrencePattern ? String(body.recurrencePattern) : null;
    if (body.recurrenceDays !== undefined) patch.recurrenceDays = typeof body.recurrenceDays === 'string' ? body.recurrenceDays : JSON.stringify(body.recurrenceDays);
    if (body.startHourDisplay !== undefined) patch.startHourDisplay = body.startHourDisplay;
    if (body.dateDisplay !== undefined) patch.dateDisplay = body.dateDisplay;

    // Resilient local update
    updateTaskInLocalDb(user.id, id, patch);

    // Also attempt PostgreSQL update
    try {
      await prisma.task.updateMany({
        where: { id, userId: user.id },
        data: {
          ...patch,
          ...(patch.status === 'COMPLETED' ? { completedAt: new Date() } : patch.status === 'TODO' ? { completedAt: null } : {}),
        },
      });
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('PUT /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui tugas.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, user } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Resilient local deletion
    deleteTaskFromLocalDb(user.id, id);

    // Also attempt PostgreSQL deletion
    try {
      await prisma.task.deleteMany({
        where: { id, userId: user.id },
      });
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus tugas.' }, { status: 500 });
  }
}
