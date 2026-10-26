import { Router, Response } from 'express';
import { prisma } from '@focient/database';
import { CreateCategorySchema } from '@focient/contracts';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';

export const categoryRouter = Router();
categoryRouter.use(authenticate);

export const STANDARD_CATEGORIES = [
  { name: 'Pekerjaan Inti', colorToken: 'blue', isDefault: true },
  { name: 'Fokus Inti', colorToken: 'purple', isDefault: true },
  { name: 'Pengembangan', colorToken: 'teal', isDefault: true },
  { name: 'Refleksi', colorToken: 'green', isDefault: true },
  { name: 'Manajemen Pribadi', colorToken: 'amber', isDefault: true },
];

// GET /api/categories
categoryRouter.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    let categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // If user has zero categories, seed initial defaults
    if (categories.length === 0) {
      for (const std of STANDARD_CATEGORIES) {
        await prisma.category.create({
          data: {
            userId,
            name: std.name,
            colorToken: std.colorToken,
            isDefault: std.isDefault,
          },
        });
      }

      categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
    }

    res.json(
      categories.map((c) => ({
        id: c.id,
        userId: c.userId,
        name: c.name,
        colorToken: c.colorToken,
        isDefault: c.isDefault,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    next(error);
  }
});

// POST /api/categories
categoryRouter.post(
  '/',
  validateBody(CreateCategorySchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const { name, colorToken, isDefault } = req.body;

      const category = await prisma.category.create({
        data: {
          userId,
          name,
          colorToken: colorToken ?? 'blue',
          isDefault: isDefault ?? false,
        },
      });

      res.status(201).json({
        id: category.id,
        userId: category.userId,
        name: category.name,
        colorToken: category.colorToken,
        isDefault: category.isDefault,
        createdAt: category.createdAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/categories/:id
categoryRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    await prisma.category.deleteMany({
      where: { id: req.params.id, userId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
