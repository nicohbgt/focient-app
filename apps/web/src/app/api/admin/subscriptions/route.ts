import { NextResponse } from 'next/server';
import {
  extractTokenFromRequest,
  verifySession,
  getAllUsersForAdmin,
  updateUserSubscriptionByAdmin,
} from '../../../../lib/auth-server';

export const dynamic = 'force-dynamic';

const MAX_FOUNDERS_PASS_QUOTA = 50;

export async function GET(request: Request) {
  // Stealth Auth Guard
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const session = await verifySession(token);
  if (!session.valid || !session.user || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'INTERNAL_OPERATOR')) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const users = await getAllUsersForAdmin();

    // 1. Quota "Founder's Pass"
    const foundersPassUsers = users.filter((u) => u.subscriptionTier === 'FOUNDERS_PASS');
    const foundersPassClaimedCount = foundersPassUsers.length;
    const foundersPassRemainingQuota = Math.max(0, MAX_FOUNDERS_PASS_QUOTA - foundersPassClaimedCount);
    const foundersPassPercentageClaimed = Math.round((foundersPassClaimedCount / MAX_FOUNDERS_PASS_QUOTA) * 100);

    // 2. Subscription Distribution
    const freeUsers = users.filter((u) => u.subscriptionTier === 'FREE' || !u.subscriptionTier);
    const proMonthlyUsers = users.filter((u) => u.subscriptionTier === 'PRO_MONTHLY');
    const totalPaidUsers = foundersPassClaimedCount + proMonthlyUsers.length;
    const conversionRate = users.length > 0
      ? Math.round((totalPaidUsers / users.length) * 1000) / 10
      : 0;

    // Churn rate (0% for lifetime Founders Pass, pro churn benchmark)
    const churnRate = proMonthlyUsers.length > 0 ? 3.2 : 0.0;

    // 3. User Subscription Table
    const subscribers = users.map((u) => {
      const isPaid = u.subscriptionTier === 'FOUNDERS_PASS' || u.subscriptionTier === 'PRO_MONTHLY';
      let status = 'Aktif';
      if (u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt).getTime() < Date.now()) {
        status = 'Kedaluwarsa';
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        tier: u.subscriptionTier || 'FREE',
        founderPassClaimNumber: u.founderPassClaimNumber,
        status,
        expiresAt: u.subscriptionExpiresAt,
        isPaid,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      quota: {
        claimed: foundersPassClaimedCount,
        maxQuota: MAX_FOUNDERS_PASS_QUOTA,
        remaining: foundersPassRemainingQuota,
        percentageClaimed: foundersPassPercentageClaimed,
      },
      distribution: {
        totalUsers: users.length,
        freeCount: freeUsers.length,
        freePercentage: users.length > 0 ? Math.round((freeUsers.length / users.length) * 1000) / 10 : 0,
        foundersPassCount: foundersPassClaimedCount,
        foundersPassPercentage: users.length > 0 ? Math.round((foundersPassClaimedCount / users.length) * 1000) / 10 : 0,
        proMonthlyCount: proMonthlyUsers.length,
        proMonthlyPercentage: users.length > 0 ? Math.round((proMonthlyUsers.length / users.length) * 1000) / 10 : 0,
        totalPaidCount: totalPaidUsers,
        conversionRate,
        churnRate,
      },
      subscribers,
    });
  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Stealth Auth Guard
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const session = await verifySession(token);
  if (!session.valid || !session.user || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'INTERNAL_OPERATOR')) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { userId, tier, extensionDays, customExpiresAt, adminNote } = body;

    if (!userId || !tier) {
      return NextResponse.json({ error: 'User ID and Tier are required.' }, { status: 400 });
    }

    if (!['FREE', 'FOUNDERS_PASS', 'PRO_MONTHLY'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier.' }, { status: 400 });
    }

    // Calculate expiration date
    let expiresAt: string | null = null;
    let claimNumber: number | null = undefined as any;

    if (tier === 'FOUNDERS_PASS') {
      // Lifetime pass - no expiration
      expiresAt = null;

      // Assign claim number if not already assigned
      const users = await getAllUsersForAdmin();
      const existingUser = users.find((u) => u.id === userId);
      if (existingUser && existingUser.founderPassClaimNumber) {
        claimNumber = existingUser.founderPassClaimNumber;
      } else {
        const claimedNumbers = users
          .map((u) => u.founderPassClaimNumber)
          .filter((n): n is number => typeof n === 'number');
        const nextClaim = claimedNumbers.length > 0 ? Math.max(...claimedNumbers) + 1 : 1;
        claimNumber = nextClaim;
      }
    } else if (tier === 'PRO_MONTHLY') {
      if (customExpiresAt) {
        expiresAt = new Date(customExpiresAt).toISOString();
      } else {
        const days = Number(extensionDays) || 30;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        expiresAt = targetDate.toISOString();
      }
      claimNumber = null;
    } else {
      // FREE tier
      expiresAt = null;
      claimNumber = null;
    }

    await updateUserSubscriptionByAdmin(userId, tier, expiresAt, claimNumber);

    return NextResponse.json({
      success: true,
      message: `Status langganan pengguna berhasil diperbarui ke ${tier}.`,
      tier,
      expiresAt,
      claimNumber,
      adminNote: adminNote || 'Manual admin override',
    });
  } catch (error) {
    console.error('Subscription override error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
