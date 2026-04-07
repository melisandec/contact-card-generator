export interface GlobalColor {
  id: string;
  value: string;
  label: string;
}

export interface GlobalStyles {
  colors: GlobalColor[];
  fonts: {
    heading: string;
    body: string;
  };
}

export interface StyleRefs {
  colorRef?: string;
  fontRef?: "heading" | "body";
  overrides?: {
    fontSize?: number;
    letterSpacing?: number;
  };
}

export interface QRStyle {
  dotShape: "square" | "rounded" | "circle" | "diamond";
  gradient?: {
    type: "linear" | "radial";
    colors: string[];
  };
  logoUrl?: string;
  logoSize?: number;
  backgroundColor?: string;
}

export interface Guide {
  id: string;
  orientation: "horizontal" | "vertical";
  position: number;
}

export interface DesignElement {
  id: string;
  type: "text" | "image" | "shape" | "qrcode" | "icon" | "group";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;

  // Style references (global styles)
  styleRefs?: StyleRefs;

  // Text properties
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: "left" | "center" | "right";
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;

  // Shape properties
  shapeType?: "rectangle" | "circle" | "triangle" | "line" | "star" | "polygon";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  sides?: number;

  // Image properties
  src?: string;
  objectFit?: "cover" | "contain" | "fill";

  // Shadow
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  // QR Code
  qrData?: string;
  qrForeground?: string;
  qrBackground?: string;
  qrStyle?: QRStyle;
  // 'url' = plain URL, 'profile' = dynamic /p/{slug} link, 'vcard' = contact data embedded offline
  qrType?: 'url' | 'profile' | 'vcard';
  qrLinkedProfileId?: string;

  // Icon
  iconName?: string;
  iconSize?: number;

  // Group (nested elements)
  children?: DesignElement[];

  // Text on path
  pathRef?: string;
  pathOffset?: number;

  // Smart text resizing
  autoShrink?: boolean;

  // Labeled field type for card-profile sync
  fieldType?: 'name' | 'title' | 'company' | 'email' | 'phone' | 'website' | 'location' | 'description' | 'custom';
}

export interface CanvasBackground {
  type: "solid" | "gradient" | "image" | "pattern";
  color?: string;
  gradient?: {
    type: "linear" | "radial";
    angle?: number;
    stops: Array<{ color: string; position: number }>;
  };
  imageUrl?: string;
  patternType?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  elements: DesignElement[];
  background: CanvasBackground;
  width: number;
  height: number;
  // Double-sided support
  frontLayers?: DesignElement[];
  backLayers?: DesignElement[];
  backBackground?: CanvasBackground;
  isDoubleSided?: boolean;
}

export interface Design {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  data: {
    elements: DesignElement[];
    background: CanvasBackground;
  };
  frontLayers?: DesignElement[];
  backLayers?: DesignElement[];
  globalStyles?: GlobalStyles;
  guides?: Guide[];
  isDoubleSided: boolean;
  width: number;
  height: number;
  templateId?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  folderId?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { designs: number };
}

export interface DesignCollaborator {
  id: string;
  designId: string;
  userId: string;
  role: "viewer" | "editor";
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

export interface DesignVersion {
  id: string;
  designId: string;
  version: number;
  name?: string;
  data: unknown;
  frontLayers?: unknown;
  backLayers?: unknown;
  isDoubleSided: boolean;
  width: number;
  height: number;
  createdAt: string;
  createdBy?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportOptions {
  format: "png" | "jpg" | "pdf" | "svg";
  quality: number;
  scale: number;
  width?: number;
  height?: number;
}

export type SidebarTab =
  | "templates"
  | "elements"
  | "uploads"
  | "text"
  | "background"
  | "layers"
  | "profile";

export interface ColorStop {
  color: string;
  position: number;
}

// QR Contact Types

export interface ContactPhone {
  type: "work" | "home" | "mobile" | "fax" | "pager" | "other";
  number: string;
  preferred?: boolean;
}

export interface ContactEmail {
  type: "work" | "home" | "personal" | "other";
  address: string;
  preferred?: boolean;
}

export interface ContactAddress {
  type: "work" | "home" | "other";
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ContactWebsite {
  type: "work" | "personal" | "portfolio" | "other";
  url: string;
}

export interface ContactSocialMedia {
  platform:
    | "linkedin"
    | "twitter"
    | "instagram"
    | "facebook"
    | "github"
    | "other";
  username: string;
  url?: string;
}

export interface ContactCustomField {
  label: string;
  value: string;
}

export interface ContactData {
  fullName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  prefix?: string;
  suffix?: string;
  nickname?: string;
  title?: string;
  company?: string;
  department?: string;
  role?: string;
  phones?: ContactPhone[];
  emails?: ContactEmail[];
  addresses?: ContactAddress[];
  websites?: ContactWebsite[];
  socialMedia?: ContactSocialMedia[];
  birthday?: string;
  notes?: string;
  photo?: string;
  logo?: string;
  customFields?: ContactCustomField[];
}

export interface QRContactOptions {
  format: "vcard" | "mecard";
  encoding?: string;
  version?: string;
  errorCorrection?: "L" | "M" | "Q" | "H";
  margin?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  size?: number;
}

// Digital Profile Types

export interface ProfileSocialLink {
  platform:
    | "linkedin"
    | "twitter"
    | "instagram"
    | "facebook"
    | "github"
    | "youtube"
    | "tiktok"
    | "dribbble"
    | "behance"
    | "other";
  url: string;
  username?: string;
}

export interface ProfileCTA {
  label: string;
  url: string;
}

export interface ProfileTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  font: string;
}

export interface DigitalProfile {
  id: string;
  slug: string;
  userId: string;
  designId?: string | null;

  fullName: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  bio?: string;
  photoUrl?: string;

  email?: string;
  phone?: string;
  website?: string;

  socialLinks: ProfileSocialLink[];
  ctaButton?: ProfileCTA | null;
  theme: ProfileTheme;

  isPublic: boolean;
  notifyOnScan?: boolean;
  contactData?: ContactData;

  createdAt: string;
  updatedAt: string;
}

export interface ProfileView {
  id: string;
  profileId: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ProfileAnalytics {
  totalViews: number;
  last7Days: number;
  actions: {
    view: number;
    save_contact: number;
    email: number;
    call: number;
    social_click: number;
  };
  dailyViews: Array<{ date: string; count: number }>;
}
