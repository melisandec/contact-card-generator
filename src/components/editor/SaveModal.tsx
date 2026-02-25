"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/store/ui-store";
import { useDesignStore } from "@/store/design-store";
import { saveGuestDesign } from "@/lib/guest-storage";
import { Save, Loader2 } from "lucide-react";

export function SaveModal() {
  const router = useRouter();
  const { saveModalOpen, setSaveModalOpen, showNotification } = useUIStore();
  const {
    currentDesignId,
    setCurrentDesignId,
    elements,
    background,
    frontLayers,
    backLayers,
    frontBackground,
    isDoubleSided,
    canvasWidth,
    canvasHeight,
  } = useDesignStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (saveModalOpen) {
      setName("");
      setDescription("");
      setError("");
    }
  }, [saveModalOpen]);

  const buildDesignPayload = () => {
    const data = {
      elements: isDoubleSided ? frontLayers : elements,
      background: isDoubleSided ? frontBackground : background,
    };

    return {
      name: name.trim() || "Untitled Design",
      description: description.trim() || undefined,
      data,
      frontLayers: isDoubleSided ? frontLayers : elements,
      backLayers: isDoubleSided ? backLayers : [],
      isDoubleSided,
      width: canvasWidth,
      height: canvasHeight,
    };
  };

  const saveToApi = async () => {
    const payload = buildDesignPayload();
    const isUpdate = !!currentDesignId;
    const url = isUpdate ? `/api/designs/${currentDesignId}` : "/api/designs";
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Failed to save (${res.status})`);
    }

    const saved = await res.json();
    return saved;
  };

  const saveToGuest = () => {
    const payload = buildDesignPayload();
    return saveGuestDesign({
      ...(currentDesignId ? { id: currentDesignId } : {}),
      name: payload.name,
      description: payload.description,
      data: payload.data,
      frontLayers: payload.frontLayers,
      backLayers: payload.backLayers,
      isDoubleSided: payload.isDoubleSided,
      width: payload.width,
      height: payload.height,
      tags: [],
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      // Try saving to API first (for authenticated users)
      const saved = await saveToApi();
      setCurrentDesignId(saved.id);
      showNotification("Design saved successfully!", "success");
      setSaveModalOpen(false);
      // Update URL if this is a new design so re-saves will update it
      if (!currentDesignId) {
        router.replace(`/editor?id=${saved.id}`);
      }
    } catch {
      // If unauthorized (not signed in), save locally
      try {
        const saved = saveToGuest();
        setCurrentDesignId(saved.id);
        showNotification("Design saved locally!", "success");
        setSaveModalOpen(false);
      } catch {
        setError("Failed to save design. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={saveModalOpen}
      onOpenChange={setSaveModalOpen}
      title={currentDesignId ? "Update Design" : "Save Design"}
      description="Save your design to access it later from My Cards."
      size="sm"
    >
      <div className="space-y-4 pt-2">
        <Input
          label="Design name"
          placeholder="My Business Card"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="w-full">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Description (optional)
          </label>
          <textarea
            className="flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            rows={2}
            placeholder="A brief description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSaveModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            leftIcon={
              isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {isSaving ? "Saving..." : currentDesignId ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
