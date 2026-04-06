import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { headers } from "next/headers";
import type { Metadata } from "next";
import ProfilePageClient from "./ProfilePageClient";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

// Generate OG metadata
export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.digitalProfile.findUnique({
    where: { slug },
  });

  if (!profile) return { title: "Profile Not Found" };

  return {
    title: `${profile.fullName} — CardCrafter`,
    description:
      profile.bio ||
      `${profile.fullName}${profile.title ? ` — ${profile.title}` : ""}${profile.company ? ` at ${profile.company}` : ""}`,
    openGraph: {
      title: profile.fullName,
      description: profile.bio || `Contact ${profile.fullName}`,
      type: "profile",
      ...(profile.photoUrl && { images: [{ url: profile.photoUrl }] }),
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const profile = await prisma.digitalProfile.findUnique({
    where: { slug },
  });

  if (!profile || !profile.isPublic) {
    notFound();
  }

  // Track view (fire-and-forget)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  const userAgent = headersList.get("user-agent") || undefined;

  // Don't await – fire and forget
  prisma.profileView
    .create({
      data: {
        profileId: profile.id,
        action: "view",
        ipHash,
        userAgent,
      },
    })
    .catch(() => {});

  const theme = (profile.theme as {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    font: string;
  }) || {
    primaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    font: "Inter",
  };

  const socialLinks =
    (profile.socialLinks as Array<{
      platform: string;
      url: string;
      username?: string;
    }>) || [];
  const ctaButton = profile.ctaButton as { label: string; url: string } | null;

  // Fetch design thumbnail if this profile has a linked design
  let designThumbnail: string | null = null;
  if (profile.designId) {
    const design = await prisma.design.findUnique({
      where: { id: profile.designId },
      select: { thumbnailUrl: true, thumbnail: true },
    });
    designThumbnail = design?.thumbnailUrl ?? design?.thumbnail ?? null;
  }

  return (
    <ProfilePageClient
      profile={{
        id: profile.id,
        slug: profile.slug,
        fullName: profile.fullName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        title: profile.title,
        company: profile.company,
        bio: profile.bio,
        photoUrl: profile.photoUrl,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        socialLinks,
        ctaButton,
        theme,
      }}
      designThumbnail={designThumbnail}
    />
  );
}
