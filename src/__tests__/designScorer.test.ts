import {
  relativeLuminance,
  contrastRatio,
  analyzeDesign,
  scoringRules,
} from '@/lib/designScorer';
import type { DesignElement, CanvasBackground } from '@/types';

const defaultBg: CanvasBackground = { type: 'solid', color: '#ffffff' };

function makeElement(overrides: Partial<DesignElement>): DesignElement {
  return {
    id: `el-${Math.random().toString(36).slice(2, 8)}`,
    type: 'text',
    x: 50,
    y: 50,
    width: 200,
    height: 40,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    ...overrides,
  };
}

describe('relativeLuminance', () => {
  it('returns 0 for black', () => {
    expect(relativeLuminance(0, 0, 0)).toBeCloseTo(0, 4);
  });

  it('returns 1 for white', () => {
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 4);
  });

  it('returns intermediate value for gray', () => {
    const lum = relativeLuminance(128, 128, 128);
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });
});

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    const ratio = contrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 1 for same colors', () => {
    const ratio = contrastRatio('#336699', '#336699');
    expect(ratio).toBeCloseTo(1, 4);
  });

  it('returns ratio > 1 for different colors', () => {
    const ratio = contrastRatio('#003153', '#ffffff');
    expect(ratio).toBeGreaterThan(1);
  });

  it('handles invalid colors gracefully', () => {
    const ratio = contrastRatio('invalid', '#ffffff');
    expect(ratio).toBe(1);
  });
});

describe('scoringRules', () => {
  it('has expected number of rules', () => {
    expect(scoringRules.length).toBe(7);
  });

  it('all rules have required fields', () => {
    for (const rule of scoringRules) {
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(rule.category).toBeTruthy();
      expect(rule.weight).toBeGreaterThan(0);
      expect(typeof rule.check).toBe('function');
    }
  });

  it('weights sum to 100', () => {
    const total = scoringRules.reduce((sum, r) => sum + r.weight, 0);
    expect(total).toBe(100);
  });
});

describe('analyzeDesign', () => {
  it('returns perfect score for empty canvas', () => {
    const score = analyzeDesign([], defaultBg, 1050, 600);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.results).toHaveLength(scoringRules.length);
  });

  it('returns good score for well-designed card', () => {
    const elements: DesignElement[] = [
      makeElement({ type: 'text', content: 'John Doe', fontSize: 24, color: '#000000', x: 50, y: 50, width: 300, height: 40 }),
      makeElement({ type: 'text', content: 'Developer', fontSize: 14, color: '#333333', x: 50, y: 100, width: 300, height: 30 }),
      makeElement({ type: 'shape', shapeType: 'rectangle', x: 50, y: 150, width: 300, height: 2, fill: '#003153' }),
      makeElement({ type: 'text', content: 'john@example.com', fontSize: 12, color: '#666666', x: 50, y: 170, width: 300, height: 25 }),
    ];
    const score = analyzeDesign(elements, defaultBg, 1050, 600);
    expect(score.total).toBeGreaterThanOrEqual(50);
  });

  it('penalizes low contrast text', () => {
    const elements: DesignElement[] = [
      makeElement({ type: 'text', content: 'Hard to read', fontSize: 14, color: '#eeeeee' }),
      makeElement({ type: 'shape', shapeType: 'rectangle', x: 300, y: 300, width: 100, height: 100 }),
    ];
    const score = analyzeDesign(elements, defaultBg, 1050, 600);
    const contrastResult = score.results.find((r) => r.rule.id === 'text_contrast');
    expect(contrastResult).toBeDefined();
    expect(contrastResult!.result.passed).toBe(false);
  });

  it('penalizes tiny font sizes', () => {
    const elements: DesignElement[] = [
      makeElement({ type: 'text', content: 'Tiny text', fontSize: 6 }),
      makeElement({ type: 'shape', shapeType: 'rectangle', x: 300, y: 300, width: 100, height: 100 }),
    ];
    const score = analyzeDesign(elements, defaultBg, 1050, 600);
    const fontResult = score.results.find((r) => r.rule.id === 'min_font_size');
    expect(fontResult).toBeDefined();
    expect(fontResult!.result.passed).toBe(false);
  });

  it('penalizes out-of-bounds elements', () => {
    const elements: DesignElement[] = [
      makeElement({ type: 'text', content: 'Off screen', x: -50, y: -50, width: 200, height: 40 }),
      makeElement({ type: 'shape', shapeType: 'rectangle', x: 300, y: 300, width: 100, height: 100 }),
    ];
    const score = analyzeDesign(elements, defaultBg, 1050, 600);
    const boundsResult = score.results.find((r) => r.rule.id === 'element_out_of_bounds');
    expect(boundsResult).toBeDefined();
    expect(boundsResult!.result.passed).toBe(false);
  });

  it('detects overlapping elements', () => {
    const elements: DesignElement[] = [
      makeElement({ type: 'text', content: 'Text 1', x: 50, y: 50, width: 200, height: 40 }),
      makeElement({ type: 'text', content: 'Text 2', x: 60, y: 55, width: 200, height: 40 }),
    ];
    const score = analyzeDesign(elements, defaultBg, 1050, 600);
    const overlapResult = score.results.find((r) => r.rule.id === 'element_overlap');
    expect(overlapResult).toBeDefined();
    expect(overlapResult!.result.passed).toBe(false);
  });

  it('warns about small QR codes', () => {
    const elements: DesignElement[] = [
      makeElement({ type: 'qrcode', x: 50, y: 50, width: 40, height: 40 }),
      makeElement({ type: 'text', content: 'Name', fontSize: 20, x: 200, y: 50, width: 200, height: 30 }),
    ];
    const score = analyzeDesign(elements, defaultBg, 1050, 600);
    const qrResult = score.results.find((r) => r.rule.id === 'qr_code_size');
    expect(qrResult).toBeDefined();
    expect(qrResult!.result.passed).toBe(false);
  });

  it('returns a summary string', () => {
    const score = analyzeDesign([], defaultBg, 1050, 600);
    expect(typeof score.summary).toBe('string');
    expect(score.summary.length).toBeGreaterThan(0);
  });
});
