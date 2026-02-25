'use client';

import { useState } from 'react';
import { useDesignStore } from '@/store/design-store';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown, ChevronRight, Type, Square, Image, Group, Ungroup } from 'lucide-react';
import type { DesignElement } from '@/types';

function getElementIcon(element: DesignElement) {
  switch (element.type) {
    case 'text': return <Type className="w-3.5 h-3.5" />;
    case 'shape': return <Square className="w-3.5 h-3.5" />;
    case 'image': return <Image className="w-3.5 h-3.5" />;
    case 'group': return <Group className="w-3.5 h-3.5" />;
    default: return <Square className="w-3.5 h-3.5" />;
  }
}

function getElementLabel(element: DesignElement): string {
  if (element.type === 'group') {
    return `Group (${element.children?.length ?? 0})`;
  }
  if (element.type === 'text' && element.content) {
    return element.content.slice(0, 20) + (element.content.length > 20 ? '…' : '');
  }
  return `${element.type} ${element.zIndex + 1}`;
}

export function LayerPanel() {
  const {
    elements, selectedElementId, selectedElementIds, selectElement, toggleSelectElement,
    updateElement, removeElement, reorderElement, ungroupElements,
  } = useDesignStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const reversedElements = [...elements].reverse();

  const toggleGroupExpand = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderElement = (element: DesignElement, depth: number = 0) => {
    const isSelected = selectedElementId === element.id;
    const isMultiSelected = selectedElementIds.includes(element.id);
    const isGroup = element.type === 'group';
    const isExpanded = expandedGroups.has(element.id);

    return (
      <div key={element.id}>
        <div
          onClick={(e) => {
            if (e.shiftKey) {
              toggleSelectElement(element.id);
            } else {
              selectElement(element.id);
            }
          }}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs group transition-colors',
            isSelected
              ? 'bg-indigo-50 text-indigo-700'
              : isMultiSelected
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-slate-50 text-slate-700'
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {isGroup && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleGroupExpand(element.id); }}
              className="p-0.5 text-slate-400 hover:text-slate-600"
            >
              <ChevronRight className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-90')} />
            </button>
          )}
          <span className="text-slate-400">{getElementIcon(element)}</span>
          <span className="flex-1 truncate">{getElementLabel(element)}</span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {isGroup && isSelected && (
              <button
                onClick={(e) => { e.stopPropagation(); ungroupElements(); }}
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
                title="Ungroup"
              >
                <Ungroup className="w-3 h-3" />
              </button>
            )}
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

        {/* Group children */}
        {isGroup && isExpanded && element.children && (
          <div className="border-l-2 border-blue-200 ml-4">
            {[...element.children].reverse().map((child) => renderElement(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-2">
      {elements.length === 0 && (
        <div className="text-center text-xs text-slate-400 py-8">
          No elements yet. Add elements from the sidebar.
        </div>
      )}
      <div className="space-y-1">
        {reversedElements.map((element) => renderElement(element))}
      </div>
    </div>
  );
}
