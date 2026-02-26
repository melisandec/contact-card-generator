import { DesignElement, CanvasBackground } from '@/types';

export interface AIDesignVariation {
  id: string;
  name: string;
  elements: Omit<DesignElement, 'id'>[];
  background: CanvasBackground;
}

export interface AIDesignPrompt {
  prompt: string;
  includeElements?: {
    photo?: boolean;
    name?: boolean;
    title?: boolean;
    company?: boolean;
    contactInfo?: boolean;
    qrCode?: boolean;
  };
}

interface ParsedDesign {
  theme: string;
  colors: string[];
  fonts: { heading: string; body: string };
  layout: 'left' | 'right' | 'top' | 'center';
  elements: Array<{
    type: 'text' | 'shape' | 'image';
    fieldType?: DesignElement['fieldType'];
    content?: string;
    style: {
      fontWeight?: string;
      fontSize?: number;
      color?: string;
      fill?: string;
    };
  }>;
}

const DESIGN_TEMPLATES: ParsedDesign[] = [
  {
    theme: 'modern-minimal',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#ffffff'],
    fonts: { heading: 'Inter', body: 'Inter' },
    layout: 'left',
    elements: [
      { type: 'shape', content: undefined, style: { fill: '#1a1a2e' } },
      { type: 'text', fieldType: 'name', content: 'John Doe', style: { fontWeight: '700', fontSize: 32, color: '#ffffff' } },
      { type: 'text', fieldType: 'title', content: 'Software Engineer', style: { fontWeight: '400', fontSize: 16, color: '#e94560' } },
      { type: 'text', fieldType: 'company', content: 'Acme Corp', style: { fontWeight: '400', fontSize: 14, color: '#cccccc' } },
      { type: 'text', fieldType: 'email', content: 'john@acme.com', style: { fontWeight: '400', fontSize: 12, color: '#888888' } },
      { type: 'text', fieldType: 'phone', content: '+1 (555) 123-4567', style: { fontWeight: '400', fontSize: 12, color: '#888888' } },
    ],
  },
  {
    theme: 'elegant-gold',
    colors: ['#0a0a0a', '#1c1c1c', '#c5a572', '#f5f0e8', '#ffffff'],
    fonts: { heading: 'Georgia', body: 'Arial' },
    layout: 'center',
    elements: [
      { type: 'shape', content: undefined, style: { fill: '#c5a572' } },
      { type: 'text', fieldType: 'name', content: 'Jane Smith', style: { fontWeight: '700', fontSize: 34, color: '#0a0a0a' } },
      { type: 'text', fieldType: 'title', content: 'Creative Director', style: { fontWeight: '400', fontSize: 16, color: '#1c1c1c' } },
      { type: 'text', fieldType: 'company', content: 'Design Studio', style: { fontWeight: '400', fontSize: 14, color: '#555555' } },
      { type: 'text', fieldType: 'email', content: 'jane@studio.com', style: { fontWeight: '400', fontSize: 12, color: '#777777' } },
      { type: 'text', fieldType: 'phone', content: '+1 (555) 987-6543', style: { fontWeight: '400', fontSize: 12, color: '#777777' } },
    ],
  },
  {
    theme: 'tech-gradient',
    colors: ['#667eea', '#764ba2', '#f093fb', '#ffffff', '#2d3748'],
    fonts: { heading: 'Helvetica', body: 'Verdana' },
    layout: 'right',
    elements: [
      { type: 'shape', content: undefined, style: { fill: '#667eea' } },
      { type: 'text', fieldType: 'name', content: 'Alex Chen', style: { fontWeight: '700', fontSize: 30, color: '#ffffff' } },
      { type: 'text', fieldType: 'title', content: 'Full Stack Developer', style: { fontWeight: '400', fontSize: 15, color: '#f093fb' } },
      { type: 'text', fieldType: 'company', content: 'TechStart Inc.', style: { fontWeight: '400', fontSize: 13, color: '#dddddd' } },
      { type: 'text', fieldType: 'email', content: 'alex@techstart.io', style: { fontWeight: '400', fontSize: 12, color: '#bbbbbb' } },
      { type: 'text', fieldType: 'website', content: 'techstart.io', style: { fontWeight: '400', fontSize: 12, color: '#bbbbbb' } },
    ],
  },
  {
    theme: 'nature-organic',
    colors: ['#2d6a4f', '#40916c', '#95d5b2', '#d8f3dc', '#1b4332'],
    fonts: { heading: 'Georgia', body: 'Verdana' },
    layout: 'left',
    elements: [
      { type: 'shape', content: undefined, style: { fill: '#d8f3dc' } },
      { type: 'text', fieldType: 'name', content: 'Sarah Green', style: { fontWeight: '700', fontSize: 32, color: '#1b4332' } },
      { type: 'text', fieldType: 'title', content: 'Landscape Architect', style: { fontWeight: '400', fontSize: 16, color: '#2d6a4f' } },
      { type: 'text', fieldType: 'company', content: 'EcoDesign Co.', style: { fontWeight: '400', fontSize: 14, color: '#40916c' } },
      { type: 'text', fieldType: 'email', content: 'sarah@ecodesign.com', style: { fontWeight: '400', fontSize: 12, color: '#555555' } },
      { type: 'text', fieldType: 'phone', content: '+1 (555) 456-7890', style: { fontWeight: '400', fontSize: 12, color: '#555555' } },
    ],
  },
  {
    theme: 'bold-corporate',
    colors: ['#003153', '#00509d', '#00a8e8', '#f8f9fa', '#ffffff'],
    fonts: { heading: 'Arial', body: 'Helvetica' },
    layout: 'center',
    elements: [
      { type: 'shape', content: undefined, style: { fill: '#003153' } },
      { type: 'text', fieldType: 'name', content: 'Michael Brown', style: { fontWeight: '700', fontSize: 34, color: '#ffffff' } },
      { type: 'text', fieldType: 'title', content: 'Chief Executive Officer', style: { fontWeight: '400', fontSize: 16, color: '#00a8e8' } },
      { type: 'text', fieldType: 'company', content: 'Global Solutions', style: { fontWeight: '400', fontSize: 14, color: '#cccccc' } },
      { type: 'text', fieldType: 'email', content: 'michael@global.com', style: { fontWeight: '400', fontSize: 12, color: '#999999' } },
      { type: 'text', fieldType: 'phone', content: '+1 (555) 000-1234', style: { fontWeight: '400', fontSize: 12, color: '#999999' } },
    ],
  },
];

function matchPromptToTemplates(prompt: string): ParsedDesign[] {
  const lower = prompt.toLowerCase();
  const scored = DESIGN_TEMPLATES.map((template) => {
    let score = 0;
    const themeWords = template.theme.split('-');
    themeWords.forEach((word) => {
      if (lower.includes(word)) score += 3;
    });
    template.colors.forEach((color) => {
      if (lower.includes(color)) score += 2;
    });
    if (lower.includes('gold') && template.theme.includes('gold')) score += 5;
    if (lower.includes('minimal') && template.theme.includes('minimal')) score += 5;
    if (lower.includes('tech') && template.theme.includes('tech')) score += 5;
    if (lower.includes('nature') && template.theme.includes('nature')) score += 5;
    if (lower.includes('corporate') && template.theme.includes('corporate')) score += 5;
    if (lower.includes('elegant') && template.theme.includes('elegant')) score += 5;
    if (lower.includes('bold') && template.theme.includes('bold')) score += 4;
    if (lower.includes('blue') && template.colors.some((c) => c.includes('00'))) score += 2;
    if (lower.includes('green') && template.colors.some((c) => c.includes('6a') || c.includes('91'))) score += 2;
    if (lower.includes('dark') && template.colors[0].match(/^#[0-3]/)) score += 2;
    if (lower.includes('light') && template.colors.some((c) => c.match(/^#[d-f]/i))) score += 2;
    // Every template gets at least 1 base score so we always return results
    score += 1;
    return { template, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.template);
}

function buildVariation(
  parsed: ParsedDesign,
  canvasWidth: number,
  canvasHeight: number,
  variationIndex: number,
  includeElements?: AIDesignPrompt['includeElements'],
): AIDesignVariation {
  const elements: Omit<DesignElement, 'id'>[] = [];
  const layout = parsed.layout;

  // Accent bar shape
  const accentEl = parsed.elements.find((e) => e.type === 'shape');
  if (accentEl) {
    if (layout === 'left') {
      elements.push({
        type: 'shape',
        shapeType: 'rectangle',
        x: 0,
        y: 0,
        width: 12,
        height: canvasHeight,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        fill: accentEl.style.fill ?? parsed.colors[0],
      });
    } else if (layout === 'right') {
      elements.push({
        type: 'shape',
        shapeType: 'rectangle',
        x: canvasWidth - 12,
        y: 0,
        width: 12,
        height: canvasHeight,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        fill: accentEl.style.fill ?? parsed.colors[0],
      });
    } else {
      // center or top: horizontal accent bar at bottom
      elements.push({
        type: 'shape',
        shapeType: 'rectangle',
        x: 0,
        y: canvasHeight - 8,
        width: canvasWidth,
        height: 8,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        fill: accentEl.style.fill ?? parsed.colors[0],
      });
    }
  }

  const textElements = parsed.elements.filter((e) => e.type === 'text');
  const shouldInclude = (fieldType?: DesignElement['fieldType']): boolean => {
    if (!includeElements || !fieldType) return true;
    if (fieldType === 'name') return includeElements.name !== false;
    if (fieldType === 'title') return includeElements.title !== false;
    if (fieldType === 'company') return includeElements.company !== false;
    if (fieldType === 'email' || fieldType === 'phone' || fieldType === 'website')
      return includeElements.contactInfo !== false;
    return true;
  };

  // Position text elements based on layout
  let startX: number;
  let startY: number;
  let textAlign: 'left' | 'center' | 'right';

  if (layout === 'left') {
    startX = 40;
    startY = 60;
    textAlign = 'left';
  } else if (layout === 'right') {
    startX = canvasWidth - 400;
    startY = 60;
    textAlign = 'right';
  } else {
    startX = canvasWidth / 2 - 180;
    startY = 50;
    textAlign = 'center';
  }

  let currentY = startY;
  textElements.forEach((te, idx) => {
    if (!shouldInclude(te.fieldType)) return;
    const fontSize = te.style.fontSize ?? 16;
    const height = Math.ceil(fontSize * 1.6);
    elements.push({
      type: 'text',
      x: startX,
      y: currentY,
      width: 360,
      height,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: idx + 1,
      content: te.content ?? '',
      fontFamily: idx === 0 ? parsed.fonts.heading : parsed.fonts.body,
      fontSize,
      fontWeight: te.style.fontWeight ?? '400',
      color: te.style.color ?? '#000000',
      textAlign,
      fieldType: te.fieldType,
    });
    currentY += height + 8;
  });

  // Background
  const bgColor = parsed.colors[parsed.colors.length - 1] ?? '#ffffff';
  const gradAngle = layout === 'left' ? 135 : layout === 'right' ? 225 : 180;
  const background: CanvasBackground = variationIndex % 2 === 0
    ? { type: 'solid', color: bgColor }
    : {
        type: 'gradient',
        gradient: {
          type: 'linear',
          angle: gradAngle,
          stops: [
            { color: bgColor, position: 0 },
            { color: parsed.colors[Math.min(3, parsed.colors.length - 1)], position: 100 },
          ],
        },
      };

  return {
    id: `variation-${variationIndex}`,
    name: `${parsed.theme} v${variationIndex + 1}`,
    elements,
    background,
  };
}

export function generateDesignVariations(
  input: AIDesignPrompt,
  canvasWidth: number,
  canvasHeight: number,
): AIDesignVariation[] {
  const matched = matchPromptToTemplates(input.prompt);
  return matched.map((parsed, i) =>
    buildVariation(parsed, canvasWidth, canvasHeight, i, input.includeElements),
  );
}
