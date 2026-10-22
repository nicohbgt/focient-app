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
