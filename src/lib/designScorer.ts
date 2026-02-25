import type { DesignElement, CanvasBackground } from '@/types';
import { hexToRgb } from '@/lib/utils';

export interface ScoreRule {
  id: string;
  name: string;
  category: 'contrast' | 'typography' | 'layout' | 'qr' | 'general';
  weight: number;
  check: (elements: DesignElement[], background: CanvasBackground, canvasWidth: number, canvasHeight: number) => RuleResult;
}

export interface RuleResult {
  passed: boolean;
  score: number; // 0-100
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface DesignScore {
  total: number; // 0-100
  results: Array<{ rule: ScoreRule; result: RuleResult }>;
  summary: string;
}

/**
 * Computes the relative luminance of an RGB color per WCAG 2.0.
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes WCAG contrast ratio between two colors.
 */
export function contrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 1;

  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Gets the effective background color from a CanvasBackground.
 */
function getBackgroundColor(bg: CanvasBackground): string {
  if (bg.type === 'solid' && bg.color) return bg.color;
  if (bg.type === 'gradient' && bg.gradient?.stops?.length) {
    return bg.gradient.stops[0].color;
  }
  return '#ffffff';
}

/**
 * Checks for overlapping elements on the canvas.
 */
function doElementsOverlap(a: DesignElement, b: DesignElement): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

/**
 * Scoring rules for design analysis.
 */
export const scoringRules: ScoreRule[] = [
  {
    id: 'text_contrast',
    name: 'Text Contrast',
    category: 'contrast',
    weight: 20,
    check: (elements, background) => {
      const textElements = elements.filter((el) => el.type === 'text' && el.visible);
      if (textElements.length === 0) {
        return { passed: true, score: 100, message: 'No text elements to check', severity: 'info' };
      }
      const bgColor = getBackgroundColor(background);
      let passCount = 0;
      const issues: string[] = [];

      for (const el of textElements) {
        const textColor = el.color || '#000000';
        const ratio = contrastRatio(textColor, bgColor);
        const fontSize = el.fontSize ?? 16;
        const requiredRatio = fontSize >= 18 ? 3 : 4.5; // WCAG AA

        if (ratio >= requiredRatio) {
          passCount++;
        } else {
          issues.push(`"${(el.content ?? '').slice(0, 20)}" has contrast ${ratio.toFixed(1)}:1 (need ${requiredRatio}:1)`);
        }
      }

      const score = Math.round((passCount / textElements.length) * 100);
      return {
        passed: score === 100,
        score,
        message: score === 100
          ? 'All text meets WCAG AA contrast requirements'
          : `${issues.length} text element(s) have low contrast: ${issues[0]}`,
        severity: score === 100 ? 'info' : 'warning',
      };
    },
  },
  {
    id: 'min_font_size',
    name: 'Minimum Font Size',
    category: 'typography',
    weight: 15,
    check: (elements) => {
      const textElements = elements.filter((el) => el.type === 'text' && el.visible);
      if (textElements.length === 0) {
        return { passed: true, score: 100, message: 'No text elements to check', severity: 'info' };
      }
      const tooSmall = textElements.filter((el) => (el.fontSize ?? 16) < 10);
      const score = Math.round(((textElements.length - tooSmall.length) / textElements.length) * 100);
      return {
        passed: tooSmall.length === 0,
        score,
        message: tooSmall.length === 0
          ? 'All text is at least 10px (legible at print)'
          : `${tooSmall.length} text element(s) below 10px – may be unreadable when printed`,
        severity: tooSmall.length > 0 ? 'warning' : 'info',
      };
    },
  },
  {
    id: 'qr_code_size',
    name: 'QR Code Size',
    category: 'qr',
    weight: 10,
    check: (elements) => {
      const qrElements = elements.filter((el) => el.type === 'qrcode' && el.visible);
      if (qrElements.length === 0) {
        return { passed: true, score: 100, message: 'No QR codes to check', severity: 'info' };
      }
      // Minimum recommended: ~100px at screen, ~1cm at 300dpi (≈118px)
      const tooSmall = qrElements.filter((el) => el.width < 80 || el.height < 80);
      const score = tooSmall.length === 0 ? 100 : 40;
      return {
        passed: tooSmall.length === 0,
        score,
        message: tooSmall.length === 0
          ? 'QR code size is sufficient for scanning'
          : `${tooSmall.length} QR code(s) may be too small to scan reliably (< 80px)`,
        severity: tooSmall.length > 0 ? 'error' : 'info',
      };
    },
  },
  {
    id: 'element_overlap',
    name: 'Element Overlap',
    category: 'layout',
    weight: 15,
    check: (elements) => {
      const visible = elements.filter((el) => el.visible);
      if (visible.length < 2) {
        return { passed: true, score: 100, message: 'Not enough elements to check overlap', severity: 'info' };
      }
      let overlapCount = 0;
      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          if (doElementsOverlap(visible[i], visible[j])) {
            overlapCount++;
          }
        }
      }
      const maxPairs = (visible.length * (visible.length - 1)) / 2;
      const overlapRatio = overlapCount / maxPairs;
      const score = Math.round(Math.max(0, (1 - overlapRatio * 2)) * 100);
      return {
        passed: overlapCount === 0,
        score,
        message: overlapCount === 0
          ? 'No overlapping elements detected'
          : `${overlapCount} pair(s) of overlapping elements found`,
        severity: overlapCount > 3 ? 'error' : overlapCount > 0 ? 'warning' : 'info',
      };
    },
  },
  {
    id: 'element_out_of_bounds',
    name: 'Elements Within Canvas',
    category: 'layout',
    weight: 15,
    check: (elements, _bg, canvasWidth, canvasHeight) => {
      const visible = elements.filter((el) => el.visible);
      if (visible.length === 0) {
        return { passed: true, score: 100, message: 'No elements to check', severity: 'info' };
      }
      const outOfBounds = visible.filter(
        (el) =>
          el.x < 0 ||
          el.y < 0 ||
          el.x + el.width > canvasWidth ||
          el.y + el.height > canvasHeight
      );
      const score = Math.round(((visible.length - outOfBounds.length) / visible.length) * 100);
      return {
        passed: outOfBounds.length === 0,
        score,
        message: outOfBounds.length === 0
          ? 'All elements are within canvas bounds'
          : `${outOfBounds.length} element(s) extend beyond the canvas`,
        severity: outOfBounds.length > 0 ? 'warning' : 'info',
      };
    },
  },
  {
    id: 'has_content',
    name: 'Design Has Content',
    category: 'general',
    weight: 10,
    check: (elements) => {
      const hasText = elements.some((el) => el.type === 'text' && el.visible);
      const hasVisual = elements.some((el) => ['image', 'shape', 'qrcode', 'icon'].includes(el.type) && el.visible);
      const score = hasText && hasVisual ? 100 : hasText || hasVisual ? 60 : 0;
      return {
        passed: score >= 60,
        score,
        message: score === 100
          ? 'Design has both text and visual elements'
          : score >= 60
          ? 'Design could benefit from more element variety'
          : 'Design appears empty',
        severity: score < 60 ? 'error' : score < 100 ? 'info' : 'info',
      };
    },
  },
  {
    id: 'alignment_consistency',
    name: 'Alignment Consistency',
    category: 'layout',
    weight: 15,
    check: (elements) => {
      const visible = elements.filter((el) => el.visible);
      if (visible.length < 2) {
        return { passed: true, score: 100, message: 'Not enough elements for alignment check', severity: 'info' };
      }

      // Check if elements share common x or y values (within 5px tolerance)
      const tolerance = 5;
      const xPositions = visible.map((el) => el.x);
      const yPositions = visible.map((el) => el.y);

      let alignedPairs = 0;
      const totalPairs = (visible.length * (visible.length - 1)) / 2;

      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          if (
            Math.abs(xPositions[i] - xPositions[j]) <= tolerance ||
            Math.abs(yPositions[i] - yPositions[j]) <= tolerance ||
            Math.abs((xPositions[i] + visible[i].width / 2) - (xPositions[j] + visible[j].width / 2)) <= tolerance
          ) {
            alignedPairs++;
          }
        }
      }

      const alignmentRatio = alignedPairs / totalPairs;
      const score = Math.round(Math.min(100, alignmentRatio * 150)); // Bonus for high alignment
      return {
        passed: score >= 50,
        score,
        message: score >= 80
          ? 'Elements are well-aligned'
          : score >= 50
          ? 'Some elements could be better aligned'
          : 'Consider aligning elements for a more professional look',
        severity: score < 50 ? 'warning' : 'info',
      };
    },
  },
];

/**
 * Analyzes a design and returns a performance score with detailed results.
 */
export function analyzeDesign(
  elements: DesignElement[],
  background: CanvasBackground,
  canvasWidth: number,
  canvasHeight: number
): DesignScore {
  const results = scoringRules.map((rule) => ({
    rule,
    result: rule.check(elements, background, canvasWidth, canvasHeight),
  }));

  const totalWeight = results.reduce((sum, r) => sum + r.rule.weight, 0);
  const weightedScore = results.reduce(
    (sum, r) => sum + (r.result.score * r.rule.weight) / totalWeight,
    0
  );
  const total = Math.round(weightedScore);

  const failedCount = results.filter((r) => !r.result.passed).length;
  const summary =
    total >= 90
      ? 'Excellent design! Your card follows best practices.'
      : total >= 70
      ? `Good design with ${failedCount} area(s) to improve.`
      : total >= 50
      ? `Fair design. ${failedCount} issue(s) found – review suggestions below.`
      : `Needs improvement. ${failedCount} issue(s) need attention.`;

  return { total, results, summary };
}
