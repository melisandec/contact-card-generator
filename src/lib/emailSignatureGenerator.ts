import type { DesignElement } from '@/types';

export interface EmailSignatureData {
  fullName?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  photoUrl?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  github?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

/**
 * Extracts contact data from design elements by inspecting text content.
 * Uses heuristics to map element content to contact fields.
 */
export function extractContactFromElements(elements: DesignElement[]): EmailSignatureData {
  const data: EmailSignatureData = {};
  const textElements = elements
    .filter((el) => el.type === 'text' && el.content)
    .sort((a, b) => a.y - b.y);

  for (const el of textElements) {
    const content = el.content?.trim() ?? '';
    if (!content) continue;

    // Detect email
    if (!data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)) {
      data.email = content;
      continue;
    }
    // Detect phone
    if (!data.phone && /^[\+\(\)\d\s\-\.]{7,}$/.test(content)) {
      data.phone = content;
      continue;
    }
    // Detect website
    if (!data.website && /^(https?:\/\/|www\.)/.test(content)) {
      data.website = content;
      continue;
    }
    // Detect social links
    if (/linkedin\.com/i.test(content)) {
      data.linkedin = content;
      continue;
    }
    // First large text is likely the name
    if (!data.fullName && (el.fontSize ?? 16) >= 16) {
      data.fullName = content;
      continue;
    }
    // Title/company guesses
    if (!data.title && data.fullName) {
      data.title = content;
      continue;
    }
    if (!data.company && data.title) {
      data.company = content;
      continue;
    }
  }

  // Check for image that could be a photo
  const imageEl = elements.find((el) => el.type === 'image' && el.src);
  if (imageEl?.src) {
    data.photoUrl = imageEl.src;
  }

  return data;
}

/**
 * Generates email-client-compatible HTML signature using table-based layout
 * with inline CSS for maximum compatibility (Outlook, Gmail, Apple Mail).
 */
export function generateEmailSignatureHTML(data: EmailSignatureData): string {
  const primaryColor = data.primaryColor || '#003153';
  const secondaryColor = data.secondaryColor || '#666666';
  const fontFamily = data.fontFamily || 'Arial, Helvetica, sans-serif';

  const socialLinks: string[] = [];

  if (data.linkedin) {
    socialLinks.push(
      `<a href="${escapeHtml(data.linkedin)}" style="color:${primaryColor};text-decoration:none;font-size:12px;" target="_blank">LinkedIn</a>`
    );
  }
  if (data.twitter) {
    socialLinks.push(
      `<a href="${escapeHtml(data.twitter)}" style="color:${primaryColor};text-decoration:none;font-size:12px;" target="_blank">Twitter</a>`
    );
  }
  if (data.github) {
    socialLinks.push(
      `<a href="${escapeHtml(data.github)}" style="color:${primaryColor};text-decoration:none;font-size:12px;" target="_blank">GitHub</a>`
    );
  }
  if (data.instagram) {
    socialLinks.push(
      `<a href="${escapeHtml(data.instagram)}" style="color:${primaryColor};text-decoration:none;font-size:12px;" target="_blank">Instagram</a>`
    );
  }
  if (data.facebook) {
    socialLinks.push(
      `<a href="${escapeHtml(data.facebook)}" style="color:${primaryColor};text-decoration:none;font-size:12px;" target="_blank">Facebook</a>`
    );
  }

  let html = `<table cellpadding="0" cellspacing="0" border="0" style="font-family:${fontFamily};color:${secondaryColor};font-size:13px;line-height:1.4;">
  <tr>`;

  // Photo column
  if (data.photoUrl) {
    html += `
    <td style="vertical-align:top;padding-right:14px;">
      <img src="${escapeHtml(data.photoUrl)}" alt="${escapeHtml(data.fullName || '')}" width="80" height="80" style="border-radius:50%;display:block;width:80px;height:80px;object-fit:cover;" />
    </td>`;
  }

  // Info column
  html += `
    <td style="vertical-align:top;border-left:3px solid ${primaryColor};padding-left:14px;">`;

  if (data.fullName) {
    html += `
      <div style="font-size:16px;font-weight:bold;color:${primaryColor};margin:0 0 2px 0;">${escapeHtml(data.fullName)}</div>`;
  }

  if (data.title) {
    html += `
      <div style="font-size:13px;color:${secondaryColor};margin:0 0 1px 0;">${escapeHtml(data.title)}</div>`;
  }

  if (data.company) {
    html += `
      <div style="font-size:13px;color:${secondaryColor};font-weight:600;margin:0 0 8px 0;">${escapeHtml(data.company)}</div>`;
  }

  // Contact details
  const contactLines: string[] = [];

  if (data.email) {
    contactLines.push(
      `<a href="mailto:${escapeHtml(data.email)}" style="color:${primaryColor};text-decoration:none;">${escapeHtml(data.email)}</a>`
    );
  }
  if (data.phone) {
    contactLines.push(
      `<a href="tel:${escapeHtml(data.phone.replace(/\s/g, ''))}" style="color:${primaryColor};text-decoration:none;">${escapeHtml(data.phone)}</a>`
    );
  }
  if (data.website) {
    const href = data.website.startsWith('http') ? data.website : `https://${data.website}`;
    contactLines.push(
      `<a href="${escapeHtml(href)}" style="color:${primaryColor};text-decoration:none;" target="_blank">${escapeHtml(data.website)}</a>`
    );
  }
  if (data.address) {
    contactLines.push(`<span>${escapeHtml(data.address)}</span>`);
  }

  if (contactLines.length > 0) {
    html += `
      <div style="font-size:12px;margin:0 0 6px 0;">
        ${contactLines.join(' &nbsp;|&nbsp; ')}
      </div>`;
  }

  // Social links
  if (socialLinks.length > 0) {
    html += `
      <div style="margin-top:4px;">
        ${socialLinks.join(' &nbsp; ')}
      </div>`;
  }

  html += `
    </td>
  </tr>
</table>`;

  return html;
}

/**
 * Generates a plain text version of the email signature.
 */
export function generateEmailSignaturePlainText(data: EmailSignatureData): string {
  const headerLines: string[] = [];
  const contactLines: string[] = [];

  if (data.fullName) headerLines.push(data.fullName);
  if (data.title) headerLines.push(data.title);
  if (data.company) headerLines.push(data.company);

  if (data.email) contactLines.push(`Email: ${data.email}`);
  if (data.phone) contactLines.push(`Phone: ${data.phone}`);
  if (data.website) contactLines.push(`Web: ${data.website}`);
  if (data.address) contactLines.push(data.address);
  if (data.linkedin) contactLines.push(`LinkedIn: ${data.linkedin}`);
  if (data.twitter) contactLines.push(`Twitter: ${data.twitter}`);
  if (data.github) contactLines.push(`GitHub: ${data.github}`);

  if (headerLines.length > 0 && contactLines.length > 0) {
    return [...headerLines, '---', ...contactLines].join('\n');
  }
  return [...headerLines, ...contactLines].join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
