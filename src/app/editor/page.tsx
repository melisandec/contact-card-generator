'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@/components/editor/Canvas';
import { Sidebar } from '@/components/editor/Sidebar';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Toolbar } from '@/components/editor/Toolbar';
import { ExportModal } from '@/components/editor/ExportModal';
import { useDesignStore } from '@/store/design-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

export default function EditorPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { zoom, setZoom, undo, redo } = useDesignStore();
  const { exportModalOpen } = useUIStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        setZoom(Math.min(zoom + 0.1, 3));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom(Math.max(zoom - 0.1, 0.25));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, setZoom, undo, redo]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top toolbar */}
      <Toolbar />

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <Sidebar />

        {/* Canvas */}
        <main className="flex-1 overflow-hidden relative">
          <Canvas exportRef={canvasRef} />

          {/* Status bar */}
          <div className="absolute bottom-0 left-0 right-0 h-7 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center px-3 gap-4 text-xs text-slate-500">
            <StatusBarInfo />
          </div>
        </main>

        {/* Right properties panel */}
        <aside className="w-64 border-l border-slate-200 bg-white overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Properties</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PropertiesPanel />
          </div>
        </aside>
      </div>

      {/* Modals */}
      <ExportModal canvasRef={canvasRef} />
    </div>
  );
}

function StatusBarInfo() {
  const { elements, selectedElementId, canvasWidth, canvasHeight, zoom } = useDesignStore();
  const selected = elements.find((e) => e.id === selectedElementId);

  return (
    <>
      <span>{canvasWidth} × {canvasHeight}px</span>
      <span>•</span>
      <span>{Math.round(zoom * 100)}%</span>
      <span>•</span>
      <span>{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
      {selected && (
        <>
          <span>•</span>
          <span className="text-indigo-600">
            {selected.type} — x:{selected.x} y:{selected.y}
          </span>
        </>
      )}
    </>
  );
}
