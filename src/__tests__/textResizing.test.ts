import {
  measureTextDimensions,
  isTextOverflowing,
  computeFittingFontSize,
  getAutoShrinkFontSize,
} from '@/lib/textResizing';
import type { DesignElement } from '@/types';

function makeTextElement(overrides: Partial<DesignElement> = {}): DesignElement {
  return {
    id: 'test-text',
    type: 'text',
    x: 0,
    y: 0,
    width: 200,
    height: 50,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    content: 'Hello World',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 1.4,
    ...overrides,
  };
}

describe('measureTextDimensions', () => {
  it('returns dimensions for simple text', () => {
    const dims = measureTextDimensions('Hello', 16, 'Inter');
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('larger font produces larger dimensions', () => {
    const small = measureTextDimensions('Test', 12, 'Inter');
    const large = measureTextDimensions('Test', 24, 'Inter');
    expect(large.width).toBeGreaterThan(small.width);
    expect(large.height).toBeGreaterThan(small.height);
  });

  it('multiline text increases height', () => {
    const single = measureTextDimensions('Line 1', 16, 'Inter');
    const multi = measureTextDimensions('Line 1\nLine 2', 16, 'Inter');
    expect(multi.height).toBeGreaterThan(single.height);
  });

  it('wraps text when container width is limited', () => {
    const longText = 'This is a very long text that should wrap when the container is narrow';
    const unlimited = measureTextDimensions(longText, 16, 'Inter');
    const limited = measureTextDimensions(longText, 16, 'Inter', '400', 1.4, 0, 100);
    expect(limited.height).toBeGreaterThan(unlimited.height);
  });

  it('bold text is wider than normal', () => {
    const normal = measureTextDimensions('Test', 16, 'Inter', '400');
    const bold = measureTextDimensions('Test', 16, 'Inter', '700');
    expect(bold.width).toBeGreaterThan(normal.width);
  });
});

describe('isTextOverflowing', () => {
  it('returns false for text that fits', () => {
    const el = makeTextElement({ content: 'Hi', width: 200, height: 50, fontSize: 14 });
    expect(isTextOverflowing(el)).toBe(false);
  });

  it('returns true for text that overflows', () => {
    const el = makeTextElement({
      content: 'This is a very long text that will definitely overflow the small bounding box when rendered at a large font size',
      width: 50,
      height: 20,
      fontSize: 24,
    });
    expect(isTextOverflowing(el)).toBe(true);
  });

  it('returns false for non-text elements', () => {
    const el = makeTextElement({ type: 'shape' });
    expect(isTextOverflowing(el)).toBe(false);
  });

  it('returns false for empty text', () => {
    const el = makeTextElement({ content: '' });
    expect(isTextOverflowing(el)).toBe(false);
  });
});

describe('computeFittingFontSize', () => {
  it('returns max font size when text fits easily', () => {
    const size = computeFittingFontSize('Hi', 500, 200, 24);
    expect(size).toBe(24);
  });

  it('reduces font size when text would overflow', () => {
    const size = computeFittingFontSize(
      'This is a long paragraph that needs to fit into a very small container area',
      100, 30, 24, 8
    );
    expect(size).toBeLessThan(24);
    expect(size).toBeGreaterThanOrEqual(8);
  });

  it('returns minFontSize when nothing fits', () => {
    const size = computeFittingFontSize(
      'A'.repeat(1000),
      10, 10, 24, 8
    );
    expect(size).toBe(8);
  });

  it('returns minFontSize for empty text', () => {
    const size = computeFittingFontSize('', 200, 100, 24, 8);
    expect(size).toBe(8);
  });

  it('returns minFontSize for zero container', () => {
    const size = computeFittingFontSize('Test', 0, 0, 24, 8);
    expect(size).toBe(8);
  });
});

describe('getAutoShrinkFontSize', () => {
  it('returns original size when autoShrink is false', () => {
    const el = makeTextElement({ fontSize: 20, autoShrink: false });
    expect(getAutoShrinkFontSize(el)).toBe(20);
  });

  it('returns original size when autoShrink is undefined', () => {
    const el = makeTextElement({ fontSize: 20 });
    expect(getAutoShrinkFontSize(el)).toBe(20);
  });

  it('returns original size when text fits', () => {
    const el = makeTextElement({
      fontSize: 14,
      autoShrink: true,
      content: 'Hi',
      width: 200,
      height: 50,
    });
    expect(getAutoShrinkFontSize(el)).toBe(14);
  });

  it('returns reduced size when text overflows with autoShrink', () => {
    const el = makeTextElement({
      fontSize: 48,
      autoShrink: true,
      content: 'This is a very long text that will overflow the container when rendered at a large font size',
      width: 100,
      height: 30,
    });
    const result = getAutoShrinkFontSize(el);
    expect(result).toBeLessThan(48);
    expect(result).toBeGreaterThanOrEqual(8);
  });
});
