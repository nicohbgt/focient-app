import { Router, Response } from 'express';
import { RegisterSchema, LoginSchema } from '@focient/contracts';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authService } from './auth.service.js';
import { authenticate, AuthenticatedRequest } from './auth.middleware.js';

export const authRouter = Router();

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

authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});
