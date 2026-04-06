import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, foreground = '#000000', background = '#ffffff', size: rawSize = 200 } = body;
    const size = Math.max(50, Math.min(2000, Number(rawSize) || 200));

    if (!data || typeof data !== 'string') {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 });
    }
    if (data.length > 2048) {
      return NextResponse.json({ error: 'Data exceeds maximum length of 2048 characters' }, { status: 400 });
    }

    const fg = HEX_COLOR_RE.test(foreground) ? foreground : '#000000';
    const bg = HEX_COLOR_RE.test(background) ? background : '#ffffff';

    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      color: {
        dark: fg,
        light: bg,
      },
      margin: 1,
    });

    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data');

  if (!data) {
    return NextResponse.json({ error: 'Data is required' }, { status: 400 });
  }
  if (data.length > 2048) {
    return NextResponse.json({ error: 'Data exceeds maximum length' }, { status: 400 });
  }

  try {
    const buffer = await QRCode.toBuffer(data, { width: 200, margin: 1 });
    return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
