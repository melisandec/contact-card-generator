'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useDesignStore } from '@/store/design-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { presetColors } from '@/data/colors';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  RotateCcw,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Unlink2,
} from 'lucide-react';
import type { DesignElement } from '@/types';

export function PropertiesPanel() {
  const {
    elements, selectedElementId, updateElement, removeElement, duplicateElement,
    globalStyles, applyGlobalColorToElement, applyGlobalFontToElement, unlinkElementStyle,
  } = useDesignStore();
  const [colorPickerTarget, setColorPickerTarget] = useState<'fill' | 'stroke' | 'color' | null>(null);

  const selected = elements.find((e) => e.id === selectedElementId);

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm px-4 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
          <RotateCcw className="w-5 h-5" />
        </div>
        <p className="font-medium text-slate-500">No element selected</p>
        <p className="text-xs mt-1">Click an element on the canvas to edit its properties</p>
      </div>
    );
  }

  const update = (updates: Partial<DesignElement>) => updateElement(selected.id, updates);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Element actions */}
      <div className="p-3 border-b border-slate-100 flex items-center gap-1">
        <span className="text-xs font-medium text-slate-500 mr-auto capitalize">{selected.type} element</span>
        <button
          onClick={() => update({ visible: !selected.visible })}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title={selected.visible ? 'Hide' : 'Show'}
        >
          {selected.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => update({ locked: !selected.locked })}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title={selected.locked ? 'Unlock' : 'Lock'}
        >
          {selected.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => duplicateElement(selected.id)}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => removeElement(selected.id)}
          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Position & Size */}
        <Section title="Position & Size">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="X"
              type="number"
              value={selected.x}
              onChange={(e) => update({ x: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Y"
              type="number"
              value={selected.y}
              onChange={(e) => update({ y: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="W"
              type="number"
              value={selected.width}
              onChange={(e) => update({ width: Math.max(1, parseInt(e.target.value) || 1) })}
            />
            <Input
              label="H"
              type="number"
              value={selected.height}
              onChange={(e) => update({ height: Math.max(1, parseInt(e.target.value) || 1) })}
            />
            <Input
              label="Rotation"
              type="number"
              value={selected.rotation}
              onChange={(e) => update({ rotation: parseInt(e.target.value) || 0 })}
            />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Opacity</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={selected.opacity}
                onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
                className="w-full h-2 accent-indigo-600"
              />
              <span className="text-xs text-slate-400">{Math.round(selected.opacity * 100)}%</span>
            </div>
          </div>
        </Section>

        {/* Text Properties */}
        {selected.type === 'text' && (
          <Section title="Text">
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Content</label>
                <textarea
                  value={selected.content ?? ''}
                  onChange={(e) => update({ content: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Font Family</label>
                  <select
                    value={selected.fontFamily ?? 'Inter'}
                    onChange={(e) => update({ fontFamily: e.target.value })}
                    className="w-full h-9 border border-slate-200 rounded-lg px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana', 'monospace', 'cursive'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Font Size"
                  type="number"
                  value={selected.fontSize ?? 16}
                  onChange={(e) => update({ fontSize: Math.max(6, parseInt(e.target.value) || 16) })}
                />
              </div>

              {/* Text formatting */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => update({ fontWeight: selected.fontWeight === '700' ? '400' : '700' })}
                  className={cn('p-1.5 rounded hover:bg-slate-100 transition-colors', selected.fontWeight === '700' && 'bg-slate-100')}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => update({ fontStyle: selected.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={cn('p-1.5 rounded hover:bg-slate-100 transition-colors', selected.fontStyle === 'italic' && 'bg-slate-100')}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => update({ textDecoration: selected.textDecoration === 'underline' ? 'none' : 'underline' })}
                  className={cn('p-1.5 rounded hover:bg-slate-100 transition-colors', selected.textDecoration === 'underline' && 'bg-slate-100')}
                >
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => update({ textAlign: align })}
                    className={cn('p-1.5 rounded hover:bg-slate-100 transition-colors', selected.textAlign === align && 'bg-slate-100')}
                  >
                    {align === 'left' ? <AlignLeft className="w-4 h-4" /> : align === 'center' ? <AlignCenter className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              {/* Text color */}
              <ColorPicker
                label="Text Color"
                value={selected.color ?? '#000000'}
                onChange={(color) => update({ color })}
                isOpen={colorPickerTarget === 'color'}
                onToggle={() => setColorPickerTarget(colorPickerTarget === 'color' ? null : 'color')}
              />
            </div>
          </Section>
        )}

        {/* Shape Properties */}
        {selected.type === 'shape' && (
          <Section title="Shape">
            <div className="space-y-2">
              <ColorPicker
                label="Fill Color"
                value={selected.fill ?? '#6366f1'}
                onChange={(color) => update({ fill: color })}
                isOpen={colorPickerTarget === 'fill'}
                onToggle={() => setColorPickerTarget(colorPickerTarget === 'fill' ? null : 'fill')}
              />
              <ColorPicker
                label="Stroke Color"
                value={selected.stroke ?? '#000000'}
                onChange={(color) => update({ stroke: color })}
                isOpen={colorPickerTarget === 'stroke'}
                onToggle={() => setColorPickerTarget(colorPickerTarget === 'stroke' ? null : 'stroke')}
              />
              <Input
                label="Stroke Width"
                type="number"
                value={selected.strokeWidth ?? 0}
                onChange={(e) => update({ strokeWidth: Math.max(0, parseInt(e.target.value) || 0) })}
              />
              {selected.shapeType !== 'circle' && (
                <Input
                  label="Border Radius"
                  type="number"
                  value={selected.borderRadius ?? 0}
                  onChange={(e) => update({ borderRadius: Math.max(0, parseInt(e.target.value) || 0) })}
                />
              )}
            </div>
          </Section>
        )}

        {/* Shadow */}
        <Section title="Shadow">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Blur"
              type="number"
              value={selected.shadowBlur ?? 0}
              onChange={(e) => update({ shadowBlur: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <Input
              label="Offset X"
              type="number"
              value={selected.shadowOffsetX ?? 0}
              onChange={(e) => update({ shadowOffsetX: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Offset Y"
              type="number"
              value={selected.shadowOffsetY ?? 0}
              onChange={(e) => update({ shadowOffsetY: parseInt(e.target.value) || 0 })}
            />
          </div>
        </Section>

        {/* Style from Theme */}
        <Section title="Style from Theme">
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Apply a theme color to this element:</p>
            <div className="flex flex-wrap gap-1.5">
              {globalStyles.colors.map((gc) => (
                <button
                  key={gc.id}
                  onClick={() => {
                    const target = selected.type === 'text' ? 'color' : 'fill';
                    applyGlobalColorToElement(selected.id, gc.id, target as 'color' | 'fill');
                  }}
                  className={cn(
                    'w-6 h-6 rounded-md border-2 transition-all hover:scale-110',
                    selected.styleRefs?.colorRef === gc.id
                      ? 'border-indigo-500 ring-1 ring-indigo-300'
                      : 'border-slate-200'
                  )}
                  style={{ backgroundColor: gc.value }}
                  title={`${gc.label}: ${gc.value}`}
                />
              ))}
            </div>

            {selected.type === 'text' && (
              <div className="flex gap-1.5 mt-1">
                <button
                  onClick={() => applyGlobalFontToElement(selected.id, 'heading')}
                  className={cn(
                    'flex-1 px-2 py-1 text-[10px] rounded border transition-colors',
                    selected.styleRefs?.fontRef === 'heading'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-200'
                  )}
                >
                  Heading font
                </button>
                <button
                  onClick={() => applyGlobalFontToElement(selected.id, 'body')}
                  className={cn(
                    'flex-1 px-2 py-1 text-[10px] rounded border transition-colors',
                    selected.styleRefs?.fontRef === 'body'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-200'
                  )}
                >
                  Body font
                </button>
              </div>
            )}

            {selected.styleRefs && (selected.styleRefs.colorRef || selected.styleRefs.fontRef) && (
              <button
                onClick={() => unlinkElementStyle(selected.id)}
                className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 transition-colors mt-1"
              >
                <Unlink2 className="w-3 h-3" />
                Unlink from theme
              </button>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function ColorPicker({ label, value, onChange, isOpen, onToggle }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg border-2 border-slate-200 shadow-sm hover:border-indigo-300 transition-colors flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          className="flex-1 h-8 border border-slate-200 rounded-lg px-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        />
      </div>

      {isOpen && (
        <div className="mt-2">
          <HexColorPicker color={value} onChange={onChange} style={{ width: '100%' }} />
          <div className="grid grid-cols-10 gap-1 mt-2">
            {presetColors.map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                className="w-5 h-5 rounded border border-slate-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
