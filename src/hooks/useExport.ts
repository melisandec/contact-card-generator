import { useCallback } from 'react';
import { useDesignStore } from '@/store/design-store';
import type { ExportOptions } from '@/types';

export function useExport() {
  const { canvasWidth, canvasHeight } = useDesignStore();

  const exportCanvas = useCallback(
    async (canvasElement: HTMLDivElement, options: ExportOptions) => {
      const { format, scale = 2, quality = 0.95 } = options;

      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(canvasElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: format === 'jpg' ? '#ffffff' : null,
        width: canvasWidth,
        height: canvasHeight,
      });

      if (format === 'png') {
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl, 'design.png');
      } else if (format === 'jpg') {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        triggerDownload(dataUrl, 'design.jpg');
      } else if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/jpeg', quality);
        const orientation = canvasWidth > canvasHeight ? 'landscape' : 'portrait';
        const pdf = new jsPDF({ orientation, unit: 'px', format: [canvasWidth, canvasHeight] });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvasWidth, canvasHeight);
        pdf.save('design.pdf');
      }
    },
    [canvasWidth, canvasHeight]
  );

  const generateThumbnail = useCallback(
    async (canvasElement: HTMLDivElement): Promise<string | null> => {
      try {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(canvasElement, {
          scale: 0.5,
          useCORS: true,
          allowTaint: true,
          width: canvasWidth,
          height: canvasHeight,
        });
        return canvas.toDataURL('image/jpeg', 0.7);
      } catch {
        return null;
      }
    },
    [canvasWidth, canvasHeight]
  );

  return { exportCanvas, generateThumbnail };
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
