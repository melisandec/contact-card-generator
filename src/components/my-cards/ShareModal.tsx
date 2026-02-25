"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useCollaborators,
  addCollaborator,
  removeCollaborator,
} from "@/hooks/useDesign";
import {
  Users,
  UserPlus,
  Trash2,
  Loader2,
  Mail,
  Shield,
  Pencil,
} from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: string;
  designName: string;
}

export function ShareModal({
  open,
  onOpenChange,
  designId,
  designName,
}: ShareModalProps) {
  const { collaborators, isLoading, mutate } = useCollaborators(designId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsAdding(true);
    setError("");
    setSuccess("");

    try {
      await addCollaborator(designId, email.trim(), role);
      mutate();
      setEmail("");
      setSuccess(`Shared with ${email.trim()}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add collaborator",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (collabId: string) => {
    try {
      await removeCollaborator(designId, collabId);
      mutate();
    } catch (err) {
      console.error("Failed to remove collaborator:", err);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Share Design"
      size="md"
    >
      <p className="text-sm text-slate-500 -mt-4 mb-4">
        Share <strong className="text-slate-700">{designName}</strong> with team
        members
      </p>

      {/* Add collaborator form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-3.5 h-3.5" />}
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
          className="h-9 px-2 text-sm border border-slate-200 rounded-lg bg-white"
          aria-label="Collaborator role"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <Button
          type="submit"
          size="sm"
          disabled={isAdding || !email.trim()}
          loading={isAdding}
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </form>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      {success && <p className="text-sm text-emerald-600 mb-3">{success}</p>}

      {/* Collaborator list */}
      <div className="border-t border-slate-100 pt-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          People with access
        </h4>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : collaborators.length === 0 ? (
          <p className="text-sm text-slate-400 py-3 text-center">
            No collaborators yet
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50"
              >
                {collab.user?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={collab.user.image}
                    alt={collab.user.name || "Avatar"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-medium">
                    {(
                      collab.user?.name?.[0] ||
                      collab.user?.email?.[0] ||
                      "?"
                    ).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {collab.user?.name || collab.user?.email}
                  </p>
                  {collab.user?.name && (
                    <p className="text-xs text-slate-400 truncate">
                      {collab.user.email}
                    </p>
                  )}
                </div>

                <span className="flex items-center gap-1 text-xs text-slate-400">
                  {collab.role === "editor" ? (
                    <>
                      <Pencil className="w-3 h-3" /> Editor
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3" /> Viewer
                    </>
                  )}
                </span>

                <button
                  onClick={() => handleRemove(collab.id)}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                  title="Remove access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
