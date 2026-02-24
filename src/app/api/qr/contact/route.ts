import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { QRContactGenerator } from '@/lib/qrContactGenerator';
import type { ContactData, QRContactOptions } from '@/types';

export async function POST(request: NextRequest) {
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
    console.error('QR contact generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR contact code' },
      { status: 500 }
    );
  }
}
