import { useDesignStore } from '@/store/design-store';

describe('Text Editing Interaction', () => {
  beforeEach(() => {
    const store = useDesignStore.getState();
    store.clearCanvas();
    // Reset editing state
    useDesignStore.setState({ editingElementId: null });
  });

  it('has editingElementId initialized to null', () => {
    const state = useDesignStore.getState();
    expect(state.editingElementId).toBeNull();
  });

  it('setEditingElementId sets the editing element', () => {
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
      content: 'Hello',
    });

    const el = useDesignStore.getState().elements[0];
    store.setEditingElementId(el.id);
    expect(useDesignStore.getState().editingElementId).toBe(el.id);
  });

  it('setEditingElementId(null) clears editing state', () => {
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

    const el = useDesignStore.getState().elements[0];
    store.setEditingElementId(el.id);
    expect(useDesignStore.getState().editingElementId).toBe(el.id);

    store.setEditingElementId(null);
    expect(useDesignStore.getState().editingElementId).toBeNull();
  });

  it('selectElement clears editingElementId', () => {
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

    const el = useDesignStore.getState().elements[0];
    store.setEditingElementId(el.id);
    expect(useDesignStore.getState().editingElementId).toBe(el.id);

    // Selecting a different element should clear editing
    store.selectElement(null);
    expect(useDesignStore.getState().editingElementId).toBeNull();
  });

  it('updateElement works while editing for content changes', () => {
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
      content: 'Original',
    });

    const el = useDesignStore.getState().elements[0];
    store.setEditingElementId(el.id);
    store.updateElement(el.id, { content: 'Updated text' });

    const updated = useDesignStore.getState().elements[0];
    expect(updated.content).toBe('Updated text');
  });
});
