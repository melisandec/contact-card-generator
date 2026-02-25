"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { useDesignStore } from "@/store/design-store";
import {
  useProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileQR,
} from "@/hooks/useProfile";
import type {
  ProfileSocialLink,
  ProfileTheme,
  ProfileCTA,
  DigitalProfile,
} from "@/types";
import {
  User,
  Plus,
  Trash2,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Globe,
  Mail,
  Phone as PhoneIcon,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Facebook,
  Youtube,
  Download,
  Eye,
  Loader2,
  LogIn,
  AlertCircle,
} from "lucide-react";

const SOCIAL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "twitter", label: "Twitter / X", icon: Twitter },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "github", label: "GitHub", icon: Github },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "youtube", label: "YouTube", icon: Youtube },
] as const;

const DEFAULT_THEME: ProfileTheme = {
  primaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  font: "Inter",
};

const FONTS = [
  "Inter",
  "Playfair Display",
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
];

export function DigitalProfilePanel() {
  const { data: session, status: authStatus } = useSession();
  const { profiles, mutate } = useProfiles();
  const { addElement, currentDesignId } = useDesignStore();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{
    dataUrl: string;
    profileUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    info: true,
    contact: true,
    social: false,
    cta: false,
    theme: false,
    analytics: false,
  });

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    title: "",
    company: "",
    bio: "",
    photoUrl: "",
    email: "",
    phone: "",
    website: "",
    socialLinks: [] as ProfileSocialLink[],
    ctaButton: null as ProfileCTA | null,
    theme: { ...DEFAULT_THEME },
    isPublic: true,
  });

  // Load selected profile into form
  useEffect(() => {
    if (selectedProfileId) {
      const p = profiles.find((pr) => pr.id === selectedProfileId);
      if (p) {
        setForm({
          fullName: p.fullName,
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          title: p.title || "",
          company: p.company || "",
          bio: p.bio || "",
          photoUrl: p.photoUrl || "",
          email: p.email || "",
          phone: p.phone || "",
          website: p.website || "",
          socialLinks: p.socialLinks || [],
          ctaButton: p.ctaButton || null,
          theme: p.theme || { ...DEFAULT_THEME },
          isPublic: p.isPublic,
        });
      }
    }
  }, [selectedProfileId, profiles]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (selectedProfileId) {
        await updateProfile(selectedProfileId, {
          ...form,
          designId: currentDesignId,
        } as Partial<DigitalProfile>);
      } else {
        const created = await createProfile({
          ...form,
          designId: currentDesignId,
        } as Partial<DigitalProfile>);
        setSelectedProfileId(created.id);
        setIsCreating(false);
      }
      mutate();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save profile";
      setError(message);
      console.error("Save profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this digital profile?")) return;
    try {
      await deleteProfile(id);
      if (selectedProfileId === id) {
        setSelectedProfileId(null);
        setQrData(null);
      }
      mutate();
    } catch (err) {
      console.error("Delete profile error:", err);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedProfileId) return;
    try {
      const data = await getProfileQR(selectedProfileId, 300);
      setQrData(data);
    } catch (err) {
      console.error("QR generation error:", err);
    }
  };

  const handleCopyUrl = () => {
    if (qrData?.profileUrl) {
      navigator.clipboard.writeText(qrData.profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddQRToCanvas = () => {
    if (!qrData?.dataUrl) return;
    addElement({
      type: "image",
      x: 50,
      y: 50,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      src: qrData.dataUrl,
      objectFit: "contain",
    });
  };

  const addSocialLink = () => {
    setForm((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "linkedin", url: "", username: "" },
      ],
    }));
  };

  const removeSocialLink = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
    }));
  };

  const updateSocialLink = (
    idx: number,
    updates: Partial<ProfileSocialLink>,
  ) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s, i) =>
        i === idx ? { ...s, ...updates } : s,
      ),
    }));
  };

  // If not authenticated, show sign-in prompt
  if (authStatus !== "loading" && !session) {
    return (
      <div className="p-3">
        <div className="text-center py-8">
          <LogIn className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600 mb-1">
            Sign in required
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Digital profiles are saved to your account. Sign in to create and
            manage them.
          </p>
          <button
            onClick={() => signIn()}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // If not creating/editing, show profile list
  if (!isCreating && !selectedProfileId) {
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-500">Your digital profiles</p>
          <button
            onClick={() => {
              setIsCreating(true);
              setForm({
                fullName: "",
                firstName: "",
                lastName: "",
                title: "",
                company: "",
                bio: "",
                photoUrl: "",
                email: "",
                phone: "",
                website: "",
                socialLinks: [],
                ctaButton: null,
                theme: { ...DEFAULT_THEME },
                isPublic: true,
              });
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Profile
          </button>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-3">
              No digital profiles yet
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Profile
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition-colors cursor-pointer group"
                onClick={() => setSelectedProfileId(p.id)}
              >
                <div className="flex items-center gap-2">
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photoUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {p.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      /p/{p.slug}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Edit / Create form
  return (
    <div className="p-3 space-y-3">
      {/* Back button */}
      <button
        onClick={() => {
          setSelectedProfileId(null);
          setIsCreating(false);
          setQrData(null);
        }}
        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
      >
        ← Back to profiles
      </button>

      {/* Section: Basic Info */}
      <SectionHeader
        title="Basic Info"
        expanded={expandedSections.info}
        onToggle={() => toggleSection("info")}
      />
      {expandedSections.info && (
        <div className="space-y-2">
          <Input
            label="Full Name *"
            value={form.fullName}
            onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
            />
          </div>
          <Input
            label="Job Title"
            value={form.title}
            onChange={(v) => setForm((f) => ({ ...f, title: v }))}
          />
          <Input
            label="Company"
            value={form.company}
            onChange={(v) => setForm((f) => ({ ...f, company: v }))}
          />
          <Input
            label="Photo URL"
            value={form.photoUrl}
            onChange={(v) => setForm((f) => ({ ...f, photoUrl: v }))}
            placeholder="https://..."
          />
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 resize-none"
              rows={3}
              placeholder="A short bio about yourself..."
            />
          </div>
        </div>
      )}

      {/* Section: Contact */}
      <SectionHeader
        title="Contact Info"
        expanded={expandedSections.contact}
        onToggle={() => toggleSection("contact")}
      />
      {expandedSections.contact && (
        <div className="space-y-2">
          <Input
            label="Email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            placeholder="jane@example.com"
            icon={<Mail className="w-3 h-3" />}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            placeholder="+1 (555) 000-0000"
            icon={<PhoneIcon className="w-3 h-3" />}
          />
          <Input
            label="Website"
            value={form.website}
            onChange={(v) => setForm((f) => ({ ...f, website: v }))}
            placeholder="https://example.com"
            icon={<Globe className="w-3 h-3" />}
          />
        </div>
      )}

      {/* Section: Social Links */}
      <SectionHeader
        title="Social Links"
        expanded={expandedSections.social}
        onToggle={() => toggleSection("social")}
      />
      {expandedSections.social && (
        <div className="space-y-2">
          {form.socialLinks.map((link, idx) => (
            <div
              key={idx}
              className="flex items-start gap-1.5 p-2 bg-slate-50 rounded-lg"
            >
              <select
                value={link.platform}
                onChange={(e) =>
                  updateSocialLink(idx, {
                    platform: e.target.value as ProfileSocialLink["platform"],
                  })
                }
                className="text-[10px] px-1.5 py-1 border border-slate-200 rounded bg-white"
              >
                {SOCIAL_PLATFORMS.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.label}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateSocialLink(idx, { url: e.target.value })}
                placeholder="https://..."
                className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-300"
              />
              <button
                onClick={() => removeSocialLink(idx)}
                className="p-1 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={addSocialLink}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Plus className="w-3 h-3" />
            Add Social Link
          </button>
        </div>
      )}

      {/* Section: CTA Button */}
      <SectionHeader
        title="Call to Action"
        expanded={expandedSections.cta}
        onToggle={() => toggleSection("cta")}
      />
      {expandedSections.cta && (
        <div className="space-y-2">
          {form.ctaButton ? (
            <>
              <Input
                label="Button Label"
                value={form.ctaButton.label}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    ctaButton: { ...f.ctaButton!, label: v },
                  }))
                }
                placeholder="Book a Meeting"
              />
              <Input
                label="Button URL"
                value={form.ctaButton.url}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    ctaButton: { ...f.ctaButton!, url: v },
                  }))
                }
                placeholder="https://calendly.com/..."
              />
              <button
                onClick={() => setForm((f) => ({ ...f, ctaButton: null }))}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Remove CTA Button
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                setForm((f) => ({ ...f, ctaButton: { label: "", url: "" } }))
              }
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-3 h-3" />
              Add CTA Button
            </button>
          )}
        </div>
      )}

      {/* Section: Theme */}
      <SectionHeader
        title="Page Theme"
        expanded={expandedSections.theme}
        onToggle={() => toggleSection("theme")}
      />
      {expandedSections.theme && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-slate-500 w-20">
              Primary
            </label>
            <input
              type="color"
              value={form.theme.primaryColor}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  theme: { ...f.theme, primaryColor: e.target.value },
                }))
              }
              className="w-6 h-6 rounded cursor-pointer border-0"
            />
            <span className="text-[10px] text-slate-400">
              {form.theme.primaryColor}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-slate-500 w-20">
              Background
            </label>
            <input
              type="color"
              value={form.theme.backgroundColor}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  theme: { ...f.theme, backgroundColor: e.target.value },
                }))
              }
              className="w-6 h-6 rounded cursor-pointer border-0"
            />
            <span className="text-[10px] text-slate-400">
              {form.theme.backgroundColor}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-slate-500 w-20">
              Text
            </label>
            <input
              type="color"
              value={form.theme.textColor}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  theme: { ...f.theme, textColor: e.target.value },
                }))
              }
              className="w-6 h-6 rounded cursor-pointer border-0"
            />
            <span className="text-[10px] text-slate-400">
              {form.theme.textColor}
            </span>
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Font
            </label>
            <select
              value={form.theme.font}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  theme: { ...f.theme, font: e.target.value },
                }))
              }
              className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md"
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-red-700">{error}</p>
            {error.toLowerCase().includes("unauthorized") && (
              <button
                onClick={() => signIn()}
                className="mt-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-700 underline"
              >
                Sign in to continue
              </button>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <span className="text-xs">×</span>
          </button>
        </div>
      )}

      {/* Save & Generate */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <button
          onClick={handleSave}
          disabled={saving || !form.fullName.trim()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {selectedProfileId ? "Update Profile" : "Create Profile"}
        </button>

        {selectedProfileId && (
          <button
            onClick={handleGenerateQR}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            Generate QR Code
          </button>
        )}
      </div>

      {/* QR Code Result */}
      {qrData && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-3">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrData.dataUrl}
              alt="Profile QR Code"
              className="w-40 h-40 rounded-lg border border-slate-200 bg-white p-2"
            />
          </div>

          <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-600 truncate flex-1">
              {qrData.profileUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddQRToCanvas}
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add to Canvas
            </button>
            <a
              href={qrData.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-3 h-3" />
              Preview
            </a>
          </div>

          <a
            href={qrData.dataUrl}
            download="profile-qr.png"
            className="flex items-center justify-center gap-1 w-full px-2 py-1.5 text-[10px] font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download QR Image
          </a>
        </div>
      )}

      {/* Phone preview */}
      {selectedProfileId && form.fullName && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Preview
          </p>
          <div
            className="border-2 border-slate-300 rounded-2xl overflow-hidden bg-white"
            style={{ maxHeight: 320 }}
          >
            <div className="h-3 bg-slate-200 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-300 rounded-full" />
            </div>
            <div
              className="p-4 text-center overflow-y-auto"
              style={{
                backgroundColor: form.theme.backgroundColor,
                color: form.theme.textColor,
                fontFamily: `'${form.theme.font}', sans-serif`,
                maxHeight: 300,
              }}
            >
              {form.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.photoUrl}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2"
                  style={{ borderColor: form.theme.primaryColor }}
                />
              )}
              <p className="text-sm font-bold">{form.fullName}</p>
              {(form.title || form.company) && (
                <p className="text-[10px] opacity-60">
                  {form.title}
                  {form.title && form.company ? " at " : ""}
                  {form.company}
                </p>
              )}
              <div className="mt-3 space-y-1">
                <div
                  className="w-full py-1.5 rounded-md text-[10px] font-medium text-white"
                  style={{ backgroundColor: form.theme.primaryColor }}
                >
                  Save Contact
                </div>
                {form.email && (
                  <div
                    className="w-full py-1.5 rounded-md text-[10px] border"
                    style={{ borderColor: form.theme.primaryColor + "40" }}
                  >
                    ✉️ Email
                  </div>
                )}
                {form.phone && (
                  <div
                    className="w-full py-1.5 rounded-md text-[10px] border"
                    style={{ borderColor: form.theme.primaryColor + "40" }}
                  >
                    📞 Call
                  </div>
                )}
              </div>
              {form.socialLinks.length > 0 && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  {form.socialLinks.map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full"
                      style={{
                        backgroundColor: form.theme.primaryColor + "20",
                      }}
                    />
                  ))}
                </div>
              )}
              {form.bio && (
                <p className="mt-2 text-[9px] opacity-60 line-clamp-2">
                  {form.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Section header component
function SectionHeader({
  title,
  expanded,
  onToggle,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full text-left text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors py-1"
    >
      {expanded ? (
        <ChevronDown className="w-3.5 h-3.5" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5" />
      )}
      {title}
    </button>
  );
}

// Reusable input component
function Input({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative mt-0.5">
        {icon && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 ${
            icon ? "pl-7" : ""
          }`}
        />
      </div>
    </div>
  );
}
