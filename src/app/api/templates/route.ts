import { NextRequest, NextResponse } from 'next/server';
import templates from '@/data/templates.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q')?.toLowerCase();

  let result = templates;

  if (category && category !== 'all') {
    result = result.filter((t) => t.category === category);
  }

  if (query) {
    result = result.filter(
      (t) => t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ templates: result, total: result.length });
}
