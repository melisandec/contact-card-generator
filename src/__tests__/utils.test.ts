import { cn, generateId, formatFileSize, clamp, hexToRgb, rgbToHex, truncate } from '@/lib/utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', { 'text-blue-500': true })).toBe('text-blue-500');
  });

  it('handles falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null as unknown as string)).toBe('foo');
  });
});

describe('generateId', () => {
  it('generates a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId));
    expect(ids.size).toBe(100);
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('hexToRgb', () => {
  it('converts hex to rgb', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#6366f1')).toEqual({ r: 99, g: 102, b: 241 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('invalid')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('converts rgb to hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(99, 102, 241)).toBe('#6366f1');
  });
});

describe('truncate', () => {
  it('does not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long strings', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});
