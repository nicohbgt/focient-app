import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import { resetLocalDb } from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: 'Dev reset endpoint is disabled in production' },
      { status: 403 }
    );
  }

  try {
    // 1. Reset PostgreSQL tables if connected
    try {
      await prisma.$transaction([
        prisma.task.deleteMany(),
        prisma.category.deleteMany(),
        prisma.scheduleBlock.deleteMany(),
        prisma.workloadDaily.deleteMany(),
        prisma.activityLog.deleteMany(),
        prisma.rescheduleAuditLog.deleteMany(),
        prisma.rescheduleLog.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.session.deleteMany(),
        prisma.deviceToken.deleteMany(),
        prisma.user.deleteMany(),
      ]);
    } catch (err) {
      console.warn('Prisma reset-db skipped or encountered error:', err);
    }

    // 2. Reset local persistent DB
    resetLocalDb();

    return NextResponse.json({
      success: true,
      message: 'Dev database reset successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
