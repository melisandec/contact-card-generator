'use client';

import Link from 'next/link';
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
  ArrowRightLeft,
  Copy,
  Columns2,
  Ruler,
  Lock,
  Sparkles,
  CreditCard,
  ChevronLeft,
  LayoutGrid,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clamp, cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface ToolbarProps {
  splitView?: boolean;
  onToggleSplitView?: () => void;
  onOpenAIGenerator?: () => void;
  children?: React.ReactNode;
}

export function Toolbar({ splitView, onToggleSplitView, onOpenAIGenerator, children }: ToolbarProps) {
  const {
    zoom, setZoom, undo, redo, clearCanvas, historyIndex, history,
    currentSide, setCurrentSide, isDoubleSided, setIsDoubleSided,
    copyStylesToSide, copyFrontToBack, mirrorFrontToBack,
    guidesVisible, setGuidesVisible, guidesLocked, setGuidesLocked,
  } = useDesignStore();
  const { setExportModalOpen, setSaveModalOpen } = useUIStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const zoomIn = () => setZoom(clamp(zoom + 0.1, 0.25, 3));
  const zoomOut = () => setZoom(clamp(zoom - 0.1, 0.25, 3));
  const zoomReset = () => setZoom(1);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-white h-14">
      {/* Back to My Cards */}
      <Link
        href="/my-cards"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors group mr-1"
        title="Back to My Cards"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <LayoutGrid className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">My Cards</span>
      </Link>

      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md" />
        <span className="font-bold text-sm text-slate-800 hidden md:inline">CardCrafter</span>
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

      {/* Guides toggle */}
      <div className="h-5 w-px bg-slate-200" />
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setGuidesVisible(!guidesVisible)}
          title={guidesVisible ? 'Hide rulers & guides' : 'Show rulers & guides'}
          className={cn(guidesVisible && 'bg-slate-100 text-indigo-600')}
        >
          <Ruler className="w-4 h-4" />
        </Button>
        {guidesVisible && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setGuidesLocked(!guidesLocked)}
              title={guidesLocked ? 'Unlock guides' : 'Lock guides'}
              className={cn(guidesLocked && 'bg-slate-100 text-amber-600')}
            >
              <Lock className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Double-sided toggle */}
      <div className="h-5 w-px bg-slate-200" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDoubleSided(!isDoubleSided)}
        title={isDoubleSided ? 'Switch to single-sided card' : 'Enable double-sided card'}
        className={cn(isDoubleSided && 'bg-indigo-50 text-indigo-600')}
      >
        <CreditCard className="w-4 h-4 mr-1" />
        <span className="text-xs hidden sm:inline">{isDoubleSided ? '2-sided' : '1-sided'}</span>
      </Button>

      {/* AI Generate */}
      <div className="h-5 w-px bg-slate-200" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenAIGenerator}
        title="AI Design Generator"
        className="text-indigo-600 hover:bg-indigo-50"
      >
        <Sparkles className="w-4 h-4 mr-1" />
        <span className="text-xs">✨ AI Generate</span>
      </Button>

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

          {/* Copy / Mirror / Split-view */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm" title="Side actions">
                <Copy className="w-4 h-4" />
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 text-sm"
                sideOffset={4}
              >
                <DropdownMenu.Item
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 outline-none"
                  onClick={() => copyFrontToBack()}
                >
                  Copy front to back
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 outline-none"
                  onClick={() => mirrorFrontToBack()}
                >
                  Mirror front on back
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 outline-none"
                  onClick={() => copyStylesToSide()}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 inline mr-1.5" />
                  Copy styles to other side
                </DropdownMenu.Item>
                {onToggleSplitView && (
                  <>
                    <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                    <DropdownMenu.Item
                      className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 outline-none"
                      onClick={onToggleSplitView}
                    >
                      <Columns2 className="w-3.5 h-3.5 inline mr-1.5" />
                      {splitView ? 'Hide split view' : 'Show split view'}
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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

      {/* Custom toolbar children (Import, CRM, etc.) */}
      {children && (
        <>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-0.5">
            {children}
          </div>
        </>
      )}

      <div className="h-5 w-px bg-slate-200" />

      {/* Language switcher */}
      <LanguageSwitcher />

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
