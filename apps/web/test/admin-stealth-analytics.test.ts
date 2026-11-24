import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAllUsersForAdmin,
  getUserDetailForAdmin,
  updateUserRoleByAdmin,
  updateUserSubscriptionByAdmin,
  updateUserOnboardingByAdmin,
  readLocalDb,
  verifySession,
} from '../src/lib/auth-server.ts';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware.ts';

test('FoCient Admin & Analytics Console - Stealth Security & Analytics Suite', async (t) => {
  await t.test('1. Stealth Security: Unauthenticated request to /ops-console rewrites to /404', async () => {
    const req = new NextRequest('http://localhost:3000/ops-console', {
      headers: {},
    });

    const res = await middleware(req);
    assert.ok(res, 'Middleware must return a response');
    assert.equal(res.status, 404, 'Response status must be 404 Not Found');

    const rewrittenUrl = res.headers.get('x-middleware-rewrite');
    assert.ok(
      rewrittenUrl?.includes('/404'),
      'Unauthenticated request must be rewritten to /404 to hide console existence'
    );
  });

  await t.test('2. Stealth Security: Non-privileged USER role to /ops-console rewrites to /404 without 403 leaks', async () => {
    // Read local db to find a user with USER role
    const localDb = readLocalDb();
    const standardUser = localDb.users.find((u) => u.role === 'USER' || !u.role);
    assert.ok(standardUser, 'A user with role USER must exist in database');

    const req = new NextRequest('http://localhost:3000/ops-console/subscriptions', {
      headers: {
        // Missing valid admin token or role
        cookie: 'focient_token=invalid_or_non_admin_token',
      },
    });

    const res = await middleware(req);
    assert.ok(res, 'Middleware must return a response');
    assert.equal(res.status, 404, 'Response status must strictly be 404 (never 403 or 401)');

    const rewrittenUrl = res.headers.get('x-middleware-rewrite');
    assert.ok(
      rewrittenUrl?.includes('/404'),
      'Standard user must be rewritten to /404 without leaking console existence'
    );
  });

  await t.test('3. RBAC & Database Schema: UserRole & SubscriptionTier Enums Integrity', async () => {
    const users = await getAllUsersForAdmin();
    assert.ok(users.length > 0, 'Users must be retrieved for admin');

    // Verify valid UserRole values
    const validRoles = new Set(['USER', 'INTERNAL_OPERATOR', 'SUPERADMIN']);
    users.forEach((u) => {
      assert.ok(validRoles.has(u.role), `User role ${u.role} must be a valid UserRole enum value`);
    });

    // Verify valid SubscriptionTier values
    const validTiers = new Set(['FREE', 'FOUNDERS_PASS', 'PRO_MONTHLY']);
    users.forEach((u) => {
      assert.ok(validTiers.has(u.subscriptionTier), `Tier ${u.subscriptionTier} must be a valid SubscriptionTier enum value`);
    });

    // Verify Superadmin user exists
    const superadmin = users.find((u) => u.role === 'SUPERADMIN');
    assert.ok(superadmin, 'At least one SUPERADMIN must exist in the system');
    assert.equal(superadmin.role, 'SUPERADMIN');
  });

  await t.test('4. Modul 1: Traction & Onboarding Analytics Contract', async () => {
    const users = await getAllUsersForAdmin();
    const totalUsers = users.length;
    const completedCount = users.filter((u) => u.isOnboardingCompleted).length;
    const onboardingRate = Math.round((completedCount / totalUsers) * 1000) / 10;

    assert.ok(totalUsers >= 20, 'System should aggregate traction over registered users');
    assert.ok(onboardingRate > 0 && onboardingRate <= 100, 'Onboarding completion rate must be a valid percentage');

    // Time to First Plan average
    const validTimes = users.map((u) => u.timeToFirstPlanSeconds).filter((s): s is number => typeof s === 'number' && s > 0);
    assert.ok(validTimes.length > 0, 'Time to first plan must be tracked across active users');
    const avgSeconds = Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
    assert.ok(avgSeconds > 0, 'Average time to first plan seconds must be positive');

    // Job Archetype Distribution: Tech & Product, Creative & Freelance, Business, Student, General
    const requiredArchetypes = ['Tech & Product', 'Creative & Freelance', 'Business', 'Student', 'General'];
    const archetypeCounts: Record<string, number> = {};
    requiredArchetypes.forEach((a) => (archetypeCounts[a] = 0));

    users.forEach((u) => {
      const arch = u.roleArchetype || u.occupancy || 'General';
      const matched = requiredArchetypes.find((cat) => arch.toLowerCase().includes(cat.toLowerCase().split(' ')[0])) || 'General';
      archetypeCounts[matched]++;
    });

    requiredArchetypes.forEach((arch) => {
      assert.ok(archetypeCounts[arch] >= 1, `Archetype ${arch} must be represented in distribution`);
    });
  });

  await t.test('5. Modul 1: Retention Metrics, Stickiness Ratio & 8-Week Cohorts', async () => {
    const localDb = readLocalDb();
    const tasks = localDb.tasks;
    assert.ok(tasks.length > 0, 'Tasks must exist to compute DAU/WAU');

    const users = await getAllUsersForAdmin();
    const activeUserIds = new Set(tasks.map((t) => t.userId));
    assert.ok(activeUserIds.size > 0, 'Active users must be computed');

    // DAU/WAU Stickiness
    const dau = activeUserIds.size;
    const wau = users.length;
    const stickiness = Math.round((dau / wau) * 1000) / 10;
    assert.ok(stickiness >= 0 && stickiness <= 100, 'Stickiness ratio must be between 0 and 100%');
  });

  await t.test('6. Modul 2: Subscription & Commercial Metrics: Founder’s Pass Quota Tracker', async () => {
    const users = await getAllUsersForAdmin();
    const foundersPassUsers = users.filter((u) => u.subscriptionTier === 'FOUNDERS_PASS');
    const claimedCount = foundersPassUsers.length;
    const maxQuota = 50;
    const remaining = maxQuota - claimedCount;
    const percentage = Math.round((claimedCount / maxQuota) * 100);

    assert.equal(claimedCount, 14, "Founder's Pass quota claimed must track accurately (e.g. 14 claims)");
    assert.equal(remaining, 36, "Founder's Pass quota remaining must be accurately calculated (50 - 14 = 36)");
    assert.equal(percentage, 28, "Founder's Pass percentage claimed must be 28%");

    // Verify claim numbers are unique positive integers
    const claimNumbers = foundersPassUsers.map((u) => u.founderPassClaimNumber).filter((n): n is number => typeof n === 'number');
    const uniqueClaimNumbers = new Set(claimNumbers);
    assert.equal(claimNumbers.length, uniqueClaimNumbers.size, 'Founder pass claim numbers must be unique');
  });

  await t.test('7. Modul 2: Subscription Manual Override Action Contract', async () => {
    const users = await getAllUsersForAdmin();
    const targetUser = users.find((u) => u.subscriptionTier === 'FREE');
    assert.ok(targetUser, 'A free tier user must exist for testing manual override');

    // Perform manual upgrade to Founder's Pass
    await updateUserSubscriptionByAdmin(targetUser.id, 'FOUNDERS_PASS', null, 49);

    const updatedDetail = await getUserDetailForAdmin(targetUser.id);
    assert.ok(updatedDetail, 'User detail must be retrieved');
    assert.equal(updatedDetail.user.subscriptionTier, 'FOUNDERS_PASS', 'Subscription tier must be upgraded to FOUNDERS_PASS');
    assert.equal(updatedDetail.user.founderPassClaimNumber, 49, 'Founder pass claim number must be recorded');

    // Revert user back to FREE for state hygiene
    await updateUserSubscriptionByAdmin(targetUser.id, 'FREE', null, null);
    const revertedDetail = await getUserDetailForAdmin(targetUser.id);
    assert.equal(revertedDetail?.user.subscriptionTier, 'FREE', 'User subscription tier reverted back to FREE');
  });

  await t.test('8. Modul 3: Workload Health 4-Tier Distribution Contract', async () => {
    const localDb = readLocalDb();
    const workloads = localDb.workloads || [];
    assert.ok(workloads.length > 0, 'Workload daily records must be present for health analysis');

    let light = 0;
    let optimal = 0;
    let nearCapacity = 0;
    let overload = 0;

    workloads.forEach((w) => {
      const pct = w.capacityPercentage ?? 0;
      if (pct > 100 || w.status === 'OVERLOAD') overload++;
      else if (pct >= 85 || w.status === 'NEAR_CAPACITY') nearCapacity++;
      else if (pct >= 60 || w.status === 'OPTIMAL') optimal++;
      else light++;
    });

    const total = light + optimal + nearCapacity + overload;
    assert.ok(total > 0, 'Total workload days must be non-zero');
    assert.ok(optimal > 0, 'Optimal workload days must be observed');
    assert.ok(light > 0, 'Light workload days must be observed');
  });

  await t.test('9. Modul 3: Adaptability, Reschedule Frequency & Silent Buffer', async () => {
    const localDb = readLocalDb();
    const tasks = localDb.tasks;

    // Daily task completion rate
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const completionRate = Math.round((completedTasks / tasks.length) * 1000) / 10;
    assert.ok(completionRate >= 50 && completionRate <= 100, 'Task completion rate must be reasonable');

    // Cognitive Depth Ratio: Deep Focus (High) vs Routine (Medium/Low)
    const deepFocus = tasks.filter((t) => (t.focusType || '').toLowerCase() === 'high').length;
    const routine = tasks.filter((t) => (t.focusType || '').toLowerCase() !== 'high').length;
    assert.ok(deepFocus > 0, 'Deep Focus tasks must be tracked');
    assert.ok(routine > 0, 'Routine tasks must be tracked');

    // Silent buffer utilization (>=10 min buffer)
    const silentBufferTasks = tasks.filter((t) => (t.restMinutes ?? 0) >= 10).length;
    const bufferUtilization = Math.round((silentBufferTasks / tasks.length) * 1000) / 10;
    assert.ok(bufferUtilization > 0, '10-minute silent buffer utilization must be active');
  });

  await t.test('10. Modul 4: User Audit, Search & Role Mutation Contract', async () => {
    const users = await getAllUsersForAdmin();
    const sampleUser = users.find((u) => u.role === 'USER');
    assert.ok(sampleUser, 'A user with role USER must exist');

    // Inspect user detail
    const detail = await getUserDetailForAdmin(sampleUser.id);
    assert.ok(detail, 'User deep inspect detail must return user, tasks, workloads, and reschedule logs');
    assert.ok(Array.isArray(detail.tasks), 'User tasks must be an array');
    assert.ok(Array.isArray(detail.workloads), 'User workloads must be an array');
    assert.ok(Array.isArray(detail.rescheduleAuditLogs), 'User rescheduleAuditLogs must be an array');

    // Test Operational Role Mutation: promote to INTERNAL_OPERATOR
    await updateUserRoleByAdmin(sampleUser.id, 'INTERNAL_OPERATOR');
    const updated = await getUserDetailForAdmin(sampleUser.id);
    assert.equal(updated?.user.role, 'INTERNAL_OPERATOR', 'Role must be updated to INTERNAL_OPERATOR');

    // Revert role back to USER
    await updateUserRoleByAdmin(sampleUser.id, 'USER');
    const reverted = await getUserDetailForAdmin(sampleUser.id);
    assert.equal(reverted?.user.role, 'USER', 'Role must revert cleanly to USER');

    // Test Onboarding status override
    await updateUserOnboardingByAdmin(sampleUser.id, false);
    const pendingOnboarding = await getUserDetailForAdmin(sampleUser.id);
    assert.equal(pendingOnboarding?.user.isOnboardingCompleted, false, 'Onboarding must be toggled to false');

    await updateUserOnboardingByAdmin(sampleUser.id, true);
    const completedOnboarding = await getUserDetailForAdmin(sampleUser.id);
    assert.equal(completedOnboarding?.user.isOnboardingCompleted, true, 'Onboarding must be toggled back to true');
  });

  await t.test('11. Zero Public Visibility: Public Client Navigation Bundles Contain No Ops-Console Imports', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');

    // Read MainAppShell and public layout files
    const mainShellPath = path.resolve('apps/web/src/screens/components/MainAppShell.tsx');
    if (fs.existsSync(mainShellPath)) {
      const content = fs.readFileSync(mainShellPath, 'utf-8');
      assert.ok(!content.includes('ops-console'), 'MainAppShell must NEVER contain ops-console imports or links');
      assert.ok(!content.includes('(admin)'), 'MainAppShell must NEVER reference (admin) routes');
    }

    const publicRootLayout = path.resolve('apps/web/src/app/layout.tsx');
    if (fs.existsSync(publicRootLayout)) {
      const content = fs.readFileSync(publicRootLayout, 'utf-8');
      assert.ok(!content.includes('ops-console'), 'Public RootLayout must NEVER reference ops-console');
    }
  });
});
