import {
  generateEmailSignatureHTML,
  generateEmailSignaturePlainText,
  extractContactFromElements,
  type EmailSignatureData,
} from '@/lib/emailSignatureGenerator';
import type { DesignElement } from '@/types';

describe('Email Signature Generator', () => {
  const fullData: EmailSignatureData = {
    fullName: 'John Doe',
    title: 'Senior Developer',
    company: 'Tech Co',
    email: 'john@techco.com',
    phone: '+1 234 567 8900',
    website: 'https://techco.com',
    address: '123 Main St, Anytown, CA 12345',
    photoUrl: 'https://example.com/photo.jpg',
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: 'https://twitter.com/johndoe',
    github: 'https://github.com/johndoe',
    primaryColor: '#003153',
    secondaryColor: '#666666',
  };

  describe('generateEmailSignatureHTML', () => {
    it('generates valid HTML with table layout', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('<table');
      expect(html).toContain('</table>');
      expect(html).toContain('cellpadding="0"');
      expect(html).toContain('cellspacing="0"');
    });

    it('includes contact name', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('John Doe');
    });

    it('includes title and company', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('Senior Developer');
      expect(html).toContain('Tech Co');
    });

    it('includes email with mailto link', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('mailto:john@techco.com');
      expect(html).toContain('john@techco.com');
    });

    it('includes phone with tel link', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('tel:');
      expect(html).toContain('+1 234 567 8900');
    });

    it('includes website link', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('https://techco.com');
    });

    it('includes photo with img tag', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('<img');
      expect(html).toContain('https://example.com/photo.jpg');
    });

    it('includes social links', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('LinkedIn');
      expect(html).toContain('Twitter');
      expect(html).toContain('GitHub');
    });

    it('uses inline styles for email client compatibility', () => {
      const html = generateEmailSignatureHTML(fullData);
      expect(html).toContain('style="');
      // No external CSS references
      expect(html).not.toContain('<style');
      expect(html).not.toContain('class=');
    });

    it('uses default colors when not provided', () => {
      const html = generateEmailSignatureHTML({ fullName: 'Test' });
      expect(html).toContain('#003153'); // default primary
    });

    it('handles minimal data', () => {
      const html = generateEmailSignatureHTML({ fullName: 'Jane Smith' });
      expect(html).toContain('Jane Smith');
      expect(html).toContain('<table');
      expect(html).not.toContain('mailto:');
    });

    it('escapes HTML entities in names', () => {
      const html = generateEmailSignatureHTML({
        fullName: 'John <script>alert("xss")</script>',
      });
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('handles website without http prefix', () => {
      const html = generateEmailSignatureHTML({
        fullName: 'Test',
        website: 'www.example.com',
      });
      expect(html).toContain('https://www.example.com');
    });
  });

  describe('generateEmailSignaturePlainText', () => {
    it('generates plain text with all fields', () => {
      const text = generateEmailSignaturePlainText(fullData);
      expect(text).toContain('John Doe');
      expect(text).toContain('Senior Developer');
      expect(text).toContain('Tech Co');
      expect(text).toContain('Email: john@techco.com');
      expect(text).toContain('Phone: +1 234 567 8900');
      expect(text).toContain('Web: https://techco.com');
    });

    it('separates name/title from contact info', () => {
      const text = generateEmailSignaturePlainText(fullData);
      expect(text).toContain('---');
    });

    it('handles minimal data', () => {
      const text = generateEmailSignaturePlainText({ fullName: 'Jane' });
      expect(text).toBe('Jane');
    });
  });

  describe('extractContactFromElements', () => {
    it('extracts email from text elements', () => {
      const elements: DesignElement[] = [
        makeText('John Doe', 0, 0, 20),
        makeText('john@example.com', 0, 30, 14),
      ];
      const data = extractContactFromElements(elements);
      expect(data.email).toBe('john@example.com');
    });

    it('extracts phone number', () => {
      const elements: DesignElement[] = [
        makeText('Jane', 0, 0, 20),
        makeText('+1 234 567 8900', 0, 30, 14),
      ];
      const data = extractContactFromElements(elements);
      expect(data.phone).toBe('+1 234 567 8900');
    });

    it('extracts website URL', () => {
      const elements: DesignElement[] = [
        makeText('Test', 0, 0, 20),
        makeText('https://example.com', 0, 30, 14),
      ];
      const data = extractContactFromElements(elements);
      expect(data.website).toBe('https://example.com');
    });

    it('extracts name from largest text', () => {
      const elements: DesignElement[] = [
        makeText('Developer', 0, 30, 12),
        makeText('John Doe', 0, 0, 24),
      ];
      const data = extractContactFromElements(elements);
      expect(data.fullName).toBe('John Doe');
    });

    it('extracts photo from image element', () => {
      const elements: DesignElement[] = [
        makeImage('https://example.com/photo.jpg', 0, 0),
      ];
      const data = extractContactFromElements(elements);
      expect(data.photoUrl).toBe('https://example.com/photo.jpg');
    });
  });
});

function makeText(content: string, x: number, y: number, fontSize: number): DesignElement {
  return {
    id: `text-${content.slice(0, 5)}`,
    type: 'text',
    x,
    y,
    width: 200,
    height: 30,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    content,
    fontSize,
  };
}

function makeImage(src: string, x: number, y: number): DesignElement {
  return {
    id: `img-${x}-${y}`,
    type: 'image',
    x,
    y,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    src,
  };
}
