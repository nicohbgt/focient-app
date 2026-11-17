import { PrismaClient, TaskPriority, TaskStatus, ScheduleBlockType, CapacityStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FoCient database...');

  // Upsert demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@focient.app' },
    update: {},
    create: {
      email: 'demo@focient.app',
      name: 'Budi Fokus',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fVQxTcOuqf0j9Kq2J.5y6Wq/5T4z4E2Y8k7mQKG', // demo1234
      timezone: 'Asia/Jakarta',
      workHourStart: '09:00',
      workHourEnd: '17:00',
      dailyCapacityMinutes: 480,
    },
  });

  console.log(`User seeded: ${user.name} (${user.id})`);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Seed Top-3 Priority Tasks
  const task1 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Tinjau Arsitektur Reschedule Engine',
      notes: 'Pastikan transisi ripple tidak memicu benturan slot.',
      durationMinutes: 90,
      priority: TaskPriority.TOP_3,
      status: TaskStatus.IN_PROGRESS,
      category: 'Engineering',
      scheduledStart: new Date(Date.now() + 3600000),
      scheduledEnd: new Date(Date.now() + 3600000 + 90 * 60000),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Validasi Kontras WCAG AAA Dark Mode',
      notes: 'Verifikasi seluruh pasangan text-bold pada bg-subtle.',
      durationMinutes: 60,
      priority: TaskPriority.TOP_3,
      status: TaskStatus.TODO,
      category: 'Design System',
    },
  });

  const task3 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Sinkronisasi Blok Jadwal Google Calendar',
      durationMinutes: 45,
      priority: TaskPriority.TOP_3,
      status: TaskStatus.TODO,
      category: 'Integrations',
    },
  });

  // Seed Schedule Block for Task 1
  await prisma.scheduleBlock.create({
    data: {
      userId: user.id,
      taskId: task1.id,
      title: task1.title,
      startTime: task1.scheduledStart!,
      endTime: task1.scheduledEnd!,
      isLocked: false,
      type: ScheduleBlockType.TASK,
    },
  });

  // Seed Workload Record
  await prisma.workloadDaily.upsert({
    where: { userId_date: { userId: user.id, date: todayStr } },
    update: { allocatedMinutes: 195 },
    create: {
      userId: user.id,
      date: todayStr,
      allocatedMinutes: 195,
      capacityMinutes: 480,
      status: CapacityStatus.LIGHT,
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
