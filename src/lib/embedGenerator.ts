import type { DesignElement } from '@/types';

export interface EmbedOptions {
  mode: 'static' | 'interactive';
  imageUrl?: string;
  width?: number;
  height?: number;
  linkUrl?: string;
  vcardUrl?: string;
}

/**
 * Generates an HTML snippet for embedding a contact card on external websites.
 */
export function generateEmbedSnippet(
  elements: DesignElement[],
  options: EmbedOptions
): string {
  const width = options.width || 525;
  const height = options.height || 300;

  if (options.mode === 'static') {
    return generateStaticEmbed(options, width, height);
  }

  return generateInteractiveEmbed(elements, options, width, height);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateStaticEmbed(
  options: EmbedOptions,
  width: number,
  height: number
): string {
  const imgSrc = options.imageUrl || '';
  const linkUrl = options.linkUrl || '#';

  let html = `<!-- CardCrafter Embed -->\n`;
  html += `<div style="max-width:${width}px;margin:0 auto;">\n`;

  if (linkUrl !== '#') {
    html += `  <a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;">\n`;
  }

  html += `    <img src="${escapeHtml(imgSrc)}" alt="Contact Card" style="width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);" />\n`;

  if (linkUrl !== '#') {
    html += `  </a>\n`;
  }

  html += `</div>\n`;
  html += `<!-- End CardCrafter Embed -->`;

  return html;
}

function generateInteractiveEmbed(
  elements: DesignElement[],
  options: EmbedOptions,
  width: number,
  height: number
): string {
  // Extract contact info from elements
  const textElements = elements
    .filter((el) => el.type === 'text' && el.visible && el.content)
    .sort((a, b) => a.y - b.y);

  let name = '';
  let title = '';
  let details: string[] = [];

  for (const el of textElements) {
    const content = el.content?.trim() ?? '';
    if (!content) continue;

    if (!name && (el.fontSize ?? 16) >= 18) {
      name = content;
    } else if (!title && name) {
      title = content;
    } else {
      details.push(content);
    }
  }

  const vcardUrl = options.vcardUrl;
  const primaryColor = '#003153';

  let html = `<!-- CardCrafter Interactive Embed -->\n`;
  html += `<div style="max-width:${width}px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.12);border:1px solid #e2e8f0;">\n`;

  // Card body
  html += `  <div style="padding:24px;background:white;">\n`;

  if (name) {
    html += `    <div style="font-size:20px;font-weight:bold;color:${primaryColor};margin-bottom:4px;">${escapeHtml(name)}</div>\n`;
  }
  if (title) {
    html += `    <div style="font-size:14px;color:#64748b;margin-bottom:16px;">${escapeHtml(title)}</div>\n`;
  }

  for (const detail of details) {
    // Detect and linkify emails and URLs
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(detail)) {
      html += `    <div style="font-size:13px;color:#475569;margin-bottom:4px;"><a href="mailto:${escapeHtml(detail)}" style="color:${primaryColor};text-decoration:none;">${escapeHtml(detail)}</a></div>\n`;
    } else if (/^(https?:\/\/|www\.)/.test(detail)) {
      const href = detail.startsWith('http') ? detail : `https://${detail}`;
      html += `    <div style="font-size:13px;color:#475569;margin-bottom:4px;"><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="color:${primaryColor};text-decoration:none;">${escapeHtml(detail)}</a></div>\n`;
    } else {
      html += `    <div style="font-size:13px;color:#475569;margin-bottom:4px;">${escapeHtml(detail)}</div>\n`;
    }
  }

  // Save contact button
  if (vcardUrl) {
    html += `    <div style="margin-top:16px;">\n`;
    html += `      <a href="${escapeHtml(vcardUrl)}" download style="display:inline-block;padding:8px 16px;background:${primaryColor};color:white;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;">Save Contact</a>\n`;
    html += `    </div>\n`;
  }

  html += `  </div>\n`;
  html += `</div>\n`;
  html += `<!-- End CardCrafter Interactive Embed -->`;

  return html;
}
