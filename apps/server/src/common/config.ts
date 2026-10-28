import crypto from 'node:crypto';

/**
 * FoCient Centralized Configuration & Secret Management
 *
 * Ensures all cryptographic secrets are loaded from environment variables
 * without insecure default fallbacks in production, enforcing minimum entropy.
 */

export interface SecurityConfig {
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  otpSecret: string;
  allowedOrigins: string[];
  googleClientIds: string[];
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is missing. A secure secret must be configured in production.'
      );
    }
    // In development or test, require JWT_SECRET or provide a test-only warning
    if (process.env.NODE_ENV === 'test') {
      return 'focient_test_env_jwt_secret_at_least_32_characters_long!';
    }
    throw new Error(
      'JWT_SECRET environment variable is missing. Please set JWT_SECRET in your .env file.'
    );
  }

  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error(
      'FATAL: JWT_SECRET must be at least 32 characters in production to guarantee cryptographic security.'
    );
  }

  return secret;
}

export function getJwtRefreshSecret(): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!refreshSecret) {
    if (process.env.NODE_ENV === 'test') {
      return 'focient_test_env_jwt_refresh_secret_at_least_32_chars!';
    }
    throw new Error(
      'JWT_REFRESH_SECRET environment variable is missing. Please set it in your .env file.'
    );
  }
  return refreshSecret;
}

export function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'test') {
      return 'focient_test_otp_hmac_secret_key_32_chars!';
    }
    return crypto.randomBytes(32).toString('hex');
  }
  return secret;
}

export function getGoogleClientIds(): string[] {
  const ids: string[] = [];
  if (process.env.GOOGLE_CLIENT_ID) ids.push(process.env.GOOGLE_CLIENT_ID);
  if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) ids.push(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  if (process.env.GOOGLE_MOBILE_CLIENT_ID) ids.push(process.env.GOOGLE_MOBILE_CLIENT_ID);
  return ids;
}

export const securityConfig: SecurityConfig = {
  get jwtSecret() {
    return getJwtSecret();
  },
  get jwtRefreshSecret() {
    return getJwtRefreshSecret();
  },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  get otpSecret() {
    return getOtpSecret();
  },
  get allowedOrigins() {
    return process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
      : ['http://localhost:3000', 'http://localhost:5173'];
  },
  get googleClientIds() {
    return getGoogleClientIds();
  },
};
