import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const categoryRouter = Router();
categoryRouter.use(authenticate);

export const STANDARD_CATEGORIES = [
  { id: 'cat-core', name: 'Pekerjaan Inti', color: '#2563EB', isSystem: true },
  { id: 'cat-learn', name: 'Pembelajaran Mandiri', color: '#0D9488', isSystem: true },
  { id: 'cat-health', name: 'Kesehatan & Istirahat', color: '#16A34A', isSystem: true },
  { id: 'cat-career', name: 'Pengembangan Karir', color: '#7C3AED', isSystem: true },
  { id: 'cat-personal', name: 'Manajemen Pribadi', color: '#D97706', isSystem: true },
  { id: 'cat-creative', name: 'Eksplorasi Kreatif', color: '#EA580C', isSystem: true },
];

categoryRouter.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  res.json(STANDARD_CATEGORIES);
});
