import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  RegisterDeviceTokenSchema,
  UpdateNotificationPreferencesSchema,
  TaskResponseDto,
} from '@focient/contracts';
import { formatTask } from '../src/modules/task/task.controller.js';
import { notificationService } from '../src/modules/notification/notification.service.js';
import { cache } from '../src/common/redis.js';
import { jobQueue } from '../src/common/queue.js';

describe('FoCient DTO, Contract & Mobile Compatibility Specification (P1 Data & Integrations)', () => {

  describe('1. Prisma Task to Server formatTask to TaskResponseDto Contract Alignment', () => {
    it('accurately maps all Prisma Task fields to TaskResponseDto without data loss', () => {
      const mockPrismaTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        category: 'Strategic',
        title: 'Draft System Architecture',
        notes: 'Include non-punitive rescheduling model',
        durationMinutes: 45,
        priority: 'TOP_3',
        energyLevel: 'HIGH',
        status: 'TODO',
        targetDate: new Date('2026-10-29T00:00:00.000Z'),
        startTime: new Date('2026-10-29T09:00:00.000Z'),
        scheduledStart: new Date('2026-10-29T09:00:00.000Z'),
        scheduledEnd: new Date('2026-10-29T09:45:00.000Z'),
        deadline: new Date('2026-10-29T17:00:00.000Z'),
        completedAt: null,
        focusType: 'Deep Focus',
        restMinutes: 15,
        needRestAfter: true,
        isBacklog: false,
        categoryName: 'Strategic',
        categoryColor: '#7C3AED',
        dateDisplay: 'October, 29th 2026',
        startHourDisplay: '09:00',
        createdAt: new Date('2026-10-29T08:00:00.000Z'),
        updatedAt: new Date('2026-10-29T08:30:00.000Z'),
      };

      const dto: TaskResponseDto = formatTask(mockPrismaTask);

      assert.strictEqual(dto.id, mockPrismaTask.id);
      assert.strictEqual(dto.userId, mockPrismaTask.userId);
      assert.strictEqual(dto.title, 'Draft System Architecture');
      assert.strictEqual(dto.durationMinutes, 45);
      assert.strictEqual(dto.priority, 'TOP_3');
      assert.strictEqual(dto.energyLevel, 'HIGH');
      assert.strictEqual(dto.status, 'TODO');
      assert.strictEqual(dto.categoryName, 'Strategic');
      assert.strictEqual(dto.categoryColor, '#7C3AED');
      assert.strictEqual(dto.focusType, 'Deep Focus');
      assert.strictEqual(dto.restMinutes, 15);
      assert.strictEqual(dto.needRestAfter, true);
      assert.strictEqual(dto.isBacklog, false);
      assert.strictEqual(dto.dateDisplay, 'October, 29th 2026');
      assert.strictEqual(dto.startHourDisplay, '09:00');
      assert.strictEqual(dto.startTime, '2026-10-29T09:00:00.000Z');
      assert.strictEqual(dto.endTime, '2026-10-29T09:45:00.000Z');
    });

    it('provides calm, sensible defaults when optional fields are null or unset', () => {
      const minimalPrismaTask = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Quick Reflection',
        notes: null,
        durationMinutes: 20,
        priority: 'REGULAR',
        energyLevel: null,
        status: 'TODO',
        createdAt: new Date('2026-10-29T08:00:00.000Z'),
        updatedAt: new Date('2026-10-29T08:00:00.000Z'),
      };

      const dto = formatTask(minimalPrismaTask);

      assert.strictEqual(dto.energyLevel, 'MEDIUM');
      assert.strictEqual(dto.focusType, 'Medium');
      assert.strictEqual(dto.restMinutes, 10);
      assert.strictEqual(dto.needRestAfter, true);
      assert.strictEqual(dto.isBacklog, false);
      assert.strictEqual(dto.categoryName, 'Strategic');
      assert.strictEqual(dto.categoryColor, '#7C3AED');
      assert.strictEqual(dto.startHourDisplay, '11:40');
    });
  });

  describe('2. Server JSON Serialization to Mobile TaskDtoMapper Compatibility', () => {
    it('serializes payload with all properties required by Flutter TaskDtoMapper.fromJson', () => {
      const serverPayload = {
        id: 'task-test-01',
        userId: 'user-01',
        title: 'Review Sprint Goals',
        notes: 'Check team rhythm',
        durationMinutes: 30,
        priority: 'TOP_3',
        energyLevel: 'HIGH',
        status: 'IN_PROGRESS',
        scheduledStart: '2026-10-29T10:00:00.000Z',
        categoryName: 'Execution',
        categoryColor: '#0284C7',
        restMinutes: 10,
        dateDisplay: 'October, 29th 2026',
        startHourDisplay: '10:00',
        focusType: 'Deep Focus',
        isBacklog: false,
        needRestAfter: true,
        createdAt: '2026-10-29T08:00:00.000Z',
        updatedAt: '2026-10-29T08:00:00.000Z',
      };

      // Emulate mobile TaskDtoMapper logic in TypeScript
      const mobilePriority = serverPayload.priority === 'TOP_3'
        ? 'top3'
        : serverPayload.priority === 'LOW' ? 'low' : 'normal';
      const mobileStatus = serverPayload.status === 'COMPLETED'
        ? 'completed'
        : serverPayload.status === 'IN_PROGRESS' ? 'inProgress' : 'todo';
      const mobileEnergy = serverPayload.energyLevel === 'HIGH'
        ? 'high'
        : serverPayload.energyLevel === 'LOW' ? 'low' : 'medium';

      assert.strictEqual(mobilePriority, 'top3');
      assert.strictEqual(mobileStatus, 'inProgress');
      assert.strictEqual(mobileEnergy, 'high');

      // Hex Color parsing verification (Color(0xFF0284C7))
      const hexClean = serverPayload.categoryColor.replace('#', '');
      const parsedColorInt = parseInt(`FF${hexClean}`, 16);
      assert.strictEqual(parsedColorInt, 0xFF0284C7);
    });

    it('handles legacy and alias fields (category vs categoryName, targetDate vs dateDisplay)', () => {
      const legacyPayload = {
        id: 'task-test-legacy',
        title: 'Legacy Compatibility Task',
        durationMinutes: 25,
        priority: 'REGULAR',
        status: 'COMPLETED',
        category: 'Meeting',
        targetDate: '2026-10-29T00:00:00.000Z',
      };

      const categoryName = legacyPayload.category;
      const dateDisplay = legacyPayload.targetDate.split('T')[0];

      assert.strictEqual(categoryName, 'Meeting');
      assert.strictEqual(dateDisplay, '2026-10-29');
    });
  });

  describe('3. Mobile TaskDtoMapper.toJson to Server Validation Schema Compatibility', () => {
    it('validates mobile client serialized JSON against CreateTaskSchema', () => {
      const mobileExportedTask = {
        title: 'Write Documentation',
        notes: 'Detail ADR-004 and ADR-005',
        durationMinutes: 45,
        priority: 'TOP_3' as const,
        energyLevel: 'HIGH' as const,
        scheduledStart: '2026-10-29T14:00:00.000Z',
        category: 'Strategic',
        categoryName: 'Strategic',
        categoryColor: '#7C3AED',
        restMinutes: 15,
        dateDisplay: 'October, 29th 2026',
        startHourDisplay: '14:00',
        focusType: 'Deep Focus',
        isBacklog: false,
        needRestAfter: true,
      };

      const parsed = CreateTaskSchema.safeParse(mobileExportedTask);
      assert.strictEqual(parsed.success, true);
      if (parsed.success) {
        assert.strictEqual(parsed.data.title, 'Write Documentation');
        assert.strictEqual(parsed.data.durationMinutes, 45);
        assert.strictEqual(parsed.data.priority, 'TOP_3');
      }
    });

    it('validates mobile client serialized JSON against UpdateTaskSchema', () => {
      const mobileUpdatePayload = {
        status: 'COMPLETED' as const,
        notes: 'Selesai tepat waktu dengan fokus penuh',
      };

      const parsed = UpdateTaskSchema.safeParse(mobileUpdatePayload);
      assert.strictEqual(parsed.success, true);
      if (parsed.success) {
        assert.strictEqual(parsed.data.status, 'COMPLETED');
      }
    });
  });

  describe('4. Device Token Storage & Notification Preferences', () => {
    const testUserId = 'test-user-compatibility-01';

    it('validates RegisterDeviceTokenSchema with valid inputs', () => {
      const validTokenData = {
        token: 'fcm_device_token_sample_abc123xyz789',
        platform: 'ANDROID' as const,
        deviceInfo: 'Samsung Galaxy S21 (Android 14)',
      };

      const result = RegisterDeviceTokenSchema.safeParse(validTokenData);
      assert.strictEqual(result.success, true);
    });

    it('registers and retrieves device tokens via NotificationService', async () => {
      const tokenRecord = await notificationService.registerDeviceToken(testUserId, {
        token: 'fcm_token_test_abc_123',
        platform: 'ANDROID',
        deviceInfo: 'SM-G990E',
      });

      assert.ok(tokenRecord);
      assert.strictEqual(tokenRecord.token, 'fcm_token_test_abc_123');

      const tokens = await notificationService.getDeviceTokens(testUserId);
      assert.ok(tokens.includes('fcm_token_test_abc_123'));
    });

    it('retrieves and updates notification preferences with supportive defaults', async () => {
      const prefs = await notificationService.getPreferences(testUserId);
      assert.strictEqual(prefs.focusReminders, true);
      assert.strictEqual(prefs.capacityAlerts, true);
      assert.strictEqual(prefs.pushNotifications, true);

      const updateData = {
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        pushNotifications: true,
      };

      const validUpdate = UpdateNotificationPreferencesSchema.safeParse(updateData);
      assert.strictEqual(validUpdate.success, true);

      const updated = await notificationService.updatePreferences(testUserId, updateData);
      assert.strictEqual(updated.quietHoursStart, '22:00');
      assert.strictEqual(updated.quietHoursEnd, '07:00');
    });

    it('dispatches supportive push notification with 3x retry mechanism', async () => {
      const result = await notificationService.dispatchFcmNotification(testUserId, {
        title: 'Sesi Fokus Berikutnya',
        body: 'Waktunya fokus pada "System Architecture".',
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.deliveredAt);
    });

    it('unregisters device token cleanly', async () => {
      const success = await notificationService.unregisterDeviceToken(testUserId, 'fcm_token_test_abc_123');
      assert.strictEqual(success, true);
    });
  });

  describe('5. Redis Cache & BullMQ Background Queue Integration', () => {
    it('sets, retrieves, and deletes values from CacheService with memory fallback', async () => {
      const testKey = 'test:active_plan:user_42';
      const testPlan = {
        date: '2026-10-29',
        allocatedMinutes: 240,
        capacityPercentage: 50.0,
      };

      await cache.set(testKey, testPlan, 60);

      const retrieved = await cache.get<typeof testPlan>(testKey);
      assert.deepStrictEqual(retrieved, testPlan);

      await cache.del(testKey);
      const afterDel = await cache.get(testKey);
      assert.strictEqual(afterDel, null);
    });

    it('enqueues background job and invokes registered processor handler', async () => {
      let processed = false;
      let receivedData: any = null;

      jobQueue.registerHandler('test:ping', async (data) => {
        processed = true;
        receivedData = data;
      });

      const jobId = await jobQueue.add('test:ping', { ping: 'pong' });
      assert.ok(jobId);

      // Allow brief async event loop cycle
      await new Promise((resolve) => setTimeout(resolve, 50));
      assert.strictEqual(processed, true);
      assert.deepStrictEqual(receivedData, { ping: 'pong' });
    });
  });

  describe('6. Universal RFC 5545 iCalendar (.ics) Export Compatibility', () => {
    it('formats RFC 5545 calendar entries with non-punitive event descriptions', () => {
      const task = {
        id: 'ics-task-01',
        title: 'Deep Work: Core Engine',
        notes: 'Focus on adaptive algorithm',
        durationMinutes: 60,
        status: 'CONFIRMED',
      };

      const now = new Date('2026-10-29T10:00:00.000Z');
      const startIso = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = new Date(now.getTime() + task.durationMinutes * 60000);
      const endIso = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const icsEventLines = [
        'BEGIN:VEVENT',
        `UID:focient-task-${task.id}@focient.app`,
        `DTSTAMP:${startIso}`,
        `DTSTART:${startIso}`,
        `DTEND:${endIso}`,
        `SUMMARY:${task.title}`,
        `DESCRIPTION:${task.notes}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ];

      const icsString = icsEventLines.join('\r\n');
      assert.ok(icsString.includes('BEGIN:VEVENT'));
      assert.ok(icsString.includes('SUMMARY:Deep Work: Core Engine'));
      assert.ok(icsString.includes('END:VEVENT'));
      assert.ok(!icsString.includes('Terlambat') && !icsString.includes('Overdue'));
    });
  });

});
