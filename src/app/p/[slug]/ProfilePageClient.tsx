"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  Phone,
  Globe,
  Download,
  ExternalLink,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Facebook,
  Youtube,
  CheckCircle2,
  Layers,
} from "lucide-react";

interface ProfileData {
  id: string;
  slug: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  socialLinks: Array<{ platform: string; url: string; username?: string }>;
  ctaButton?: { label: string; url: string } | null;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    font: string;
  };
}

function safeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
};

function trackAction(
  profileId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  fetch("/api/profiles/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId, action, metadata }),
  }).catch(() => {});
}

export default function ProfilePageClient({
  profile,
  designThumbnail,
}: {
  profile: ProfileData;
  designThumbnail?: string | null;
}) {
  const { theme } = profile;
  const [saved, setSaved] = useState(false);

  const handleSaveContact = async () => {
    trackAction(profile.id, "save_contact");
    setSaved(true);
    window.location.href = `/api/profiles/${profile.id}/vcard`;
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEmail = () => {
    trackAction(profile.id, "email");
    window.location.href = `mailto:${profile.email}`;
  };

  const handleCall = () => {
    trackAction(profile.id, "call");
    window.location.href = `tel:${profile.phone}`;
  };

  const handleSocialClick = (platform: string, url: string) => {
    trackAction(profile.id, "social_click", { platform });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const websiteUrl = profile.website
    ? safeUrl(
        profile.website.startsWith("http")
          ? profile.website
          : `https://${profile.website}`,
      )
    : null;

  // Derive a subtle tinted hero bg from the primary color
  const heroBg = `linear-gradient(160deg, ${theme.primaryColor}22 0%, ${theme.backgroundColor} 55%)`;

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: `'${theme.font}', system-ui, sans-serif`,
      }}
    >
      {/* Hero section */}
      <div
        className="relative pb-24 pt-12 px-4"
        style={{ background: heroBg }}
      >
        {/* Decorative blob */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: theme.primaryColor, transform: "translate(30%, -30%)" }}
        />

        <div className="max-w-md mx-auto text-center">
          {/* Card design thumbnail — shown if design is linked */}
          {designThumbnail && (
            <div className="mb-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={designThumbnail}
                alt={`${profile.fullName}'s card`}
                className="w-72 rounded-2xl shadow-2xl ring-1 ring-black/10"
                style={{ aspectRatio: "1.75 / 1", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Avatar — shown when no card thumbnail */}
          {!designThumbnail && profile.photoUrl && (
            <div className="relative mx-auto w-28 h-28 mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="w-28 h-28 rounded-full object-cover shadow-xl ring-4"
                style={{ borderColor: theme.primaryColor, border: `4px solid ${theme.primaryColor}` }}
              />
            </div>
          )}

          {/* Initials avatar fallback */}
          {!designThumbnail && !profile.photoUrl && (
            <div
              className="mx-auto w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg mb-5"
              style={{ backgroundColor: theme.primaryColor, color: "#fff" }}
            >
              {(profile.firstName?.[0] ?? profile.fullName[0] ?? "?").toUpperCase()}
            </div>
          )}

          <h1 className="text-3xl font-bold tracking-tight">{profile.fullName}</h1>
          {(profile.title || profile.company) && (
            <p className="mt-2 text-base opacity-60">
              {profile.title}
              {profile.title && profile.company && " · "}
              {profile.company}
            </p>
          )}

          {/* Social icons */}
          {profile.socialLinks.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              {profile.socialLinks.map((link, idx) => {
                const IconComponent = SOCIAL_ICONS[link.platform] || Globe;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSocialClick(link.platform, link.url)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: theme.primaryColor + "18",
                      color: theme.primaryColor,
                    }}
                    title={link.platform}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating action card */}
      <div className="max-w-md mx-auto px-4 -mt-12 relative z-10">
        <div
          className="rounded-2xl shadow-xl p-5 space-y-3"
          style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.primaryColor}18` }}
        >
          {/* Save Contact — primary CTA */}
          <button
            onClick={handleSaveContact}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl font-semibold text-base transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            style={{
              backgroundColor: theme.primaryColor,
              color: "#ffffff",
            }}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Downloading contact…
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Save to Contacts
              </>
            )}
          </button>

          <div className="flex gap-3">
            {profile.email && (
              <button
                onClick={handleEmail}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm border transition-all hover:shadow-sm active:scale-[0.98]"
                style={{
                  borderColor: theme.primaryColor + "40",
                  color: theme.textColor,
                }}
              >
                <Mail className="w-4 h-4" style={{ color: theme.primaryColor }} />
                Email
              </button>
            )}
            {profile.phone && (
              <button
                onClick={handleCall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm border transition-all hover:shadow-sm active:scale-[0.98]"
                style={{
                  borderColor: theme.primaryColor + "40",
                  color: theme.textColor,
                }}
              >
                <Phone className="w-4 h-4" style={{ color: theme.primaryColor }} />
                Call
              </button>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAction(profile.id, "social_click", { platform: "website" })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm border transition-all hover:shadow-sm active:scale-[0.98]"
                style={{
                  borderColor: theme.primaryColor + "40",
                  color: theme.textColor,
                }}
              >
                <Globe className="w-4 h-4" style={{ color: theme.primaryColor }} />
                Web
              </a>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p
              className="text-sm leading-relaxed opacity-70 pt-1 whitespace-pre-line text-center"
            >
              {profile.bio}
            </p>
          )}

          {/* CTA Button */}
          {profile.ctaButton && safeUrl(profile.ctaButton.url) && (
            <a
              href={safeUrl(profile.ctaButton.url)!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              style={{
                backgroundColor: theme.primaryColor + "15",
                color: theme.primaryColor,
              }}
            >
              {profile.ctaButton.label}
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}
        </div>
      </div>

      {/* Footer — viral CTA */}
      <div className="max-w-md mx-auto px-4 pb-10 pt-4">
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: theme.primaryColor + "0a", border: `1px solid ${theme.primaryColor}18` }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: theme.textColor }}>CardCrafter</span>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: theme.textColor }}>
            Like this digital card?
          </p>
          <p className="text-xs mb-4" style={{ color: theme.textColor, opacity: 0.55 }}>
            Create your own free card in minutes — share your contact instantly, track who views it.
          </p>
          <Link
            href="/?utm_source=viral_card&utm_medium=profile_footer&utm_campaign=scan"
            onClick={() => trackAction(profile.id, "viral_click")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Layers className="w-4 h-4" />
            Create my free card →
          </Link>
          <p className="mt-3 text-[11px]" style={{ color: theme.textColor, opacity: 0.35 }}>
            Free · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
