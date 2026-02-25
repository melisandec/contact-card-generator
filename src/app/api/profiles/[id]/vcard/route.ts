import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QRContactGenerator } from "@/lib/qrContactGenerator";
import type { ContactData } from "@/types";

// GET /api/profiles/[id]/vcard – download vCard for a profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const profile = await prisma.digitalProfile.findUnique({
      where: { id },
    });

    if (!profile || !profile.isPublic) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Build ContactData from profile
    const contactData: ContactData =
      (profile.contactData as unknown as ContactData) || {
        fullName: profile.fullName,
        firstName: profile.firstName || undefined,
        lastName: profile.lastName || undefined,
        title: profile.title || undefined,
        company: profile.company || undefined,
        phones: profile.phone
          ? [{ type: "mobile" as const, number: profile.phone }]
          : [],
        emails: profile.email
          ? [{ type: "work" as const, address: profile.email }]
          : [],
        websites: profile.website
          ? [{ type: "work" as const, url: profile.website }]
          : [],
        notes: profile.bio || undefined,
        photo: profile.photoUrl || undefined,
        socialMedia: (
          (profile.socialLinks as Array<{
            platform: string;
            url: string;
            username?: string;
          }>) || []
        ).map((s) => ({
          platform: s.platform as
            | "linkedin"
            | "twitter"
            | "instagram"
            | "facebook"
            | "github"
            | "other",
          username: s.username || "",
          url: s.url,
        })),
      };

    const generator = new QRContactGenerator(contactData, { format: "vcard" });
    const vcard = generator.generateVCard();

    const filename = `${profile.fullName.replace(/[^a-zA-Z0-9]/g, "_")}.vcf`;

    return new NextResponse(vcard, {
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("vCard download error:", error);
    return NextResponse.json(
      { error: "Failed to generate vCard" },
      { status: 500 },
    );
  }
}
