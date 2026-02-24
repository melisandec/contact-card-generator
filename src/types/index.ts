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
