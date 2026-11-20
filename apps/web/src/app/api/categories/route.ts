import { NextResponse } from 'next/server';
import { prisma } from '@focient/database';
import {
  extractTokenFromRequest,
  verifySession,
  saveCategoriesToLocalDb,
  getCategoriesFromLocalDb,
  deleteCategoryFromLocalDb,
  findLocalUserById,
  resolveCategoryFocusTypeByName,
} from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Token otorisasi diperlukan.' },
        { status: 401 }
      );
    }

    const { valid, user, message } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: message || 'Sesi otorisasi telah berakhir.' },
        { status: 401 }
      );
    }

    // 1. Try PostgreSQL first
    try {
      const categories = await prisma.category.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
      if (categories && categories.length > 0) {
        return NextResponse.json(categories);
      }
    } catch {
      // PostgreSQL is offline
    }

    // 2. Fall back to local persistent store
    const localCategories = getCategoriesFromLocalDb(user.id);
    if (localCategories && localCategories.length > 0) {
      return NextResponse.json(localCategories);
    }

    // 3. If none exist yet, return empty list (user configures during onboarding)
    return NextResponse.json([]);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, user } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const catData = {
      id: body.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: body.name,
      colorHex: body.colorHex || body.colorToken || '#0284C7',
      focusType: body.focusType || resolveCategoryFocusTypeByName(body.name),
      isDefault: Boolean(body.isDefault),
    };

    // Save to local store
    saveCategoriesToLocalDb(user.id, [catData]);

    // Also attempt PostgreSQL write
    try {
      const created = await prisma.category.create({
        data: {
          id: catData.id,
          userId: user.id,
          name: catData.name,
          colorToken: catData.colorHex,
          isDefault: catData.isDefault,
        },
      });
      return NextResponse.json(created, { status: 201 });
    } catch {
      return NextResponse.json(catData, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ error: 'Gagal membuat kategori.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, user } = await verifySession(token);
    if (!valid || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
    }

    // Local delete
    deleteCategoryFromLocalDb(user.id, id);

    // PostgreSQL delete
    try {
      await prisma.category.deleteMany({
        where: { id, userId: user.id },
      });
    } catch {}

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (error) {
    console.error('DELETE /api/categories error:', error);
    return NextResponse.json({ error: 'Gagal menghapus kategori.' }, { status: 500 });
  }
}
