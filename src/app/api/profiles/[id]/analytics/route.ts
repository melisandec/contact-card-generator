import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/profiles/[id]/analytics – get profile view analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await prisma.digitalProfile.findFirst({
      where: { id, userId: user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalViews, last7DaysViews, actionCounts, dailyViews] =
      await Promise.all([
        prisma.profileView.count({ where: { profileId: id } }),
        prisma.profileView.count({
          where: { profileId: id, createdAt: { gte: sevenDaysAgo } },
        }),
        prisma.profileView.groupBy({
          by: ["action"],
          where: { profileId: id },
          _count: { action: true },
        }),
        prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
          SELECT DATE("createdAt") as date, COUNT(*) as count
          FROM "ProfileView"
          WHERE "profileId" = ${id}
            AND "createdAt" >= ${sevenDaysAgo}
          GROUP BY DATE("createdAt")
          ORDER BY date ASC
        `,
      ]);

    const actions: Record<string, number> = {
      view: 0,
      save_contact: 0,
      email: 0,
      call: 0,
      social_click: 0,
    };
    actionCounts.forEach((ac) => {
      actions[ac.action] = ac._count.action;
    });

    return NextResponse.json({
      totalViews,
      last7Days: last7DaysViews,
      actions,
      dailyViews: dailyViews.map((d) => ({
        date: String(d.date),
        count: Number(d.count),
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 },
    );
  }
}
