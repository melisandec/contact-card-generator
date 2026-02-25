"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useVersions, restoreVersion } from "@/hooks/useDesign";
import { History, RotateCcw, Loader2, Clock } from "lucide-react";

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: string;
  designName: string;
  onRestore?: () => void;
}

export function VersionHistoryModal({
  open,
  onOpenChange,
  designId,
  designName,
  onRestore,
}: VersionHistoryModalProps) {
  const { versions, isLoading, mutate } = useVersions(designId);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    if (
      !confirm(
        "Restore this version? Your current design will be saved as a new version first.",
      )
    ) {
      return;
    }
    setRestoringId(versionId);
    try {
      await restoreVersion(designId, versionId);
      mutate();
      onRestore?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to restore version:", err);
    } finally {
      setRestoringId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const timeAgo = (dateStr: string) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Version History"
      size="md"
    >
      <p className="text-sm text-slate-500 -mt-4 mb-4">
        Version history for{" "}
        <strong className="text-slate-700">{designName}</strong>
      </p>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No versions yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Versions are created automatically when you save changes
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto -mx-2 px-2">
          {versions.map((version, i) => (
            <div
              key={version.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center self-stretch">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    i === 0 ? "bg-indigo-500" : "bg-slate-300"
                  }`}
                />
                {i < versions.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 mt-1" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-700">
                    {version.name || `Version ${version.version}`}
                  </p>
                  {i === 0 && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                      Latest
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {timeAgo(version.createdAt)}
                </p>
              </div>

              {i > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(version.id)}
                  disabled={restoringId === version.id}
                  loading={restoringId === version.id}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Restore
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
