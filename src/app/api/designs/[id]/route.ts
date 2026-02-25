import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  const { id } = await params;

  try {
    const design = await prisma.design.findUnique({
      where: { id },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (design.userId !== userId && !design.isPublic) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(design);
  } catch (error) {
    console.error("Failed to fetch design:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const design = await prisma.design.findUnique({
      where: { id },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (design.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      data,
      frontLayers,
      backLayers,
      isDoubleSided,
      width,
      height,
      thumbnail,
      thumbnailUrl,
      templateId,
      tags,
      isPublic,
      folderId,
    } = body;

    // Auto-create a version snapshot before updating (if data changed)
    if (data !== undefined) {
      const versionCount = await prisma.designVersion.count({
        where: { designId: id },
      });
      await prisma.designVersion.create({
        data: {
          designId: id,
          version: versionCount + 1,
          name: `Version ${versionCount + 1}`,
          data: design.data,
          frontLayers: design.frontLayers ?? undefined,
          backLayers: design.backLayers ?? undefined,
          isDoubleSided: design.isDoubleSided,
          width: design.width,
          height: design.height,
          createdBy: userId,
        },
      });
    }

    const updated = await prisma.design.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(data !== undefined && { data }),
        ...(frontLayers !== undefined && { frontLayers }),
        ...(backLayers !== undefined && { backLayers }),
        ...(isDoubleSided !== undefined && { isDoubleSided }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(templateId !== undefined && { templateId }),
        ...(tags !== undefined && { tags }),
        ...(isPublic !== undefined && { isPublic }),
        ...(folderId !== undefined && { folderId }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update design:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const design = await prisma.design.findUnique({
      where: { id },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (design.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.design.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete design:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
