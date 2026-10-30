import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma, TaskPriority, TaskStatus, ScheduleBlockType, CapacityStatus, NotificationType } from '@focient/database';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserProfileDto,
  CompleteOnboardingDto,
  SendOtpDto,
  VerifyOtpDto,
  OtpResponseDto,
  ForgotPasswordDto,
  VerifyResetOtpDto,
  ResetPasswordDto,
} from '@focient/contracts';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../common/errors.js';
import { otpRepository } from './otp.repository.js';
import { emailService } from '../email/email.service.js';
import { googleOidcService } from './google-oidc.service.js';
import { sessionService, TokenPair } from './session.service.js';

/**
 * FoCient Proses 1.0: Manajemen Akun & Onboarding
 *
 * Mengelola pendaftaran akun, otentikasi ganda (Email/Password & Google OAuth OIDC),
 * manajemen sesi, OTP terenkripsi/ter-hash persisten, serta pencatatan preferensi gaya kerja ke D1, D2, dan D4.
 */
export class AuthService {
  /**
   * Generates and dispatches a cryptographically secure 6-digit OTP code using real email provider
   */
  async sendOtp(data: SendOtpDto): Promise<OtpResponseDto> {
    const email = data.email.toLowerCase();

    // 1. Verify that email is not already registered
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictError('Email sudah terdaftar. Silakan login ke akun Anda.');
    }

    // 2. Generate secure 6-digit OTP and persist hashed record
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresInSeconds = 600; // 10 minutes

    await otpRepository.saveOtp(email, 'REGISTRATION', code, expiresInSeconds);

    // 3. Real Email Dispatch Hook (code is never logged into server console)
    await emailService.sendRegistrationOtp(email, code);

    return {
      success: true,
      message: 'Kode OTP telah dikirimkan ke email Anda.',
      expiresInSeconds,
    };
  }

  /**
   * Verifies the 6-digit OTP and completes Account Registration
   */
  async verifyOtp(data: VerifyOtpDto): Promise<AuthResponseDto> {
    const email = data.email.toLowerCase();

    // 1. Verify and consume hashed OTP record
    await otpRepository.verifyAndConsume(email, 'REGISTRATION', data.code);

    // 2. Create real user in Database and initiate session
    return this.register({
      email,
      name: data.name,
      password: data.password,
    });
  }

  /**
   * Generates and dispatches an OTP for Forgot Password flow
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<OtpResponseDto> {
    const email = data.email.toLowerCase();

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('Email tidak terdaftar dalam sistem FoCient.');
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresInSeconds = 600;

    await otpRepository.saveOtp(email, 'PASSWORD_RESET', code, expiresInSeconds);

    // Dispatch via real email service
    await emailService.sendPasswordResetOtp(email, code);

    return {
      success: true,
      message: 'Kode OTP pemulihan kata sandi telah dikirimkan ke email Anda.',
      expiresInSeconds,
    };
  }

  /**
   * Verifies the 6-digit OTP for Password Reset
   */
  async verifyResetOtp(data: VerifyResetOtpDto): Promise<{ success: boolean; message: string }> {
    const email = data.email.toLowerCase();
    await otpRepository.verifyAndConsume(email, 'PASSWORD_RESET', data.code);

    return {
      success: true,
      message: 'Kode OTP valid.',
    };
  }

  /**
   * Resets the user's password using verified OTP and revokes all active sessions
   */
  async resetPassword(data: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    const email = data.email.toLowerCase();

    // 1. Verify and consume OTP
    await otpRepository.verifyAndConsume(email, 'PASSWORD_RESET', data.code);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('Pengguna tidak ditemukan.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // 2. Revoke all existing sessions on password change
    await sessionService.revokeAllUserSessions(user.id);

    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru Anda.',
    };
  }

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

    const session = await sessionService.createSession(user.id);
    return {
      token: session.token,
      refreshToken: session.refreshToken,
      user: this.formatProfile(user),
    };
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

    const session = await sessionService.createSession(user.id);
    return {
      token: session.token,
      refreshToken: session.refreshToken,
      user: this.formatProfile(user),
    };
  }

  /**
   * Hybrid Auth: Google OAuth 2.0 Account Linking & Login
   * Uses cryptographically verified OpenID Connect token validation.
   */
  async googleSignIn(googleToken: string): Promise<AuthResponseDto> {
    const verified = await googleOidcService.verifyIdToken(googleToken);
    const email = verified.email;
    const name = verified.name || 'Google User';

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

    const session = await sessionService.createSession(user.id);
    return {
      token: session.token,
      refreshToken: session.refreshToken,
      user: this.formatProfile(user),
    };
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
        name: data.username || data.name || user.name,
        username: data.username || data.name || user.name,
        roleArchetype: data.occupancy || data.roleArchetype,
        occupancy: data.occupancy || data.roleArchetype,
        workingRhythm: data.workingRhythm || data.energyRhythm || 'Early Bird',
        schedulingStyle: data.schedulingStyle || data.workStyle || 'Structured',
        restTimePerTask: data.restTimePerTask ?? data.restTimeMinutesPerTask ?? 10,
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

    const session = await sessionService.createSession(user.id);
    return {
      token: session.token,
      refreshToken: session.refreshToken,
      user: this.formatProfile(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    return sessionService.refreshTokens(refreshToken);
  }

  async logout(tokenOrSessionId: string): Promise<{ success: boolean; message: string }> {
    await sessionService.revokeSessionByToken(tokenOrSessionId);
    return { success: true, message: 'Logout berhasil. Sesi telah dicabut.' };
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

  async updateProfile(userId: string, data: Record<string, any>): Promise<UserProfileDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.roleArchetype !== undefined) updateData.roleArchetype = data.roleArchetype;
    if (data.occupancy !== undefined) {
      updateData.occupancy = data.occupancy;
      updateData.roleArchetype = data.occupancy;
    }
    if (data.startWorkTime !== undefined) {
      updateData.startWorkTime = data.startWorkTime;
      updateData.workHourStart = data.startWorkTime;
    }
    if (data.endWorkTime !== undefined) {
      updateData.endWorkTime = data.endWorkTime;
      updateData.workHourEnd = data.endWorkTime;
    }
    if (data.dailyCapacityMinutes !== undefined) {
      updateData.dailyCapacityMinutes = Number(data.dailyCapacityMinutes);
      updateData.workHoursLimit = Number(data.dailyCapacityMinutes) / 60.0;
    }
    if (data.restTimeMinutesPerTask !== undefined) {
      updateData.restTimePerTask = Number(data.restTimeMinutesPerTask);
    }
    if (data.restTimePerTask !== undefined) {
      updateData.restTimePerTask = Number(data.restTimePerTask);
    }
    if (data.energyRhythm !== undefined) {
      updateData.workingRhythm = data.energyRhythm;
    }
    if (data.workingRhythm !== undefined) {
      updateData.workingRhythm = data.workingRhythm;
    }
    if (data.schedulingStyle !== undefined) {
      updateData.schedulingStyle = data.schedulingStyle;
      updateData.workStyle = data.schedulingStyle;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.formatProfile(updatedUser);
  }

  async verifyToken(token: string): Promise<{ sub: string; sessionId?: string }> {
    return sessionService.verifyAccessToken(token);
  }

  private formatProfile(user: {
    id: string;
    email: string;
    name: string;
    username?: string | null;
    occupancy?: string | null;
    workingRhythm?: string | null;
    schedulingStyle?: string | null;
    restTimePerTask?: number | null;
    workloadPercentage?: number | null;
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
      username: user.username || user.name,
      occupancy: user.occupancy || user.roleArchetype || 'Software Engineer',
      workingRhythm: user.workingRhythm || 'Early Bird',
      schedulingStyle: user.schedulingStyle || user.workStyle || 'Structured',
      restTimePerTask: user.restTimePerTask ?? 10,
      workloadPercentage: user.workloadPercentage ?? 0,
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
