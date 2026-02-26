'use client';

import { useState } from 'react';
import { useDesignStore } from '@/store/design-store';
import { generateDesignVariations, AIDesignVariation, AIDesignPrompt } from '@/lib/aiDesignGenerator';
import { X, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIGeneratorModal({ isOpen, onClose }: AIGeneratorModalProps) {
  const { canvasWidth, canvasHeight, loadDesign } = useDesignStore();

  const [prompt, setPrompt] = useState('');
  const [includeElements, setIncludeElements] = useState({
    name: true,
    title: true,
    company: true,
    contactInfo: true,
    qrCode: false,
  });
  const [variations, setVariations] = useState<AIDesignVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSelectedIdx(null);

    // Simulate async processing
    setTimeout(() => {
      const input: AIDesignPrompt = { prompt, includeElements };
      const results = generateDesignVariations(input, canvasWidth, canvasHeight);
      setVariations(results);
      setLoading(false);
    }, 600);
  };

  const handleApply = () => {
    if (selectedIdx === null || !variations[selectedIdx]) return;
    const v = variations[selectedIdx];
    const elements = v.elements.map((el, i) => ({
      ...el,
      id: `ai-${Date.now()}-${i}`,
      zIndex: i,
    }));
    loadDesign(elements, v.background, canvasWidth, canvasHeight);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">AI Design Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Prompt input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Describe your card design
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., modern luxury real estate card with gold accents, minimalist style"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
              rows={3}
            />
          </div>

          {/* Include elements checklist */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Include Elements
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'name' as const, label: 'Name' },
                { key: 'title' as const, label: 'Title' },
                { key: 'company' as const, label: 'Company' },
                { key: 'contactInfo' as const, label: 'Contact Info' },
                { key: 'qrCode' as const, label: 'QR Code' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={includeElements[key]}
                    onChange={(e) =>
                      setIncludeElements((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Design
              </>
            )}
          </button>

          {/* Variations */}
          {variations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-700">
                  Design Variations
                </h3>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {variations.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={cn(
                      'rounded-xl border-2 overflow-hidden transition-all hover:shadow-md p-1',
                      selectedIdx === idx
                        ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-indigo-300'
                    )}
                  >
                    {/* Mini preview */}
                    <div
                      className="w-full aspect-[1.75] rounded-lg relative overflow-hidden"
                      style={getPreviewBgStyle(v.background)}
                    >
                      {v.elements.slice(0, 6).map((el, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            left: `${(el.x / canvasWidth) * 100}%`,
                            top: `${(el.y / canvasHeight) * 100}%`,
                            width: `${(el.width / canvasWidth) * 100}%`,
                            fontSize: Math.max(4, (el.fontSize ?? 12) * 0.3),
                            fontWeight: el.fontWeight ?? '400',
                            color: el.type === 'text' ? el.color : undefined,
                            backgroundColor: el.type === 'shape' ? el.fill : undefined,
                            height: el.type === 'shape' ? `${(el.height / canvasHeight) * 100}%` : undefined,
                            textAlign: el.textAlign ?? 'left',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {el.type === 'text' ? el.content : null}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 text-center truncate px-1">
                      {v.name}
                    </p>
                  </button>
                ))}
              </div>

              {/* Apply button */}
              {selectedIdx !== null && (
                <button
                  onClick={handleApply}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
                >
                  Apply Selected Design
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getPreviewBgStyle(bg: AIDesignVariation['background']): React.CSSProperties {
  if (bg.type === 'gradient' && bg.gradient) {
    const stops = bg.gradient.stops.map((s) => `${s.color} ${s.position}%`).join(', ');
    return { backgroundImage: `linear-gradient(${bg.gradient.angle ?? 135}deg, ${stops})` };
  }
  return { backgroundColor: bg.color ?? '#ffffff' };
}
