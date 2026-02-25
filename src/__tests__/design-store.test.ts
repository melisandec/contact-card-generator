import { useDesignStore, resolveElementStyles } from '@/store/design-store';
import { DesignElement, CanvasBackground, GlobalStyles } from '@/types';

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
      globalStyles: {
        colors: [
          { id: 'primary', value: '#003153', label: 'Primary' },
          { id: 'secondary', value: '#C5A572', label: 'Accent' },
        ],
        fonts: { heading: 'Playfair Display', body: 'Montserrat' },
      },
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

  describe('double-sided editing workflow', () => {
    it('adds elements to front side and they persist after side switch', () => {
      const { loadFullDesign } = useDesignStore.getState();

      loadFullDesign({
        id: 'wf-1',
        frontLayers: [sampleElement],
        backLayers: [],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      // Add an element to front
      useDesignStore.getState().addElement({
        type: 'text',
        x: 300,
        y: 300,
        width: 100,
        height: 50,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 1,
        content: 'Front new',
      });

      expect(useDesignStore.getState().elements).toHaveLength(2);

      // Switch to back
      useDesignStore.getState().setCurrentSide('back');
      expect(useDesignStore.getState().elements).toHaveLength(0);

      // Switch back to front — elements should persist
      useDesignStore.getState().setCurrentSide('front');
      expect(useDesignStore.getState().elements).toHaveLength(2);
    });

    it('adds elements to back side independently', () => {
      const { loadFullDesign } = useDesignStore.getState();

      loadFullDesign({
        id: 'wf-2',
        frontLayers: [sampleElement],
        backLayers: [],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      // Switch to back
      useDesignStore.getState().setCurrentSide('back');
      expect(useDesignStore.getState().elements).toHaveLength(0);

      // Add element to back
      useDesignStore.getState().addElement({
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
        content: 'Back only',
      });

      expect(useDesignStore.getState().elements).toHaveLength(1);

      // Switch to front — should have original element
      useDesignStore.getState().setCurrentSide('front');
      expect(useDesignStore.getState().elements).toHaveLength(1);
      expect(useDesignStore.getState().elements[0].id).toBe('test-1');
    });

    it('loadFullDesign with backgrounds loads correct backgrounds per side', () => {
      const frontBg: CanvasBackground = { type: 'solid', color: '#ff0000' };
      const backBg: CanvasBackground = { type: 'solid', color: '#0000ff' };

      useDesignStore.getState().loadFullDesign({
        id: 'wf-3',
        frontLayers: [sampleElement],
        backLayers: [sampleElement2],
        frontBackground: frontBg,
        backBackground: backBg,
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      // Front side should have red background
      expect(useDesignStore.getState().background.color).toBe('#ff0000');

      // Switch to back — should have blue background
      useDesignStore.getState().setCurrentSide('back');
      expect(useDesignStore.getState().background.color).toBe('#0000ff');

      // Switch back to front
      useDesignStore.getState().setCurrentSide('front');
      expect(useDesignStore.getState().background.color).toBe('#ff0000');
    });

    it('setCurrentSide clears selection', () => {
      useDesignStore.getState().loadFullDesign({
        id: 'wf-4',
        frontLayers: [sampleElement],
        backLayers: [sampleElement2],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      // Select an element on front
      useDesignStore.getState().selectElement('test-1');
      expect(useDesignStore.getState().selectedElementId).toBe('test-1');

      // Switch to back — selection should be cleared
      useDesignStore.getState().setCurrentSide('back');
      expect(useDesignStore.getState().selectedElementId).toBeNull();
    });

    it('setCurrentSide resets history for the new side', () => {
      useDesignStore.getState().loadFullDesign({
        id: 'wf-5',
        frontLayers: [sampleElement],
        backLayers: [sampleElement2],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      // Switch to back
      useDesignStore.getState().setCurrentSide('back');
      expect(useDesignStore.getState().historyIndex).toBe(0);
      expect(useDesignStore.getState().history).toHaveLength(1);
    });

    it('disabling double-sided mode preserves state', () => {
      useDesignStore.getState().loadFullDesign({
        id: 'wf-6',
        frontLayers: [sampleElement],
        backLayers: [sampleElement2],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      useDesignStore.getState().setIsDoubleSided(false);
      expect(useDesignStore.getState().isDoubleSided).toBe(false);
      expect(useDesignStore.getState().isDirty).toBe(true);
      // Elements still intact
      expect(useDesignStore.getState().elements).toHaveLength(1);
    });
  });

  describe('global styles', () => {
    it('loads with default global styles', () => {
      const state = useDesignStore.getState();
      expect(state.globalStyles.colors).toHaveLength(2);
      expect(state.globalStyles.fonts.heading).toBe('Playfair Display');
      expect(state.globalStyles.fonts.body).toBe('Montserrat');
    });

    it('loadFullDesign preserves globalStyles', () => {
      const customStyles: GlobalStyles = {
        colors: [{ id: 'brand', value: '#ff0000', label: 'Brand' }],
        fonts: { heading: 'Georgia', body: 'Arial' },
      };

      useDesignStore.getState().loadFullDesign({
        id: 'gs-1',
        frontLayers: [sampleElement],
        globalStyles: customStyles,
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      const state = useDesignStore.getState();
      expect(state.globalStyles.colors).toHaveLength(1);
      expect(state.globalStyles.colors[0].value).toBe('#ff0000');
      expect(state.globalStyles.fonts.heading).toBe('Georgia');
    });

    it('setGlobalColor updates a specific color', () => {
      useDesignStore.getState().setGlobalColor('primary', '#112233');
      const state = useDesignStore.getState();
      expect(state.globalStyles.colors.find((c) => c.id === 'primary')?.value).toBe('#112233');
      expect(state.isDirty).toBe(true);
    });

    it('setGlobalFont updates heading or body font', () => {
      useDesignStore.getState().setGlobalFont('heading', 'Georgia');
      expect(useDesignStore.getState().globalStyles.fonts.heading).toBe('Georgia');

      useDesignStore.getState().setGlobalFont('body', 'Arial');
      expect(useDesignStore.getState().globalStyles.fonts.body).toBe('Arial');
    });

    it('addGlobalColor adds a new color to palette', () => {
      useDesignStore.getState().addGlobalColor({ id: 'accent2', value: '#00ff00', label: 'Accent 2' });
      const state = useDesignStore.getState();
      expect(state.globalStyles.colors).toHaveLength(3);
      expect(state.globalStyles.colors[2].id).toBe('accent2');
    });

    it('removeGlobalColor removes a color from palette', () => {
      useDesignStore.getState().removeGlobalColor('secondary');
      const state = useDesignStore.getState();
      expect(state.globalStyles.colors).toHaveLength(1);
      expect(state.globalStyles.colors[0].id).toBe('primary');
    });

    it('applyGlobalColorToElement sets color and styleRef on text element', () => {
      useDesignStore.getState().addElement({
        type: 'text',
        x: 0, y: 0, width: 100, height: 50, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 0, content: 'Test',
        color: '#000000',
      });
      const elId = useDesignStore.getState().elements[0].id;

      useDesignStore.getState().applyGlobalColorToElement(elId, 'primary', 'color');
      const el = useDesignStore.getState().elements[0];
      expect(el.color).toBe('#003153');
      expect(el.styleRefs?.colorRef).toBe('primary');
    });

    it('applyGlobalColorToElement sets fill and styleRef on shape element', () => {
      useDesignStore.getState().addElement({
        type: 'shape',
        x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 0, shapeType: 'rectangle',
        fill: '#000000',
      });
      const elId = useDesignStore.getState().elements[0].id;

      useDesignStore.getState().applyGlobalColorToElement(elId, 'secondary', 'fill');
      const el = useDesignStore.getState().elements[0];
      expect(el.fill).toBe('#C5A572');
      expect(el.styleRefs?.colorRef).toBe('secondary');
    });

    it('applyGlobalFontToElement sets font and styleRef', () => {
      useDesignStore.getState().addElement({
        type: 'text',
        x: 0, y: 0, width: 100, height: 50, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 0, content: 'Test',
        fontFamily: 'Arial',
      });
      const elId = useDesignStore.getState().elements[0].id;

      useDesignStore.getState().applyGlobalFontToElement(elId, 'heading');
      const el = useDesignStore.getState().elements[0];
      expect(el.fontFamily).toBe('Playfair Display');
      expect(el.styleRefs?.fontRef).toBe('heading');
    });

    it('unlinkElementStyle removes styleRefs from element', () => {
      useDesignStore.getState().addElement({
        type: 'text',
        x: 0, y: 0, width: 100, height: 50, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 0, content: 'Test',
        color: '#003153',
        styleRefs: { colorRef: 'primary', fontRef: 'heading' },
      });
      const elId = useDesignStore.getState().elements[0].id;

      useDesignStore.getState().unlinkElementStyle(elId);
      const el = useDesignStore.getState().elements[0];
      expect(el.styleRefs).toBeUndefined();
      // color value is preserved even after unlinking
      expect(el.color).toBe('#003153');
    });

    it('changing global color auto-resolves for linked elements', () => {
      useDesignStore.getState().addElement({
        type: 'text',
        x: 0, y: 0, width: 100, height: 50, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 0, content: 'Test',
        color: '#003153',
      });
      const elId = useDesignStore.getState().elements[0].id;

      // Link element to primary color
      useDesignStore.getState().applyGlobalColorToElement(elId, 'primary', 'color');

      // Change global color
      useDesignStore.getState().setGlobalColor('primary', '#ff0000');

      // Resolve element styles
      const el = useDesignStore.getState().elements[0];
      const resolved = resolveElementStyles(el, useDesignStore.getState().globalStyles);
      expect(resolved.color).toBe('#ff0000');
    });

    it('resolveElementStyles applies global font', () => {
      const el: DesignElement = {
        id: 'test-resolve',
        type: 'text',
        x: 0, y: 0, width: 100, height: 50, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 0, content: 'Test',
        fontFamily: 'Arial',
        styleRefs: { fontRef: 'body' },
      };

      const resolved = resolveElementStyles(el, useDesignStore.getState().globalStyles);
      expect(resolved.fontFamily).toBe('Montserrat');
    });

    it('resolveElementStyles applies overrides', () => {
      const el: DesignElement = {
        id: 'test-override',
        type: 'text',
        x: 0, y: 0, width: 100, height: 50, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 0, content: 'Test',
        fontSize: 16,
        styleRefs: { fontRef: 'heading', overrides: { fontSize: 24, letterSpacing: 2 } },
      };

      const resolved = resolveElementStyles(el, useDesignStore.getState().globalStyles);
      expect(resolved.fontFamily).toBe('Playfair Display');
      expect(resolved.fontSize).toBe(24);
      expect(resolved.letterSpacing).toBe(2);
    });

    it('resolveElementStyles returns element unchanged when no styleRefs', () => {
      const el: DesignElement = {
        id: 'test-no-ref',
        type: 'text',
        x: 0, y: 0, width: 100, height: 50, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 0, content: 'Test',
        fontFamily: 'Arial',
        color: '#000000',
      };

      const resolved = resolveElementStyles(el, useDesignStore.getState().globalStyles);
      expect(resolved).toBe(el);
    });

    it('copyStylesToSide marks design as dirty', () => {
      useDesignStore.getState().loadFullDesign({
        id: 'gs-copy',
        frontLayers: [sampleElement],
        backLayers: [sampleElement2],
        isDoubleSided: true,
        width: 1050,
        height: 600,
      });

      useDesignStore.getState().copyStylesToSide();
      expect(useDesignStore.getState().isDirty).toBe(true);
    });

    it('setGlobalStyles replaces all global styles', () => {
      const newStyles: GlobalStyles = {
        colors: [{ id: 'custom', value: '#abcdef', label: 'Custom' }],
        fonts: { heading: 'Roboto', body: 'Open Sans' },
      };

      useDesignStore.getState().setGlobalStyles(newStyles);
      const state = useDesignStore.getState();
      expect(state.globalStyles.colors).toHaveLength(1);
      expect(state.globalStyles.colors[0].id).toBe('custom');
      expect(state.globalStyles.fonts.heading).toBe('Roboto');
      expect(state.globalStyles.fonts.body).toBe('Open Sans');
    });
  });
});
