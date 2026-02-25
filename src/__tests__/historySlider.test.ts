import { useDesignStore } from '@/store/design-store';
import type { CanvasBackground } from '@/types';

const defaultBackground: CanvasBackground = { type: 'solid', color: '#ffffff' };

describe('jumpToHistory', () => {
  beforeEach(() => {
    useDesignStore.setState({
      elements: [],
      selectedElementId: null,
      selectedElementIds: [],
      background: defaultBackground,
      zoom: 1,
      canvasWidth: 1050,
      canvasHeight: 600,
      history: [{ elements: [], background: defaultBackground }],
      historyIndex: 0,
      isDirty: false,
      frontLayers: [],
      backLayers: [],
      frontBackground: defaultBackground,
      backBackground: defaultBackground,
      currentSide: 'front' as const,
      isDoubleSided: false,
    });
  });

  it('jumps to a specific history index', () => {
    const store = useDesignStore.getState();

    // Add element to create history
    store.addElement({
      type: 'text',
      x: 10,
      y: 10,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      content: 'First',
    });

    store.addElement({
      type: 'text',
      x: 20,
      y: 20,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      content: 'Second',
    });

    const state = useDesignStore.getState();
    expect(state.elements.length).toBe(2);
    expect(state.historyIndex).toBe(2);

    // Jump to index 0 (empty state)
    state.jumpToHistory(0);
    const jumped = useDesignStore.getState();
    expect(jumped.elements.length).toBe(0);
    expect(jumped.historyIndex).toBe(0);
  });

  it('does nothing for out-of-bounds index', () => {
    const store = useDesignStore.getState();
    store.addElement({
      type: 'text',
      x: 10,
      y: 10,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      content: 'Test',
    });

    const beforeState = useDesignStore.getState();
    const beforeIndex = beforeState.historyIndex;
    const beforeCount = beforeState.elements.length;

    beforeState.jumpToHistory(999);
    const afterState = useDesignStore.getState();
    expect(afterState.historyIndex).toBe(beforeIndex);
    expect(afterState.elements.length).toBe(beforeCount);
  });

  it('does nothing for negative index', () => {
    const store = useDesignStore.getState();
    store.jumpToHistory(-1);
    expect(useDesignStore.getState().historyIndex).toBe(0);
  });

  it('can jump forward after jumping backward', () => {
    const store = useDesignStore.getState();

    store.addElement({
      type: 'text',
      x: 10,
      y: 10,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      content: 'First',
    });

    store.addElement({
      type: 'text',
      x: 20,
      y: 20,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      content: 'Second',
    });

    // History stores pre-states: [initial-empty(0), pre-add1(1), pre-add2(2)]
    // Current state (after both adds) has 2 elements
    expect(useDesignStore.getState().historyIndex).toBe(2);
    expect(useDesignStore.getState().elements.length).toBe(2);

    // Jump back to 0 (initial empty state)
    useDesignStore.getState().jumpToHistory(0);
    expect(useDesignStore.getState().elements.length).toBe(0);

    // Jump forward to 2 (pre-state of 2nd add = 1 element)
    useDesignStore.getState().jumpToHistory(2);
    expect(useDesignStore.getState().elements.length).toBe(1);
    expect(useDesignStore.getState().historyIndex).toBe(2);
  });
});
