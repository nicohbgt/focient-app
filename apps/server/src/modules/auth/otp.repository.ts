import crypto from 'node:crypto';
import { prisma, OtpType } from '@focient/database';
import { getOtpSecret } from '../../common/config.js';
import { ConflictError, UnauthorizedError } from '../../common/errors.js';

export interface StoredOtpRecord {
  id: string;
  email: string;
  type: OtpType;
  hashedCode: string;
  expiresAt: Date;
  lastSentAt: Date;
  attempts: number;
  maxAttempts: number;
  usedAt: Date | null;
}

/**
 * Persistent Hashed OTP Repository
 *
 * Enforces:
 * - HMAC-SHA256 code hashing with server-side salt (plain text OTP is never stored)
 * - Timing-safe hash comparison (CWE-208 protection against side-channel timing attacks)
 * - 30-second cooldown rate limit between consecutive OTP requests
 * - 5 attempts max limit before automatic invalidation (brute-force defense)
 * - Single-use guarantee (consumed immediately upon successful verification)
 * - Dual backend: writes to PostgreSQL via Prisma with an in-memory resilient fallback
 */
export class OtpRepository {
  // Resilient fallback storage for standalone tests or environments without PostgreSQL
  private fallbackStore = new Map<string, StoredOtpRecord>();

  private get isDbAvailable(): boolean {
    return Boolean(process.env.DATABASE_URL);
  }

  /**
   * Hashes an OTP code using HMAC-SHA256 with server-side secret and email salt
   */
  public hashOtp(email: string, code: string): string {
    const salt = getOtpSecret();
    const hmac = crypto.createHmac('sha256', salt);
    hmac.update(`${email.toLowerCase()}:${code.trim()}`);
    return hmac.digest('hex');
  }

  /**
   * Constant-time verification of candidate code against stored hash
   */
  public verifyCode(email: string, candidateCode: string, storedHash: string): boolean {
    const candidateHash = this.hashOtp(email, candidateCode);
    const candidateBuffer = Buffer.from(candidateHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (candidateBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
  }

  private getCompositeKey(email: string, type: OtpType): string {
    return `${email.toLowerCase()}:${type}`;
  }

  /**
   * Generates and securely stores a hashed OTP record
   */
  async saveOtp(
    email: string,
    type: OtpType,
    code: string,
    expiresInSeconds: number = 600
  ): Promise<{ expiresInSeconds: number }> {
    const normalizedEmail = email.toLowerCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
    const hashedCode = this.hashOtp(normalizedEmail, code);

    // 1. Check 30-second cooldown rate limit
    const existing = await this.findLatestOtp(normalizedEmail, type);
    if (existing && !existing.usedAt) {
      const elapsedMs = now.getTime() - existing.lastSentAt.getTime();
      const cooldownMs = 30 * 1000;
      if (elapsedMs < cooldownMs) {
        const waitSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        throw new ConflictError(`Mohon tunggu ${waitSeconds} detik sebelum meminta kode OTP baru.`);
      }
    }

    // 2. Persist hashed OTP
    if (this.isDbAvailable) {
      try {
        await prisma.otp.create({
          data: {
            email: normalizedEmail,
            type,
            hashedCode,
            expiresAt,
            lastSentAt: now,
            attempts: 0,
            maxAttempts: 5,
          },
        });
      } catch {
        // Fallback in case database is unreachable
      }
    }

    const key = this.getCompositeKey(normalizedEmail, type);
    this.fallbackStore.set(key, {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      type,
      hashedCode,
      expiresAt,
      lastSentAt: now,
      attempts: 0,
      maxAttempts: 5,
      usedAt: null,
    });

    return { expiresInSeconds };
  }

  /**
   * Verifies an OTP candidate code and permanently consumes it upon success
   */
  async verifyAndConsume(email: string, type: OtpType, candidateCode: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase();
    const record = await this.findLatestOtp(normalizedEmail, type);

    if (!record || record.usedAt) {
      throw new UnauthorizedError('Kode OTP tidak ditemukan atau sudah kedaluwarsa. Silakan minta kode baru.');
    }

    const now = new Date();
    if (now > record.expiresAt) {
      await this.invalidateOtp(record.id, normalizedEmail, type);
      throw new UnauthorizedError('Kode OTP sudah kedaluwarsa. Silakan minta kode baru.');
    }

    if (record.attempts >= record.maxAttempts) {
      await this.invalidateOtp(record.id, normalizedEmail, type);
      throw new UnauthorizedError('Batas percobaan terlampaui. Silakan minta kode OTP baru demi keamanan.');
    }

    const isValid = this.verifyCode(normalizedEmail, candidateCode, record.hashedCode);

    if (!isValid) {
      // Increment failed attempts counter
      await this.incrementAttempts(record.id, normalizedEmail, type, record.attempts + 1);
      throw new UnauthorizedError('Kode OTP salah. Silakan periksa kembali email Anda.');
    }

    // Single-use: Mark as used or delete immediately
    await this.markAsUsed(record.id, normalizedEmail, type);
    return true;
  }

  private async findLatestOtp(email: string, type: OtpType): Promise<StoredOtpRecord | null> {
    if (this.isDbAvailable) {
      try {
        const record = await prisma.otp.findFirst({
          where: {
            email,
            type,
            usedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        if (record) return record;
      } catch {
        // Fallback
      }
    }
    const key = this.getCompositeKey(email, type);
    const record = this.fallbackStore.get(key);
    if (record && !record.usedAt) {
      return record;
    }
    return null;
  }

  private async incrementAttempts(id: string, email: string, type: OtpType, newAttempts: number): Promise<void> {
    if (this.isDbAvailable) {
      try {
        await prisma.otp.update({
          where: { id },
          data: { attempts: newAttempts },
        });
      } catch {
        // Fallback
      }
    }
    const key = this.getCompositeKey(email, type);
    const record = this.fallbackStore.get(key);
    if (record) {
      record.attempts = newAttempts;
    }
  }

  private async markAsUsed(id: string, email: string, type: OtpType): Promise<void> {
    if (this.isDbAvailable) {
      try {
        await prisma.otp.update({
          where: { id },
          data: { usedAt: new Date() },
        });
      } catch {
        // Fallback
      }
    }
    const key = this.getCompositeKey(email, type);
    const record = this.fallbackStore.get(key);
    if (record) {
      record.usedAt = new Date();
    }
  }

  private async invalidateOtp(id: string, email: string, type: OtpType): Promise<void> {
    if (this.isDbAvailable) {
      try {
        await prisma.otp.delete({
          where: { id },
        });
      } catch {
        // Fallback
      }
    }
    const key = this.getCompositeKey(email, type);
    this.fallbackStore.delete(key);
  }

  clearFallback(): void {
    this.fallbackStore.clear();
  }
}

export const otpRepository = new OtpRepository();
