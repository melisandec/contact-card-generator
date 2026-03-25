import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, foreground = '#000000', background = '#ffffff', size: rawSize = 200 } = body;
    const size = Math.max(50, Math.min(2000, Number(rawSize) || 200));

    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 });
    }

    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      color: {
        dark: foreground,
        light: background,
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
