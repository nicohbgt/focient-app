import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

/**
 * Applies security middlewares:
 * - Helmet for HTTP security headers
 * - CORS policy restricting allowed origins
 * - Rate limiting to mitigate brute-force and DoS
 */
export const configureSecurityMiddleware = (app: Express): void => {
  // Helmet HTTP Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

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

  // Global API Rate Limiter: 100 requests per 15 minutes per IP
  const limiter = rateLimit({
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

  app.use('/api/', limiter);
};
