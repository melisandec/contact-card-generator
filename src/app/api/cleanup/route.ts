import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Weekly cleanup job - removes designs older than 6 months for guest-equivalent inactive users
export async function GET(request: NextRequest) {
  // Verify this is called from Vercel Cron (via Authorization header)
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Delete old non-public designs that haven't been updated in 6 months
    const deleted = await prisma.design.deleteMany({
      where: {
        isPublic: false,
        updatedAt: { lt: sixMonthsAgo },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cleanup job failed:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
