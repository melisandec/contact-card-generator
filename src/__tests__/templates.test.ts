import templates from '@/data/templates.json';

describe('templates', () => {
  it('contains luxury-realty-double-01 template', () => {
    const template = templates.find((t) => t.id === 'luxury-realty-double-01');
    expect(template).toBeDefined();
    expect(template!.name).toBe('Luxury Estates Double-Sided');
    expect(template!.category).toBe('real-estate');
    expect(template!.width).toBe(1050);
    expect(template!.height).toBe(600);
    expect(template!.background).toEqual({ type: 'solid', color: '#FFFFFF' });
    expect(template!.elements.length).toBeGreaterThan(0);
  });

  it('contains luxury-realty-skyline-02 template', () => {
    const template = templates.find((t) => t.id === 'luxury-realty-skyline-02');
    expect(template).toBeDefined();
    expect(template!.name).toBe('Miami Skyline Luxury');
    expect(template!.category).toBe('real-estate');
    expect(template!.width).toBe(1050);
    expect(template!.height).toBe(600);
    expect(template!.background).toEqual({ type: 'solid', color: '#F5F5F5' });
    expect(template!.elements.length).toBeGreaterThan(0);
  });

  it('has unique template ids', () => {
    const ids = templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('luxury-realty-double-01 has expected elements', () => {
    const template = templates.find((t) => t.id === 'luxury-realty-double-01')!;
    const textElements = template.elements.filter((e) => e.type === 'text');
    const shapeElements = template.elements.filter((e) => e.type === 'shape');

    expect(textElements.length).toBe(9);
    expect(shapeElements.length).toBe(4);

    const nameEl = textElements.find((e) => e.content === 'AGENT FULL NAME');
    expect(nameEl).toBeDefined();
    expect(nameEl!.fontFamily).toBe('Cormorant Garamond');
    expect(nameEl!.fontSize).toBe(48);
  });

  it('luxury-realty-skyline-02 has expected elements', () => {
    const template = templates.find((t) => t.id === 'luxury-realty-skyline-02')!;
    const textElements = template.elements.filter((e) => e.type === 'text');
    const shapeElements = template.elements.filter((e) => e.type === 'shape');

    expect(textElements.length).toBe(11);
    expect(shapeElements.length).toBe(3);

    const nameEl = textElements.find((e) => e.content === 'AGENT FULL NAME');
    expect(nameEl).toBeDefined();
    expect(nameEl!.fontFamily).toBe('Playfair Display');
    expect(nameEl!.fontSize).toBe(52);
  });

  it('all templates have required fields', () => {
    templates.forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.width).toBeGreaterThan(0);
      expect(t.height).toBeGreaterThan(0);
      expect(t.background).toBeDefined();
      expect(Array.isArray(t.elements)).toBe(true);
    });
  });

  it('all elements have required fields', () => {
    templates.forEach((t) => {
      t.elements.forEach((el) => {
        expect(el.id).toBeTruthy();
        expect(el.type).toBeTruthy();
        expect(typeof el.x).toBe('number');
        expect(typeof el.y).toBe('number');
        expect(typeof el.width).toBe('number');
        expect(typeof el.height).toBe('number');
        expect(typeof el.zIndex).toBe('number');
      });
    });
  });

  it('real-estate category has exactly 2 templates', () => {
    const realEstateTemplates = templates.filter((t) => t.category === 'real-estate');
    expect(realEstateTemplates.length).toBe(2);
  });
});
