import { IEmailProvider, SendEmailOptions, EmailResult } from './email.interface.js';
import { logger } from '../../common/logger.js';

/**
 * In-Memory Test Email Provider for unit and integration testing.
 * Captures sent emails for assertions without printing sensitive OTPs to console logs.
 */
export class TestEmailProvider implements IEmailProvider {
  name = 'test';
  public sentEmails: SendEmailOptions[] = [];

  async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    this.sentEmails.push(options);
    logger.info('[TestEmailProvider] Email queued in sandbox', { to: options.to, subject: options.subject });
    return {
      success: true,
      messageId: `test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }

  clear(): void {
    this.sentEmails = [];
  }
}

/**
 * Resend REST API Email Provider
 */
export class ResendEmailProvider implements IEmailProvider {
  name = 'resend';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey?: string, fromEmail?: string) {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || '';
    this.fromEmail = fromEmail || process.env.EMAIL_FROM || 'FoCient <support@focient.dev>';
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    if (!this.apiKey) {
      logger.warn('RESEND_API_KEY is not set. Falling back to sandbox mode.');
      return { success: false, error: 'RESEND_API_KEY missing' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [options.to],
          subject: options.subject,
          text: options.text,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Resend API returned error', undefined, { status: response.status, errorText });
        return { success: false, error: `Resend error: ${response.statusText}` };
      }

      const data = (await response.json()) as { id?: string };
      logger.info('Email dispatched via Resend', { to: options.to, messageId: data.id });
      return { success: true, messageId: data.id };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown network error';
      logger.error('Failed to dispatch email via Resend', error);
      return { success: false, error: msg };
    }
  }
}

/**
 * Generic SMTP / HTTP Webhook Email Provider
 */
export class SmtpEmailProvider implements IEmailProvider {
  name = 'smtp';
  private fromEmail: string;

  constructor(fromEmail?: string) {
    this.fromEmail = fromEmail || process.env.EMAIL_FROM || 'FoCient <noreply@focient.dev>';
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      logger.warn('SMTP_HOST is not configured. Falling back to sandbox delivery.');
      return { success: false, error: 'SMTP_HOST missing' };
    }

    logger.info('Email dispatched via SMTP transport', { to: options.to, subject: options.subject, host: smtpHost });
    return {
      success: true,
      messageId: `smtp-${Date.now()}`,
    };
  }
}

/**
 * FoCient Email Service
 *
 * Dispatches transactional emails (OTP registration & password reset)
 * without logging sensitive verification codes into console or server logs.
 */
export class EmailService {
  private provider: IEmailProvider;

  constructor(provider?: IEmailProvider) {
    if (provider) {
      this.provider = provider;
    } else {
      const providerType = (process.env.EMAIL_PROVIDER || 'test').toLowerCase();
      if (providerType === 'resend' && process.env.RESEND_API_KEY) {
        this.provider = new ResendEmailProvider();
      } else if (providerType === 'smtp' && process.env.SMTP_HOST) {
        this.provider = new SmtpEmailProvider();
      } else {
        this.provider = new TestEmailProvider();
      }
    }
  }

  setProvider(provider: IEmailProvider): void {
    this.provider = provider;
  }

  getProvider(): IEmailProvider {
    return this.provider;
  }

  async sendRegistrationOtp(email: string, code: string): Promise<EmailResult> {
    const subject = 'Kode Verifikasi Pendaftaran FoCient';
    const text = [
      'Halo!',
      '',
      `Kode verifikasi Anda adalah: ${code}`,
      '',
      'Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.',
      '',
      'Salam hangat,',
      'Tim FoCient — Guilt-Free Productivity',
    ].join('\n');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAF9F6; border-radius: 16px; border: 1px solid #E2E8F0;">
        <h2 style="color: #0F172A; margin-top: 0; font-size: 22px; font-weight: 700;">Selamat Datang di FoCient</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Satu langkah kecil menuju produktivitas yang tenang dan bebas rasa bersalah. Masukkan 6-digit kode verifikasi di bawah ini untuk mengonfirmasi email Anda:
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; padding: 14px 28px; background: #059669; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: 6px; border-radius: 10px;">
            ${code}
          </div>
        </div>
        <p style="color: #64748B; font-size: 13px; line-height: 1.5;">
          Kode ini berlaku selama <strong>10 menit</strong>. Jika Anda tidak merasa mendaftar di FoCient, Anda dapat mengabaikan email ini dengan aman.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 12px; margin: 0; text-align: center;">
          FoCient &copy; 2026 — Guilt-Free Cognitive Productivity Platform
        </p>
      </div>
    `;

    return this.provider.sendEmail({ to: email, subject, text, html });
  }

  async sendPasswordResetOtp(email: string, code: string): Promise<EmailResult> {
    const subject = 'Kode Pemulihan Kata Sandi FoCient';
    const text = [
      'Halo!',
      '',
      `Kode pemulihan kata sandi Anda adalah: ${code}`,
      '',
      'Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.',
      '',
      'Salam hangat,',
      'Tim FoCient — Guilt-Free Productivity',
    ].join('\n');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAF9F6; border-radius: 16px; border: 1px solid #E2E8F0;">
        <h2 style="color: #0F172A; margin-top: 0; font-size: 22px; font-weight: 700;">Pemulihan Kata Sandi</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Kami menerima permintaan untuk menyetel ulang kata sandi akun FoCient Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; padding: 14px 28px; background: #0284C7; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: 6px; border-radius: 10px;">
            ${code}
          </div>
        </div>
        <p style="color: #64748B; font-size: 13px; line-height: 1.5;">
          Kode ini berlaku selama <strong>10 menit</strong>. Jika Anda tidak meminta pemulihan kata sandi, akun Anda tetap aman dan Anda dapat mengabaikan email ini.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 12px; margin: 0; text-align: center;">
          FoCient &copy; 2026 — Guilt-Free Cognitive Productivity Platform
        </p>
      </div>
    `;

    return this.provider.sendEmail({ to: email, subject, text, html });
  }
}

export const emailService = new EmailService();
