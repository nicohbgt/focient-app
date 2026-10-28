import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { securityConfig } from '../common/config.js';

// Dedicated Rate Limiter for sensitive Auth operations (Login, Send OTP, Forgot Password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Terlalu banyak permintaan otentikasi. Silakan beristirahat sejenak dan coba lagi dalam 15 menit.',
    },
  },
});

// Dedicated Strict Rate Limiter for OTP verification to prevent brute-forcing
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Batas percobaan verifikasi terlampaui. Silakan minta kode baru.',
    },
  },
});

// Global API Rate Limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Terlalu banyak permintaan. Silakan coba kembali dalam beberapa menit.',
    },
  },
});

/**
 * Applies security middlewares:
 * - Helmet for HTTP security headers
 * - CORS policy restricting allowed origins
 * - Rate limiting to mitigate brute-force, credential stuffing, and DoS
 */
export const configureSecurityMiddleware = (app: Express): void => {
  // Helmet HTTP Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = securityConfig.allowedOrigins;

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Apply Auth route rate limiting (bypass in test environment if test flag is set)
  if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_RATE_LIMIT_IN_TEST === 'true') {
    app.use('/api/auth/send-otp', authLimiter);
    app.use('/api/auth/forgot-password', authLimiter);
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/verify-otp', otpVerifyLimiter);
    app.use('/api/auth/verify-reset-otp', otpVerifyLimiter);
    app.use('/api/', globalLimiter);
  }
};
