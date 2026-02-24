'use client';

import { useDesignStore } from '@/store/design-store';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown, Type, Square, Image } from 'lucide-react';
import type { DesignElement } from '@/types';

function getElementIcon(element: DesignElement) {
  switch (element.type) {
    case 'text': return <Type className="w-3.5 h-3.5" />;
    case 'shape': return <Square className="w-3.5 h-3.5" />;
    case 'image': return <Image className="w-3.5 h-3.5" />;
    default: return <Square className="w-3.5 h-3.5" />;
  }
}

function getElementLabel(element: DesignElement): string {
  if (element.type === 'text' && element.content) {
    return element.content.slice(0, 20) + (element.content.length > 20 ? '…' : '');
  }
  return `${element.type} ${element.zIndex + 1}`;
}

export function LayerPanel() {
  const { elements, selectedElementId, selectElement, updateElement, removeElement, reorderElement } = useDesignStore();
  const reversedElements = [...elements].reverse();

  return (
    <div className="p-2">
      {elements.length === 0 && (
        <div className="text-center text-xs text-slate-400 py-8">
          No elements yet. Add elements from the sidebar.
        </div>
      )}
      <div className="space-y-1">
        {reversedElements.map((element) => (
          <div
            key={element.id}
            onClick={() => selectElement(element.id)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs group transition-colors',
              selectedElementId === element.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'hover:bg-slate-50 text-slate-700'
            )}
          >
            <span className="text-slate-400">{getElementIcon(element)}</span>
            <span className="flex-1 truncate">{getElementLabel(element)}</span>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); reorderElement(element.id, 'up'); }}
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); reorderElement(element.id, 'down'); }}
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); updateElement(element.id, { visible: !element.visible }); }}
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
                title={element.visible ? 'Hide' : 'Show'}
              >
                {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); updateElement(element.id, { locked: !element.locked }); }}
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
                title={element.locked ? 'Unlock' : 'Lock'}
              >
                {element.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                className="p-0.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
