export interface CardPreset {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
  category: 'business' | 'social' | 'custom';
}

/**
 * All measurements stored as pixels at 300 DPI.
 * 1 inch = 300px at 300 DPI
 * 1 mm = 300/25.4 ≈ 11.81px at 300 DPI
 */
const PX_PER_INCH = 300;
const PX_PER_MM = PX_PER_INCH / 25.4;

export function mmToPx(mm: number): number {
  return Math.round(mm * PX_PER_MM);
}

export function inToPx(inches: number): number {
  return Math.round(inches * PX_PER_INCH);
}

export function pxToMm(px: number): number {
  return Math.round((px / PX_PER_MM) * 10) / 10;
}

export function pxToIn(px: number): number {
  return Math.round((px / PX_PER_INCH) * 100) / 100;
}

export const cardPresets: CardPreset[] = [
  {
    id: 'us-business',
    name: 'US Business Card',
    description: '3.5″ × 2″ (1050 × 600px)',
    width: inToPx(3.5),
    height: inToPx(2),
    unit: 'in',
    category: 'business',
  },
  {
    id: 'european-business',
    name: 'European Business Card',
    description: '85mm × 55mm (1004 × 650px)',
    width: mmToPx(85),
    height: mmToPx(55),
    unit: 'mm',
    category: 'business',
  },
  {
    id: 'japanese-business',
    name: 'Japanese Business Card',
    description: '91mm × 55mm (1075 × 650px)',
    width: mmToPx(91),
    height: mmToPx(55),
    unit: 'mm',
    category: 'business',
  },
  {
    id: 'square',
    name: 'Square Card',
    description: '2.5″ × 2.5″ (750 × 750px)',
    width: inToPx(2.5),
    height: inToPx(2.5),
    unit: 'in',
    category: 'business',
  },
  {
    id: 'instagram',
    name: 'Instagram Post',
    description: '1080 × 1080px',
    width: 1080,
    height: 1080,
    unit: 'px',
    category: 'social',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    description: '1080 × 1920px',
    width: 1080,
    height: 1920,
    unit: 'px',
    category: 'social',
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    description: '1584 × 396px',
    width: 1584,
    height: 396,
    unit: 'px',
    category: 'social',
  },
  {
    id: 'a7',
    name: 'A7 Card',
    description: '74mm × 105mm (874 × 1240px)',
    width: mmToPx(74),
    height: mmToPx(105),
    unit: 'mm',
    category: 'business',
  },
];
