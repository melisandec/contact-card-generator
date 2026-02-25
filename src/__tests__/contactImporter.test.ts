import { parseVCard } from '@/lib/contactImporter';

describe('Contact Importer — parseVCard', () => {
  it('parses basic vCard with name', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
N:Doe;John;;;
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.fullName).toBe('John Doe');
    expect(data.firstName).toBe('John');
    expect(data.lastName).toBe('Doe');
  });

  it('parses company and title', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
ORG:Acme Corp;Engineering
TITLE:Lead Developer
ROLE:Engineer
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.company).toBe('Acme Corp');
    expect(data.department).toBe('Engineering');
    expect(data.title).toBe('Lead Developer');
    expect(data.role).toBe('Engineer');
  });

  it('parses phone numbers with types', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
TEL;TYPE=MOBILE;PREF=1:+1234567890
TEL;TYPE=WORK:+0987654321
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.phones).toHaveLength(2);
    expect(data.phones![0].type).toBe('mobile');
    expect(data.phones![0].number).toBe('+1234567890');
    expect(data.phones![0].preferred).toBe(true);
    expect(data.phones![1].type).toBe('work');
    expect(data.phones![1].preferred).toBe(false);
  });

  it('parses email addresses', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
EMAIL;TYPE=WORK;PREF=1:john@work.com
EMAIL;TYPE=HOME:john@home.com
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.emails).toHaveLength(2);
    expect(data.emails![0].address).toBe('john@work.com');
    expect(data.emails![0].type).toBe('work');
    expect(data.emails![0].preferred).toBe(true);
    expect(data.emails![1].address).toBe('john@home.com');
    expect(data.emails![1].type).toBe('home');
  });

  it('parses addresses', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
ADR;TYPE=WORK:;;123 Main St;Anytown;CA;12345;USA
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.addresses).toHaveLength(1);
    expect(data.addresses![0].street).toBe('123 Main St');
    expect(data.addresses![0].city).toBe('Anytown');
    expect(data.addresses![0].state).toBe('CA');
    expect(data.addresses![0].zip).toBe('12345');
    expect(data.addresses![0].country).toBe('USA');
  });

  it('parses regular websites', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
URL;TYPE=WORK:https://example.com
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.websites).toHaveLength(1);
    expect(data.websites![0].url).toBe('https://example.com');
    expect(data.websites![0].type).toBe('work');
  });

  it('detects social media URLs', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
URL;TYPE=LINKEDIN:https://linkedin.com/in/johndoe
URL;TYPE=GITHUB:https://github.com/johndoe
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.socialMedia).toHaveLength(2);
    expect(data.socialMedia![0].platform).toBe('linkedin');
    expect(data.socialMedia![0].url).toBe('https://linkedin.com/in/johndoe');
    expect(data.socialMedia![0].username).toBe('johndoe');
    expect(data.socialMedia![1].platform).toBe('github');
  });

  it('parses birthday and notes', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
BDAY:1990-01-15
NOTE:A great person
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.birthday).toBe('1990-01-15');
    expect(data.notes).toBe('A great person');
  });

  it('parses photo URL', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
PHOTO;VALUE=URL:https://example.com/photo.jpg
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.photo).toBe('https://example.com/photo.jpg');
  });

  it('parses nickname', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
NICKNAME:JD
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.nickname).toBe('JD');
  });

  it('parses custom X- fields', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
X-SKYPE:john.doe.skype
X-MY-FIELD:custom value
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.customFields).toHaveLength(2);
    expect(data.customFields![0].label).toBe('SKYPE');
    expect(data.customFields![0].value).toBe('john.doe.skype');
    expect(data.customFields![1].label).toBe('MY FIELD');
  });

  it('unescapes special characters', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test
NOTE:Line 1\\nLine 2\\; semi\\, comma
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.notes).toBe('Line 1\nLine 2; semi, comma');
  });

  it('handles folded lines (long lines split with whitespace)', () => {
    const vcard = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:John Doe\r\nNOTE:This is a very long note that has been\r\n  folded across multiple lines\r\nEND:VCARD`;

    const data = parseVCard(vcard);
    expect(data.notes).toBe('This is a very long note that has been folded across multiple lines');
  });

  it('generates fullName from N field when FN is missing', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Doe;John;M;;
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.fullName).toBe('John M Doe');
  });

  it('parses a full real-world vCard', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Doe;John;M;Mr.;Jr.
FN:John Doe
ORG:Tech Co;Engineering
TITLE:Developer
TEL;TYPE=MOBILE;PREF=1:+1234567890
EMAIL;TYPE=WORK;PREF=1:john@techco.com
ADR;TYPE=WORK:;;123 Main St;Anytown;CA;12345;USA
URL;TYPE=WORK:https://techco.com
URL;TYPE=LINKEDIN:https://linkedin.com/in/johndoe
BDAY:1990-01-15
NOTE:A great developer
PHOTO;VALUE=URL:https://example.com/photo.jpg
NICKNAME:JD
X-SKYPE:john.doe.skype
END:VCARD`;

    const data = parseVCard(vcard);
    expect(data.fullName).toBe('John Doe');
    expect(data.firstName).toBe('John');
    expect(data.lastName).toBe('Doe');
    expect(data.company).toBe('Tech Co');
    expect(data.department).toBe('Engineering');
    expect(data.title).toBe('Developer');
    expect(data.phones).toHaveLength(1);
    expect(data.emails).toHaveLength(1);
    expect(data.addresses).toHaveLength(1);
    expect(data.websites).toHaveLength(1);
    expect(data.socialMedia).toHaveLength(1);
    expect(data.birthday).toBe('1990-01-15');
    expect(data.notes).toBe('A great developer');
    expect(data.photo).toBe('https://example.com/photo.jpg');
    expect(data.nickname).toBe('JD');
    expect(data.customFields).toHaveLength(1);
  });
});
