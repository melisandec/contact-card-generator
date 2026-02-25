import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const design = await prisma.design.findUnique({ where: { id } });
    if (!design) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (design.userId !== userId) {
      // Allow collaborators to view versions
      const collab = await prisma.designCollaborator.findUnique({
        where: { designId_userId: { designId: id, userId } },
      });
      if (!collab) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const versions = await prisma.designVersion.findMany({
      where: { designId: id },
      orderBy: { version: "desc" },
      take: 50,
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("Failed to fetch versions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
