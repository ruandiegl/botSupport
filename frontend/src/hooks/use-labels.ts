import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ConversationLabel } from "@/types";

type LabelList = { items: ConversationLabel[]; total: number; page: number; limit: number; totalPages: number };

export function useLabels(enabled = true) {
  return useQuery({ queryKey: ["labels"], queryFn: () => apiFetch<LabelList>("/labels?limit=100"), enabled, staleTime: 60_000 });
}

export function useAssignConversationLabel(conversationId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => apiFetch(`/conversations/${conversationId}/labels`, { method: "POST", body: JSON.stringify({ labelId }) }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["conversation", conversationId] }); client.invalidateQueries({ queryKey: ["conversations"] }); },
  });
}

export function useRemoveConversationLabel(conversationId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => apiFetch(`/conversations/${conversationId}/labels/${labelId}`, { method: "DELETE" }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["conversation", conversationId] }); client.invalidateQueries({ queryKey: ["conversations"] }); },
  });
}
