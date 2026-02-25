import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string; versionId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, versionId } = await params;

  try {
    const design = await prisma.design.findUnique({ where: { id } });
    if (!design || design.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const version = await prisma.designVersion.findUnique({
      where: { id: versionId },
    });
    if (!version || version.designId !== id) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Save current state as a new version before restoring
    const latestVersion = await prisma.designVersion.count({
      where: { designId: id },
    });
    await prisma.designVersion.create({
      data: {
        designId: id,
        version: latestVersion + 1,
        name: `Before restore (auto-saved)`,
        data: design.data,
        frontLayers: design.frontLayers ?? undefined,
        backLayers: design.backLayers ?? undefined,
        isDoubleSided: design.isDoubleSided,
        width: design.width,
        height: design.height,
        createdBy: userId,
      },
    });

    // Restore the design to the selected version
    const updated = await prisma.design.update({
      where: { id },
      data: {
        data: version.data as object,
        frontLayers: (version.frontLayers as object) ?? undefined,
        backLayers: (version.backLayers as object) ?? undefined,
        isDoubleSided: version.isDoubleSided,
        width: version.width,
        height: version.height,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to restore version:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
