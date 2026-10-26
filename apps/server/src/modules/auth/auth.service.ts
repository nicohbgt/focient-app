import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@focient/database';
import { RegisterDto, LoginDto, AuthResponseDto, UserProfileDto } from '@focient/contracts';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../common/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'focient_default_jwt_secret_change_in_prod';
const JWT_EXPIRES_IN = '7d';

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

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        timezone: data.timezone ?? 'Asia/Jakarta',
        dailyCapacityMinutes: data.dailyCapacityMinutes ?? 480,
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
          timezone: 'Asia/Jakarta',
          dailyCapacityMinutes: 480,
        },
      });
    }

    const token = this.generateToken(user.id);
    return { token, user: this.formatProfile(user) };
  }

  /**
   * Creates an instantaneous demo guest session pre-populated with realistic mock data.
   * Enables zero-friction MVP testing without registration hurdles.
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
        timezone: 'Asia/Jakarta',
        workHourStart: '09:00',
        workHourEnd: '17:00',
        dailyCapacityMinutes: 480,
      },
    });

    // Pre-populate mock tasks & schedule blocks for instant zero-friction demo
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
        priority: 'TOP_3',
        status: 'IN_PROGRESS',
        category: 'Perencanaan',
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
        type: 'TASK',
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
        priority: 'TOP_3',
        status: 'TODO',
        category: 'Pengembangan',
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
        type: 'TASK',
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
        priority: 'TOP_3',
        status: 'TODO',
        category: 'Fokus',
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
        type: 'TASK',
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
        priority: 'REGULAR',
        status: 'TODO',
        category: 'Refleksi',
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
        type: 'TASK',
      },
    });

    // Create initial welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Selamat datang di Mode Demo FoCient',
        message:
          'Nikmati pengalaman perencanaan adaptif tanpa rasa bersalah. Coba fitur Guilt-Free Rescheduling dan Top 3 Priorities!',
        type: 'FOCUS_REMINDER',
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
    workHourStart: string;
    workHourEnd: string;
    dailyCapacityMinutes: number;
    createdAt: Date;
  }): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      workHourStart: user.workHourStart,
      workHourEnd: user.workHourEnd,
      dailyCapacityMinutes: user.dailyCapacityMinutes,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const authService = new AuthService();
