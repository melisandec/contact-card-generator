'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useDesignStore } from '@/store/design-store';
import { presetColors, gradientPresets } from '@/data/colors';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const BG_TYPES = ['solid', 'gradient', 'image'] as const;

export function BackgroundPanel() {
  const { background, setBackground } = useDesignStore();
  const [activeType, setActiveType] = useState<typeof BG_TYPES[number]>(background.type as 'solid' | 'gradient' | 'image');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleSolidColor = (color: string) => {
    setBackground({ type: 'solid', color });
  };

  const handleGradientPreset = (preset: (typeof gradientPresets)[number]) => {
    setBackground({
      type: 'gradient',
      gradient: {
        type: 'linear',
        angle: preset.angle,
        stops: preset.stops,
      },
    });
  };

  const handleImageUrl = () => {
    if (imageUrl.trim()) {
      setBackground({ type: 'image', imageUrl: imageUrl.trim() });
    }
  };

  return (
    <div className="p-3 space-y-4">
      {/* Type selector */}
      <div className="flex rounded-lg border border-slate-200 p-0.5 gap-0.5">
        {BG_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={cn(
              'flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
              activeType === type ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Solid */}
      {activeType === 'solid' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                className="w-8 h-8 rounded-lg border-2 border-slate-200 shadow-sm"
                style={{ backgroundColor: background.color ?? '#ffffff' }}
              />
              <Input
                value={background.color ?? '#ffffff'}
                onChange={(e) => handleSolidColor(e.target.value)}
                className="font-mono"
              />
            </div>
            {colorPickerOpen && (
              <div className="mt-2">
                <HexColorPicker
                  color={background.color ?? '#ffffff'}
                  onChange={handleSolidColor}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Presets</label>
            <div className="grid grid-cols-10 gap-1">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleSolidColor(color)}
                  className={cn(
                    'w-5 h-5 rounded border border-slate-200 hover:scale-110 transition-transform',
                    background.color === color && 'ring-2 ring-indigo-500 ring-offset-1'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gradient */}
      {activeType === 'gradient' && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {gradientPresets.map((preset) => {
              const stops = preset.stops.map((s) => `${s.color} ${s.position}%`).join(', ');
              return (
                <button
                  key={preset.name}
                  onClick={() => handleGradientPreset(preset)}
                  className="h-16 rounded-xl border-2 border-transparent hover:border-indigo-400 transition-all shadow-sm"
                  style={{ backgroundImage: `linear-gradient(${preset.angle}deg, ${stops})` }}
                  title={preset.name}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Image */}
      {activeType === 'image' && (
        <div className="space-y-3">
          <Input
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button
            onClick={handleImageUrl}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Apply Image
          </button>

          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Photos</h4>
          <div className="grid grid-cols-2 gap-2">
            {['abstract', 'gradient', 'texture', 'pattern', 'nature', 'city'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  const url = `https://picsum.photos/seed/${term}/800/500`;
                  setBackground({ type: 'image', imageUrl: url });
                }}
                className="aspect-video rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${term}/200/125`}
                  alt={term}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
