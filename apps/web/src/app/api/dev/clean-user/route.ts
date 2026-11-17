import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import { deleteLocalUserByEmail } from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Only allow in development or test environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: 'Dev cleanup endpoints are disabled in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Parameter email wajib disertakan' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Delete from PostgreSQL via Prisma
    try {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        select: { id: true },
      });

      if (user) {
        // Cascade delete child entities explicitly then the user record
        await prisma.$transaction([
          prisma.task.deleteMany({ where: { userId: user.id } }),
          prisma.category.deleteMany({ where: { userId: user.id } }),
          prisma.scheduleBlock.deleteMany({ where: { userId: user.id } }),
          prisma.workloadDaily.deleteMany({ where: { userId: user.id } }),
          prisma.activityLog.deleteMany({ where: { userId: user.id } }),
          prisma.rescheduleAuditLog.deleteMany({ where: { userId: user.id } }),
          prisma.rescheduleLog.deleteMany({ where: { userId: user.id } }),
          prisma.notification.deleteMany({ where: { userId: user.id } }),
          prisma.session.deleteMany({ where: { userId: user.id } }),
          prisma.deviceToken.deleteMany({ where: { userId: user.id } }),
          prisma.user.delete({ where: { id: user.id } }),
        ]).catch(async () => {
          // If transaction fails or cascade handles it automatically
          await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
        });
      }
    } catch (err) {
      console.warn('Prisma clean-user error (PostgreSQL might be offline):', err);
    }

    // 2. Delete from local persistent storage
    deleteLocalUserByEmail(cleanEmail);

    return NextResponse.json({
      success: true,
      message: `User ${cleanEmail} and all relational data cleared.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
