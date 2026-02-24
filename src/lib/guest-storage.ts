import { Design, DesignElement, CanvasBackground } from '@/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'cardcrafter_guest_designs';

export interface GuestDesign {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  data: {
    elements: DesignElement[];
    background: CanvasBackground;
  };
  frontLayers?: DesignElement[];
  backLayers?: DesignElement[];
  isDoubleSided: boolean;
  width: number;
  height: number;
  templateId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

function getDesigns(): GuestDesign[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDesigns(designs: GuestDesign[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

export function getGuestDesigns(): GuestDesign[] {
  return getDesigns().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getGuestDesign(id: string): GuestDesign | undefined {
  return getDesigns().find((d) => d.id === id);
}

export function saveGuestDesign(
  designData: Omit<GuestDesign, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): GuestDesign {
  const designs = getDesigns();
  const now = new Date().toISOString();

  if (designData.id) {
    const index = designs.findIndex((d) => d.id === designData.id);
    if (index !== -1) {
      designs[index] = { ...designs[index], ...designData, updatedAt: now };
      saveDesigns(designs);
      return designs[index];
    }
  }

  const newDesign: GuestDesign = {
    ...designData,
    id: designData.id || generateId(),
    createdAt: now,
    updatedAt: now,
    tags: designData.tags || [],
    isDoubleSided: designData.isDoubleSided || false,
  };
  designs.push(newDesign);
  saveDesigns(designs);
  return newDesign;
}

export function deleteGuestDesign(id: string): boolean {
  const designs = getDesigns();
  const filtered = designs.filter((d) => d.id !== id);
  if (filtered.length === designs.length) return false;
  saveDesigns(filtered);
  return true;
}

export function duplicateGuestDesign(id: string): GuestDesign | null {
  const design = getGuestDesign(id);
  if (!design) return null;

  return saveGuestDesign({
    name: `Copy of ${design.name}`,
    description: design.description,
    data: JSON.parse(JSON.stringify(design.data)),
    frontLayers: design.frontLayers ? JSON.parse(JSON.stringify(design.frontLayers)) : undefined,
    backLayers: design.backLayers ? JSON.parse(JSON.stringify(design.backLayers)) : undefined,
    isDoubleSided: design.isDoubleSided,
    width: design.width,
    height: design.height,
    templateId: design.templateId,
    tags: [...(design.tags || [])],
    thumbnail: design.thumbnail,
  });
}

export function searchGuestDesigns(query: string): GuestDesign[] {
  const designs = getGuestDesigns();
  if (!query) return designs;
  const lower = query.toLowerCase();
  return designs.filter(
    (d) =>
      d.name.toLowerCase().includes(lower) ||
      d.description?.toLowerCase().includes(lower) ||
      d.tags?.some((t) => t.toLowerCase().includes(lower))
  );
}
