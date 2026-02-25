import { useEffect, useRef, useCallback, useState } from 'react';
import { useDesignStore } from '@/store/design-store';

const AUTO_SAVE_KEY = 'cardcrafter_auto_save_draft';
const AUTO_SAVE_INTERVAL = 30_000; // 30 seconds

export interface AutoSaveDraft {
  elements: unknown[];
  background: unknown;
  frontLayers?: unknown[];
  backLayers?: unknown[];
  frontBackground?: unknown;
  backBackground?: unknown;
  globalStyles?: unknown;
  guides?: unknown[];
  isDoubleSided: boolean;
  canvasWidth: number;
  canvasHeight: number;
  savedAt: string;
}

/**
 * Saves the current design state as a draft in localStorage.
 */
export function saveDraft(): string | null {
  if (typeof window === 'undefined') return null;

  const state = useDesignStore.getState();
  if (state.elements.length === 0 && state.frontLayers.length === 0) {
    return null; // Don't save empty designs
  }

  const draft: AutoSaveDraft = {
    elements: state.elements,
    background: state.background,
    frontLayers: state.frontLayers,
    backLayers: state.backLayers,
    frontBackground: state.frontBackground,
    backBackground: state.backBackground,
    globalStyles: state.globalStyles,
    guides: state.guides,
    isDoubleSided: state.isDoubleSided,
    canvasWidth: state.canvasWidth,
    canvasHeight: state.canvasHeight,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(draft));
    return draft.savedAt;
  } catch {
    return null;
  }
}

/**
 * Loads a draft from localStorage.
 */
export function loadDraft(): AutoSaveDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(AUTO_SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AutoSaveDraft;
  } catch {
    return null;
  }
}

/**
 * Clears the saved draft from localStorage.
 */
export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTO_SAVE_KEY);
}

/**
 * Checks if there is an auto-saved draft available.
 */
export function hasDraft(): boolean {
  return loadDraft() !== null;
}

/**
 * Hook that auto-saves the design at regular intervals.
 * Returns the last saved timestamp and a manual save trigger.
 */
export function useAutoSave() {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDirty = useDesignStore((s) => s.isDirty);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setDraftAvailable(true);
    }
  }, []);

  // Auto-save on interval when dirty
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const state = useDesignStore.getState();
      if (state.isDirty) {
        const savedAt = saveDraft();
        if (savedAt) {
          setLastSaved(savedAt);
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (!draft) return false;

    const store = useDesignStore.getState();
    store.loadFullDesign({
      frontLayers: (draft.frontLayers || draft.elements) as Parameters<typeof store.loadFullDesign>[0]['frontLayers'],
      backLayers: draft.backLayers as Parameters<typeof store.loadFullDesign>[0]['backLayers'],
      frontBackground: draft.frontBackground as Parameters<typeof store.loadFullDesign>[0]['frontBackground'],
      backBackground: draft.backBackground as Parameters<typeof store.loadFullDesign>[0]['backBackground'],
      globalStyles: draft.globalStyles as Parameters<typeof store.loadFullDesign>[0]['globalStyles'],
      guides: draft.guides as Parameters<typeof store.loadFullDesign>[0]['guides'],
      isDoubleSided: draft.isDoubleSided,
      width: draft.canvasWidth,
      height: draft.canvasHeight,
    });

    setDraftAvailable(false);
    clearDraft();
    return true;
  }, []);

  const dismissDraft = useCallback(() => {
    clearDraft();
    setDraftAvailable(false);
  }, []);

  const saveNow = useCallback(() => {
    const savedAt = saveDraft();
    if (savedAt) setLastSaved(savedAt);
  }, []);

  return {
    lastSaved,
    draftAvailable,
    restoreDraft,
    dismissDraft,
    saveNow,
    isDirty,
  };
}
