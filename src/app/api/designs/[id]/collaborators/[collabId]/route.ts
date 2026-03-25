import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string; collabId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, collabId } = await params;

  try {
    const design = await prisma.design.findUnique({ where: { id } });
    if (!design || design.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collaborator = await prisma.designCollaborator.findUnique({
      where: { id: collabId },
    });
    if (!collaborator || collaborator.designId !== id) {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
    }

    await prisma.designCollaborator.delete({ where: { id: collabId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove collaborator:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
