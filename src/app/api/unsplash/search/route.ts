import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await checkRateLimit(`unsplash:${ip}`);

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q') ?? 'background';
  const query = rawQuery.slice(0, 100);
  const page = Math.max(1, Math.min(100, parseInt(searchParams.get('page') ?? '1') || 1));
  const perPage = Math.max(1, Math.min(50, parseInt(searchParams.get('per_page') ?? '20') || 20));

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    // Return picsum fallback
    const photos = Array.from({ length: perPage }, (_, i) => ({
      id: `picsum-${i}`,
      urls: {
        small: `https://picsum.photos/seed/${query}${i}/400/300`,
        regular: `https://picsum.photos/seed/${query}${i}/800/600`,
        full: `https://picsum.photos/seed/${query}${i}/1600/1200`,
      },
      alt_description: `${query} photo ${i + 1}`,
      user: { name: 'Picsum', username: 'picsum' },
    }));
    return NextResponse.json({ results: photos, total: 100 });
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unsplash search error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
