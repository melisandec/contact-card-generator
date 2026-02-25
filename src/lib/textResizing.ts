import type { DesignElement } from '@/types';

/**
 * Measures approximate text dimensions using a simplified approach.
 * In the browser, this uses canvas measureText for accuracy.
 * For server/testing, uses character-width estimation.
 */
export function measureTextDimensions(
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight: string = '400',
  lineHeight: number = 1.4,
  letterSpacing: number = 0,
  containerWidth: number = Infinity
): { width: number; height: number } {
  // Average character width ratio relative to font size
  const charWidthRatio = getCharWidthRatio(fontWeight);
  const avgCharWidth = fontSize * charWidthRatio + letterSpacing;

  const lines = text.split('\n');
  let totalHeight = 0;
  let maxWidth = 0;

  for (const line of lines) {
    const lineWidth = line.length * avgCharWidth;
    if (containerWidth < Infinity && lineWidth > containerWidth) {
      // Word-wrap simulation
      const wrappedLines = Math.ceil(lineWidth / containerWidth);
      totalHeight += wrappedLines * fontSize * lineHeight;
      maxWidth = Math.max(maxWidth, containerWidth);
    } else {
      totalHeight += fontSize * lineHeight;
      maxWidth = Math.max(maxWidth, lineWidth);
    }
  }

  return { width: maxWidth, height: totalHeight };
}

function getCharWidthRatio(fontWeight: string): number {
  const weight = parseInt(fontWeight, 10) || 400;
  if (weight >= 700) return 0.65;
  if (weight >= 500) return 0.6;
  return 0.55;
}

/**
 * Determines if text content overflows its container.
 */
export function isTextOverflowing(element: DesignElement): boolean {
  if (element.type !== 'text' || !element.content) return false;

  const fontSize = element.fontSize ?? 16;
  const fontFamily = element.fontFamily ?? 'Inter';
  const fontWeight = element.fontWeight ?? '400';
  const lineHeight = element.lineHeight ?? 1.4;
  const letterSpacing = element.letterSpacing ?? 0;

  const measured = measureTextDimensions(
    element.content,
    fontSize,
    fontFamily,
    fontWeight,
    lineHeight,
    letterSpacing,
    element.width
  );

  return measured.height > element.height;
}

/**
 * Computes the optimal (largest) font size that fits the text
 * within the given container dimensions. Uses binary search.
 *
 * @param text - The text content
 * @param containerWidth - Container width in pixels
 * @param containerHeight - Container height in pixels
 * @param maxFontSize - Maximum font size to try
 * @param minFontSize - Minimum font size (floor)
 * @param fontFamily - Font family name
 * @param fontWeight - Font weight
 * @param lineHeight - Line height multiplier
 * @param letterSpacing - Letter spacing in pixels
 * @returns The computed font size that fits, or minFontSize if nothing fits
 */
export function computeFittingFontSize(
  text: string,
  containerWidth: number,
  containerHeight: number,
  maxFontSize: number,
  minFontSize: number = 8,
  fontFamily: string = 'Inter',
  fontWeight: string = '400',
  lineHeight: number = 1.4,
  letterSpacing: number = 0
): number {
  if (!text || containerWidth <= 0 || containerHeight <= 0) return minFontSize;

  let low = minFontSize;
  let high = maxFontSize;
  let bestFit = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const dims = measureTextDimensions(
      text,
      mid,
      fontFamily,
      fontWeight,
      lineHeight,
      letterSpacing,
      containerWidth
    );

    if (dims.height <= containerHeight) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFit;
}

/**
 * Gets the auto-shrunk font size for a text element.
 * Returns the original font size if text fits, or a reduced size if it doesn't.
 */
export function getAutoShrinkFontSize(element: DesignElement): number {
  const originalSize = element.fontSize ?? 16;
  if (element.type !== 'text' || !element.content || !element.autoShrink) {
    return originalSize;
  }

  if (!isTextOverflowing(element)) {
    return originalSize;
  }

  return computeFittingFontSize(
    element.content,
    element.width,
    element.height,
    originalSize,
    8,
    element.fontFamily ?? 'Inter',
    element.fontWeight ?? '400',
    element.lineHeight ?? 1.4,
    element.letterSpacing ?? 0
  );
}
