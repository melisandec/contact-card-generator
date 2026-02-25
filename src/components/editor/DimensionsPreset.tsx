'use client';

import { useState } from 'react';
import { useDesignStore } from '@/store/design-store';
import { cardPresets, type CardPreset } from '@/lib/cardPresets';
import { cn } from '@/lib/utils';
import { ChevronDown, Monitor, CreditCard } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function DimensionsPreset() {
  const { canvasWidth, canvasHeight, setCanvasSize } = useDesignStore();
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const currentPreset = cardPresets.find(
    (p) => p.width === canvasWidth && p.height === canvasHeight
  );

  const handlePresetSelect = (preset: CardPreset) => {
    setCanvasSize(preset.width, preset.height);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    const w = parseInt(customW, 10);
    const h = parseInt(customH, 10);
    if (w > 0 && h > 0 && w <= 4000 && h <= 4000) {
      setCanvasSize(w, h);
      setShowCustom(false);
    }
  };

  const businessPresets = cardPresets.filter((p) => p.category === 'business');
  const socialPresets = cardPresets.filter((p) => p.category === 'social');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 transition-colors"
          title="Change card dimensions"
        >
          <span className="tabular-nums">
            {currentPreset ? currentPreset.name : `${canvasWidth}×${canvasHeight}`}
          </span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 text-sm"
          sideOffset={4}
          align="start"
        >
          {/* Business cards */}
          <DropdownMenu.Label className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Business Cards
          </DropdownMenu.Label>
          {businessPresets.map((preset) => (
            <DropdownMenu.Item
              key={preset.id}
              className={cn(
                'px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer outline-none',
                preset.width === canvasWidth && preset.height === canvasHeight
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-700'
              )}
              onClick={() => handlePresetSelect(preset)}
            >
              <div className="font-medium text-xs">{preset.name}</div>
              <div className="text-[10px] text-slate-400">{preset.description}</div>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />

          {/* Social media */}
          <DropdownMenu.Label className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Monitor className="w-3 h-3" /> Social Media
          </DropdownMenu.Label>
          {socialPresets.map((preset) => (
            <DropdownMenu.Item
              key={preset.id}
              className={cn(
                'px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer outline-none',
                preset.width === canvasWidth && preset.height === canvasHeight
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-700'
              )}
              onClick={() => handlePresetSelect(preset)}
            >
              <div className="font-medium text-xs">{preset.name}</div>
              <div className="text-[10px] text-slate-400">{preset.description}</div>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />

          {/* Custom */}
          <DropdownMenu.Item
            className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 outline-none"
            onClick={(e) => {
              e.preventDefault();
              setShowCustom(!showCustom);
              setCustomW(String(canvasWidth));
              setCustomH(String(canvasHeight));
            }}
          >
            <div className="font-medium text-xs">Custom Dimensions…</div>
          </DropdownMenu.Item>

          {showCustom && (
            <div className="px-3 py-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-400 mb-0.5">Width (px)</label>
                  <input
                    type="number"
                    value={customW}
                    onChange={(e) => setCustomW(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                    min={100}
                    max={4000}
                  />
                </div>
                <span className="text-xs text-slate-300 pt-3">×</span>
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-400 mb-0.5">Height (px)</label>
                  <input
                    type="number"
                    value={customH}
                    onChange={(e) => setCustomH(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                    min={100}
                    max={4000}
                  />
                </div>
              </div>
              <button
                onClick={handleCustomApply}
                className="w-full px-2 py-1 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
