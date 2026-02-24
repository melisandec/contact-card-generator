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
  const skip = (page - 1) * limit;

  try {
    const [designs, total] = await Promise.all([
      prisma.design.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          thumbnail: true,
          width: true,
          height: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.design.count({ where: { userId } }),
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
    const { name, data, width, height, thumbnail, isPublic } = body;

    if (!name || !data) {
      return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
    }

    const design = await prisma.design.create({
      data: {
        name,
        data,
        width: width ?? 800,
        height: height ?? 500,
        thumbnail,
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
