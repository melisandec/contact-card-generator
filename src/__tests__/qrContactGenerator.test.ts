import { QRContactGenerator } from '@/lib/qrContactGenerator';
import type { ContactData } from '@/types';

describe('QRContactGenerator', () => {
  const fullContact: ContactData = {
    fullName: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'M',
    prefix: 'Mr.',
    suffix: 'Jr.',
    nickname: 'JD',
    title: 'Developer',
    company: 'Tech Co',
    department: 'Engineering',
    role: 'Lead',
    phones: [
      { type: 'mobile', number: '+1234567890', preferred: true },
      { type: 'work', number: '+0987654321' },
    ],
    emails: [
      { type: 'work', address: 'john@techco.com', preferred: true },
      { type: 'personal', address: 'john@home.com' },
    ],
    addresses: [
      {
        type: 'work',
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA',
      },
    ],
    websites: [{ type: 'work', url: 'https://techco.com' }],
    socialMedia: [
      { platform: 'linkedin', username: 'johndoe', url: 'https://linkedin.com/in/johndoe' },
      { platform: 'github', username: 'johndoe' },
    ],
    birthday: '1990-01-15',
    notes: 'A great developer',
    photo: 'https://example.com/photo.jpg',
    customFields: [{ label: 'Skype', value: 'john.doe.skype' }],
  };

  describe('generateVCard', () => {
    it('generates valid vCard format with required fields', () => {
      const contact: ContactData = {
        fullName: 'John Doe',
        title: 'Developer',
        company: 'Tech Co',
        phones: [{ type: 'mobile', number: '+1234567890' }],
      };

      const generator = new QRContactGenerator(contact);
      const vcard = generator.generateVCard();

      expect(vcard).toContain('BEGIN:VCARD');
      expect(vcard).toContain('VERSION:3.0');
      expect(vcard).toContain('FN:John Doe');
      expect(vcard).toContain('TITLE:Developer');
      expect(vcard).toContain('ORG:Tech Co');
      expect(vcard).toContain('TEL;TYPE=MOBILE:+1234567890');
      expect(vcard).toContain('END:VCARD');
    });

    it('generates vCard with all fields populated', () => {
      const generator = new QRContactGenerator(fullContact);
      const vcard = generator.generateVCard();

      expect(vcard).toContain('N:Doe;John;M;Mr.;Jr.');
      expect(vcard).toContain('FN:John Doe');
      expect(vcard).toContain('ORG:Tech Co;Engineering');
      expect(vcard).toContain('TITLE:Developer');
      expect(vcard).toContain('ROLE:Lead');
      expect(vcard).toContain('TEL;TYPE=MOBILE;PREF=1:+1234567890');
      expect(vcard).toContain('TEL;TYPE=WORK:+0987654321');
      expect(vcard).toContain('EMAIL;TYPE=WORK;PREF=1:john@techco.com');
      expect(vcard).toContain('EMAIL;TYPE=PERSONAL:john@home.com');
      expect(vcard).toContain('ADR;TYPE=WORK:;;123 Main St;Anytown;CA;12345;USA');
      expect(vcard).toContain('URL;TYPE=WORK:https://techco.com');
      expect(vcard).toContain('URL;TYPE=LINKEDIN:https://linkedin.com/in/johndoe');
      expect(vcard).toContain('BDAY:1990-01-15');
      expect(vcard).toContain('NOTE:A great developer');
      expect(vcard).toContain('PHOTO;VALUE=URL:https://example.com/photo.jpg');
      expect(vcard).toContain('NICKNAME:JD');
      expect(vcard).toContain('X-SKYPE:john.doe.skype');
    });

    it('handles minimal contact data', () => {
      const contact: ContactData = { fullName: 'Jane Smith' };
      const generator = new QRContactGenerator(contact);
      const vcard = generator.generateVCard();

      expect(vcard).toContain('BEGIN:VCARD');
      expect(vcard).toContain('FN:Jane Smith');
      expect(vcard).toContain('END:VCARD');
      expect(vcard).not.toContain('TEL');
      expect(vcard).not.toContain('EMAIL');
      expect(vcard).not.toContain('ADR');
    });

    it('handles special characters in names', () => {
      const contact: ContactData = {
        fullName: 'José María García',
      };
      const generator = new QRContactGenerator(contact);
      const vcard = generator.generateVCard();

      expect(vcard).toContain('FN:José María García');
    });

    it('omits social media without URL', () => {
      const contact: ContactData = {
        fullName: 'Test',
        socialMedia: [{ platform: 'github', username: 'test' }],
      };
      const generator = new QRContactGenerator(contact);
      const vcard = generator.generateVCard();

      expect(vcard).not.toContain('URL;TYPE=GITHUB');
    });

    it('includes social media with URL', () => {
      const contact: ContactData = {
        fullName: 'Test',
        socialMedia: [
          { platform: 'linkedin', username: 'test', url: 'https://linkedin.com/in/test' },
        ],
      };
      const generator = new QRContactGenerator(contact);
      const vcard = generator.generateVCard();

      expect(vcard).toContain('URL;TYPE=LINKEDIN:https://linkedin.com/in/test');
    });

    it('uses CRLF line endings', () => {
      const contact: ContactData = { fullName: 'Test' };
      const generator = new QRContactGenerator(contact);
      const vcard = generator.generateVCard();

      const lines = vcard.split('\r\n');
      expect(lines.length).toBeGreaterThan(3);
    });

    it('handles company without department', () => {
      const contact: ContactData = { fullName: 'Test', company: 'Acme Inc' };
      const generator = new QRContactGenerator(contact);
      const vcard = generator.generateVCard();

      expect(vcard).toContain('ORG:Acme Inc\r\n');
      expect(vcard).not.toContain('ORG:Acme Inc;');
    });

    it('handles custom fields with spaces in labels', () => {
      const contact: ContactData = {
        fullName: 'Test',
        customFields: [{ label: 'My Custom Field', value: 'custom value' }],
      };
      const generator = new QRContactGenerator(contact);
      const vcard = generator.generateVCard();

      expect(vcard).toContain('X-MY-CUSTOM-FIELD:custom value');
    });
  });

  describe('generateMeCard', () => {
    it('generates valid meCard format', () => {
      const contact: ContactData = {
        fullName: 'John Doe',
        title: 'Developer',
        company: 'Tech Co',
        phones: [{ type: 'mobile', number: '+1234567890' }],
        emails: [{ type: 'work', address: 'john@techco.com' }],
      };

      const generator = new QRContactGenerator(contact, { format: 'mecard' });
      const mecard = generator.generateMeCard();

      expect(mecard).toContain('MECARD:');
      expect(mecard).toContain('N:John Doe;');
      expect(mecard).toContain('ORG:Tech Co;');
      expect(mecard).toContain('TITLE:Developer;');
      expect(mecard).toContain('TEL:+1234567890;');
      expect(mecard).toContain('EMAIL:john@techco.com;');
      expect(mecard).toMatch(/;$/);
    });

    it('handles minimal contact data', () => {
      const contact: ContactData = { fullName: 'Jane Smith' };
      const generator = new QRContactGenerator(contact, { format: 'mecard' });
      const mecard = generator.generateMeCard();

      expect(mecard).toContain('N:Jane Smith;');
      expect(mecard).not.toContain('TEL:');
      expect(mecard).not.toContain('EMAIL:');
    });

    it('formats addresses as comma-separated parts', () => {
      const contact: ContactData = {
        fullName: 'Test',
        addresses: [
          { type: 'work', street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345', country: 'USA' },
        ],
      };
      const generator = new QRContactGenerator(contact, { format: 'mecard' });
      const mecard = generator.generateMeCard();

      expect(mecard).toContain('ADR:123 Main St, Anytown, CA, 12345, USA;');
    });
  });

  describe('getQRDataString', () => {
    it('returns vCard format by default', () => {
      const contact: ContactData = { fullName: 'John Doe' };
      const generator = new QRContactGenerator(contact);
      const result = generator.getQRDataString();

      expect(result).toContain('BEGIN:VCARD');
    });

    it('returns meCard format when configured', () => {
      const contact: ContactData = { fullName: 'John Doe' };
      const generator = new QRContactGenerator(contact, { format: 'mecard' });
      const result = generator.getQRDataString();

      expect(result).toContain('MECARD:');
      expect(result).not.toContain('BEGIN:VCARD');
    });

    it('meCard format is smaller than vCard for same data', () => {
      const contact: ContactData = { fullName: 'Jane Smith' };
      const vcardGen = new QRContactGenerator(contact, { format: 'vcard' });
      const mecardGen = new QRContactGenerator(contact, { format: 'mecard' });

      expect(mecardGen.getQRDataString().length).toBeLessThan(
        vcardGen.getQRDataString().length
      );
    });
  });

  describe('constructor options', () => {
    it('uses default options when none provided', () => {
      const generator = new QRContactGenerator({ fullName: 'Test' });
      expect(generator.options.format).toBe('vcard');
      expect(generator.options.errorCorrection).toBe('M');
      expect(generator.options.size).toBe(200);
    });

    it('merges provided options with defaults', () => {
      const generator = new QRContactGenerator(
        { fullName: 'Test' },
        { format: 'mecard', size: 300 }
      );
      expect(generator.options.format).toBe('mecard');
      expect(generator.options.size).toBe(300);
      expect(generator.options.errorCorrection).toBe('M');
    });
  });
});
