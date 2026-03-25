import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QRContactGenerator } from "@/lib/qrContactGenerator";
import QRCode from "qrcode";

// GET /api/profiles/[id]/qr – generate QR code for the profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const size = Math.max(50, Math.min(2000, parseInt(searchParams.get("size") || "300", 10) || 300));
    const format = searchParams.get("format") || "dataurl"; // 'dataurl' | 'png'

    const profile = await prisma.digitalProfile.findFirst({
      where: { id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // The QR encodes the public profile URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const profileUrl = `${baseUrl}/p/${profile.slug}`;

    if (format === "png") {
      const buffer = await QRCode.toBuffer(profileUrl, {
        width: size,
        margin: 1,
        errorCorrectionLevel: "M",
      });
      return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const dataUrl = await QRCode.toDataURL(profileUrl, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return NextResponse.json({ dataUrl, profileUrl, slug: profile.slug });
  } catch (error) {
    console.error("Profile QR error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate QR code",
      },
      { status: 500 },
    );
  }
}
