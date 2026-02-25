import useSWR from "swr";
import { Design, Folder, DesignCollaborator, DesignVersion } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDesigns(options?: {
  search?: string;
  sort?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (options?.search) params.set("search", options.search);
  if (options?.sort) params.set("sort", options.sort);
  if (options?.tag) params.set("tag", options.tag);
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));

  const queryString = params.toString();
  const url = `/api/designs${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<{
    designs: Design[];
    total: number;
  }>(url, fetcher);

  return {
    designs: data?.designs ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useDesign(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Design>(
    id ? `/api/designs/${id}` : null,
    fetcher,
  );

  return { design: data, isLoading, error, mutate };
}

export async function saveDesign(designData: {
  id?: string;
  name: string;
  description?: string;
  data: unknown;
  frontLayers?: unknown;
  backLayers?: unknown;
  isDoubleSided?: boolean;
  width: number;
  height: number;
  thumbnail?: string;
  thumbnailUrl?: string;
  templateId?: string;
  tags?: string[];
}) {
  const { id, ...body } = designData;
  const url = id ? `/api/designs/${id}` : "/api/designs";
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? "Failed to save design");
  }

  return res.json();
}

export async function duplicateDesign(id: string) {
  const res = await fetch(`/api/designs/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch design for duplication");
  }

  const design = await res.json();

  return saveDesign({
    name: `Copy of ${design.name}`,
    description: design.description,
    data: design.data,
    frontLayers: design.frontLayers,
    backLayers: design.backLayers,
    isDoubleSided: design.isDoubleSided,
    width: design.width,
    height: design.height,
    thumbnail: design.thumbnail,
    thumbnailUrl: design.thumbnailUrl,
    templateId: design.templateId,
    tags: design.tags,
  });
}

export async function deleteDesign(id: string) {
  const res = await fetch(`/api/designs/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? "Failed to delete design");
  }
  return res.json();
}

// ── Folders ─────────────────────────────────────────────────────────

export function useFolders() {
  const { data, error, isLoading, mutate } = useSWR<Folder[]>(
    "/api/folders",
    fetcher,
  );
  return { folders: Array.isArray(data) ? data : [], isLoading, error, mutate };
}

export async function createFolder(name: string, color?: string) {
  const res = await fetch("/api/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) throw new Error("Failed to create folder");
  return res.json();
}

export async function updateFolder(
  id: string,
  data: { name?: string; color?: string },
) {
  const res = await fetch(`/api/folders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update folder");
  return res.json();
}

export async function deleteFolder(id: string) {
  const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete folder");
  return res.json();
}

export async function moveDesignToFolder(
  designId: string,
  folderId: string | null,
) {
  const res = await fetch(`/api/designs/${designId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folderId }),
  });
  if (!res.ok) throw new Error("Failed to move design");
  return res.json();
}

// ── Collaboration ───────────────────────────────────────────────────

export function useCollaborators(designId: string) {
  const { data, error, isLoading, mutate } = useSWR<DesignCollaborator[]>(
    designId ? `/api/designs/${designId}/collaborators` : null,
    fetcher,
  );
  return {
    collaborators: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

export async function addCollaborator(
  designId: string,
  email: string,
  role: "viewer" | "editor",
) {
  const res = await fetch(`/api/designs/${designId}/collaborators`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to add collaborator");
  }
  return res.json();
}

export async function removeCollaborator(
  designId: string,
  collaboratorId: string,
) {
  const res = await fetch(
    `/api/designs/${designId}/collaborators/${collaboratorId}`,
    {
      method: "DELETE",
    },
  );
  if (!res.ok) throw new Error("Failed to remove collaborator");
  return res.json();
}

// ── Version History ─────────────────────────────────────────────────

export function useVersions(designId: string) {
  const { data, error, isLoading, mutate } = useSWR<DesignVersion[]>(
    designId ? `/api/designs/${designId}/versions` : null,
    fetcher,
  );
  return {
    versions: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

export async function restoreVersion(designId: string, versionId: string) {
  const res = await fetch(
    `/api/designs/${designId}/versions/${versionId}/restore`,
    {
      method: "POST",
    },
  );
  if (!res.ok) throw new Error("Failed to restore version");
  return res.json();
}
