export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qrcode' | 'icon';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;

  // Text properties
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;

  // Shape properties
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line' | 'star';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;

  // Image properties
  src?: string;
  objectFit?: 'cover' | 'contain' | 'fill';

  // Shadow
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  // QR Code
  qrData?: string;
  qrForeground?: string;
  qrBackground?: string;

  // Icon
  iconName?: string;
  iconSize?: number;
}

export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
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
}

export interface Design {
  id: string;
  name: string;
  thumbnail?: string;
  data: {
    elements: DesignElement[];
    background: CanvasBackground;
  };
  width: number;
  height: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
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
  format: 'png' | 'jpg' | 'pdf' | 'svg';
  quality: number;
  scale: number;
  width?: number;
  height?: number;
}

export type SidebarTab = 'templates' | 'elements' | 'uploads' | 'text' | 'background' | 'layers';

export interface ColorStop {
  color: string;
  position: number;
}

// QR Contact Types

export interface ContactPhone {
  type: 'work' | 'home' | 'mobile' | 'fax' | 'pager' | 'other';
  number: string;
  preferred?: boolean;
}

export interface ContactEmail {
  type: 'work' | 'home' | 'personal' | 'other';
  address: string;
  preferred?: boolean;
}

export interface ContactAddress {
  type: 'work' | 'home' | 'other';
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ContactWebsite {
  type: 'work' | 'personal' | 'portfolio' | 'other';
  url: string;
}

export interface ContactSocialMedia {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'other';
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
  format: 'vcard' | 'mecard';
  encoding?: string;
  version?: string;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  size?: number;
}
