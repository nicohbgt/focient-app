import { prisma, NotificationType } from '@focient/database';

/**
 * FoCient Notification & Reminder Service
 *
 * Dispatches gentle, empathetic reminders:
 * - Avoids alarmist or guilt-inducing alerts ("Terlambat", "Missed")
 * - Focuses on helpful recalibration prompts and restorative breaks
 */
export class NotificationService {
  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async sendFocusReminder(userId: string, taskTitle: string, scheduledTime: Date) {
    return prisma.notification.create({
      data: {
        userId,
        type: NotificationType.FOCUS_REMINDER,
        title: 'Sesi Fokus Berikutnya',
        message: `Waktunya fokus pada "${taskTitle}". Siapkan ruang kerja yang tenang.`,
      },
    });
  }

  async sendCapacityAlert(userId: string, allocatedHours: number, capacityHours: number) {
    return prisma.notification.create({
      data: {
        userId,
        type: NotificationType.CAPACITY_WARNING,
        title: 'Perlu Penyesuaian Jadwal',
        message: `Kapasitas hari ini tercatat ${allocatedHours}j dari target ${capacityHours}j. Pertimbangkan untuk memindahkan tugas ke esok hari.`,
      },
    });
  }
}

export const notificationService = new NotificationService();
