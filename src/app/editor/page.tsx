"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Canvas } from "@/components/editor/Canvas";
import { Sidebar } from "@/components/editor/Sidebar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { GlobalStylesPanel } from "@/components/editor/GlobalStylesPanel";
import { Toolbar } from "@/components/editor/Toolbar";
import { ExportModal } from "@/components/editor/ExportModal";
import { SaveModal } from "@/components/editor/SaveModal";
import { ImportContactModal } from "@/components/editor/ImportContactModal";
import { CRMPanel } from "@/components/editor/CRMPanel";
import { useDesignStore } from "@/store/design-store";
import { useUIStore } from "@/store/ui-store";
import { useDesign } from "@/hooks/useDesign";
import { cn } from "@/lib/utils";
import { Loader2, UserPlus, Building2 } from "lucide-react";

function EditorContent() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [rightPanelTab, setRightPanelTab] = useState<
    "properties" | "globalStyles"
  >("properties");
  const [splitView, setSplitView] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [crmPanelOpen, setCrmPanelOpen] = useState(false);
  const {
    zoom,
    setZoom,
    undo,
    redo,
    loadDesign,
    loadFullDesign,
    setCurrentDesignId,
    currentSide,
    setCurrentSide,
    isDoubleSided,
    groupElements,
    ungroupElements,
  } = useDesignStore();
  const { exportModalOpen } = useUIStore();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");
  const { design, isLoading: isDesignLoading } = useDesign(designId ?? "");

  // Load design from URL query param
  useEffect(() => {
    if (design && designId) {
      if (design.frontLayers) {
        loadFullDesign({
          id: design.id,
          frontLayers: design.frontLayers,
          backLayers: design.backLayers || [],
          isDoubleSided: design.isDoubleSided,
          width: design.width,
          height: design.height,
        });
      } else if (design.data) {
        setCurrentDesignId(design.id);
        loadDesign(
          design.data.elements || [],
          design.data.background || { type: "solid", color: "#ffffff" },
          design.width,
          design.height,
        );
      }
    }
  }, [design, designId, loadDesign, loadFullDesign, setCurrentDesignId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        setZoom(Math.min(zoom + 0.1, 3));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom(Math.max(zoom - 0.1, 0.25));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoom(1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        if (isDoubleSided) {
          setCurrentSide(currentSide === "front" ? "back" : "front");
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "g" && !e.shiftKey) {
        e.preventDefault();
        groupElements();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "g" && e.shiftKey) {
        e.preventDefault();
        ungroupElements();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoom, setZoom, undo, redo, isDoubleSided, currentSide, setCurrentSide, groupElements, ungroupElements]);

  if (designId && isDesignLoading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50 items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500 mt-3">Loading design...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top toolbar */}
      <Toolbar
        splitView={splitView}
        onToggleSplitView={() => setSplitView((v) => !v)}
      >
        {/* Integration buttons in toolbar */}
        <button
          onClick={() => setImportModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          title="Import contact from vCard"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Import</span>
        </button>
        <button
          onClick={() => setCrmPanelOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          title="Push to CRM"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">CRM</span>
        </button>
      </Toolbar>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <Sidebar />

        {/* Canvas */}
        <main className="flex-1 overflow-hidden relative">
          <Canvas exportRef={canvasRef} splitView={splitView} />

          {/* Status bar */}
          <div className="absolute bottom-0 left-0 right-0 h-7 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center px-3 gap-4 text-xs text-slate-500">
            <StatusBarInfo />
          </div>
        </main>

        {/* Right properties panel */}
        <aside className="w-64 border-l border-slate-200 bg-white overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1">
            <button
              onClick={() => setRightPanelTab("properties")}
              className={cn(
                "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors",
                rightPanelTab === "properties"
                  ? "text-indigo-700 bg-indigo-50"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              Properties
            </button>
            <button
              onClick={() => setRightPanelTab("globalStyles")}
              className={cn(
                "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors",
                rightPanelTab === "globalStyles"
                  ? "text-indigo-700 bg-indigo-50"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              Global Styles
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rightPanelTab === "properties" ? (
              <PropertiesPanel />
            ) : (
              <GlobalStylesPanel />
            )}
          </div>
        </aside>
      </div>

      {/* Modals */}
      <ExportModal canvasRef={canvasRef} />
      <SaveModal />
      <ImportContactModal open={importModalOpen} onOpenChange={setImportModalOpen} />
      <CRMPanel open={crmPanelOpen} onOpenChange={setCrmPanelOpen} />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}

function StatusBarInfo() {
  const {
    elements,
    selectedElementId,
    canvasWidth,
    canvasHeight,
    zoom,
    currentSide,
    setCurrentSide,
    isDoubleSided,
  } = useDesignStore();
  const selected = elements.find((e) => e.id === selectedElementId);

  return (
    <>
      <span>
        {canvasWidth} × {canvasHeight}px
      </span>
      <span>•</span>
      <span>{Math.round(zoom * 100)}%</span>
      <span>•</span>
      <span>
        {elements.length} element{elements.length !== 1 ? "s" : ""}
      </span>
      {selected && (
        <>
          <span>•</span>
          <span className="text-indigo-600">
            {selected.type} — x:{selected.x} y:{selected.y}
          </span>
        </>
      )}
      {isDoubleSided && (
        <>
          <span>•</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentSide("front")}
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                currentSide === "front"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              Front
            </button>
            <button
              onClick={() => setCurrentSide("back")}
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                currentSide === "back"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              Back
            </button>
          </div>
        </>
      )}
    </>
  );
}
