"use client";

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
    return ['http:', 'https:'].includes(parsed.protocol) ? url : null;
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
}: {
  profile: ProfileData;
}) {
  const { theme } = profile;

  const handleSaveContact = async () => {
    trackAction(profile.id, "save_contact");
    // Download vCard
    window.location.href = `/api/profiles/${profile.id}/vcard`;
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

  return (
    <div
      className="min-h-screen flex items-start justify-center p-4 sm:p-8"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: `'${theme.font}', system-ui, sans-serif`,
      }}
    >
      <div className="w-full max-w-md mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {profile.photoUrl && (
            <div className="relative mx-auto w-28 h-28 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="w-28 h-28 rounded-full object-cover border-4 shadow-lg"
                style={{ borderColor: theme.primaryColor }}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold">{profile.fullName}</h1>
          {(profile.title || profile.company) && (
            <p className="mt-1 text-sm opacity-70">
              {profile.title}
              {profile.title && profile.company && " at "}
              {profile.company}
            </p>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleSaveContact}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            style={{
              backgroundColor: theme.primaryColor,
              color: "#ffffff",
            }}
          >
            <Download className="w-5 h-5" />
            Save Contact
          </button>

          {profile.email && (
            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-sm border transition-all hover:shadow-sm active:scale-[0.98]"
              style={{
                borderColor: theme.primaryColor + "40",
                color: theme.textColor,
              }}
            >
              <Mail className="w-5 h-5" style={{ color: theme.primaryColor }} />
              Send Email
              <span className="ml-auto text-xs opacity-50 truncate max-w-[180px]">
                {profile.email}
              </span>
            </button>
          )}

          {profile.phone && (
            <button
              onClick={handleCall}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-sm border transition-all hover:shadow-sm active:scale-[0.98]"
              style={{
                borderColor: theme.primaryColor + "40",
                color: theme.textColor,
              }}
            >
              <Phone
                className="w-5 h-5"
                style={{ color: theme.primaryColor }}
              />
              Call
              <span className="ml-auto text-xs opacity-50">
                {profile.phone}
              </span>
            </button>
          )}

          {(() => {
            const websiteUrl = safeUrl(profile.website.startsWith("http") ? profile.website : `https://${profile.website}`);
            return profile.website && websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-sm border transition-all hover:shadow-sm active:scale-[0.98]"
              style={{
                borderColor: theme.primaryColor + "40",
                color: theme.textColor,
              }}
              onClick={() =>
                trackAction(profile.id, "social_click", { platform: "website" })
              }
            >
              <Globe
                className="w-5 h-5"
                style={{ color: theme.primaryColor }}
              />
              Visit Website
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40" />
            </a>
            ) : null;
          })()}
        </div>

        {/* Social Links */}
        {profile.socialLinks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {profile.socialLinks.map((link, idx) => {
                const IconComponent = SOCIAL_ICONS[link.platform] || Globe;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSocialClick(link.platform, link.url)}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: theme.primaryColor + "15",
                      color: theme.primaryColor,
                    }}
                    title={link.platform}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="mb-8 text-center">
            <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {/* CTA Button */}
        {profile.ctaButton && safeUrl(profile.ctaButton.url) && (
          <div className="mb-8">
            <a
              href={safeUrl(profile.ctaButton.url)!}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-5 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              style={{
                backgroundColor: theme.primaryColor,
                color: "#ffffff",
              }}
            >
              {profile.ctaButton.label}
              <ExternalLink className="w-3.5 h-3.5 inline-block ml-2 -mt-0.5" />
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-xs opacity-30">
            Powered by{" "}
            <a href="/" className="underline hover:opacity-60">
              CardCrafter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
