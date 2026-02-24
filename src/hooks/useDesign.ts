import useSWR from 'swr';
import { Design } from '@/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDesigns() {
  const { data, error, isLoading, mutate } = useSWR<{ designs: Design[]; total: number }>(
    '/api/designs',
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
  data: unknown;
  width: number;
  height: number;
  thumbnail?: string;
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

export async function deleteDesign(id: string) {
  const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? 'Failed to delete design');
  }
  return res.json();
}
