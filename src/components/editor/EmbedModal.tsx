'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useDesignStore } from '@/store/design-store';
import { generateEmbedSnippet } from '@/lib/embedGenerator';
import { Copy, Check, Code, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmbedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmbedModal({ open, onOpenChange }: EmbedModalProps) {
  const { elements } = useDesignStore();
  const [mode, setMode] = useState<'static' | 'interactive'>('interactive');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const embedHtml = useMemo(
    () =>
      generateEmbedSnippet(elements, {
        mode,
        imageUrl: imageUrl || undefined,
        linkUrl: linkUrl || undefined,
        vcardUrl: vcardUrl || undefined,
      }),
    [elements, mode, imageUrl, linkUrl, vcardUrl]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = embedHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Embed Card"
      description="Generate HTML to embed your contact card on any website"
      size="lg"
    >
      <div className="space-y-4">
        {/* Mode selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Embed Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('static')}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors text-sm',
                mode === 'static'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="font-semibold">Static Image</span>
              <span className="text-[10px] text-slate-400">Simple image embed</span>
            </button>
            <button
              onClick={() => setMode('interactive')}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors text-sm',
                mode === 'interactive'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              <Code className="w-5 h-5" />
              <span className="font-semibold">Interactive HTML</span>
              <span className="text-[10px] text-slate-400">With links & save contact</span>
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {mode === 'static' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Card Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/card.png"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Export your card as PNG first, then host the image</p>
            </div>
          )}

          {mode === 'static' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Link URL (optional)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {mode === 'interactive' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">vCard File URL (optional)</label>
              <input
                type="url"
                value={vcardUrl}
                onChange={(e) => setVcardUrl(e.target.value)}
                placeholder="https://example.com/contact.vcf"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Adds a &quot;Save Contact&quot; download button</p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Preview</label>
          <div
            className="border border-slate-200 rounded-lg p-4 bg-white overflow-auto max-h-48"
            dangerouslySetInnerHTML={{ __html: embedHtml }}
          />
        </div>

        {/* HTML Code */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">HTML Code</label>
          <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 overflow-auto max-h-32 whitespace-pre-wrap font-mono">
            {embedHtml}
          </pre>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCopy}
          leftIcon={copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        >
          {copied ? 'Copied!' : 'Copy Embed Code'}
        </Button>
      </div>
    </Modal>
  );
}
