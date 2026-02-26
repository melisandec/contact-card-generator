'use client';

import { useDesignStore } from '@/store/design-store';
import { Button } from '@/components/ui/Button';
import { Type, Tag } from 'lucide-react';
import { FIELD_TYPE_OPTIONS } from '@/lib/fieldSync';

const fontFamilies = [
  'Inter', 'Arial', 'Georgia', 'Times New Roman', 'Helvetica',
  'Verdana', 'Trebuchet MS', 'Courier New', 'monospace', 'cursive',
];

export function TextPanel() {
  const { addElement } = useDesignStore();

  const addText = (preset?: Partial<Parameters<typeof addElement>[0]>) => {
    addElement({
      type: 'text',
      x: 100,
      y: 100,
      width: 300,
      height: 50,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      content: 'Your text here',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: '400',
      color: '#1e293b',
      textAlign: 'left',
      ...preset,
    });
  };

  return (
    <div className="p-3 space-y-4">
      {/* Quick add presets */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Add Text</h4>
        <div className="space-y-2">
          <button
            onClick={() => addText({ content: 'Heading', fontSize: 36, fontWeight: '700' })}
            className="w-full text-left px-3 py-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <span className="text-xl font-bold text-slate-800">Heading</span>
          </button>
          <button
            onClick={() => addText({ content: 'Subheading', fontSize: 20, fontWeight: '500' })}
            className="w-full text-left px-3 py-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <span className="text-base font-medium text-slate-600">Subheading</span>
          </button>
          <button
            onClick={() => addText({ content: 'Body text', fontSize: 14, fontWeight: '400' })}
            className="w-full text-left px-3 py-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <span className="text-sm text-slate-500">Body text</span>
          </button>
          <button
            onClick={() => addText({ content: 'Caption', fontSize: 11, fontWeight: '400', color: '#9ca3af' })}
            className="w-full text-left px-3 py-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <span className="text-xs text-slate-400">Caption</span>
          </button>
        </div>
      </div>

      {/* Labeled fields */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Add Field</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {FIELD_TYPE_OPTIONS.filter((f) => f.value !== 'custom').map((field) => (
            <button
              key={field.value}
              onClick={() =>
                addText({
                  content: field.label,
                  fontSize: field.value === 'name' ? 28 : 14,
                  fontWeight: field.value === 'name' ? '700' : '400',
                  fieldType: field.value,
                })
              }
              className="flex items-center gap-1.5 px-2 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <Tag className="w-3 h-3 text-indigo-400" />
              {field.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font options */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Font Family</h4>
        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
          {fontFamilies.map((font) => (
            <button
              key={font}
              onClick={() => addText({ fontFamily: font })}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700 transition-colors"
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      <Button
        className="w-full"
        leftIcon={<Type className="w-4 h-4" />}
        onClick={() => addText()}
      >
        Add Text Element
      </Button>
    </div>
  );
}
