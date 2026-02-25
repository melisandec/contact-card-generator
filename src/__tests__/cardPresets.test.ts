import { cardPresets, mmToPx, inToPx, pxToMm, pxToIn } from '@/lib/cardPresets';

describe('cardPresets', () => {
  it('has at least 5 presets', () => {
    expect(cardPresets.length).toBeGreaterThanOrEqual(5);
  });

  it('all presets have required fields', () => {
    for (const preset of cardPresets) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.width).toBeGreaterThan(0);
      expect(preset.height).toBeGreaterThan(0);
      expect(['px', 'mm', 'in']).toContain(preset.unit);
      expect(['business', 'social', 'custom']).toContain(preset.category);
    }
  });

  it('US business card has standard dimensions', () => {
    const us = cardPresets.find((p) => p.id === 'us-business');
    expect(us).toBeDefined();
    // 3.5" × 2" at 300dpi = 1050 × 600
    expect(us!.width).toBe(1050);
    expect(us!.height).toBe(600);
  });

  it('has unique IDs', () => {
    const ids = cardPresets.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('unit conversions', () => {
  it('converts mm to px (300dpi)', () => {
    expect(mmToPx(25.4)).toBe(300); // 1 inch in mm = 300px
  });

  it('converts inches to px (300dpi)', () => {
    expect(inToPx(1)).toBe(300);
    expect(inToPx(3.5)).toBe(1050);
    expect(inToPx(2)).toBe(600);
  });

  it('converts px to mm', () => {
    const mm = pxToMm(300);
    expect(mm).toBeCloseTo(25.4, 0);
  });

  it('converts px to inches', () => {
    const inches = pxToIn(300);
    expect(inches).toBe(1);
  });

  it('round-trips mm conversion', () => {
    const original = 85;
    const px = mmToPx(original);
    const back = pxToMm(px);
    expect(Math.abs(back - original)).toBeLessThan(1);
  });

  it('round-trips inch conversion', () => {
    const original = 3.5;
    const px = inToPx(original);
    const back = pxToIn(px);
    expect(back).toBeCloseTo(original, 1);
  });
});
