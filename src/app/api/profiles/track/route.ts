import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { headers } from "next/headers";

// POST /api/profiles/track – record a profile action (view, save_contact, email, call, social_click)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, action, metadata } = body;

    if (!profileId || !action) {
      return NextResponse.json(
        { error: "profileId and action are required" },
        { status: 400 },
      );
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const userAgent = headersList.get("user-agent") || undefined;

    await prisma.profileView.create({
      data: {
        profileId,
        action,
        metadata: metadata || undefined,
        ipHash,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track profile action error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to track action",
      },
      { status: 500 },
    );
  }
}
