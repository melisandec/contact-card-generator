import useSWR from 'swr';
import { Design } from '@/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDesigns(options?: {
  search?: string;
  sort?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (options?.search) params.set('search', options.search);
  if (options?.sort) params.set('sort', options.sort);
  if (options?.tag) params.set('tag', options.tag);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));

  const queryString = params.toString();
  const url = `/api/designs${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<{ designs: Design[]; total: number }>(
    url,
    fetcher
  );

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
    fetcher
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
  const url = id ? `/api/designs/${id}` : '/api/designs';
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? 'Failed to save design');
  }

  return res.json();
}

export async function duplicateDesign(id: string) {
  const res = await fetch(`/api/designs/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch design for duplication');
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
  const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? 'Failed to delete design');
  }
  return res.json();
}
