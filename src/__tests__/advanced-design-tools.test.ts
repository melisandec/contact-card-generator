import { useDesignStore } from '@/store/design-store';
import { DesignElement, CanvasBackground } from '@/types';

const defaultBackground: CanvasBackground = {
  type: 'solid',
  color: '#ffffff',
};

const makeElement = (overrides: Partial<DesignElement> = {}): DesignElement => ({
  id: `el-${Math.random().toString(36).slice(2, 8)}`,
  type: 'shape',
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
  zIndex: 0,
  shapeType: 'rectangle',
  fill: '#ff0000',
  ...overrides,
});

describe('Advanced Design Tools', () => {
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
      currentDesignId: null,
      frontLayers: [],
      backLayers: [],
      frontBackground: defaultBackground,
      backBackground: defaultBackground,
      currentSide: 'front',
      isDoubleSided: false,
      guides: [],
      guidesLocked: false,
      guidesVisible: true,
      snapThreshold: 5,
      globalStyles: {
        colors: [
          { id: 'primary', value: '#003153', label: 'Primary' },
          { id: 'secondary', value: '#C5A572', label: 'Accent' },
        ],
        fonts: { heading: 'Playfair Display', body: 'Montserrat' },
      },
    });
  });

  describe('Multi-select', () => {
    it('selectElement sets both selectedElementId and selectedElementIds', () => {
      const el = makeElement({ id: 'a' });
      useDesignStore.setState({ elements: [el] });

      useDesignStore.getState().selectElement('a');
      const state = useDesignStore.getState();
      expect(state.selectedElementId).toBe('a');
      expect(state.selectedElementIds).toEqual(['a']);
    });

    it('selectElement(null) clears selection', () => {
      useDesignStore.setState({ selectedElementId: 'a', selectedElementIds: ['a', 'b'] });

      useDesignStore.getState().selectElement(null);
      const state = useDesignStore.getState();
      expect(state.selectedElementId).toBeNull();
      expect(state.selectedElementIds).toEqual([]);
    });

    it('toggleSelectElement adds and removes elements', () => {
      const elements = [makeElement({ id: 'a' }), makeElement({ id: 'b' }), makeElement({ id: 'c' })];
      useDesignStore.setState({ elements, selectedElementIds: ['a'] });

      useDesignStore.getState().toggleSelectElement('b');
      expect(useDesignStore.getState().selectedElementIds).toEqual(['a', 'b']);

      useDesignStore.getState().toggleSelectElement('a');
      expect(useDesignStore.getState().selectedElementIds).toEqual(['b']);
    });

    it('selectMultipleElements sets the list directly', () => {
      const elements = [makeElement({ id: 'a' }), makeElement({ id: 'b' })];
      useDesignStore.setState({ elements });

      useDesignStore.getState().selectMultipleElements(['a', 'b']);
      const state = useDesignStore.getState();
      expect(state.selectedElementIds).toEqual(['a', 'b']);
      expect(state.selectedElementId).toBeNull();
    });

    it('selectMultipleElements with single element sets selectedElementId', () => {
      useDesignStore.getState().selectMultipleElements(['a']);
      const state = useDesignStore.getState();
      expect(state.selectedElementIds).toEqual(['a']);
      expect(state.selectedElementId).toBe('a');
    });
  });

  describe('Smart Alignment', () => {
    const el1 = makeElement({ id: 'el1', x: 50, y: 20, width: 80, height: 40 });
    const el2 = makeElement({ id: 'el2', x: 200, y: 100, width: 60, height: 30 });
    const el3 = makeElement({ id: 'el3', x: 120, y: 60, width: 100, height: 50 });

    beforeEach(() => {
      useDesignStore.setState({
        elements: [el1, el2, el3],
        selectedElementIds: ['el1', 'el2', 'el3'],
      });
    });

    it('aligns left edges to leftmost element', () => {
      useDesignStore.getState().alignElements('left');
      const elements = useDesignStore.getState().elements;
      elements.forEach((el) => {
        if (['el1', 'el2', 'el3'].includes(el.id)) {
          expect(el.x).toBe(50); // leftmost x
        }
      });
    });

    it('aligns right edges to rightmost element', () => {
      useDesignStore.getState().alignElements('right');
      const elements = useDesignStore.getState().elements;
      // rightmost = el2.x + el2.width = 200 + 60 = 260
      const el1Updated = elements.find((el) => el.id === 'el1')!;
      expect(el1Updated.x).toBe(260 - 80); // 180
      const el3Updated = elements.find((el) => el.id === 'el3')!;
      expect(el3Updated.x).toBe(260 - 100); // 160
    });

    it('aligns top edges to topmost element', () => {
      useDesignStore.getState().alignElements('top');
      const elements = useDesignStore.getState().elements;
      elements.forEach((el) => {
        if (['el1', 'el2', 'el3'].includes(el.id)) {
          expect(el.y).toBe(20); // topmost y
        }
      });
    });

    it('aligns bottom edges to bottommost element', () => {
      useDesignStore.getState().alignElements('bottom');
      const elements = useDesignStore.getState().elements;
      // bottommost = el2.y + el2.height = 100 + 30 = 130
      const el1Updated = elements.find((el) => el.id === 'el1')!;
      expect(el1Updated.y).toBe(130 - 40); // 90
      const el3Updated = elements.find((el) => el.id === 'el3')!;
      expect(el3Updated.y).toBe(130 - 50); // 80
    });

    it('aligns horizontal centers', () => {
      useDesignStore.getState().alignElements('center-h');
      const elements = useDesignStore.getState().elements;
      // minX=50, maxRight=260, centerX=155
      const el1Updated = elements.find((el) => el.id === 'el1')!;
      expect(el1Updated.x).toBe(Math.round(155 - 80 / 2)); // 115
      const el2Updated = elements.find((el) => el.id === 'el2')!;
      expect(el2Updated.x).toBe(Math.round(155 - 60 / 2)); // 125
    });

    it('aligns vertical centers', () => {
      useDesignStore.getState().alignElements('center-v');
      const elements = useDesignStore.getState().elements;
      // minY=20, maxBottom=130, centerY=75
      const el1Updated = elements.find((el) => el.id === 'el1')!;
      expect(el1Updated.y).toBe(Math.round(75 - 40 / 2)); // 55
      const el2Updated = elements.find((el) => el.id === 'el2')!;
      expect(el2Updated.y).toBe(Math.round(75 - 30 / 2)); // 60
    });

    it('does nothing with fewer than 2 selected elements', () => {
      useDesignStore.setState({ selectedElementIds: ['el1'] });
      useDesignStore.getState().alignElements('left');
      const el = useDesignStore.getState().elements.find((e) => e.id === 'el1')!;
      expect(el.x).toBe(50); // unchanged
    });

    it('marks design as dirty after alignment', () => {
      useDesignStore.getState().alignElements('left');
      expect(useDesignStore.getState().isDirty).toBe(true);
    });
  });

  describe('Distribution', () => {
    const el1 = makeElement({ id: 'el1', x: 0, y: 0, width: 40, height: 20 });
    const el2 = makeElement({ id: 'el2', x: 200, y: 200, width: 60, height: 30 });
    const el3 = makeElement({ id: 'el3', x: 400, y: 400, width: 40, height: 20 });

    beforeEach(() => {
      useDesignStore.setState({
        elements: [el1, el2, el3],
        selectedElementIds: ['el1', 'el2', 'el3'],
      });
    });

    it('distributes elements horizontally with equal spacing', () => {
      useDesignStore.getState().distributeElements('horizontal');
      const elements = useDesignStore.getState().elements;
      // sorted by x: el1(0), el2(200), el3(400)
      // totalWidth = 40+60+40 = 140
      // span = 400+40 - 0 = 440
      // totalSpace = 440 - 140 = 300
      // gap = 300 / 2 = 150
      // el1.x = 0, el2.x = 0 + 40 + 150 = 190, el3.x = 190 + 60 + 150 = 400
      const sorted = [...elements].sort((a, b) => a.x - b.x);
      expect(sorted[0].x).toBe(0);
      expect(sorted[1].x).toBe(190);
      expect(sorted[2].x).toBe(400);
    });

    it('distributes elements vertically with equal spacing', () => {
      useDesignStore.getState().distributeElements('vertical');
      const elements = useDesignStore.getState().elements;
      // sorted by y: el1(0), el2(200), el3(400)
      // totalHeight = 20+30+20 = 70
      // span = 400+20 - 0 = 420
      // totalSpace = 420 - 70 = 350
      // gap = 350 / 2 = 175
      // el1.y = 0, el2.y = 0 + 20 + 175 = 195, el3.y = 195 + 30 + 175 = 400
      const sorted = [...elements].sort((a, b) => a.y - b.y);
      expect(sorted[0].y).toBe(0);
      expect(sorted[1].y).toBe(195);
      expect(sorted[2].y).toBe(400);
    });

    it('does nothing with fewer than 3 selected elements', () => {
      useDesignStore.setState({ selectedElementIds: ['el1', 'el2'] });
      useDesignStore.getState().distributeElements('horizontal');
      const el = useDesignStore.getState().elements.find((e) => e.id === 'el2')!;
      expect(el.x).toBe(200); // unchanged
    });
  });

  describe('Match Dimensions', () => {
    it('matches width to the widest element', () => {
      const el1 = makeElement({ id: 'a', width: 100 });
      const el2 = makeElement({ id: 'b', width: 200 });
      const el3 = makeElement({ id: 'c', width: 50 });
      useDesignStore.setState({
        elements: [el1, el2, el3],
        selectedElementIds: ['a', 'b', 'c'],
      });

      useDesignStore.getState().matchDimensions('width');
      const elements = useDesignStore.getState().elements;
      elements.forEach((el) => {
        expect(el.width).toBe(200);
      });
    });

    it('matches height to the tallest element', () => {
      const el1 = makeElement({ id: 'a', height: 50 });
      const el2 = makeElement({ id: 'b', height: 150 });
      useDesignStore.setState({
        elements: [el1, el2],
        selectedElementIds: ['a', 'b'],
      });

      useDesignStore.getState().matchDimensions('height');
      const elements = useDesignStore.getState().elements;
      elements.forEach((el) => {
        expect(el.height).toBe(150);
      });
    });

    it('does nothing with fewer than 2 selected', () => {
      const el1 = makeElement({ id: 'a', width: 100 });
      useDesignStore.setState({
        elements: [el1],
        selectedElementIds: ['a'],
      });

      useDesignStore.getState().matchDimensions('width');
      expect(useDesignStore.getState().elements[0].width).toBe(100);
    });
  });

  describe('Layer Groups', () => {
    it('groups selected elements into a group', () => {
      const el1 = makeElement({ id: 'a', x: 10, y: 20, width: 50, height: 30 });
      const el2 = makeElement({ id: 'b', x: 100, y: 80, width: 60, height: 40 });
      useDesignStore.setState({
        elements: [el1, el2],
        selectedElementIds: ['a', 'b'],
      });

      useDesignStore.getState().groupElements();
      const state = useDesignStore.getState();

      // Should have 1 group element
      expect(state.elements).toHaveLength(1);
      const group = state.elements[0];
      expect(group.type).toBe('group');
      expect(group.children).toHaveLength(2);
      // Group bounding box
      expect(group.x).toBe(10);
      expect(group.y).toBe(20);
      expect(group.width).toBe(150); // 100+60 - 10
      expect(group.height).toBe(100); // 80+40 - 20
      // Children have relative positions
      expect(group.children![0].x).toBe(0); // 10 - 10
      expect(group.children![0].y).toBe(0); // 20 - 20
      expect(group.children![1].x).toBe(90); // 100 - 10
      expect(group.children![1].y).toBe(60); // 80 - 20
    });

    it('groups selects the new group', () => {
      const el1 = makeElement({ id: 'a' });
      const el2 = makeElement({ id: 'b' });
      useDesignStore.setState({
        elements: [el1, el2],
        selectedElementIds: ['a', 'b'],
      });

      useDesignStore.getState().groupElements();
      const state = useDesignStore.getState();
      expect(state.selectedElementId).toBe(state.elements[0].id);
      expect(state.selectedElementIds).toEqual([state.elements[0].id]);
    });

    it('does nothing when fewer than 2 elements selected', () => {
      const el1 = makeElement({ id: 'a' });
      useDesignStore.setState({
        elements: [el1],
        selectedElementIds: ['a'],
      });

      useDesignStore.getState().groupElements();
      expect(useDesignStore.getState().elements).toHaveLength(1);
      expect(useDesignStore.getState().elements[0].type).toBe('shape');
    });

    it('ungroups a group back to individual elements', () => {
      const child1 = makeElement({ id: 'c1', x: 0, y: 0, width: 50, height: 30 });
      const child2 = makeElement({ id: 'c2', x: 90, y: 60, width: 60, height: 40 });
      const group = makeElement({
        id: 'g1',
        type: 'group',
        x: 10,
        y: 20,
        width: 150,
        height: 100,
        children: [child1, child2],
      });
      useDesignStore.setState({
        elements: [group],
        selectedElementId: 'g1',
        selectedElementIds: ['g1'],
      });

      useDesignStore.getState().ungroupElements();
      const state = useDesignStore.getState();

      expect(state.elements).toHaveLength(2);
      const restored1 = state.elements.find((el) => el.id === 'c1')!;
      const restored2 = state.elements.find((el) => el.id === 'c2')!;
      // Absolute positions restored
      expect(restored1.x).toBe(10); // 0 + 10
      expect(restored1.y).toBe(20); // 0 + 20
      expect(restored2.x).toBe(100); // 90 + 10
      expect(restored2.y).toBe(80); // 60 + 20
    });

    it('ungroup does nothing if selected element is not a group', () => {
      const el = makeElement({ id: 'a' });
      useDesignStore.setState({
        elements: [el],
        selectedElementId: 'a',
        selectedElementIds: ['a'],
      });

      useDesignStore.getState().ungroupElements();
      expect(useDesignStore.getState().elements).toHaveLength(1);
    });

    it('ungroup selects the restored children', () => {
      const group = makeElement({
        id: 'g1',
        type: 'group',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        children: [
          makeElement({ id: 'c1' }),
          makeElement({ id: 'c2' }),
        ],
      });
      useDesignStore.setState({
        elements: [group],
        selectedElementId: 'g1',
        selectedElementIds: ['g1'],
      });

      useDesignStore.getState().ungroupElements();
      const state = useDesignStore.getState();
      expect(state.selectedElementId).toBeNull();
      expect(state.selectedElementIds).toEqual(['c1', 'c2']);
    });
  });

  describe('Guides', () => {
    it('adds a horizontal guide', () => {
      useDesignStore.getState().addGuide('horizontal', 150);
      const state = useDesignStore.getState();
      expect(state.guides).toHaveLength(1);
      expect(state.guides[0].orientation).toBe('horizontal');
      expect(state.guides[0].position).toBe(150);
      expect(state.isDirty).toBe(true);
    });

    it('adds a vertical guide', () => {
      useDesignStore.getState().addGuide('vertical', 300);
      const state = useDesignStore.getState();
      expect(state.guides).toHaveLength(1);
      expect(state.guides[0].orientation).toBe('vertical');
      expect(state.guides[0].position).toBe(300);
    });

    it('removes a guide', () => {
      useDesignStore.getState().addGuide('horizontal', 100);
      const guideId = useDesignStore.getState().guides[0].id;

      useDesignStore.getState().removeGuide(guideId);
      expect(useDesignStore.getState().guides).toHaveLength(0);
    });

    it('updates a guide position', () => {
      useDesignStore.getState().addGuide('horizontal', 100);
      const guideId = useDesignStore.getState().guides[0].id;

      useDesignStore.getState().updateGuide(guideId, 250);
      expect(useDesignStore.getState().guides[0].position).toBe(250);
    });

    it('toggles guides locked state', () => {
      expect(useDesignStore.getState().guidesLocked).toBe(false);
      useDesignStore.getState().setGuidesLocked(true);
      expect(useDesignStore.getState().guidesLocked).toBe(true);
    });

    it('toggles guides visibility', () => {
      expect(useDesignStore.getState().guidesVisible).toBe(true);
      useDesignStore.getState().setGuidesVisible(false);
      expect(useDesignStore.getState().guidesVisible).toBe(false);
    });

    it('loadFullDesign loads guides', () => {
      useDesignStore.getState().loadFullDesign({
        id: 'guide-test',
        frontLayers: [],
        guides: [
          { id: 'g1', orientation: 'horizontal', position: 100 },
          { id: 'g2', orientation: 'vertical', position: 200 },
        ],
        isDoubleSided: false,
        width: 1050,
        height: 600,
      });

      const state = useDesignStore.getState();
      expect(state.guides).toHaveLength(2);
      expect(state.guides[0].position).toBe(100);
      expect(state.guides[1].position).toBe(200);
    });

    it('loadFullDesign defaults to empty guides', () => {
      useDesignStore.getState().loadFullDesign({
        id: 'guide-default',
        frontLayers: [],
        isDoubleSided: false,
        width: 1050,
        height: 600,
      });

      expect(useDesignStore.getState().guides).toEqual([]);
    });
  });

  describe('QR Code Styling', () => {
    it('DesignElement can store qrStyle', () => {
      const qrElement = makeElement({
        id: 'qr1',
        type: 'qrcode',
        qrStyle: {
          dotShape: 'circle',
          gradient: { type: 'linear', colors: ['#000', '#6366f1'] },
          logoUrl: 'data:image/png;base64,abc123',
          logoSize: 20,
          backgroundColor: '#f0f0f0',
        },
      });

      useDesignStore.setState({ elements: [qrElement] });
      const el = useDesignStore.getState().elements[0];
      expect(el.qrStyle?.dotShape).toBe('circle');
      expect(el.qrStyle?.gradient?.type).toBe('linear');
      expect(el.qrStyle?.logoUrl).toBe('data:image/png;base64,abc123');
      expect(el.qrStyle?.backgroundColor).toBe('#f0f0f0');
    });

    it('updateElement updates qrStyle', () => {
      const qrElement = makeElement({ id: 'qr1', type: 'qrcode' });
      useDesignStore.setState({ elements: [qrElement] });

      useDesignStore.getState().updateElement('qr1', {
        qrStyle: {
          dotShape: 'diamond',
          backgroundColor: '#ffffff',
        },
      });

      const el = useDesignStore.getState().elements[0];
      expect(el.qrStyle?.dotShape).toBe('diamond');
    });
  });

  describe('Text on Path (data model)', () => {
    it('DesignElement can store pathRef and pathOffset', () => {
      const textEl = makeElement({
        id: 'text1',
        type: 'text',
        pathRef: 'path1',
        pathOffset: 10,
      });

      useDesignStore.setState({ elements: [textEl] });
      const el = useDesignStore.getState().elements[0];
      expect(el.pathRef).toBe('path1');
      expect(el.pathOffset).toBe(10);
    });

    it('updateElement can clear pathRef (detach from path)', () => {
      const textEl = makeElement({
        id: 'text1',
        type: 'text',
        pathRef: 'path1',
        pathOffset: 10,
      });
      useDesignStore.setState({ elements: [textEl] });

      useDesignStore.getState().updateElement('text1', {
        pathRef: undefined,
        pathOffset: undefined,
      });

      const el = useDesignStore.getState().elements[0];
      expect(el.pathRef).toBeUndefined();
      expect(el.pathOffset).toBeUndefined();
    });
  });

  describe('Shape types', () => {
    it('supports polygon shapeType with sides', () => {
      const polygon = makeElement({
        id: 'poly1',
        type: 'shape',
        shapeType: 'polygon',
        sides: 6,
      });

      useDesignStore.setState({ elements: [polygon] });
      const el = useDesignStore.getState().elements[0];
      expect(el.shapeType).toBe('polygon');
      expect(el.sides).toBe(6);
    });
  });
});
