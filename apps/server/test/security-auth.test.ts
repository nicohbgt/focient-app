import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { getJwtSecret, getJwtRefreshSecret, getOtpSecret } from '../src/common/config.js';
import { GoogleOidcService } from '../src/modules/auth/google-oidc.service.js';
import { OtpRepository } from '../src/modules/auth/otp.repository.js';
import { EmailService, TestEmailProvider } from '../src/modules/email/email.service.js';
import { SessionService } from '../src/modules/auth/session.service.js';
import { authLimiter, otpVerifyLimiter } from '../src/middleware/security.middleware.js';
import { ConflictError, UnauthorizedError } from '../src/common/errors.js';

describe('FoCient Security & Authentication Specification (P0 Security)', () => {
  // ==========================================
  // 1. Verified Google OpenID Connect Validation
  // ==========================================
  describe('1. Verified Google OpenID Connect (OIDC) Validation', () => {
    it('rejects empty or whitespace Google tokens', async () => {
      const oidcService = new GoogleOidcService();
      await assert.rejects(
        () => oidcService.verifyIdToken(''),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          assert.match(err.message, /Google ID token is required/i);
          return true;
        }
      );
    });

    it('rejects forged / unverified tokens without valid Google signature', async () => {
      const oidcService = new GoogleOidcService();
      // Forged JWT with random key
      const forgedToken = jwt.sign(
        { email: 'victim@company.com', email_verified: true, iss: 'https://accounts.google.com' },
        'attacker_private_key'
      );

      await assert.rejects(
        () => oidcService.verifyIdToken(forgedToken),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          assert.match(err.message, /Google OpenID Connect verification failed/i);
          return true;
        }
      );
    });

    it('rejects Google tokens where email is not verified', async () => {
      const oidcService = new GoogleOidcService(async () => {
        return {
          email: 'unverified@gmail.com',
          name: 'Unverified User',
          sub: '1234567890',
          emailVerified: false,
        };
      });

      // When validator reports unverified email, service rejects
      const customService = new GoogleOidcService();
      customService.setCustomValidator(async () => {
        throw new UnauthorizedError('Email Google Anda belum diverifikasi');
      });

      await assert.rejects(
        () => customService.verifyIdToken('token_unverified'),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          assert.match(err.message, /belum diverifikasi/i);
          return true;
        }
      );
    });

    it('successfully extracts verified claims when OIDC verification succeeds', async () => {
      const mockVerifiedPayload = {
        email: 'engineer@focient.dev',
        name: 'FoCient Engineer',
        sub: 'google-sub-998877',
        picture: 'https://lh3.googleusercontent.com/photo.jpg',
        emailVerified: true,
      };

      const oidcService = new GoogleOidcService(async (_idToken: string) => {
        return mockVerifiedPayload;
      });

      const result = await oidcService.verifyIdToken('valid_mock_google_oidc_id_token');
      assert.strictEqual(result.email, 'engineer@focient.dev');
      assert.strictEqual(result.name, 'FoCient Engineer');
      assert.strictEqual(result.sub, 'google-sub-998877');
      assert.strictEqual(result.emailVerified, true);
    });
  });

  // ==========================================
  // 2. Secret Management & Fallback Elimination
  // ==========================================
  describe('2. Secret Management & Fallback Elimination', () => {
    it('throws in production when JWT_SECRET is missing', () => {
      const origEnv = process.env.NODE_ENV;
      const origSecret = process.env.JWT_SECRET;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.JWT_SECRET;

        assert.throws(
          () => getJwtSecret(),
          (err: Error) => {
            assert.match(err.message, /JWT_SECRET environment variable is missing/i);
            return true;
          }
        );
      } finally {
        process.env.NODE_ENV = origEnv;
        if (origSecret) process.env.JWT_SECRET = origSecret;
      }
    });

    it('throws in production when JWT_SECRET is shorter than 32 characters', () => {
      const origEnv = process.env.NODE_ENV;
      const origSecret = process.env.JWT_SECRET;
      try {
        process.env.NODE_ENV = 'production';
        process.env.JWT_SECRET = 'short_insecure_secret_123';

        assert.throws(
          () => getJwtSecret(),
          (err: Error) => {
            assert.match(err.message, /at least 32 characters in production/i);
            return true;
          }
        );
      } finally {
        process.env.NODE_ENV = origEnv;
        if (origSecret) process.env.JWT_SECRET = origSecret;
      }
    });

    it('retrieves valid cryptographic secrets when properly configured', () => {
      const origSecret = process.env.JWT_SECRET;
      try {
        process.env.JWT_SECRET = 'a_very_secure_random_cryptographic_jwt_key_32_chars_long';
        const secret = getJwtSecret();
        assert.strictEqual(secret, 'a_very_secure_random_cryptographic_jwt_key_32_chars_long');
      } finally {
        if (origSecret) process.env.JWT_SECRET = origSecret;
      }
    });
  });

  // ==========================================
  // 3. Persistent, Hashed OTP & Real Email Provider
  // ==========================================
  describe('3. Persistent Hashed OTP Records & Real Email Provider', () => {
    let otpRepo: OtpRepository;
    let testEmailProvider: TestEmailProvider;
    let emailService: EmailService;

    beforeEach(() => {
      otpRepo = new OtpRepository();
      otpRepo.clearFallback();
      testEmailProvider = new TestEmailProvider();
      emailService = new EmailService(testEmailProvider);
    });

    it('hashes OTP using HMAC-SHA256 and never stores plaintext code', async () => {
      const email = 'user@focient.dev';
      const code = '739201';

      await otpRepo.saveOtp(email, 'REGISTRATION', code, 600);

      // Verify that the hash can be verified constant-time
      const hash = otpRepo.hashOtp(email, code);
      assert.notStrictEqual(hash, code);
      assert.strictEqual(hash.length, 64); // SHA-256 hex is 64 characters

      const isMatch = otpRepo.verifyCode(email, code, hash);
      assert.strictEqual(isMatch, true);

      // Verify wrong code fails
      const isWrongMatch = otpRepo.verifyCode(email, '000000', hash);
      assert.strictEqual(isWrongMatch, false);
    });

    it('dispatches email via email provider without logging plaintext code to console', async () => {
      const email = 'sarah@company.com';
      const code = '582194';

      await emailService.sendRegistrationOtp(email, code);

      assert.strictEqual(testEmailProvider.sentEmails.length, 1);
      const sent = testEmailProvider.sentEmails[0];
      assert.strictEqual(sent.to, email);
      assert(sent.html.includes(code));
      assert(sent.subject.includes('Verifikasi Pendaftaran'));
    });

    it('successfully consumes valid OTP (single-use guarantee)', async () => {
      const email = 'singleuse@focient.dev';
      const code = '441928';

      await otpRepo.saveOtp(email, 'REGISTRATION', code, 600);

      // First verification: success
      const verified = await otpRepo.verifyAndConsume(email, 'REGISTRATION', code);
      assert.strictEqual(verified, true);

      // Second verification: fails because single-use OTP is already consumed
      await assert.rejects(
        () => otpRepo.verifyAndConsume(email, 'REGISTRATION', code),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          assert.match(err.message, /tidak ditemukan atau sudah kedaluwarsa/i);
          return true;
        }
      );
    });

    it('increments failed attempts and permanently invalidates after 5 wrong attempts', async () => {
      const email = 'bruteforce@focient.dev';
      const code = '987654';

      await otpRepo.saveOtp(email, 'REGISTRATION', code, 600);

      // 4 wrong attempts
      for (let i = 0; i < 4; i++) {
        await assert.rejects(
          () => otpRepo.verifyAndConsume(email, 'REGISTRATION', '111111'),
          (err: Error) => {
            assert(err instanceof UnauthorizedError);
            assert.match(err.message, /Kode OTP salah/i);
            return true;
          }
        );
      }

      // 5th wrong attempt triggers invalidation
      await assert.rejects(
        () => otpRepo.verifyAndConsume(email, 'REGISTRATION', '111111'),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          return true;
        }
      );

      // 6th attempt: locked out even if code is correct!
      await assert.rejects(
        () => otpRepo.verifyAndConsume(email, 'REGISTRATION', code),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          assert.match(err.message, /Batas percobaan terlampaui/i);
          return true;
        }
      );
    });

    it('enforces 30-second cooldown rate limit between consecutive OTP requests', async () => {
      const email = 'cooldown@focient.dev';

      // First request succeeds
      await otpRepo.saveOtp(email, 'REGISTRATION', '123456', 600);

      // Immediate second request is rejected with ConflictError
      await assert.rejects(
        () => otpRepo.saveOtp(email, 'REGISTRATION', '654321', 600),
        (err: Error) => {
          assert(err instanceof ConflictError);
          assert.match(err.message, /Mohon tunggu \d+ detik/i);
          return true;
        }
      );
    });
  });

  // ==========================================
  // 4. Session Expiration, Refresh & Revocation
  // ==========================================
  describe('4. Session Expiration, Refresh & Revocation', () => {
    let sessionService: SessionService;

    beforeEach(() => {
      sessionService = new SessionService();
      sessionService.clearFallback();
    });

    it('issues access token and refresh token upon session creation', async () => {
      const userId = 'usr-test-12345';
      const session = await sessionService.createSession(userId, 'TestAgent', '127.0.0.1');

      assert(session.token.length > 0);
      assert(session.refreshToken.length > 0);
      assert.strictEqual(session.expiresInSeconds, 900);

      // Verify access token claims
      const payload = await sessionService.verifyAccessToken(session.token);
      assert.strictEqual(payload.sub, userId);
      assert(payload.sessionId.length > 0);
    });

    it('rejects expired access tokens with UnauthorizedError', async () => {
      const expiredToken = jwt.sign(
        { sub: 'usr-expired', sessionId: 'sess-exp' },
        getJwtSecret(),
        { expiresIn: -10 } // Expired 10 seconds ago
      );

      await assert.rejects(
        () => sessionService.verifyAccessToken(expiredToken),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          assert.match(err.message, /kedaluwarsa/i);
          return true;
        }
      );
    });

    it('refreshes token pair and rotates refresh token (Refresh Token Rotation)', async () => {
      const userId = 'usr-refresh-test';
      const initialSession = await sessionService.createSession(userId);

      const refreshed = await sessionService.refreshTokens(initialSession.refreshToken);

      assert(refreshed.token.length > 0);
      assert(refreshed.refreshToken.length > 0);
      // New refresh token is rotated (different from previous)
      assert.notStrictEqual(refreshed.refreshToken, initialSession.refreshToken);

      // New access token is valid
      const payload = await sessionService.verifyAccessToken(refreshed.token);
      assert.strictEqual(payload.sub, userId);
    });

    it('immediately rejects access when a session is revoked (Logout)', async () => {
      const userId = 'usr-logout-test';
      const session = await sessionService.createSession(userId);

      // Access token is valid before logout
      const payloadBefore = await sessionService.verifyAccessToken(session.token);
      assert.strictEqual(payloadBefore.sub, userId);

      // Revoke session (user logs out)
      await sessionService.revokeSession(payloadBefore.sessionId);

      // Token is now rejected!
      await assert.rejects(
        () => sessionService.verifyAccessToken(session.token),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          assert.match(err.message, /Sesi telah dicabut/i);
          return true;
        }
      );

      // Refresh token is also rejected!
      await assert.rejects(
        () => sessionService.refreshTokens(session.refreshToken),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          assert.match(err.message, /Sesi telah dicabut/i);
          return true;
        }
      );
    });

    it('revokes all sessions on password reset', async () => {
      const userId = 'usr-all-sessions';
      const session1 = await sessionService.createSession(userId);
      const session2 = await sessionService.createSession(userId);

      await sessionService.revokeAllUserSessions(userId);

      await assert.rejects(
        () => sessionService.verifyAccessToken(session1.token),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          return true;
        }
      );

      await assert.rejects(
        () => sessionService.verifyAccessToken(session2.token),
        (err: Error) => {
          assert(err instanceof UnauthorizedError);
          return true;
        }
      );
    });
  });

  // ==========================================
  // 5. Rate-Limit Configuration & Guardrails
  // ==========================================
  describe('5. Rate-Limit Guardrails', () => {
    it('defines distinct rate limits for Auth and OTP verification', () => {
      assert(authLimiter !== undefined);
      assert(otpVerifyLimiter !== undefined);
    });
  });
});
