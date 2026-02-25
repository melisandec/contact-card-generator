import type { ContactData, ContactPhone, ContactEmail, ContactWebsite, ContactSocialMedia } from '@/types';

/**
 * Parses a vCard string and returns structured ContactData.
 * Supports vCard 3.0 and 4.0 formats.
 */
export function parseVCard(vcardString: string): ContactData {
  const lines = unfoldLines(vcardString);
  const data: ContactData = { fullName: '' };

  for (const line of lines) {
    const { property, params, value } = parseLine(line);
    if (!property || !value) continue;

    switch (property.toUpperCase()) {
      case 'FN':
        data.fullName = unescapeVCard(value);
        break;

      case 'N': {
        const nameParts = value.split(';');
        data.lastName = unescapeVCard(nameParts[0] || '');
        data.firstName = unescapeVCard(nameParts[1] || '');
        data.middleName = unescapeVCard(nameParts[2] || '');
        data.prefix = unescapeVCard(nameParts[3] || '');
        data.suffix = unescapeVCard(nameParts[4] || '');
        if (!data.fullName) {
          data.fullName = [data.firstName, data.middleName, data.lastName]
            .filter(Boolean)
            .join(' ');
        }
        break;
      }

      case 'ORG': {
        const orgParts = value.split(';');
        data.company = unescapeVCard(orgParts[0] || '');
        data.department = unescapeVCard(orgParts[1] || '');
        break;
      }

      case 'TITLE':
        data.title = unescapeVCard(value);
        break;

      case 'ROLE':
        data.role = unescapeVCard(value);
        break;

      case 'TEL': {
        const phoneType = extractType(params) || 'other';
        const preferred = isPreferred(params);
        const phone: ContactPhone = {
          type: mapPhoneType(phoneType),
          number: value.replace(/[^\d\+\-\(\)\s]/g, ''),
          preferred,
        };
        if (!data.phones) data.phones = [];
        data.phones.push(phone);
        break;
      }

      case 'EMAIL': {
        const emailType = extractType(params) || 'other';
        const emailPref = isPreferred(params);
        const email: ContactEmail = {
          type: mapEmailType(emailType),
          address: value,
          preferred: emailPref,
        };
        if (!data.emails) data.emails = [];
        data.emails.push(email);
        break;
      }

      case 'ADR': {
        const addrParts = value.split(';');
        const address = {
          type: mapAddressType(extractType(params) || 'other'),
          street: unescapeVCard(addrParts[2] || ''),
          city: unescapeVCard(addrParts[3] || ''),
          state: unescapeVCard(addrParts[4] || ''),
          zip: unescapeVCard(addrParts[5] || ''),
          country: unescapeVCard(addrParts[6] || ''),
        };
        if (!data.addresses) data.addresses = [];
        data.addresses.push(address);
        break;
      }

      case 'URL': {
        const urlType = extractType(params);
        // Check if it's a social media URL
        const socialPlatform = detectSocialPlatform(value);
        if (socialPlatform) {
          if (!data.socialMedia) data.socialMedia = [];
          const social: ContactSocialMedia = {
            platform: socialPlatform,
            username: extractUsernameFromUrl(value, socialPlatform),
            url: value,
          };
          data.socialMedia.push(social);
        } else {
          if (!data.websites) data.websites = [];
          const site: ContactWebsite = {
            type: mapWebsiteType(urlType || 'other'),
            url: value,
          };
          data.websites.push(site);
        }
        break;
      }

      case 'BDAY':
        data.birthday = value;
        break;

      case 'NOTE':
        data.notes = unescapeVCard(value);
        break;

      case 'PHOTO': {
        // Could be a URL or base64
        if (value.startsWith('http') || value.startsWith('data:')) {
          data.photo = value;
        } else if (params.some((p) => p.toUpperCase().includes('VALUE=URL') || p.toUpperCase().includes('VALUE=URI'))) {
          data.photo = value;
        }
        break;
      }

      case 'NICKNAME':
        data.nickname = unescapeVCard(value);
        break;

      default: {
        // Handle X- custom fields
        if (property.toUpperCase().startsWith('X-')) {
          const label = property.substring(2).replace(/-/g, ' ');
          if (!data.customFields) data.customFields = [];
          data.customFields.push({ label, value: unescapeVCard(value) });
        }
        break;
      }
    }
  }

  return data;
}

/**
 * Reads a vCard file and returns the parsed content.
 */
export function readVCardFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// --- helpers ---

function unfoldLines(text: string): string[] {
  // vCard allows long lines to be folded (continuation with leading whitespace)
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  return unfolded
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

interface ParsedLine {
  property: string;
  params: string[];
  value: string;
}

function parseLine(line: string): ParsedLine {
  // e.g. TEL;TYPE=WORK;PREF=1:+1234567890
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return { property: '', params: [], value: '' };

  const beforeColon = line.substring(0, colonIndex);
  const value = line.substring(colonIndex + 1);

  const parts = beforeColon.split(';');
  const property = parts[0];
  const params = parts.slice(1);

  return { property, params, value };
}

function extractType(params: string[]): string {
  for (const p of params) {
    const upper = p.toUpperCase();
    if (upper.startsWith('TYPE=')) {
      return upper.substring(5).split(',')[0];
    }
    // Some vCards just use the type directly: TEL;WORK:...
    if (['WORK', 'HOME', 'MOBILE', 'FAX', 'PAGER', 'PERSONAL', 'PORTFOLIO'].includes(upper)) {
      return upper;
    }
  }
  return '';
}

function isPreferred(params: string[]): boolean {
  return params.some((p) => {
    const upper = p.toUpperCase();
    return upper === 'PREF' || upper.startsWith('PREF=') || upper.includes('PREF');
  });
}

function mapPhoneType(type: string): ContactPhone['type'] {
  const t = type.toUpperCase();
  if (t === 'CELL' || t === 'MOBILE') return 'mobile';
  if (t === 'WORK') return 'work';
  if (t === 'HOME') return 'home';
  if (t === 'FAX') return 'fax';
  if (t === 'PAGER') return 'pager';
  return 'other';
}

function mapEmailType(type: string): ContactEmail['type'] {
  const t = type.toUpperCase();
  if (t === 'WORK') return 'work';
  if (t === 'HOME') return 'home';
  if (t === 'PERSONAL') return 'personal';
  return 'other';
}

function mapAddressType(type: string): 'work' | 'home' | 'other' {
  const t = type.toUpperCase();
  if (t === 'WORK') return 'work';
  if (t === 'HOME') return 'home';
  return 'other';
}

function mapWebsiteType(type: string): ContactWebsite['type'] {
  const t = type.toUpperCase();
  if (t === 'WORK') return 'work';
  if (t === 'PERSONAL') return 'personal';
  if (t === 'PORTFOLIO') return 'portfolio';
  return 'other';
}

function detectSocialPlatform(url: string): ContactSocialMedia['platform'] | null {
  const lower = url.toLowerCase();
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('facebook.com')) return 'facebook';
  if (lower.includes('github.com')) return 'github';
  return null;
}

function extractUsernameFromUrl(url: string, platform: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    // Remove common prefixes like 'in' for LinkedIn
    if (platform === 'linkedin' && pathParts[0] === 'in') {
      return pathParts[1] || pathParts[0];
    }
    return pathParts[pathParts.length - 1] || url;
  } catch {
    return url;
  }
}

function unescapeVCard(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\;/g, ';')
    .replace(/\\,/g, ',')
    .replace(/\\\\/g, '\\');
}
