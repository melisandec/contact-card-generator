import { generateEmbedSnippet } from '@/lib/embedGenerator';
import type { DesignElement } from '@/types';

function makeElement(overrides: Partial<DesignElement> = {}): DesignElement {
  return {
    id: 'test',
    type: 'text',
    x: 0,
    y: 0,
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

describe('generateEmbedSnippet', () => {
  describe('static mode', () => {
    it('generates an img tag', () => {
      const html = generateEmbedSnippet([], {
        mode: 'static',
        imageUrl: 'https://example.com/card.png',
      });
      expect(html).toContain('<img');
      expect(html).toContain('https://example.com/card.png');
    });

    it('wraps in a link when linkUrl is provided', () => {
      const html = generateEmbedSnippet([], {
        mode: 'static',
        imageUrl: 'https://example.com/card.png',
        linkUrl: 'https://example.com',
      });
      expect(html).toContain('<a href');
      expect(html).toContain('https://example.com');
    });

    it('uses inline styles only', () => {
      const html = generateEmbedSnippet([], {
        mode: 'static',
        imageUrl: 'https://example.com/card.png',
      });
      expect(html).toContain('style="');
      expect(html).not.toContain('<style');
      expect(html).not.toContain('class=');
    });

    it('includes CardCrafter comment markers', () => {
      const html = generateEmbedSnippet([], { mode: 'static' });
      expect(html).toContain('CardCrafter Embed');
      expect(html).toContain('End CardCrafter Embed');
    });
  });

  describe('interactive mode', () => {
    it('extracts name from large text elements', () => {
      const elements: DesignElement[] = [
        makeElement({ content: 'John Doe', fontSize: 24, y: 10 }),
        makeElement({ content: 'Developer', fontSize: 14, y: 50 }),
      ];
      const html = generateEmbedSnippet(elements, { mode: 'interactive' });
      expect(html).toContain('John Doe');
      expect(html).toContain('Developer');
    });

    it('linkifies email addresses', () => {
      const elements: DesignElement[] = [
        makeElement({ content: 'John', fontSize: 20, y: 10 }),
        makeElement({ content: 'Title', fontSize: 14, y: 50 }),
        makeElement({ content: 'john@example.com', fontSize: 12, y: 80 }),
      ];
      const html = generateEmbedSnippet(elements, { mode: 'interactive' });
      expect(html).toContain('mailto:john@example.com');
    });

    it('linkifies URLs', () => {
      const elements: DesignElement[] = [
        makeElement({ content: 'Name', fontSize: 20, y: 10 }),
        makeElement({ content: 'Title', fontSize: 14, y: 50 }),
        makeElement({ content: 'https://example.com', fontSize: 12, y: 80 }),
      ];
      const html = generateEmbedSnippet(elements, { mode: 'interactive' });
      expect(html).toContain('href="https://example.com"');
    });

    it('includes save contact button when vcardUrl is provided', () => {
      const elements: DesignElement[] = [
        makeElement({ content: 'John', fontSize: 20, y: 10 }),
      ];
      const html = generateEmbedSnippet(elements, {
        mode: 'interactive',
        vcardUrl: 'https://example.com/contact.vcf',
      });
      expect(html).toContain('Save Contact');
      expect(html).toContain('https://example.com/contact.vcf');
    });

    it('escapes HTML in text content', () => {
      const elements: DesignElement[] = [
        makeElement({ content: '<script>alert("xss")</script>', fontSize: 20, y: 10 }),
      ];
      const html = generateEmbedSnippet(elements, { mode: 'interactive' });
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });
});
