import { generateDesignVariations, AIDesignPrompt } from '@/lib/aiDesignGenerator';

describe('AI Design Generator', () => {
  const canvasWidth = 1050;
  const canvasHeight = 600;

  it('generates 3 variations for a basic prompt', () => {
    const input: AIDesignPrompt = { prompt: 'modern minimal card' };
    const variations = generateDesignVariations(input, canvasWidth, canvasHeight);
    expect(variations).toHaveLength(3);
  });

  it('each variation has a unique id and name', () => {
    const input: AIDesignPrompt = { prompt: 'elegant gold business card' };
    const variations = generateDesignVariations(input, canvasWidth, canvasHeight);
    const ids = variations.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    variations.forEach((v) => {
      expect(v.name).toBeTruthy();
    });
  });

  it('generates elements with proper structure', () => {
    const input: AIDesignPrompt = { prompt: 'tech gradient card' };
    const variations = generateDesignVariations(input, canvasWidth, canvasHeight);
    variations.forEach((v) => {
      expect(v.elements.length).toBeGreaterThan(0);
      v.elements.forEach((el) => {
        expect(el.type).toBeDefined();
        expect(typeof el.x).toBe('number');
        expect(typeof el.y).toBe('number');
        expect(typeof el.width).toBe('number');
        expect(typeof el.height).toBe('number');
      });
    });
  });

  it('respects includeElements filter', () => {
    const input: AIDesignPrompt = {
      prompt: 'minimal card',
      includeElements: {
        name: true,
        title: false,
        company: false,
        contactInfo: false,
      },
    };
    const variations = generateDesignVariations(input, canvasWidth, canvasHeight);
    variations.forEach((v) => {
      const textElements = v.elements.filter((el) => el.type === 'text');
      const hasTitle = textElements.some((el) => el.fieldType === 'title');
      const hasCompany = textElements.some((el) => el.fieldType === 'company');
      expect(hasTitle).toBe(false);
      expect(hasCompany).toBe(false);
      // Name should still be present
      const hasName = textElements.some((el) => el.fieldType === 'name');
      expect(hasName).toBe(true);
    });
  });

  it('generates valid background objects', () => {
    const input: AIDesignPrompt = { prompt: 'corporate card' };
    const variations = generateDesignVariations(input, canvasWidth, canvasHeight);
    variations.forEach((v) => {
      expect(v.background).toBeDefined();
      expect(['solid', 'gradient', 'image', 'pattern']).toContain(v.background.type);
    });
  });

  it('prioritizes matching templates based on prompt keywords', () => {
    const goldPrompt: AIDesignPrompt = { prompt: 'elegant gold card' };
    const goldVariations = generateDesignVariations(goldPrompt, canvasWidth, canvasHeight);
    // The first variation should be the gold-themed one
    expect(goldVariations[0].name).toContain('elegant-gold');
  });

  it('text elements have fieldType labels', () => {
    const input: AIDesignPrompt = { prompt: 'business card' };
    const variations = generateDesignVariations(input, canvasWidth, canvasHeight);
    variations.forEach((v) => {
      const textEls = v.elements.filter((el) => el.type === 'text');
      textEls.forEach((el) => {
        expect(el.fieldType).toBeDefined();
      });
    });
  });

  it('works with an empty includeElements object', () => {
    const input: AIDesignPrompt = {
      prompt: 'card',
      includeElements: {},
    };
    const variations = generateDesignVariations(input, canvasWidth, canvasHeight);
    expect(variations).toHaveLength(3);
    variations.forEach((v) => {
      expect(v.elements.length).toBeGreaterThan(0);
    });
  });
});
