import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, TaskPriority, TaskStatus, ScheduleBlockType, CapacityStatus, NotificationType } from '@focient/database';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserProfileDto,
  CompleteOnboardingDto,
} from '@focient/contracts';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../common/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'focient_default_jwt_secret_change_in_prod';
const JWT_EXPIRES_IN = '7d';

/**
 * FoCient Proses 1.0: Manajemen Akun & Onboarding
 *
 * Mengelola pendaftaran akun, otentikasi ganda (Email/Password & Google OAuth),
 * serta pencatatan preferensi gaya kerja ke D1 (users), D2 (categories), dan D4 (user_capacities).
 */
export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('Email sudah terdaftar');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const workHoursLimit = data.workHoursLimit ?? 8.0;
    const dailyCapacityMinutes = data.dailyCapacityMinutes ?? Math.round(workHoursLimit * 60);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        roleArchetype: data.roleArchetype ?? 'Software Engineer',
        workHoursLimit,
        startWorkTime: '09:00',
        endWorkTime: '17:00',
        workHourStart: '09:00',
        workHourEnd: '17:00',
        dailyCapacityMinutes,
        timezone: data.timezone ?? 'Asia/Jakarta',
        isOnboardingCompleted: false,
      },
    });

    const token = this.generateToken(user.id);
    return { token, user: this.formatProfile(user) };
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Email atau kata sandi tidak valid');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Email atau kata sandi tidak valid');
    }

    const token = this.generateToken(user.id);
    return { token, user: this.formatProfile(user) };
  }

  /**
   * Hybrid Auth: Google OAuth 2.0 Account Linking & Login
   */
  async googleSignIn(googleToken: string): Promise<AuthResponseDto> {
    let email = 'google.user@focient.dev';
    let name = 'Google User';

    try {
      const decoded = jwt.decode(googleToken) as { email?: string; name?: string } | null;
      if (decoded?.email) {
        email = decoded.email.toLowerCase();
        name = decoded.name || 'Google User';
      }
    } catch {
      // Fallback
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(`oauth_google_${Date.now()}`, salt);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          roleArchetype: 'Knowledge Worker',
          workHoursLimit: 8.0,
          startWorkTime: '09:00',
          endWorkTime: '17:00',
          workHourStart: '09:00',
          workHourEnd: '17:00',
          dailyCapacityMinutes: 480,
          timezone: 'Asia/Jakarta',
          isOnboardingCompleted: false,
        },
      });
    }

    const token = this.generateToken(user.id);
    return { token, user: this.formatProfile(user) };
  }

  /**
   * Menyimpan data onboarding dan menginisiasi kategori bawaan ke D2 serta kuota ke D4
   */
  async completeOnboarding(userId: string, data: CompleteOnboardingDto): Promise<UserProfileDto> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    const dailyCapacityMinutes = Math.round(data.workHoursLimit * 60);

    const visualGoalsStr = data.visualGoals
      ? Array.isArray(data.visualGoals)
        ? JSON.stringify(data.visualGoals)
        : data.visualGoals
      : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roleArchetype: data.roleArchetype,
        workHoursLimit: data.workHoursLimit,
        startWorkTime: data.startWorkTime,
        endWorkTime: data.endWorkTime,
        workHourStart: data.startWorkTime,
        workHourEnd: data.endWorkTime,
        dailyCapacityMinutes,
        isOnboardingCompleted: true,
        visualGoals: visualGoalsStr,
        motivationType: (data.motivationType as any) ?? 'ACHIEVEMENT_DRIVEN',
        workStyle: data.workStyle ?? 'Hybrid System: Structure + Flexibility',
        timeToFirstPlanSeconds: data.timeToFirstPlanSeconds,
      },
    });

    // Inisiasi daftar kategori default sesuai pilihan peran ke D2: categories
    if (data.selectedCategories && data.selectedCategories.length > 0) {
      for (const catName of data.selectedCategories) {
        const existingCat = await prisma.category.findFirst({
          where: { userId, name: catName },
        });
        if (!existingCat) {
          await prisma.category.create({
            data: {
              userId,
              name: catName,
              colorToken: 'blue',
              isDefault: true,
            },
          });
        }
      }
    }

    // Inisiasi D4: user_capacities untuk hari ini
    const today = new Date().toISOString().split('T')[0];
    await prisma.workloadDaily.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        maxDailyMinutes: dailyCapacityMinutes,
        capacityMinutes: dailyCapacityMinutes,
      },
      create: {
        userId,
        date: today,
        maxDailyMinutes: dailyCapacityMinutes,
        capacityMinutes: dailyCapacityMinutes,
        allocatedMinutes: 0,
        capacityPercentage: 0,
        status: CapacityStatus.LIGHT,
        isOverloaded: false,
      },
    });

    return this.formatProfile(updatedUser);
  }

  /**
   * Mode Tamu Instan (Demo / Guest Session) dengan mock data komprehensif
   */
  async createGuestSession(): Promise<AuthResponseDto> {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const guestEmail = `guest_${timestamp}_${randomSuffix}@demo.focient.local`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(`guest_pwd_${randomSuffix}`, salt);

    const user = await prisma.user.create({
      data: {
        email: guestEmail,
        passwordHash,
        name: 'Pengguna Tamu (Demo)',
        roleArchetype: 'Software Engineer',
        workHoursLimit: 8.0,
        startWorkTime: '09:00',
        endWorkTime: '17:00',
        workHourStart: '09:00',
        workHourEnd: '17:00',
        dailyCapacityMinutes: 480,
        timezone: 'Asia/Jakarta',
        isOnboardingCompleted: true,
      },
    });

    // Inisiasi D2: categories default
    const defaultCategories = ['Perencanaan', 'Pengembangan', 'Fokus Inti', 'Refleksi'];
    const catMap = new Map<string, string>();
    for (const cName of defaultCategories) {
      const cat = await prisma.category.create({
        data: {
          userId: user.id,
          name: cName,
          colorToken: cName === 'Fokus Inti' ? 'purple' : 'blue',
          isDefault: true,
        },
      });
      catMap.set(cName, cat.id);
    }

    // Pre-populate mock tasks & schedule blocks
    const today = new Date().toISOString().split('T')[0];

    // Slot 1: 09:00 - 09:45 (45 min) - Top 3 focus (In Progress)
    const start1 = new Date(`${today}T09:00:00.000Z`);
    const end1 = new Date(`${today}T09:45:00.000Z`);
    const task1 = await prisma.task.create({
      data: {
        userId: user.id,
        title: 'Review Rencana Rilis MVP FoCient',
        notes: 'Verifikasi kesiapan 4 pilar MVP dan alur Guilt-Free Rescheduling.',
        durationMinutes: 45,
        priority: TaskPriority.TOP_3,
        status: TaskStatus.IN_PROGRESS,
        categoryId: catMap.get('Perencanaan'),
        category: 'Perencanaan',
        targetDate: new Date(`${today}T00:00:00.000Z`),
        startTime: start1,
        scheduledStart: start1,
        scheduledEnd: end1,
      },
    });
    await prisma.scheduleBlock.create({
      data: {
        userId: user.id,
        taskId: task1.id,
        title: task1.title,
        startTime: start1,
        endTime: end1,
        type: ScheduleBlockType.TASK,
      },
    });

    // Slot 2: 10:00 - 11:00 (60 min) - Top 3 focus
    const start2 = new Date(`${today}T10:00:00.000Z`);
    const end2 = new Date(`${today}T11:00:00.000Z`);
    const task2 = await prisma.task.create({
      data: {
        userId: user.id,
        title: 'Uji Coba 1-Click Guilt-Free Rescheduling',
        notes: 'Simulasikan perpanjangan tugas dan perhatikan downstream blocks bergeser lembut.',
        durationMinutes: 60,
        priority: TaskPriority.TOP_3,
        status: TaskStatus.TODO,
        categoryId: catMap.get('Pengembangan'),
        category: 'Pengembangan',
        targetDate: new Date(`${today}T00:00:00.000Z`),
        startTime: start2,
        scheduledStart: start2,
        scheduledEnd: end2,
      },
    });
    await prisma.scheduleBlock.create({
      data: {
        userId: user.id,
        taskId: task2.id,
        title: task2.title,
        startTime: start2,
        endTime: end2,
        type: ScheduleBlockType.TASK,
      },
    });

    // Slot 3: 11:15 - 12:15 (60 min) - Top 3 focus
    const start3 = new Date(`${today}T11:15:00.000Z`);
    const end3 = new Date(`${today}T12:15:00.000Z`);
    const task3 = await prisma.task.create({
      data: {
        userId: user.id,
        title: 'Pemeriksaan Kapasitas Harian & Top 3 Focus',
        notes: 'Pastikan isolasi fokus terjaga dan tidak terjadi cognitive overload.',
        durationMinutes: 60,
        priority: TaskPriority.TOP_3,
        status: TaskStatus.TODO,
        categoryId: catMap.get('Fokus Inti'),
        category: 'Fokus Inti',
        targetDate: new Date(`${today}T00:00:00.000Z`),
        startTime: start3,
        scheduledStart: start3,
        scheduledEnd: end3,
      },
    });
    await prisma.scheduleBlock.create({
      data: {
        userId: user.id,
        taskId: task3.id,
        title: task3.title,
        startTime: start3,
        endTime: end3,
        type: ScheduleBlockType.TASK,
      },
    });

    // Slot 4: 14:00 - 14:45 (45 min) - Regular Task
    const start4 = new Date(`${today}T14:00:00.000Z`);
    const end4 = new Date(`${today}T14:45:00.000Z`);
    const task4 = await prisma.task.create({
      data: {
        userId: user.id,
        title: 'Evaluasi Catatan Harian & Insights',
        durationMinutes: 45,
        priority: TaskPriority.REGULAR,
        status: TaskStatus.TODO,
        categoryId: catMap.get('Refleksi'),
        category: 'Refleksi',
        targetDate: new Date(`${today}T00:00:00.000Z`),
        startTime: start4,
        scheduledStart: start4,
        scheduledEnd: end4,
      },
    });
    await prisma.scheduleBlock.create({
      data: {
        userId: user.id,
        taskId: task4.id,
        title: task4.title,
        startTime: start4,
        endTime: end4,
        type: ScheduleBlockType.TASK,
      },
    });

    // Inisiasi D4: user_capacities
    const totalAllocated = 45 + 60 + 60 + 45; // 210 min
    const percentage = Math.round((totalAllocated / 480) * 10000) / 100; // 43.75%
    await prisma.workloadDaily.create({
      data: {
        userId: user.id,
        date: today,
        maxDailyMinutes: 480,
        capacityMinutes: 480,
        allocatedMinutes: totalAllocated,
        capacityPercentage: percentage,
        status: CapacityStatus.LIGHT,
        isOverloaded: false,
      },
    });

    // Notifikasi selamat datang
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Selamat datang di Mode Demo FoCient',
        message:
          'Nikmati pengalaman perencanaan adaptif tanpa rasa bersalah. Coba fitur Guilt-Free Rescheduling dan Top 3 Priorities!',
        type: NotificationType.FOCUS_REMINDER,
        isRead: false,
      },
    });

    const token = this.generateToken(user.id);
    return { token, user: this.formatProfile(user) };
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    return this.formatProfile(user);
  }

  private generateToken(userId: string): string {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { sub: string };
    } catch {
      throw new UnauthorizedError('Sesi kadaluarsa atau token tidak valid');
    }
  }

  private formatProfile(user: {
    id: string;
    email: string;
    name: string;
    timezone: string;
    roleArchetype?: string | null;
    workHoursLimit?: number | null;
    startWorkTime?: string | null;
    endWorkTime?: string | null;
    workHourStart: string;
    workHourEnd: string;
    dailyCapacityMinutes: number;
    isOnboardingCompleted?: boolean | null;
    visualGoals?: string | null;
    motivationType?: string | null;
    workStyle?: string | null;
    timeToFirstPlanSeconds?: number | null;
    consistentPlanDays?: number | null;
    rescheduleTimeSavedMinutes?: number | null;
    manualAdjustmentsReducedCount?: number | null;
    createdAt: Date;
  }): UserProfileDto {
    const start = user.startWorkTime || user.workHourStart || '09:00';
    const end = user.endWorkTime || user.workHourEnd || '17:00';
    let parsedVisualGoals: string[] | string | undefined = undefined;
    if (user.visualGoals) {
      try {
        parsedVisualGoals = JSON.parse(user.visualGoals);
      } catch {
        parsedVisualGoals = user.visualGoals;
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      roleArchetype: user.roleArchetype || 'Software Engineer',
      workHoursLimit: user.workHoursLimit || 8.0,
      startWorkTime: start,
      endWorkTime: end,
      workHourStart: start,
      workHourEnd: end,
      dailyCapacityMinutes: user.dailyCapacityMinutes,
      isOnboardingCompleted: Boolean(user.isOnboardingCompleted),
      visualGoals: parsedVisualGoals,
      motivationType: (user.motivationType as any) || 'ACHIEVEMENT_DRIVEN',
      workStyle: user.workStyle || 'Hybrid System: Structure + Flexibility',
      timeToFirstPlanSeconds: user.timeToFirstPlanSeconds ?? undefined,
      consistentPlanDays: user.consistentPlanDays ?? 0,
      rescheduleTimeSavedMinutes: user.rescheduleTimeSavedMinutes ?? 0,
      manualAdjustmentsReducedCount: user.manualAdjustmentsReducedCount ?? 0,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const authService = new AuthService();
