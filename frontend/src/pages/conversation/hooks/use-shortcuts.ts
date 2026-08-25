import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Shortcut, ShortcutType } from "@/types";

export function useAvailableShortcuts(conversationId: string | undefined, q: string, type: ShortcutType | "ALL", enabled: boolean) {
  const params = new URLSearchParams();
  if (conversationId) params.set("conversationId", conversationId);
  if (q) params.set("q", q);
  if (type !== "ALL") params.set("type", type);
  return useQuery<Shortcut[]>({
    queryKey: ["shortcuts", "available", conversationId, q, type],
    queryFn: () => apiFetch(`/shortcuts/available?${params.toString()}`),
    enabled,
    staleTime: 30_000,
  });
}

export function useRegisterShortcutUse() {
  return useMutation({
    mutationFn: ({ id, conversationId }: { id: string; conversationId?: string }) =>
      apiFetch(`/shortcuts/${id}/use`, { method: "POST", body: JSON.stringify(conversationId ? { conversationId } : {}) }),
  });
}
