import { saveDraft, loadDraft, clearDraft, hasDraft } from '@/hooks/useAutoSave';
import { useDesignStore } from '@/store/design-store';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const defaultBackground = { type: 'solid' as const, color: '#ffffff' };

describe('Auto-Save Drafts', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useDesignStore.setState({
      elements: [],
      background: defaultBackground,
      frontLayers: [],
      backLayers: [],
      frontBackground: defaultBackground,
      backBackground: defaultBackground,
      isDoubleSided: false,
      canvasWidth: 1050,
      canvasHeight: 600,
      isDirty: false,
    });
  });

  describe('saveDraft', () => {
    it('saves current design state to localStorage', () => {
      useDesignStore.setState({
        elements: [
          {
            id: 'el1',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 40,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 0,
            content: 'Test',
          },
        ],
        isDirty: true,
      });

      const savedAt = saveDraft();
      expect(savedAt).toBeTruthy();
      expect(typeof savedAt).toBe('string');
    });

    it('returns null for empty designs', () => {
      useDesignStore.setState({ elements: [], frontLayers: [] });
      const result = saveDraft();
      expect(result).toBeNull();
    });
  });

  describe('loadDraft', () => {
    it('returns null when no draft exists', () => {
      expect(loadDraft()).toBeNull();
    });

    it('returns saved draft data', () => {
      useDesignStore.setState({
        elements: [
          {
            id: 'el1',
            type: 'text',
            x: 10,
            y: 20,
            width: 200,
            height: 40,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 0,
            content: 'Hello',
          },
        ],
        canvasWidth: 800,
        canvasHeight: 400,
      });
      saveDraft();

      const draft = loadDraft();
      expect(draft).toBeTruthy();
      expect(draft!.canvasWidth).toBe(800);
      expect(draft!.canvasHeight).toBe(400);
      expect(draft!.savedAt).toBeTruthy();
    });
  });

  describe('clearDraft', () => {
    it('removes draft from localStorage', () => {
      useDesignStore.setState({
        elements: [
          {
            id: 'el1',
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 40,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 0,
          },
        ],
      });
      saveDraft();
      expect(loadDraft()).toBeTruthy();

      clearDraft();
      expect(loadDraft()).toBeNull();
    });
  });

  describe('hasDraft', () => {
    it('returns false when no draft exists', () => {
      expect(hasDraft()).toBe(false);
    });

    it('returns true when draft exists', () => {
      useDesignStore.setState({
        elements: [
          {
            id: 'el1',
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 40,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 0,
          },
        ],
      });
      saveDraft();
      expect(hasDraft()).toBe(true);
    });
  });
});
