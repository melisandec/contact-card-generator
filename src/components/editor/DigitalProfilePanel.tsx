"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useDesignStore } from "@/store/design-store";
import {
  useProfiles,
  useProfileAnalytics,
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
  Copy,
  Check,
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
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart2,
  Link,
  TrendingUp,
  Bell,
  BellOff,
  FileCode,
} from "lucide-react";
import { cardToProfile, profileToCard, type ProfileData } from "@/lib/fieldSync";

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
  const { addElement, currentDesignId, elements, setElements } = useDesignStore();

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
    vanityUrl: false,
  });

  const { analytics } = useProfileAnalytics(selectedProfileId ?? "");

  // Form state
  const [form, setForm] = useState({
    slug: "",
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
    notifyOnScan: false,
  });
  const [signatureCopied, setSignatureCopied] = useState(false);
  const [showSignaturePreview, setShowSignaturePreview] = useState(false);

  // Load selected profile into form
  useEffect(() => {
    if (selectedProfileId) {
      const p = profiles.find((pr) => pr.id === selectedProfileId);
      if (p) {
        setForm({
          slug: p.slug || "",
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
          notifyOnScan: (p as DigitalProfile & { notifyOnScan?: boolean }).notifyOnScan ?? false,
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
          slug: form.slug || undefined,
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

  const handleFillProfileFromCard = () => {
    const extracted = cardToProfile(elements);
    setForm((prev) => ({
      ...prev,
      fullName: extracted.fullName ?? prev.fullName,
      title: extracted.title ?? prev.title,
      company: extracted.company ?? prev.company,
      email: extracted.email ?? prev.email,
      phone: extracted.phone ?? prev.phone,
      website: extracted.website ?? prev.website,
      bio: extracted.bio ?? prev.bio,
    }));
  };

  const handleUpdateCardFromProfile = () => {
    const profileData: ProfileData = {
      fullName: form.fullName,
      title: form.title,
      company: form.company,
      email: form.email,
      phone: form.phone,
      website: form.website,
      bio: form.bio,
    };
    const updated = profileToCard(elements, profileData);
    setElements(updated);
  };

  const buildEmailSignatureHtml = (profileUrl: string, qrDataUrl?: string) => {
    const name = form.fullName || "Your Name";
    const primary = form.theme.primaryColor;
    return `<table cellpadding="0" cellspacing="0" style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#374151;border-top:3px solid ${primary};padding-top:12px;max-width:480px;">
  <tr>
    <td style="padding-right:16px;vertical-align:top;">${qrDataUrl ? `<img src="${qrDataUrl}" width="72" height="72" alt="QR" style="display:block;border-radius:8px;" />` : ""}</td>
    <td style="vertical-align:top;">
      <div style="font-size:15px;font-weight:700;color:#111827;margin-bottom:2px;">${name}</div>
      ${form.title || form.company ? `<div style="font-size:12px;color:#6b7280;margin-bottom:6px;">${[form.title, form.company].filter(Boolean).join(" · ")}</div>` : ""}
      ${form.email ? `<div style="margin-bottom:2px;"><a href="mailto:${form.email}" style="color:${primary};text-decoration:none;font-size:12px;">✉ ${form.email}</a></div>` : ""}
      ${form.phone ? `<div style="margin-bottom:2px;"><a href="tel:${form.phone}" style="color:${primary};text-decoration:none;font-size:12px;">📞 ${form.phone}</a></div>` : ""}
      ${form.website ? `<div style="margin-bottom:6px;"><a href="${form.website.startsWith("http") ? form.website : "https://" + form.website}" style="color:${primary};text-decoration:none;font-size:12px;">🌐 ${form.website}</a></div>` : ""}
      <div><a href="${profileUrl}" style="display:inline-block;margin-top:4px;padding:5px 12px;background:${primary};color:#fff;font-size:11px;font-weight:600;text-decoration:none;border-radius:6px;">View my card →</a></div>
    </td>
  </tr>
</table>`;
  };

  const handleCopySignature = async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://cardcrafter.app";
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
    const profileUrl = selectedProfile ? `${baseUrl}/p/${selectedProfile.slug}` : baseUrl;
    const html = buildEmailSignatureHtml(profileUrl, qrData?.dataUrl);
    await navigator.clipboard.writeText(html);
    setSignatureCopied(true);
    setTimeout(() => setSignatureCopied(false), 2500);
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
                slug: "",
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
                notifyOnScan: false,
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

      {/* Section: Vanity URL */}
      <SectionHeader
        title="Profile URL"
        expanded={expandedSections.vanityUrl}
        onToggle={() => toggleSection("vanityUrl")}
      />
      {expandedSections.vanityUrl && (
        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Custom slug
            </label>
            <div className="flex items-center mt-0.5 rounded-md border border-slate-200 overflow-hidden focus-within:ring-1 focus-within:ring-indigo-300 focus-within:border-indigo-300">
              <span className="px-2 py-1.5 text-[10px] text-slate-400 bg-slate-50 border-r border-slate-200 whitespace-nowrap">
                /p/
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                placeholder="your-name"
                className="flex-1 px-2 py-1.5 text-xs bg-white outline-none"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              3–40 lowercase letters, numbers, and hyphens. Save to apply.
            </p>
          </div>
          {selectedProfileId && (
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
              <Link className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-500 truncate flex-1">
                cardcrafter.app/p/{form.slug || "…"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Section: Analytics */}
      {selectedProfileId && (
        <>
          <SectionHeader
            title="Analytics"
            expanded={expandedSections.analytics}
            onToggle={() => toggleSection("analytics")}
          />
          {expandedSections.analytics && (
            <div className="space-y-3">
              {analytics ? (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
                      <p className="text-xl font-bold text-indigo-700">
                        {analytics.totalViews.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-indigo-500 mt-0.5">Total Views</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                      <p className="text-xl font-bold text-emerald-700">
                        {analytics.last7Days.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-500 mt-0.5">Last 7 Days</p>
                    </div>
                  </div>

                  {/* Action breakdown */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Actions
                    </p>
                    {[
                      { key: "save_contact", label: "Saved Contact", color: "bg-indigo-400" },
                      { key: "email", label: "Email Clicks", color: "bg-blue-400" },
                      { key: "call", label: "Call Clicks", color: "bg-green-400" },
                      { key: "social_click", label: "Social Clicks", color: "bg-purple-400" },
                    ].map(({ key, label, color }) => {
                      const count = analytics.actions[key as keyof typeof analytics.actions] ?? 0;
                      const max = Math.max(1, ...Object.values(analytics.actions));
                      const pct = Math.round((count / max) * 100);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 w-24 shrink-0">{label}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${color} transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-slate-600 w-6 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Daily sparkline */}
                  {analytics.dailyViews.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Daily Views (last 14 days)
                      </p>
                      <div className="flex items-end gap-0.5 h-12">
                        {analytics.dailyViews.slice(-14).map((d, i) => {
                          const maxCount = Math.max(1, ...analytics.dailyViews.map((x) => x.count));
                          const h = Math.max(2, Math.round((d.count / maxCount) * 44));
                          return (
                            <div
                              key={i}
                              title={`${d.date}: ${d.count} views`}
                              className="flex-1 bg-indigo-300 hover:bg-indigo-400 rounded-sm transition-colors cursor-default"
                              style={{ height: h }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">No analytics data yet</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Sync Buttons */}
      {(isCreating || selectedProfileId) && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Card ↔ Profile Sync
          </p>
          <button
            onClick={handleFillProfileFromCard}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            Fill profile from card
          </button>
          <button
            onClick={handleUpdateCardFromProfile}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            Update card from profile
          </button>
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

      {/* Section: Notifications */}
      {selectedProfileId && (
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {form.notifyOnScan ? (
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <div>
                <p className="text-xs font-medium text-slate-700">Scan Notifications</p>
                <p className="text-[10px] text-slate-400">Email me when someone views my card</p>
              </div>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, notifyOnScan: !f.notifyOnScan }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                form.notifyOnScan ? "bg-indigo-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  form.notifyOnScan ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          {form.notifyOnScan && (
            <p className="mt-1.5 text-[10px] text-slate-400 leading-relaxed">
              Rate-limited to 1 email per unique visitor per day. Requires{" "}
              <span className="font-mono text-indigo-500">RESEND_API_KEY</span> in your environment.
            </p>
          )}
        </div>
      )}

      {/* Section: Email Signature Generator */}
      {selectedProfileId && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs font-medium text-slate-700">Email Signature</p>
            </div>
            <button
              onClick={() => setShowSignaturePreview((v) => !v)}
              className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium"
            >
              {showSignaturePreview ? "Hide" : "Preview"}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Generate a professional HTML email signature with your QR code and profile link.
            {!qrData && " Generate a QR code above first to include it in the signature."}
          </p>
          {showSignaturePreview && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-white p-3">
                <div
                  dangerouslySetInnerHTML={{
                    __html: buildEmailSignatureHtml(
                      `${typeof window !== "undefined" ? window.location.origin : "https://cardcrafter.app"}/p/${
                        profiles.find((p) => p.id === selectedProfileId)?.slug ?? ""
                      }`,
                      qrData?.dataUrl,
                    ),
                  }}
                />
              </div>
              <div className="border-t border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-slate-400">
                  Live preview — paste in Gmail, Outlook, or Apple Mail signature settings
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleCopySignature}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            {signatureCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600">HTML copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Signature HTML
              </>
            )}
          </button>
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
