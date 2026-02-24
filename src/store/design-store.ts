import { create } from 'zustand';
import { DesignElement, CanvasBackground } from '@/types';
import { generateId } from '@/lib/utils';

interface HistoryEntry {
  elements: DesignElement[];
  background: CanvasBackground;
}

interface DesignState {
  // Current design ID (for re-edit)
  currentDesignId: string | null;

  elements: DesignElement[];
  selectedElementId: string | null;
  background: CanvasBackground;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  history: HistoryEntry[];
  historyIndex: number;
  isDirty: boolean;

  // Double-sided support
  frontLayers: DesignElement[];
  backLayers: DesignElement[];
  frontBackground: CanvasBackground;
  backBackground: CanvasBackground;
  currentSide: 'front' | 'back';
  isDoubleSided: boolean;

  // Actions
  addElement: (element: Omit<DesignElement, 'id'>) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  selectElement: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setBackground: (background: CanvasBackground) => void;
  setCanvasSize: (width: number, height: number) => void;
  setElements: (elements: DesignElement[]) => void;
  reorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  duplicateElement: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  loadDesign: (elements: DesignElement[], background: CanvasBackground, width: number, height: number) => void;

  // Double-sided actions
  setCurrentSide: (side: 'front' | 'back') => void;
  setIsDoubleSided: (isDoubleSided: boolean) => void;
  setCurrentDesignId: (id: string | null) => void;
  loadFullDesign: (design: {
    id?: string;
    frontLayers: DesignElement[];
    backLayers?: DesignElement[];
    frontBackground?: CanvasBackground;
    backBackground?: CanvasBackground;
    isDoubleSided: boolean;
    width: number;
    height: number;
  }) => void;
}

const defaultBackground: CanvasBackground = {
  type: 'solid',
  color: '#ffffff',
};

export const useDesignStore = create<DesignState>()((set) => ({
    elements: [],
    selectedElementId: null,
    background: defaultBackground,
    zoom: 1,
    canvasWidth: 1050,
    canvasHeight: 600,
    history: [{ elements: [], background: defaultBackground }],
    historyIndex: 0,
    isDirty: false,

    // Double-sided state
    currentDesignId: null,
    frontLayers: [],
    backLayers: [],
    frontBackground: defaultBackground,
    backBackground: defaultBackground,
    currentSide: 'front' as const,
    isDoubleSided: false,

    addElement: (elementData) =>
      set((state) => {
        const entry: HistoryEntry = {
          elements: JSON.parse(JSON.stringify(state.elements)),
          background: JSON.parse(JSON.stringify(state.background)),
        };
        const history = [...state.history.slice(0, state.historyIndex + 1), entry].slice(-50);
        const element: DesignElement = {
          ...elementData,
          id: generateId(),
          zIndex: state.elements.length,
        };
        return {
          elements: [...state.elements, element],
          selectedElementId: element.id,
          isDirty: true,
          history,
          historyIndex: history.length - 1,
        };
      }),

    removeElement: (id) =>
      set((state) => {
        const entry: HistoryEntry = {
          elements: JSON.parse(JSON.stringify(state.elements)),
          background: JSON.parse(JSON.stringify(state.background)),
        };
        const history = [...state.history.slice(0, state.historyIndex + 1), entry].slice(-50);
        return {
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          isDirty: true,
          history,
          historyIndex: history.length - 1,
        };
      }),

    updateElement: (id, updates) =>
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
        isDirty: true,
      })),

    selectElement: (id) => set({ selectedElementId: id }),

    setZoom: (zoom) => set({ zoom }),

    setBackground: (background) =>
      set((state) => {
        const entry: HistoryEntry = {
          elements: JSON.parse(JSON.stringify(state.elements)),
          background: JSON.parse(JSON.stringify(state.background)),
        };
        const history = [...state.history.slice(0, state.historyIndex + 1), entry].slice(-50);
        return { background, isDirty: true, history, historyIndex: history.length - 1 };
      }),

    setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

    setElements: (elements) => set({ elements, isDirty: true }),

    reorderElement: (id, direction) =>
      set((state) => {
        const elements = [...state.elements];
        const index = elements.findIndex((el) => el.id === id);
        if (index === -1) return {};

        if (direction === 'up' && index < elements.length - 1) {
          [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
        } else if (direction === 'down' && index > 0) {
          [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
        } else if (direction === 'top') {
          const [el] = elements.splice(index, 1);
          elements.push(el);
        } else if (direction === 'bottom') {
          const [el] = elements.splice(index, 1);
          elements.unshift(el);
        }

        const updatedElements = elements.map((el, i) => ({ ...el, zIndex: i }));
        const entry: HistoryEntry = {
          elements: JSON.parse(JSON.stringify(state.elements)),
          background: JSON.parse(JSON.stringify(state.background)),
        };
        const history = [...state.history.slice(0, state.historyIndex + 1), entry].slice(-50);
        return { elements: updatedElements, isDirty: true, history, historyIndex: history.length - 1 };
      }),

    duplicateElement: (id) =>
      set((state) => {
        const el = state.elements.find((e) => e.id === id);
        if (!el) return {};
        const newEl: DesignElement = {
          ...JSON.parse(JSON.stringify(el)),
          id: generateId(),
          x: el.x + 20,
          y: el.y + 20,
          zIndex: state.elements.length,
        };
        const entry: HistoryEntry = {
          elements: JSON.parse(JSON.stringify(state.elements)),
          background: JSON.parse(JSON.stringify(state.background)),
        };
        const history = [...state.history.slice(0, state.historyIndex + 1), entry].slice(-50);
        return {
          elements: [...state.elements, newEl],
          selectedElementId: newEl.id,
          isDirty: true,
          history,
          historyIndex: history.length - 1,
        };
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex <= 0) return {};
        const newIndex = state.historyIndex - 1;
        const entry = state.history[newIndex];
        return {
          elements: JSON.parse(JSON.stringify(entry.elements)),
          background: JSON.parse(JSON.stringify(entry.background)),
          historyIndex: newIndex,
          isDirty: true,
        };
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return {};
        const newIndex = state.historyIndex + 1;
        const entry = state.history[newIndex];
        return {
          elements: JSON.parse(JSON.stringify(entry.elements)),
          background: JSON.parse(JSON.stringify(entry.background)),
          historyIndex: newIndex,
          isDirty: true,
        };
      }),

    clearCanvas: () =>
      set((state) => {
        const entry: HistoryEntry = {
          elements: JSON.parse(JSON.stringify(state.elements)),
          background: JSON.parse(JSON.stringify(state.background)),
        };
        const history = [...state.history.slice(0, state.historyIndex + 1), entry].slice(-50);
        return {
          elements: [],
          selectedElementId: null,
          background: defaultBackground,
          isDirty: true,
          history,
          historyIndex: history.length - 1,
        };
      }),

    loadDesign: (elements, background, width, height) =>
      set({
        elements,
        background,
        canvasWidth: width,
        canvasHeight: height,
        selectedElementId: null,
        history: [{ elements: JSON.parse(JSON.stringify(elements)), background: JSON.parse(JSON.stringify(background)) }],
        historyIndex: 0,
        isDirty: false,
      }),

    // Double-sided actions
    setCurrentSide: (side) =>
      set((state) => {
        // Save current side's layers before switching
        const updates: Partial<DesignState> = { currentSide: side, selectedElementId: null };
        if (state.currentSide === 'front') {
          updates.frontLayers = [...state.elements];
          updates.frontBackground = { ...state.background };
          updates.elements = [...state.backLayers];
          updates.background = { ...state.backBackground };
        } else {
          updates.backLayers = [...state.elements];
          updates.backBackground = { ...state.background };
          updates.elements = [...state.frontLayers];
          updates.background = { ...state.frontBackground };
        }
        updates.history = [{ elements: JSON.parse(JSON.stringify(updates.elements)), background: JSON.parse(JSON.stringify(updates.background)) }];
        updates.historyIndex = 0;
        return updates as DesignState;
      }),

    setIsDoubleSided: (isDoubleSided) => set({ isDoubleSided, isDirty: true }),

    setCurrentDesignId: (id) => set({ currentDesignId: id }),

    loadFullDesign: (design) =>
      set({
        currentDesignId: design.id || null,
        frontLayers: design.frontLayers,
        backLayers: design.backLayers || [],
        frontBackground: design.frontBackground || defaultBackground,
        backBackground: design.backBackground || defaultBackground,
        isDoubleSided: design.isDoubleSided,
        elements: design.frontLayers,
        background: design.frontBackground || defaultBackground,
        currentSide: 'front' as const,
        canvasWidth: design.width,
        canvasHeight: design.height,
        selectedElementId: null,
        history: [{ elements: JSON.parse(JSON.stringify(design.frontLayers)), background: JSON.parse(JSON.stringify(design.frontBackground || defaultBackground)) }],
        historyIndex: 0,
        isDirty: false,
      }),
  }));

