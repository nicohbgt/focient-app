import { Router, Response } from 'express';
import {
  RegisterSchema,
  LoginSchema,
  CompleteOnboardingSchema,
  SendOtpSchema,
  VerifyOtpSchema,
  ForgotPasswordSchema,
  VerifyResetOtpSchema,
  ResetPasswordSchema,
} from '@focient/contracts';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authService } from './auth.service.js';
import { authenticate, AuthenticatedRequest } from './auth.middleware.js';

export const authRouter = Router();

// Dispatch 6-digit verification code to user's real email for registration
authRouter.post('/send-otp', validateBody(SendOtpSchema), async (req, res: Response, next) => {
  try {
    const result = await authService.sendOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Verify 6-digit OTP code and complete real account registration
authRouter.post('/verify-otp', validateBody(VerifyOtpSchema), async (req, res: Response, next) => {
  try {
    const result = await authService.verifyOtp(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Forgot Password: Send OTP to reset password
authRouter.post('/forgot-password', validateBody(ForgotPasswordSchema), async (req, res: Response, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Verify OTP for Password Reset
authRouter.post('/verify-reset-otp', validateBody(VerifyResetOtpSchema), async (req, res: Response, next) => {
  try {
    const result = await authService.verifyResetOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Reset Password: Submit new password with verified OTP
authRouter.post('/reset-password', validateBody(ResetPasswordSchema), async (req, res: Response, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/register', validateBody(RegisterSchema), async (req, res: Response, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', validateBody(LoginSchema), async (req, res: Response, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Hybrid Auth: Google OAuth 2.0 Sign-In
authRouter.post('/google', async (req, res: Response, next) => {
  try {
    const token = req.body.token || req.body.idToken || 'mock_google_token';
    const result = await authService.googleSignIn(token);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Instant Guest / Demo Session for frictionless onboarding and testing
authRouter.post(['/demo', '/guest'], async (_req, res: Response, next) => {
  try {
    const result = await authService.createGuestSession();
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Proses 1.0: Complete Onboarding & Save Work Capacity Preferences
authRouter.post(
  '/onboarding',
  authenticate,
  validateBody(CompleteOnboardingSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const profile = await authService.completeOnboarding(req.user!.id, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

