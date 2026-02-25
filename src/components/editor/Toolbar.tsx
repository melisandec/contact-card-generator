'use client';

import { useDesignStore } from '@/store/design-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/Button';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  Trash2,
  ChevronDown,
  FlipHorizontal2,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clamp, cn } from '@/lib/utils';

export function Toolbar() {
  const { zoom, setZoom, undo, redo, clearCanvas, historyIndex, history, currentSide, setCurrentSide, isDoubleSided } = useDesignStore();
  const { setExportModalOpen, setSaveModalOpen } = useUIStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const zoomIn = () => setZoom(clamp(zoom + 0.1, 0.25, 3));
  const zoomOut = () => setZoom(clamp(zoom - 0.1, 0.25, 3));
  const zoomReset = () => setZoom(1);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-white h-14">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md" />
        <span className="font-bold text-sm text-slate-800">CardCrafter</span>
      </div>

      <div className="h-5 w-px bg-slate-200" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-5 w-px bg-slate-200" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={zoomOut} title="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <button
          onClick={zoomReset}
          className="px-2 py-1 text-xs font-mono text-slate-600 hover:bg-slate-100 rounded-md min-w-[52px] text-center"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button variant="ghost" size="icon-sm" onClick={zoomIn} title="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Side Switcher — visible when double-sided */}
      {isDoubleSided && (
        <>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setCurrentSide('front')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                currentSide === 'front'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
              title="Edit front side (Ctrl+F)"
            >
              Front
            </button>
            <button
              onClick={() => setCurrentSide('back')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                currentSide === 'back'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
              title="Edit back side (Ctrl+F)"
            >
              Back
            </button>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentSide(currentSide === 'front' ? 'back' : 'front')}
            title="Flip side (Ctrl+F)"
          >
            <FlipHorizontal2 className="w-4 h-4" />
          </Button>
        </>
      )}

      <div className="h-5 w-px bg-slate-200" />

      {/* Clear */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          if (confirm('Clear all elements? This cannot be undone.')) {
            clearCanvas();
          }
        }}
        title="Clear canvas"
        className="text-red-400 hover:text-red-500 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <div className="flex-1" />

      {/* Save */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSaveModalOpen(true)}
        leftIcon={<Save className="w-4 h-4" />}
      >
        Save
      </Button>

      {/* Export */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button size="sm" rightIcon={<ChevronDown className="w-3.5 h-3.5" />}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[140px] bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 text-sm"
            sideOffset={4}
          >
            {[
              { label: 'Export as PNG', format: 'png' },
              { label: 'Export as JPG', format: 'jpg' },
              { label: 'Export as PDF', format: 'pdf' },
              { label: 'Export as SVG', format: 'svg' },
            ].map(({ label, format }) => (
              <DropdownMenu.Item
                key={format}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 outline-none"
                onClick={() => setExportModalOpen(true)}
              >
                {label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
