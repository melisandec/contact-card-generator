'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useDesignStore } from '@/store/design-store';
import { cn } from '@/lib/utils';
import { Palette, Type, Plus, X, Link2, Unlink2 } from 'lucide-react';

const AVAILABLE_FONTS = [
  'Playfair Display', 'Montserrat', 'Inter', 'Arial', 'Georgia',
  'Times New Roman', 'Helvetica', 'Verdana', 'Roboto', 'Open Sans',
  'Lato', 'Poppins', 'Raleway', 'Oswald', 'Merriweather',
];

export function GlobalStylesPanel() {
  const {
    globalStyles, setGlobalColor, setGlobalFont, addGlobalColor, removeGlobalColor,
    elements, selectedElementId, applyGlobalColorToElement, applyGlobalFontToElement,
    unlinkElementStyle,
  } = useDesignStore();
  const [editingColorId, setEditingColorId] = useState<string | null>(null);

  const selected = elements.find((e) => e.id === selectedElementId);

  return (
    <div className="p-3 space-y-4">
      {/* Theme Colors */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          Theme Colors
        </h4>
        <div className="space-y-2">
          {globalStyles.colors.map((gc) => (
            <div key={gc.id} className="flex items-center gap-2">
              <button
                onClick={() => setEditingColorId(editingColorId === gc.id ? null : gc.id)}
                className="w-7 h-7 rounded-md border-2 border-slate-200 shadow-sm hover:border-indigo-300 transition-colors flex-shrink-0"
                style={{ backgroundColor: gc.value }}
                title={`${gc.label}: ${gc.value}`}
              />
              <span className="text-xs text-slate-600 flex-1 truncate">{gc.label}</span>

              {/* Apply to selected element */}
              {selected && (
                <button
                  onClick={() => {
                    const target = selected.type === 'text' ? 'color' : 'fill';
                    applyGlobalColorToElement(selected.id, gc.id, target as 'color' | 'fill');
                  }}
                  className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 transition-colors"
                  title={`Apply ${gc.label} to selected element`}
                >
                  <Link2 className="w-3 h-3" />
                </button>
              )}

              {globalStyles.colors.length > 1 && (
                <button
                  onClick={() => removeGlobalColor(gc.id)}
                  className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove color"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Color editor */}
          {editingColorId && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg">
              <HexColorPicker
                color={globalStyles.colors.find((c) => c.id === editingColorId)?.value ?? '#000000'}
                onChange={(color) => setGlobalColor(editingColorId, color)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Add color button */}
          {globalStyles.colors.length < 5 && (
            <button
              onClick={() => {
                const id = `color-${Date.now()}`;
                addGlobalColor({ id, value: '#6366f1', label: `Color ${globalStyles.colors.length + 1}` });
              }}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
            >
              <Plus className="w-3 h-3" />
              Add color
            </button>
          )}
        </div>
      </div>

      {/* Theme Fonts */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5" />
          Theme Fonts
        </h4>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Heading Font</label>
            <select
              value={globalStyles.fonts.heading}
              onChange={(e) => setGlobalFont('heading', e.target.value)}
              className="w-full h-8 border border-slate-200 rounded-lg px-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Body Font</label>
            <select
              value={globalStyles.fonts.body}
              onChange={(e) => setGlobalFont('body', e.target.value)}
              className="w-full h-8 border border-slate-200 rounded-lg px-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Font preview */}
          <div className="p-2 bg-slate-50 rounded-lg space-y-1">
            <p className="text-xs text-slate-400">Preview</p>
            <p style={{ fontFamily: globalStyles.fonts.heading }} className="text-sm text-slate-700">
              Heading: {globalStyles.fonts.heading}
            </p>
            <p style={{ fontFamily: globalStyles.fonts.body }} className="text-xs text-slate-600">
              Body: {globalStyles.fonts.body}
            </p>
          </div>

          {/* Apply font to selected element */}
          {selected && selected.type === 'text' && (
            <div className="flex gap-1.5">
              <button
                onClick={() => applyGlobalFontToElement(selected.id, 'heading')}
                className={cn(
                  'flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors',
                  selected.styleRefs?.fontRef === 'heading'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                )}
              >
                Use heading font
              </button>
              <button
                onClick={() => applyGlobalFontToElement(selected.id, 'body')}
                className={cn(
                  'flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors',
                  selected.styleRefs?.fontRef === 'body'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                )}
              >
                Use body font
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Style link indicator for selected element */}
      {selected && selected.styleRefs && (selected.styleRefs.colorRef || selected.styleRefs.fontRef) && (
        <div className="border-t border-slate-100 pt-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Linked Styles</h4>
          <div className="space-y-1 text-xs text-slate-600">
            {selected.styleRefs.colorRef && (
              <div className="flex items-center gap-1.5">
                <Link2 className="w-3 h-3 text-indigo-500" />
                <span>Color: {globalStyles.colors.find((c) => c.id === selected.styleRefs?.colorRef)?.label ?? selected.styleRefs.colorRef}</span>
              </div>
            )}
            {selected.styleRefs.fontRef && (
              <div className="flex items-center gap-1.5">
                <Link2 className="w-3 h-3 text-indigo-500" />
                <span>Font: {selected.styleRefs.fontRef}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => unlinkElementStyle(selected.id)}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors mt-2"
          >
            <Unlink2 className="w-3 h-3" />
            Unlink from theme
          </button>
        </div>
      )}
    </div>
  );
}
