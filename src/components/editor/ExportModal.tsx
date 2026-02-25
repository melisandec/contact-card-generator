'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui-store';
import { useDesignStore } from '@/store/design-store';
import { Download, Image, FileType } from 'lucide-react';
import { cn } from '@/lib/utils';

const FORMATS = [
  { id: 'png', label: 'PNG', description: 'Best for web, transparent background', icon: Image },
  { id: 'jpg', label: 'JPG', description: 'Smaller file size, no transparency', icon: Image },
  { id: 'pdf', label: 'PDF', description: 'Perfect for printing', icon: FileType },
] as const;

type ExportFormat = typeof FORMATS[number]['id'];

interface ExportModalProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export function ExportModal({ canvasRef }: ExportModalProps) {
  const { exportModalOpen, setExportModalOpen } = useUIStore();
  const { canvasWidth, canvasHeight, isDoubleSided, currentSide, setCurrentSide, elements, background, frontLayers, backLayers, frontBackground, backBackground } = useDesignStore();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);
  const [includeBackSide, setIncludeBackSide] = useState(true);

  const captureCanvas = async (html2canvas: typeof import('html2canvas').default) => {
    if (!canvasRef.current) return null;
    return html2canvas(canvasRef.current, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: canvasWidth,
      height: canvasHeight,
    });
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const { default: html2canvas } = await import('html2canvas');

      // Capture front side
      const originalSide = currentSide;

      // If we're on back side, switch to front first for capture
      if (originalSide === 'back') {
        setCurrentSide('front');
        await new Promise((r) => setTimeout(r, 100));
      }

      const frontCanvas = await captureCanvas(html2canvas);

      let backCanvas: HTMLCanvasElement | null = null;
      if (isDoubleSided && includeBackSide) {
        // Switch to back and capture
        setCurrentSide('back');
        await new Promise((r) => setTimeout(r, 100));
        backCanvas = await captureCanvas(html2canvas);
      }

      // Restore original side
      if (currentSide !== originalSide) {
        setCurrentSide(originalSide);
      }

      if (!frontCanvas) {
        throw new Error('Failed to capture canvas');
      }

      if (format === 'png') {
        const dataUrl = frontCanvas.toDataURL('image/png');
        downloadDataUrl(dataUrl, 'cardcrafter-design-front.png');
        if (backCanvas) {
          const backDataUrl = backCanvas.toDataURL('image/png');
          downloadDataUrl(backDataUrl, 'cardcrafter-design-back.png');
        }
      } else if (format === 'jpg') {
        const dataUrl = frontCanvas.toDataURL('image/jpeg', 0.95);
        downloadDataUrl(dataUrl, 'cardcrafter-design-front.jpg');
        if (backCanvas) {
          const backDataUrl = backCanvas.toDataURL('image/jpeg', 0.95);
          downloadDataUrl(backDataUrl, 'cardcrafter-design-back.jpg');
        }
      } else if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const imgData = frontCanvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvasWidth, canvasHeight],
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvasWidth, canvasHeight);

        if (backCanvas) {
          pdf.addPage([canvasWidth, canvasHeight], canvasWidth > canvasHeight ? 'landscape' : 'portrait');
          const backImgData = backCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(backImgData, 'JPEG', 0, 0, canvasWidth, canvasHeight);
        }

        pdf.save('cardcrafter-design.pdf');
      }

      setExportModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      open={exportModalOpen}
      onOpenChange={setExportModalOpen}
      title="Export Design"
      description="Choose your export format and settings"
    >
      <div className="space-y-4">
        {/* Format selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFormat(id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors text-sm',
                  format === id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
                <span className="text-[10px] text-center text-slate-400 leading-tight">{description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resolution */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Resolution — {Math.round(canvasWidth * scale)} × {Math.round(canvasHeight * scale)}px
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors',
                  scale === s
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                {s}×
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">Higher resolution for print quality</p>
        </div>

        {/* Include back side checkbox — only for double-sided designs */}
        {isDoubleSided && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeBackSide"
              checked={includeBackSide}
              onChange={(e) => setIncludeBackSide(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="includeBackSide" className="text-sm text-slate-700">
              Include back side
              <span className="text-xs text-slate-400 ml-1">
                {format === 'pdf' ? '(adds second page)' : '(downloads separate file)'}
              </span>
            </label>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleExport}
          loading={isExporting}
          leftIcon={<Download className="w-5 h-5" />}
        >
          {isExporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
        </Button>
      </div>
    </Modal>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
