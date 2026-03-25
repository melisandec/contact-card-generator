import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { QRContactGenerator } from '@/lib/qrContactGenerator';
import type { ContactData, QRContactOptions } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { contactData, options } = body as {
      contactData: ContactData;
      options?: Partial<QRContactOptions>;
    };

    if (!contactData || !contactData.fullName) {
      return NextResponse.json(
        { error: 'Contact data with fullName is required' },
        { status: 400 }
      );
    }

    const generator = new QRContactGenerator(contactData, options);
    const qrString = generator.getQRDataString();

    const dataUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: generator.options.errorCorrection || 'M',
      margin: generator.options.margin ?? 4,
      width: generator.options.size || 200,
      color: {
        dark: generator.options.foregroundColor || '#000000',
        light: generator.options.backgroundColor || '#ffffff',
      },
    });

    return NextResponse.json({
      dataUrl,
      qrString,
      format: generator.options.format,
      size: qrString.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('QR contact generation error:', message);
    return NextResponse.json(
      { error: 'Failed to generate QR contact code' },
      { status: 500 }
    );
  }
}
