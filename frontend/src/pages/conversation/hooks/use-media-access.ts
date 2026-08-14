import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/api-config";

export type MediaAccessPurpose = "content" | "thumbnail" | "download";

type MediaAccessResponse = {
  mediaId: string;
  purpose: MediaAccessPurpose;
  ticketExpiresAt: string;
  url: string;
};

export async function requestMediaAccess(
  conversationId: string,
  messageId: string,
  purpose: MediaAccessPurpose,
) {
  return apiFetch<MediaAccessResponse>(
    `/conversations/${conversationId}/messages/${messageId}/media-access`,
    { method: "POST", body: JSON.stringify({ purpose }) },
  );
}

export function resolveMediaUrl(relativeUrl: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${relativeUrl}`;
}

export function useMediaAccess(
  conversationId: string,
  messageId: string,
  purpose: MediaAccessPurpose,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["media-access", conversationId, messageId, purpose],
    queryFn: () => requestMediaAccess(conversationId, messageId, purpose),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
