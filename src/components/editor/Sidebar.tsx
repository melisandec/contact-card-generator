"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDesignStore } from "@/store/design-store";
import { useUIStore } from "@/store/ui-store";
import { TemplatesPanel } from "./TemplatesPanel";
import { ElementsPanel } from "./ElementsPanel";
import { TextPanel } from "./TextPanel";
import { BackgroundPanel } from "./BackgroundPanel";
import { LayerPanel } from "./LayerPanel";
import { DigitalProfilePanel } from "./DigitalProfilePanel";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  Shapes,
  Upload,
  Type,
  ImageIcon,
  Layers,
  ChevronLeft,
  UserCircle,
  Lock,
} from "lucide-react";
import type { SidebarTab } from "@/types";

const tabs: Array<{ id: SidebarTab; label: string; icon: React.ReactNode }> = [
  {
    id: "templates",
    label: "Templates",
    icon: <LayoutTemplate className="w-4 h-4" />,
  },
  { id: "elements", label: "Elements", icon: <Shapes className="w-4 h-4" /> },
  { id: "uploads", label: "Uploads", icon: <Upload className="w-4 h-4" /> },
  { id: "text", label: "Text", icon: <Type className="w-4 h-4" /> },
  { id: "background", label: "BG", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "layers", label: "Layers", icon: <Layers className="w-4 h-4" /> },
  { id: "profile", label: "Profile", icon: <UserCircle className="w-4 h-4" /> },
];

export function Sidebar() {
  const {
    activeSidebarTab,
    setActiveSidebarTab,
    sidebarCollapsed,
    toggleSidebar,
  } = useUIStore();
  const { data: session, status: authStatus } = useSession();
  const isGuest = authStatus !== "loading" && !session;

  const renderPanel = () => {
    switch (activeSidebarTab) {
      case "templates":
        return <TemplatesPanel />;
      case "elements":
        return <ElementsPanel />;
      case "text":
        return <TextPanel />;
      case "background":
        return <BackgroundPanel />;
      case "layers":
        return <LayerPanel />;
      case "uploads":
        return <UploadsPanel />;
      case "profile":
        return <DigitalProfilePanel />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex h-full border-r border-slate-200 bg-white transition-all duration-200",
        sidebarCollapsed ? "w-12" : "w-72",
      )}
    >
      {/* Tab icons column */}
      <div className="flex flex-col items-center py-2 w-12 border-r border-slate-100 shrink-0">
        {tabs.map((tab) => {
          const requiresAuth = tab.id === "profile";
          const showLock = requiresAuth && isGuest;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSidebarTab(tab.id);
                if (sidebarCollapsed) toggleSidebar();
              }}
              className={cn(
                "relative flex flex-col items-center justify-center w-10 h-12 rounded-lg mb-1 text-xs gap-0.5 transition-colors",
                activeSidebarTab === tab.id && !sidebarCollapsed
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
              )}
              title={showLock ? `${tab.label} — Sign in required` : tab.label}
            >
              {tab.icon}
              <span className="text-[9px]">{tab.label}</span>
              {showLock && (
                <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-amber-500" />
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              sidebarCollapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Panel content */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {tabs.find((t) => t.id === activeSidebarTab)?.label}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">{renderPanel()}</div>
        </div>
      )}
    </div>
  );
}

function UploadsPanel() {
  const { addElement } = useDesignStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      addElement({
        type: "image",
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        src,
        objectFit: "cover",
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFileUpload(file);
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFileUpload(file);
          };
          input.click();
        }}
      >
        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500">
          Drop image here or click to upload
        </p>
        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, GIF, WebP</p>
      </div>

      <div className="mt-4">
        <h4 className="text-xs font-semibold text-slate-500 mb-2">
          Stock Photos
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
              onClick={() => {
                addElement({
                  type: "image",
                  x: 50,
                  y: 50,
                  width: 200,
                  height: 150,
                  rotation: 0,
                  opacity: 1,
                  locked: false,
                  visible: true,
                  zIndex: 0,
                  src: `https://picsum.photos/seed/${i + 10}/400/300`,
                  objectFit: "cover",
                });
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://picsum.photos/seed/${i + 10}/200/150`}
                alt={`Stock photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
