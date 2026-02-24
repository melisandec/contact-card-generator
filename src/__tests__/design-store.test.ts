import { useDesignStore } from '@/store/design-store';
import { DesignElement, CanvasBackground } from '@/types';

const defaultBackground: CanvasBackground = {
  type: 'solid',
  color: '#ffffff',
};

const sampleElement: DesignElement = {
  id: 'test-1',
  type: 'text',
  x: 100,
  y: 100,
  width: 200,
  height: 50,
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
  zIndex: 0,
  content: 'Hello',
  fontFamily: 'Inter',
  fontSize: 16,
  color: '#000000',
};

const sampleElement2: DesignElement = {
  id: 'test-2',
  type: 'shape',
  x: 200,
  y: 200,
  width: 100,
  height: 100,
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
  zIndex: 1,
  shapeType: 'rectangle',
  fill: '#ff0000',
};

describe('Design Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useDesignStore.setState({
      elements: [],
      selectedElementId: null,
      background: defaultBackground,
      zoom: 1,
      canvasWidth: 1050,
      canvasHeight: 600,
      history: [{ elements: [], background: defaultBackground }],
      historyIndex: 0,
      isDirty: false,
      currentDesignId: null,
      frontLayers: [],
      backLayers: [],
      frontBackground: defaultBackground,
      backBackground: defaultBackground,
      currentSide: 'front',
      isDoubleSided: false,
    });
  });

  describe('loadFullDesign', () => {
    it('loads a full design with front layers', () => {
      const { loadFullDesign } = useDesignStore.getState();

      loadFullDesign({
        id: 'design-1',
        frontLayers: [sampleElement],
        isDoubleSided: false,
        width: 1050,
        height: 600,
      });

      const state = useDesignStore.getState();
      expect(state.currentDesignId).toBe('design-1');
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].id).toBe('test-1');
      expect(state.frontLayers).toHaveLength(1);
      expect(state.isDoubleSided).toBe(false);
      expect(state.currentSide).toBe('front');
      expect(state.canvasWidth).toBe(1050);
      expect(state.canvasHeight).toBe(600);
      expect(state.isDirty).toBe(false);
    });

    it('loads a double-sided design', () => {
      const { loadFullDesign } = useDesignStore.getState();

      loadFullDesign({
        id: 'design-2',
        frontLayers: [sampleElement],
        backLayers: [sampleElement2],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      const state = useDesignStore.getState();
      expect(state.currentDesignId).toBe('design-2');
      expect(state.isDoubleSided).toBe(true);
      expect(state.frontLayers).toHaveLength(1);
      expect(state.backLayers).toHaveLength(1);
      expect(state.elements).toHaveLength(1);
      expect(state.currentSide).toBe('front');
    });
  });

  describe('setCurrentSide', () => {
    it('switches from front to back', () => {
      const { loadFullDesign } = useDesignStore.getState();

      loadFullDesign({
        id: 'design-3',
        frontLayers: [sampleElement],
        backLayers: [sampleElement2],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      const { setCurrentSide } = useDesignStore.getState();
      setCurrentSide('back');

      const state = useDesignStore.getState();
      expect(state.currentSide).toBe('back');
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].id).toBe('test-2');
    });

    it('switches back to front from back', () => {
      const { loadFullDesign } = useDesignStore.getState();

      loadFullDesign({
        id: 'design-4',
        frontLayers: [sampleElement],
        backLayers: [sampleElement2],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      const store = useDesignStore.getState();
      store.setCurrentSide('back');
      const store2 = useDesignStore.getState();
      store2.setCurrentSide('front');

      const state = useDesignStore.getState();
      expect(state.currentSide).toBe('front');
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].id).toBe('test-1');
    });
  });

  describe('setIsDoubleSided', () => {
    it('enables double-sided mode', () => {
      const { setIsDoubleSided } = useDesignStore.getState();
      setIsDoubleSided(true);

      const state = useDesignStore.getState();
      expect(state.isDoubleSided).toBe(true);
      expect(state.isDirty).toBe(true);
    });
  });

  describe('setCurrentDesignId', () => {
    it('sets the current design ID', () => {
      const { setCurrentDesignId } = useDesignStore.getState();
      setCurrentDesignId('abc123');

      const state = useDesignStore.getState();
      expect(state.currentDesignId).toBe('abc123');
    });

    it('clears the current design ID', () => {
      useDesignStore.setState({ currentDesignId: 'abc123' });
      const { setCurrentDesignId } = useDesignStore.getState();
      setCurrentDesignId(null);

      const state = useDesignStore.getState();
      expect(state.currentDesignId).toBeNull();
    });
  });

  describe('existing functionality still works', () => {
    it('adds an element', () => {
      const { addElement } = useDesignStore.getState();
      addElement({
        type: 'text',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        content: 'Test',
      });

      const state = useDesignStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.isDirty).toBe(true);
    });

    it('loads a design (legacy)', () => {
      const { loadDesign } = useDesignStore.getState();
      loadDesign(
        [sampleElement],
        { type: 'solid', color: '#ff0000' },
        800,
        500
      );

      const state = useDesignStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.background.color).toBe('#ff0000');
      expect(state.canvasWidth).toBe(800);
      expect(state.canvasHeight).toBe(500);
      expect(state.isDirty).toBe(false);
    });
  });
});
