"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Folder } from "@/types";
import { FolderPlus, FolderOpen, Trash2, Pencil } from "lucide-react";
import { createFolder, updateFolder, deleteFolder } from "@/hooks/useDesign";

const FOLDER_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
];

interface FolderPanelProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onMutate: () => void;
}

export function FolderPanel({
  folders,
  selectedFolderId,
  onSelectFolder,
  onMutate,
}: FolderPanelProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await createFolder(name.trim(), color);
      onMutate();
      setShowCreate(false);
      setName("");
      setColor(FOLDER_COLORS[0]);
    } catch (err) {
      console.error("Failed to create folder:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingFolder || !name.trim()) return;
    setIsLoading(true);
    try {
      await updateFolder(editingFolder.id, { name: name.trim(), color });
      onMutate();
      setEditingFolder(null);
      setName("");
    } catch (err) {
      console.error("Failed to update folder:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Delete this folder? Designs inside will be moved to "All Cards".',
      )
    )
      return;
    try {
      await deleteFolder(id);
      if (selectedFolderId === id) onSelectFolder(null);
      onMutate();
    } catch (err) {
      console.error("Failed to delete folder:", err);
    }
  };

  const startEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setName(folder.name);
    setColor(folder.color);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Folders
        </h3>
        <button
          onClick={() => {
            setShowCreate(true);
            setName("");
            setColor(FOLDER_COLORS[0]);
          }}
          className="ml-auto text-slate-400 hover:text-indigo-600 transition-colors"
          title="New folder"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* All cards */}
        <button
          onClick={() => onSelectFolder(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedFolderId === null
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          All Cards
        </button>

        {/* Uncategorized */}
        <button
          onClick={() => onSelectFolder("uncategorized")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedFolderId === "uncategorized"
              ? "bg-slate-200 text-slate-800 border border-slate-300"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
          }`}
        >
          Uncategorized
        </button>

        {/* User folders */}
        {folders.map((folder) => (
          <div key={folder.id} className="group relative">
            <button
              onClick={() => onSelectFolder(folder.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedFolderId === folder.id
                  ? "text-white border"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
              style={
                selectedFolderId === folder.id
                  ? { backgroundColor: folder.color, borderColor: folder.color }
                  : {}
              }
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    selectedFolderId === folder.id ? "#fff" : folder.color,
                }}
              />
              {folder.name}
              {folder._count && (
                <span
                  className={`text-xs ${selectedFolderId === folder.id ? "text-white/70" : "text-slate-400"}`}
                >
                  {folder._count.designs}
                </span>
              )}
            </button>

            {/* Edit/Delete on hover */}
            <div className="hidden group-hover:flex absolute -top-1 -right-1 bg-white border border-slate-200 rounded-md shadow-sm z-10">
              <button
                onClick={() => startEdit(folder)}
                className="p-1 text-slate-400 hover:text-indigo-600"
                title="Edit folder"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(folder.id)}
                className="p-1 text-slate-400 hover:text-red-500"
                title="Delete folder"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit folder modal */}
      <Modal
        open={showCreate || !!editingFolder}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            setEditingFolder(null);
          }
        }}
        title={editingFolder ? "Edit Folder" : "New Folder"}
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Folder name"
            placeholder="e.g., Client Cards"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={`Color ${c}`}
                  aria-label={`Select color ${c}`}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-slate-800 scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreate(false);
                setEditingFolder(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={editingFolder ? handleUpdate : handleCreate}
              disabled={isLoading || !name.trim()}
              loading={isLoading}
            >
              {editingFolder ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
