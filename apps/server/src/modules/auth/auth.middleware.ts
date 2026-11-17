import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { UnauthorizedError } from '../../common/errors.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    sessionId?: string;
  };
  token?: string;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Header otorisasi Bearer diperlukan');
    }

    const token = authHeader.split(' ')[1];
    const payload = await authService.verifyToken(token);
    req.user = { id: payload.sub, sessionId: payload.sessionId };
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};
