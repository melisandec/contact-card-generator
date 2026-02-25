import useSWR from "swr";
import type { DigitalProfile, ProfileAnalytics } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProfiles() {
  const { data, error, isLoading, mutate } = useSWR<DigitalProfile[]>(
    "/api/profiles",
    fetcher,
  );
  return {
    profiles: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

export function useProfile(id: string) {
  const { data, error, isLoading, mutate } = useSWR<DigitalProfile>(
    id ? `/api/profiles/${id}` : null,
    fetcher,
  );
  return { profile: data, isLoading, error, mutate };
}

export function useProfileAnalytics(id: string) {
  const { data, error, isLoading, mutate } = useSWR<ProfileAnalytics>(
    id ? `/api/profiles/${id}/analytics` : null,
    fetcher,
  );
  return { analytics: data, isLoading, error, mutate };
}

export async function createProfile(profileData: Partial<DigitalProfile>) {
  const res = await fetch("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create profile");
  }
  return res.json();
}

export async function updateProfile(id: string, data: Partial<DigitalProfile>) {
  const res = await fetch(`/api/profiles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update profile");
  }
  return res.json();
}

export async function deleteProfile(id: string) {
  const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete profile");
  return res.json();
}

export async function getProfileQR(profileId: string, size = 300) {
  const res = await fetch(`/api/profiles/${profileId}/qr?size=${size}`);
  if (!res.ok) throw new Error("Failed to generate QR code");
  return res.json() as Promise<{
    dataUrl: string;
    profileUrl: string;
    slug: string;
  }>;
}
