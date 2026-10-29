import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { prisma } from '@focient/database';

describe('FoCient PostgreSQL-Backed API Integration Test Suite (P1 Quality & CI)', () => {
  let server: Server;
  let baseUrl: string;
  let authToken: string;
  let testUserId: string;
  let testTaskId: string;
  let isPostgresAvailable = false;

  const uniqueEmail = `integration_test_${Date.now()}@focient.app`;
  const testPassword = 'Password123!';

  before(async () => {
    // 1. Check PostgreSQL database connectivity
    if (process.env.DATABASE_URL) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        isPostgresAvailable = true;
      } catch {
        isPostgresAvailable = false;
      }
    }

    // 2. Start Express application on ephemeral port
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    // 1. Cleanup test records from database if PostgreSQL was used
    if (isPostgresAvailable && testUserId) {
      try {
        await prisma.activityLog.deleteMany({ where: { userId: testUserId } });
        await prisma.scheduleBlock.deleteMany({ where: { userId: testUserId } });
        await prisma.rescheduleAuditLog.deleteMany({ where: { userId: testUserId } });
        await prisma.task.deleteMany({ where: { userId: testUserId } });
        await prisma.deviceToken.deleteMany({ where: { userId: testUserId } });
        await prisma.notificationPreference.deleteMany({ where: { userId: testUserId } });
        await prisma.session.deleteMany({ where: { userId: testUserId } });
        await prisma.user.deleteMany({ where: { id: testUserId } });
      } catch {
        // Ignore teardown cleanup errors
      }
    }

    // 2. Disconnect prisma and close HTTP server
    if (isPostgresAvailable) {
      try {
        await prisma.$disconnect();
      } catch {
        // Ignore
      }
    }

    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('1. Verifies API Server Health Endpoint (/health)', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);

    const json = await res.json() as { status: string; timestamp: string };
    assert.strictEqual(json.status, 'UP');
    assert.ok(json.timestamp);
  });

  it('2. Readiness probe reflects database connection status (/ready)', async () => {
    const res = await fetch(`${baseUrl}/ready`);
    if (isPostgresAvailable) {
      assert.strictEqual(res.status, 200);
      const json = await res.json() as { status: string; database: string };
      assert.strictEqual(json.status, 'READY');
      assert.strictEqual(json.database, 'CONNECTED');
    } else {
      assert.strictEqual(res.status, 503);
      const json = await res.json() as { status: string; database: string };
      assert.strictEqual(json.status, 'NOT_READY');
      assert.strictEqual(json.database, 'DISCONNECTED');
    }
  });

  it('3. Rejects unauthenticated request with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/tasks`);
    assert.strictEqual(res.status, 401);
  });

  it('4. Registers a new user in PostgreSQL and returns authenticated JWT and profile', async (t) => {
    if (!isPostgresAvailable) {
      t.skip('Skipping PostgreSQL registration test because DATABASE_URL is not connected.');
      return;
    }

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: testPassword,
        name: 'Quality Integration Runner',
        timezone: 'Asia/Jakarta',
      }),
    });

    assert.ok(res.status === 201 || res.status === 200, `Expected 200/201 but received ${res.status}`);

    const json = await res.json() as { token: string; user: { id: string; email: string; name: string } };
    assert.ok(json.token, 'Expected JWT token in registration response');
    assert.strictEqual(json.user.email, uniqueEmail);

    authToken = json.token;
    testUserId = json.user.id;
  });

  it('5. Authenticates user login with valid credentials (/api/auth/login)', async (t) => {
    if (!isPostgresAvailable || !authToken) {
      t.skip('Skipping PostgreSQL login test because DATABASE_URL is not connected.');
      return;
    }

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: testPassword,
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json() as { token: string; user: { id: string } };
    assert.ok(json.token);
    assert.strictEqual(json.user.id, testUserId);
  });

  it('6. Creates a task with silent placement and returns compliant TaskResponseDto', async (t) => {
    if (!isPostgresAvailable || !authToken) {
      t.skip('Skipping PostgreSQL task creation test because DATABASE_URL is not connected.');
      return;
    }

    const taskPayload = {
      title: 'PostgreSQL Integration Task',
      notes: 'Testing real database persistence end to end',
      durationMinutes: 45,
      priority: 'TOP_3',
      energyLevel: 'HIGH',
      scheduledStart: '2026-10-29T10:00:00.000Z',
      category: 'Strategic',
      categoryName: 'Strategic',
      categoryColor: '#7C3AED',
      restMinutes: 15,
      focusType: 'Deep Focus',
    };

    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(taskPayload),
    });

    assert.ok(res.status === 201 || res.status === 200, `Expected 200/201, got ${res.status}`);
    const json = await res.json() as { id: string; title: string; priority: string; durationMinutes: number };
    assert.ok(json.id);
    assert.strictEqual(json.title, 'PostgreSQL Integration Task');
    assert.strictEqual(json.priority, 'TOP_3');
    assert.strictEqual(json.durationMinutes, 45);

    testTaskId = json.id;
  });

  it('7. Fetches tasks list and detail by ID for authenticated user', async (t) => {
    if (!isPostgresAvailable || !authToken || !testTaskId) {
      t.skip('Skipping PostgreSQL task fetch test because DATABASE_URL is not connected.');
      return;
    }

    const listRes = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(listRes.status, 200);
    const list = await listRes.json() as Array<{ id: string; title: string }>;
    assert.ok(Array.isArray(list));
    assert.ok(list.some((t) => t.id === testTaskId));

    const detailRes = await fetch(`${baseUrl}/api/tasks/${testTaskId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(detailRes.status, 200);
    const detail = await detailRes.json() as { id: string; title: string };
    assert.strictEqual(detail.id, testTaskId);
  });

  it('8. Calculates Today Plan with guilt-free capacity metrics (/api/schedule/today-plan)', async (t) => {
    if (!isPostgresAvailable || !authToken) {
      t.skip('Skipping PostgreSQL today plan test because DATABASE_URL is not connected.');
      return;
    }

    const res = await fetch(`${baseUrl}/api/schedule/today-plan?date=2026-10-29`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(res.status, 200);
    const plan = await res.json() as {
      date: string;
      timelineBlocks: unknown[];
      top3Priorities: unknown[];
      capacityProfile: { status: string; capacityPercentage: number };
    };

    assert.ok(plan.date);
    assert.ok(Array.isArray(plan.timelineBlocks));
    assert.ok(Array.isArray(plan.top3Priorities));
    assert.ok(plan.capacityProfile);
  });

  it('9. Registers device token and manages notification preferences', async (t) => {
    if (!isPostgresAvailable || !authToken) {
      t.skip('Skipping PostgreSQL notifications test because DATABASE_URL is not connected.');
      return;
    }

    const regRes = await fetch(`${baseUrl}/api/notifications/device-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token: `ci_device_token_${Date.now()}`,
        platform: 'ANDROID',
        deviceInfo: 'GitHub Actions Runner CI',
      }),
    });
    assert.ok(regRes.status === 201 || regRes.status === 200);

    const prefRes = await fetch(`${baseUrl}/api/notifications/preferences`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(prefRes.status, 200);
    const prefs = await prefRes.json() as { focusReminders: boolean; pushNotifications: boolean };
    assert.strictEqual(prefs.focusReminders, true);
    assert.strictEqual(prefs.pushNotifications, true);
  });

  it('10. Exports RFC 5545 iCalendar stream (/api/schedule/export/ics)', async (t) => {
    if (!isPostgresAvailable || !authToken) {
      t.skip('Skipping PostgreSQL iCal export test because DATABASE_URL is not connected.');
      return;
    }

    const res = await fetch(`${baseUrl}/api/schedule/export/ics`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type');
    assert.ok(contentType?.includes('text/calendar'));

    const text = await res.text();
    assert.ok(text.includes('BEGIN:VCALENDAR'));
    assert.ok(text.includes('END:VCALENDAR'));
    assert.ok(!text.includes('Terlambat') && !text.includes('Overdue'));
  });

  it('11. Marks task as complete with reflective activity log (/api/tasks/:id/complete)', async (t) => {
    if (!isPostgresAvailable || !authToken || !testTaskId) {
      t.skip('Skipping PostgreSQL task completion test because DATABASE_URL is not connected.');
      return;
    }

    const res = await fetch(`${baseUrl}/api/tasks/${testTaskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        actualDurationMinutes: 40,
        moodRating: 5,
        reflectionNotes: 'Selesai dalam kondisi fokus yang optimal.',
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json() as { status: string; completedAt: string };
    assert.strictEqual(json.status, 'COMPLETED');
    assert.ok(json.completedAt);
  });
});
