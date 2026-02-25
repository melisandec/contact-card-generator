'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/store/ui-store';
import { useDesignStore } from '@/store/design-store';
import { Download, Image, FileType, Printer, Mail, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateEmailSignatureHTML,
  generateEmailSignaturePlainText,
  extractContactFromElements,
  type EmailSignatureData,
} from '@/lib/emailSignatureGenerator';

const FORMATS = [
  { id: 'png', label: 'PNG', description: 'Best for web, transparent background', icon: Image },
  { id: 'jpg', label: 'JPG', description: 'Smaller file size, no transparency', icon: Image },
  { id: 'pdf', label: 'PDF', description: 'Perfect for printing', icon: FileType },
  { id: 'print-pdf', label: 'Print Sheet', description: 'Front & back on one page', icon: Printer },
  { id: 'email-sig', label: 'Email Sig', description: 'HTML for email clients', icon: Mail },
] as const;

type ExportFormat = typeof FORMATS[number]['id'];

interface ExportModalProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export function ExportModal({ canvasRef }: ExportModalProps) {
  const { exportModalOpen, setExportModalOpen } = useUIStore();
  const { canvasWidth, canvasHeight, isDoubleSided, currentSide, setCurrentSide, elements } = useDesignStore();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);
  const [includeBackSide, setIncludeBackSide] = useState(true);
  const [emailSigCopied, setEmailSigCopied] = useState(false);

  // Email signature data (editable)
  const [emailSigData, setEmailSigData] = useState<EmailSignatureData>(() =>
    extractContactFromElements(elements)
  );

  // Regenerate extracted data when modal opens with new elements
  const [lastElementCount, setLastElementCount] = useState(0);
  if (exportModalOpen && elements.length !== lastElementCount) {
    setLastElementCount(elements.length);
    if (format === 'email-sig') {
      setEmailSigData(extractContactFromElements(elements));
    }
  }

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

  const handleCopyEmailSig = async () => {
    const html = generateEmailSignatureHTML(emailSigData);
    try {
      await navigator.clipboard.writeText(html);
      setEmailSigCopied(true);
      setTimeout(() => setEmailSigCopied(false), 2000);
    } catch {
      // Fallback: create textarea and copy
      const ta = document.createElement('textarea');
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setEmailSigCopied(true);
      setTimeout(() => setEmailSigCopied(false), 2000);
    }
  };

  const handleExport = async () => {
    // Email signature has its own flow (copy, not download)
    if (format === 'email-sig') {
      await handleCopyEmailSig();
      return;
    }

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
      if (isDoubleSided && (includeBackSide || format === 'print-pdf')) {
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
      } else if (format === 'print-pdf') {
        const { jsPDF } = await import('jspdf');
        // Print sheet: front and back stacked vertically on one page
        const gap = 40;
        const pageWidth = canvasWidth;
        const pageHeight = canvasHeight * 2 + gap * 3;
        const pdf = new jsPDF({
          orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [pageWidth, pageHeight],
        });

        // Front label
        pdf.setFontSize(12);
        pdf.setTextColor(100);
        pdf.text('Front', pageWidth / 2, gap / 2 + 6, { align: 'center' });

        // Front side
        const frontImgData = frontCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(frontImgData, 'JPEG', 0, gap, canvasWidth, canvasHeight);

        if (backCanvas) {
          // Back label
          pdf.text('Back', pageWidth / 2, canvasHeight + gap * 1.5 + 6, { align: 'center' });
          // Back side
          const backImgData = backCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(backImgData, 'JPEG', 0, canvasHeight + gap * 2, canvasWidth, canvasHeight);
        }

        pdf.save('cardcrafter-print-sheet.pdf');
      }

      setExportModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const displayFormat = format === 'print-pdf' ? 'PRINT PDF' : format === 'email-sig' ? 'EMAIL SIG' : format.toUpperCase();

  return (
    <Modal
      open={exportModalOpen}
      onOpenChange={setExportModalOpen}
      title="Export Design"
      description="Choose your export format and settings"
      size={format === 'email-sig' ? 'xl' : 'md'}
    >
      <div className="space-y-4">
        {/* Format selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
          <div className="grid gap-2 grid-cols-5">
            {FORMATS.filter((f) => isDoubleSided || f.id !== 'print-pdf').map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setFormat(id);
                  if (id === 'email-sig') {
                    setEmailSigData(extractContactFromElements(elements));
                  }
                }}
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

        {/* Resolution — hide for email sig */}
        {format !== 'email-sig' && (
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
        )}

        {/* Include back side checkbox — only for double-sided designs and non-print-pdf */}
        {isDoubleSided && format !== 'print-pdf' && format !== 'email-sig' && (
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

        {/* Print-sheet info */}
        {format === 'print-pdf' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-700">
            Both front and back will be placed on a single PDF page, ready for double‑sided printing.
          </div>
        )}

        {/* Email Signature Editor */}
        {format === 'email-sig' && (
          <div className="space-y-3">
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 text-xs text-violet-700">
              Edit the fields below and copy the HTML signature for Gmail, Outlook, or Apple Mail.
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Full Name"
                value={emailSigData.fullName || ''}
                onChange={(e) => setEmailSigData({ ...emailSigData, fullName: e.target.value })}
              />
              <Input
                label="Title"
                value={emailSigData.title || ''}
                onChange={(e) => setEmailSigData({ ...emailSigData, title: e.target.value })}
              />
              <Input
                label="Company"
                value={emailSigData.company || ''}
                onChange={(e) => setEmailSigData({ ...emailSigData, company: e.target.value })}
              />
              <Input
                label="Email"
                value={emailSigData.email || ''}
                onChange={(e) => setEmailSigData({ ...emailSigData, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={emailSigData.phone || ''}
                onChange={(e) => setEmailSigData({ ...emailSigData, phone: e.target.value })}
              />
              <Input
                label="Website"
                value={emailSigData.website || ''}
                onChange={(e) => setEmailSigData({ ...emailSigData, website: e.target.value })}
              />
            </div>

            {/* HTML Preview */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Preview</label>
              <div
                className="border border-slate-200 rounded-lg p-4 bg-white overflow-auto max-h-40"
                dangerouslySetInnerHTML={{ __html: generateEmailSignatureHTML(emailSigData) }}
              />
            </div>

            {/* Plain text version */}
            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer hover:text-slate-700">Plain text version</summary>
              <pre className="mt-1 p-2 bg-slate-50 rounded text-xs whitespace-pre-wrap">
                {generateEmailSignaturePlainText(emailSigData)}
              </pre>
            </details>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleExport}
          loading={isExporting}
          leftIcon={format === 'email-sig'
            ? (emailSigCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />)
            : <Download className="w-5 h-5" />
          }
        >
          {format === 'email-sig'
            ? (emailSigCopied ? 'Copied!' : 'Copy HTML Signature')
            : isExporting ? 'Exporting...' : `Export as ${displayFormat}`
          }
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
