import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

// GET /api/profiles – list the current user's profiles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profiles = await prisma.digitalProfile.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { views: true } } },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("List profiles error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list profiles",
      },
      { status: 500 },
    );
  }
}

// POST /api/profiles – create a new digital profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      fullName,
      firstName,
      lastName,
      title,
      company,
      bio,
      photoUrl,
      email,
      phone,
      website,
      socialLinks,
      ctaButton,
      theme,
      designId,
      contactData,
      slug: requestedSlug,
    } = body;

    if (!fullName) {
      return NextResponse.json(
        { error: "fullName is required" },
        { status: 400 },
      );
    }

    // Generate or validate slug
    let slug = requestedSlug || nanoid(8);
    // Check uniqueness
    const existing = await prisma.digitalProfile.findUnique({
      where: { slug },
    });
    if (existing) {
      slug = nanoid(10);
    }

    const profile = await prisma.digitalProfile.create({
      data: {
        slug,
        userId: user.id,
        designId: designId || null,
        fullName,
        firstName,
        lastName,
        title,
        company,
        bio,
        photoUrl,
        email,
        phone,
        website,
        socialLinks: socialLinks || [],
        ctaButton: ctaButton || null,
        theme: theme || {
          primaryColor: "#6366f1",
          backgroundColor: "#ffffff",
          textColor: "#0f172a",
          font: "Inter",
        },
        contactData: contactData || null,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create profile",
      },
      { status: 500 },
    );
  }
}
