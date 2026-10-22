import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { UnauthorizedError } from '../../common/errors.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Header otorisasi Bearer diperlukan');
  }

  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);
  req.user = { id: payload.sub };
  next();
};
