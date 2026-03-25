import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20") || 20));
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "updatedAt";
  const tag = searchParams.get("tag") ?? "";
  const skip = (page - 1) * limit;

  const sortField = ["updatedAt", "createdAt", "name"].includes(sort)
    ? sort
    : "updatedAt";
  const orderBy =
    sortField === "name"
      ? { name: "asc" as const }
      : { [sortField]: "desc" as const };

  try {
    const where: Record<string, unknown> = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const [designs, total] = await Promise.all([
      prisma.design.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          thumbnail: true,
          thumbnailUrl: true,
          width: true,
          height: true,
          isPublic: true,
          isDoubleSided: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.design.count({ where }),
    ]);

    return NextResponse.json({ designs, total, page, limit });
  } catch (error) {
    console.error("Failed to fetch designs:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch designs",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
    } = body;

    if (!name || !data) {
      return NextResponse.json(
        { error: "Name and data are required" },
        { status: 400 },
      );
    }

    const design = await prisma.design.create({
      data: {
        name,
        description,
        data,
        frontLayers: frontLayers ?? null,
        backLayers: backLayers ?? null,
        isDoubleSided: isDoubleSided ?? false,
        width: Math.max(100, Math.min(10000, width ?? 1050)),
        height: Math.max(100, Math.min(10000, height ?? 600)),
        thumbnail,
        thumbnailUrl,
        templateId,
        tags: tags ?? [],
        isPublic: isPublic ?? false,
        userId,
      },
    });

    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    console.error("Failed to create design:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create design",
      },
      { status: 500 },
    );
  }
}
