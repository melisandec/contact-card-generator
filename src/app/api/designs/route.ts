import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'updatedAt';
  const tag = searchParams.get('tag') ?? '';
  const skip = (page - 1) * limit;

  const sortField = ['updatedAt', 'createdAt', 'name'].includes(sort) ? sort : 'updatedAt';
  const orderBy = sortField === 'name'
    ? { name: 'asc' as const }
    : { [sortField]: 'desc' as const };

  try {
    const where: Record<string, unknown> = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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
    console.error('Failed to fetch designs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
    }

    const design = await prisma.design.create({
      data: {
        name,
        description,
        data,
        frontLayers: frontLayers ?? null,
        backLayers: backLayers ?? null,
        isDoubleSided: isDoubleSided ?? false,
        width: width ?? 1050,
        height: height ?? 600,
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
    console.error('Failed to create design:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
