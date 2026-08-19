import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { BotExclusion, BotExclusionListResponse } from "@/types";

export type BotExclusionPayload = { phone: string; label?: string | null; reason?: string | null };

export function useBotExclusions(activeOnly = false) {
  return useQuery({
    queryKey: ["bot-exclusions", { activeOnly }],
    queryFn: async () => {
      const response = await apiFetch<BotExclusionListResponse | BotExclusion[]>(`/bot-exclusions?page=1&limit=100&activeOnly=${activeOnly}`);
      if (Array.isArray(response)) return { items: response, page: 1, limit: response.length, total: response.length, totalPages: 1 };
      return response;
    },
  });
}

export function useCreateBotExclusion() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (data: BotExclusionPayload) => apiFetch<BotExclusion>("/bot-exclusions", { method: "POST", body: JSON.stringify(data) }), onSuccess: () => client.invalidateQueries({ queryKey: ["bot-exclusions"] }) });
}

export function useUpdateBotExclusion() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: BotExclusionPayload | { isActive: boolean } }) => apiFetch<BotExclusion>(`/bot-exclusions/${id}`, { method: "PATCH", body: JSON.stringify(data) }), onSuccess: () => client.invalidateQueries({ queryKey: ["bot-exclusions"] }) });
}

export function useRemoveBotExclusion() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiFetch<BotExclusion>(`/bot-exclusions/${id}`, { method: "DELETE" }), onSuccess: () => client.invalidateQueries({ queryKey: ["bot-exclusions"] }) });
}
