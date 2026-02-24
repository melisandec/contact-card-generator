/**
 * @jest-environment jsdom
 */

import {
  getGuestDesigns,
  getGuestDesign,
  saveGuestDesign,
  deleteGuestDesign,
  duplicateGuestDesign,
  searchGuestDesigns,
} from '@/lib/guest-storage';

const STORAGE_KEY = 'cardcrafter_guest_designs';

describe('Guest Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getGuestDesigns', () => {
    it('returns empty array when no designs exist', () => {
      expect(getGuestDesigns()).toEqual([]);
    });

    it('returns designs sorted by updatedAt descending', () => {
      const designs = [
        {
          id: '1',
          name: 'Old',
          data: { elements: [], background: { type: 'solid' as const, color: '#fff' } },
          isDoubleSided: false,
          width: 1050,
          height: 600,
          tags: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'New',
          data: { elements: [], background: { type: 'solid' as const, color: '#fff' } },
          isDoubleSided: false,
          width: 1050,
          height: 600,
          tags: [],
          createdAt: '2025-02-01T00:00:00Z',
          updatedAt: '2025-02-01T00:00:00Z',
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));

      const result = getGuestDesigns();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('New');
      expect(result[1].name).toBe('Old');
    });
  });

  describe('saveGuestDesign', () => {
    it('creates a new design with auto-generated id', () => {
      const design = saveGuestDesign({
        name: 'Test Card',
        data: { elements: [], background: { type: 'solid', color: '#ffffff' } },
        isDoubleSided: false,
        width: 1050,
        height: 600,
        tags: ['test'],
      });

      expect(design.id).toBeDefined();
      expect(design.name).toBe('Test Card');
      expect(design.tags).toEqual(['test']);
      expect(design.createdAt).toBeDefined();
      expect(design.updatedAt).toBeDefined();

      const stored = getGuestDesigns();
      expect(stored).toHaveLength(1);
    });

    it('updates an existing design', () => {
      const design = saveGuestDesign({
        name: 'Original',
        data: { elements: [], background: { type: 'solid', color: '#ffffff' } },
        isDoubleSided: false,
        width: 1050,
        height: 600,
        tags: [],
      });

      const updated = saveGuestDesign({
        id: design.id,
        name: 'Updated',
        data: { elements: [], background: { type: 'solid', color: '#000000' } },
        isDoubleSided: false,
        width: 1050,
        height: 600,
        tags: ['updated'],
      });

      expect(updated.name).toBe('Updated');
      expect(updated.tags).toEqual(['updated']);

      const stored = getGuestDesigns();
      expect(stored).toHaveLength(1);
    });
  });

  describe('getGuestDesign', () => {
    it('returns a specific design by id', () => {
      const saved = saveGuestDesign({
        name: 'Find Me',
        data: { elements: [], background: { type: 'solid', color: '#fff' } },
        isDoubleSided: false,
        width: 1050,
        height: 600,
        tags: [],
      });

      const found = getGuestDesign(saved.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Find Me');
    });

    it('returns undefined for non-existent id', () => {
      expect(getGuestDesign('non-existent')).toBeUndefined();
    });
  });

  describe('deleteGuestDesign', () => {
    it('removes a design', () => {
      const design = saveGuestDesign({
        name: 'Delete Me',
        data: { elements: [], background: { type: 'solid', color: '#fff' } },
        isDoubleSided: false,
        width: 1050,
        height: 600,
        tags: [],
      });

      expect(deleteGuestDesign(design.id)).toBe(true);
      expect(getGuestDesigns()).toHaveLength(0);
    });

    it('returns false for non-existent id', () => {
      expect(deleteGuestDesign('non-existent')).toBe(false);
    });
  });

  describe('duplicateGuestDesign', () => {
    it('creates a copy with "Copy of" prefix', () => {
      const original = saveGuestDesign({
        name: 'My Card',
        data: { elements: [], background: { type: 'solid', color: '#fff' } },
        isDoubleSided: false,
        width: 1050,
        height: 600,
        tags: ['test'],
      });

      const copy = duplicateGuestDesign(original.id);
      expect(copy).not.toBeNull();
      expect(copy?.name).toBe('Copy of My Card');
      expect(copy?.id).not.toBe(original.id);
      expect(copy?.tags).toEqual(['test']);

      expect(getGuestDesigns()).toHaveLength(2);
    });

    it('returns null for non-existent id', () => {
      expect(duplicateGuestDesign('non-existent')).toBeNull();
    });
  });

  describe('searchGuestDesigns', () => {
    beforeEach(() => {
      saveGuestDesign({
        name: 'Business Card',
        description: 'Professional card',
        data: { elements: [], background: { type: 'solid', color: '#fff' } },
        isDoubleSided: false,
        width: 1050,
        height: 600,
        tags: ['business', 'professional'],
      });
      saveGuestDesign({
        name: 'Personal Card',
        description: 'Fun design',
        data: { elements: [], background: { type: 'solid', color: '#fff' } },
        isDoubleSided: false,
        width: 1050,
        height: 600,
        tags: ['personal', 'fun'],
      });
    });

    it('returns all designs for empty query', () => {
      expect(searchGuestDesigns('')).toHaveLength(2);
    });

    it('filters by name', () => {
      const results = searchGuestDesigns('Business');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Business Card');
    });

    it('filters by description', () => {
      const results = searchGuestDesigns('Fun');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Personal Card');
    });

    it('filters by tag', () => {
      const results = searchGuestDesigns('professional');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Business Card');
    });

    it('is case insensitive', () => {
      expect(searchGuestDesigns('business')).toHaveLength(1);
      expect(searchGuestDesigns('BUSINESS')).toHaveLength(1);
    });
  });
});
