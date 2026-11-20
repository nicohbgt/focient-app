import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  extractTokenFromRequest,
  verifySession,
  findLocalUserById,
  saveUserToLocalDb,
  saveCategoriesToLocalDb,
  getCategoriesFromLocalDb,
  resolveCategoryFocusTypeByName,
  isDbAvailable,
  withDbTimeout,
  handleDbError,
} from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Header otorisasi Bearer diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user, message } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: message || 'Sesi otorisasi telah berakhir atau tidak valid.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      job,
      roleArchetype = job || 'Software Engineer',
      occupancy = job || roleArchetype || 'General',
      workHoursLimit = 8.0,
      startWorkTime = '09:00',
      endWorkTime = '17:00',
      selectedCategories = [
        'Deep Focus & Core Work',
        'Team Communication & Sync',
        'Administrative & Daily Planning',
        'Personal Errands & Recovery',
      ],
      workingRhythm = 'Early Bird',
      schedulingStyle = 'Structured',
      restTimePerTask = 10,
      restTimeMinutesPerTask = restTimePerTask ?? 10,
      quietHourStart = '',
      quietHourEnd = '',
      quietHourEnabled = true,
    } = body;

    const dailyCapacityMinutes = Math.round(Number(workHoursLimit) * 60);

    // 1. Update user profile in PostgreSQL database
    let updatedDbUser: any = null;
    if (isDbAvailable()) {
      try {
        updatedDbUser = await withDbTimeout(
          prisma.user.update({
            where: { id: user.id },
            data: {
              roleArchetype,
              occupancy,
              workingRhythm,
              schedulingStyle,
              workHoursLimit: Number(workHoursLimit),
              startWorkTime,
              endWorkTime,
              workHourStart: startWorkTime,
              workHourEnd: endWorkTime,
              dailyCapacityMinutes,
              restTimePerTask: Number(restTimeMinutesPerTask),
              isOnboardingCompleted: true,
            },
          }),
          350
        );

        // 2. Persist initial user categories scoped strictly to user.id
        if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
          for (const item of selectedCategories) {
            const catName = typeof item === 'string' ? item : item.name;
            const existing = await withDbTimeout(
              prisma.category.findFirst({
                where: { userId: user.id, name: catName },
              }),
              350
            );
            if (!existing) {
              const colorToken =
                typeof item === 'object' && item.colorHex
                  ? item.colorHex
                  : catName.toLowerCase().includes('strategic') || catName.toLowerCase().includes('fokus')
                  ? '#7C3AED'
                  : catName.toLowerCase().includes('communication') || catName.toLowerCase().includes('komunikasi')
                  ? '#0284C7'
                  : catName.toLowerCase().includes('admin')
                  ? '#64748B'
                  : '#059669';

              await withDbTimeout(
                prisma.category.create({
                  data: {
                    userId: user.id,
                    name: catName,
                    colorToken,
                    isDefault: typeof item === 'object' && item.isDefault !== undefined ? item.isDefault : true,
                  },
                }),
                350
              );
            }
          }
        }

        // 3. Upsert user capacity for today
        const today = new Date().toISOString().split('T')[0];
        await withDbTimeout(
          prisma.workloadDaily.upsert({
            where: { userId_date: { userId: user.id, date: today } },
            update: {
              maxDailyMinutes: dailyCapacityMinutes,
              capacityMinutes: dailyCapacityMinutes,
            },
            create: {
              userId: user.id,
              date: today,
              targetDate: new Date(`${today}T00:00:00.000Z`),
              maxDailyMinutes: dailyCapacityMinutes,
              capacityMinutes: dailyCapacityMinutes,
              allocatedMinutes: 0,
              capacityPercentage: 0,
              status: 'LIGHT',
            },
          }),
          350
        );
      } catch (dbErr) {
        handleDbError(dbErr);
      }
    }

    // 4. Update file-backed persistent local user store & categories
    const localUser = findLocalUserById(user.id);
    if (localUser) {
      localUser.roleArchetype = roleArchetype;
      localUser.occupancy = occupancy;
      localUser.workingRhythm = workingRhythm;
      localUser.schedulingStyle = schedulingStyle;
      localUser.startWorkTime = startWorkTime;
      localUser.endWorkTime = endWorkTime;
      localUser.workHourStart = startWorkTime;
      localUser.workHourEnd = endWorkTime;
      localUser.dailyCapacityMinutes = dailyCapacityMinutes;
      localUser.restTimePerTask = Number(restTimeMinutesPerTask);
      localUser.quietHourStart = quietHourStart;
      localUser.quietHourEnd = quietHourEnd;
      localUser.quietHourEnabled = quietHourEnabled;
      localUser.isOnboardingCompleted = true;
      saveUserToLocalDb(localUser);
    }

    if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      const catObjects = selectedCategories.map((item: any) => {
        const catName = typeof item === 'string' ? item : item.name;
        const colorHex =
          typeof item === 'object' && item.colorHex
            ? item.colorHex
            : catName.toLowerCase().includes('strategic') || catName.toLowerCase().includes('fokus')
            ? '#7C3AED'
            : catName.toLowerCase().includes('communication') || catName.toLowerCase().includes('komunikasi')
            ? '#0284C7'
            : catName.toLowerCase().includes('admin')
            ? '#64748B'
            : '#059669';
        const focusType =
          typeof item === 'object' && item.focusType
            ? item.focusType
            : resolveCategoryFocusTypeByName(catName);
        return {
          name: catName,
          colorHex,
          focusType,
          isDefault: typeof item === 'object' && item.isDefault !== undefined ? item.isDefault : true,
        };
      });
      saveCategoriesToLocalDb(user.id, catObjects);
    }

    const savedCategories = getCategoriesFromLocalDb(user.id);

    const updatedUser = {
      id: user.id,
      name: updatedDbUser?.name || user.name,
      username: updatedDbUser?.username || (user as any).username || user.name,
      email: updatedDbUser?.email || user.email,
      roleArchetype,
      occupancy,
      workingRhythm,
      schedulingStyle,
      workHoursLimit: Number(workHoursLimit),
      startWorkTime,
      endWorkTime,
      workHourStart: startWorkTime,
      workHourEnd: endWorkTime,
      dailyCapacityMinutes,
      restTimePerTask: Number(restTimeMinutesPerTask),
      quietHourStart,
      quietHourEnd,
      quietHourEnabled,
      isOnboardingCompleted: true,
      categories: savedCategories,
      provider: (user as any).provider || 'credentials',
    };

    return NextResponse.json({
      success: true,
      message: 'Onboarding berhasil diselesaikan.',
      user: updatedUser,
      categories: savedCategories,
    });
  } catch (error) {
    console.error('POST /api/onboarding/complete error:', error);
    return NextResponse.json(
      { error: 'Gagal menyelesaikan onboarding ke database.' },
      { status: 500 }
    );
  }
}
