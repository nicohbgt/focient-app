import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  extractTokenFromRequest,
  verifySession,
  findLocalUserById,
  saveUserToLocalDb,
  getCategoriesFromLocalDb,
  LocalUserRecord,
} from '../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Header otorisasi diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { success: false, message: 'Sesi tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }

    // 1. Try PostgreSQL first
    let dbUser: any = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { notificationPreference: true, categories: true },
      });
    } catch {
      // PostgreSQL is offline
    }

    // 2. Fall back to local store
    if (!dbUser) {
      const localUser = findLocalUserById(user.id);
      if (localUser) {
        const localCats = getCategoriesFromLocalDb(user.id);
        dbUser = {
          ...localUser,
          categories: localCats,
          notificationPreference: null,
        };
      }
    }

    if (!dbUser) {
      dbUser = user;
    }

    const start = dbUser.startWorkTime || dbUser.workHourStart || '09:00';
    const end = dbUser.endWorkTime || dbUser.workHourEnd || '17:00';

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        username: dbUser.username || dbUser.name,
        email: dbUser.email,
        roleArchetype: dbUser.roleArchetype || 'Software Engineer',
        occupancy: dbUser.occupancy || dbUser.roleArchetype || 'General',
        workingRhythm: dbUser.workingRhythm || 'Steady Pacer',
        schedulingStyle: dbUser.schedulingStyle || 'Structured',
        startWorkTime: start,
        endWorkTime: end,
        workHourStart: start,
        workHourEnd: end,
        dailyCapacityMinutes: dbUser.dailyCapacityMinutes || 480,
        restTimePerTask: dbUser.restTimePerTask ?? 10,
        isOnboardingCompleted: Boolean(dbUser.isOnboardingCompleted),
      },
      preferences: dbUser.notificationPreference || {
        focusReminders: true,
        capacityAlerts: true,
        rippleSuggestions: true,
        dailySummary: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '07:00',
      },
      categories: dbUser.categories || getCategoriesFromLocalDb(user.id) || [],
    });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat pengaturan pengguna.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Header otorisasi diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { success: false, message: 'Sesi tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      username,
      roleArchetype,
      occupancy = roleArchetype,
      workingRhythm,
      schedulingStyle,
      startWorkTime,
      endWorkTime,
      dailyCapacityMinutes,
      restTimePerTask,
      preferences,
    } = body;

    // Resilient local user store update
    let localUser = findLocalUserById(user.id);
    if (localUser) {
      if (name) localUser.name = name.trim();
      if (username) localUser.username = username.trim();
      if (roleArchetype) localUser.roleArchetype = roleArchetype;
      if (occupancy) localUser.occupancy = occupancy;
      if (workingRhythm) localUser.workingRhythm = workingRhythm;
      if (schedulingStyle) localUser.schedulingStyle = schedulingStyle;
      if (startWorkTime) {
        localUser.startWorkTime = startWorkTime;
        localUser.workHourStart = startWorkTime;
      }
      if (endWorkTime) {
        localUser.endWorkTime = endWorkTime;
        localUser.workHourEnd = endWorkTime;
      }
      if (dailyCapacityMinutes) localUser.dailyCapacityMinutes = Number(dailyCapacityMinutes);
      if (restTimePerTask !== undefined) localUser.restTimePerTask = Number(restTimePerTask);
      if (body.quietHourStart || preferences?.quietHoursStart) {
        localUser.quietHourStart = body.quietHourStart || preferences?.quietHoursStart;
      }
      if (body.quietHourEnd || preferences?.quietHoursEnd) {
        localUser.quietHourEnd = body.quietHourEnd || preferences?.quietHoursEnd;
      }
      saveUserToLocalDb(localUser);
    } else {
      const createdRecord: LocalUserRecord = {
        id: user.id,
        email: user.email || `${user.id}@focient.local`,
        name: name ? name.trim() : user.name || 'User',
        username: username ? username.trim() : user.name || 'user',
        passwordHash: '',
        roleArchetype: roleArchetype || user.roleArchetype || 'General',
        occupancy: occupancy || user.occupancy || 'General',
        workingRhythm: workingRhythm || user.workingRhythm || 'Steady Pacer',
        schedulingStyle: schedulingStyle || user.schedulingStyle || 'Structured',
        workHourStart: startWorkTime || user.workHourStart || '09:00',
        workHourEnd: endWorkTime || user.workHourEnd || '17:00',
        startWorkTime: startWorkTime || user.workHourStart || '09:00',
        endWorkTime: endWorkTime || user.workHourEnd || '17:00',
        dailyCapacityMinutes: dailyCapacityMinutes ? Number(dailyCapacityMinutes) : (user.dailyCapacityMinutes || 480),
        restTimePerTask: restTimePerTask !== undefined ? Number(restTimePerTask) : (user.restTimePerTask ?? 10),
        quietHourStart: body.quietHourStart || preferences?.quietHoursStart || (user as any).quietHourStart || '21:00',
        quietHourEnd: body.quietHourEnd || preferences?.quietHoursEnd || (user as any).quietHourEnd || '07:00',
        quietHourEnabled: (user as any).quietHourEnabled ?? true,
        isOnboardingCompleted: true,
        createdAt: new Date().toISOString(),
      };
      saveUserToLocalDb(createdRecord);
      localUser = createdRecord;
    }

    // Update user profile in PostgreSQL
    let updatedUser: any = null;
    try {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name: name.trim() }),
          ...(username && { username: username.trim() }),
          ...(roleArchetype && { roleArchetype }),
          ...(occupancy && { occupancy }),
          ...(workingRhythm && { workingRhythm }),
          ...(schedulingStyle && { schedulingStyle }),
          ...(startWorkTime && { startWorkTime, workHourStart: startWorkTime }),
          ...(endWorkTime && { endWorkTime, workHourEnd: endWorkTime }),
          ...(dailyCapacityMinutes && { dailyCapacityMinutes: Number(dailyCapacityMinutes) }),
          ...(restTimePerTask !== undefined && { restTimePerTask: Number(restTimePerTask) }),
        },
      });
    } catch {}

    // Upsert notification preferences if provided (FIXED: anotasikan ': any' untuk mencegah inferensi never/null)
    let updatedPreferences: any = null;
    if (preferences) {
      try {
        updatedPreferences = await prisma.notificationPreference.upsert({
          where: { userId: user.id },
          update: {
            ...(typeof preferences.focusReminders === 'boolean' && { focusReminders: preferences.focusReminders }),
            ...(typeof preferences.capacityAlerts === 'boolean' && { capacityAlerts: preferences.capacityAlerts }),
            ...(typeof preferences.rippleSuggestions === 'boolean' && { rippleSuggestions: preferences.rippleSuggestions }),
            ...(typeof preferences.dailySummary === 'boolean' && { dailySummary: preferences.dailySummary }),
            ...(preferences.quietHoursStart && { quietHoursStart: preferences.quietHoursStart }),
            ...(preferences.quietHoursEnd && { quietHoursEnd: preferences.quietHoursEnd }),
          },
          create: {
            userId: user.id,
            focusReminders: preferences.focusReminders ?? true,
            capacityAlerts: preferences.capacityAlerts ?? true,
            rippleSuggestions: preferences.rippleSuggestions ?? true,
            dailySummary: preferences.dailySummary ?? true,
            quietHoursStart: preferences.quietHoursStart || '21:00',
            quietHoursEnd: preferences.quietHoursEnd || '07:00',
          },
        });
      } catch {}
    }

    const finalUser = updatedUser || localUser || user;

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil diperbarui.',
      user: {
        id: finalUser.id,
        name: finalUser.name,
        username: finalUser.username || finalUser.name,
        email: finalUser.email,
        roleArchetype: finalUser.roleArchetype,
        occupancy: finalUser.occupancy || finalUser.roleArchetype,
        workingRhythm: finalUser.workingRhythm,
        schedulingStyle: finalUser.schedulingStyle,
        startWorkTime: finalUser.startWorkTime || finalUser.workHourStart,
        endWorkTime: finalUser.endWorkTime || finalUser.workHourEnd,
        workHourStart: finalUser.startWorkTime || finalUser.workHourStart,
        workHourEnd: finalUser.endWorkTime || finalUser.workHourEnd,
        dailyCapacityMinutes: finalUser.dailyCapacityMinutes,
        restTimePerTask: finalUser.restTimePerTask,
        isOnboardingCompleted: Boolean(finalUser.isOnboardingCompleted),
      },
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui pengaturan ke database.' },
      { status: 500 }
    );
  }
}
