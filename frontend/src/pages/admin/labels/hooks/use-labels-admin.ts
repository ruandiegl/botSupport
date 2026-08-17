import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ConversationLabel } from "@/types";

export type LabelPayload = { name: string; slug: string; color: string; icon?: string | null };

export function useCreateLabel() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (data: LabelPayload) => apiFetch<ConversationLabel>("/labels", { method: "POST", body: JSON.stringify(data) }), onSuccess: () => client.invalidateQueries({ queryKey: ["labels"] }) });
}
export function useUpdateLabel() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: LabelPayload }) => apiFetch<ConversationLabel>(`/labels/${id}`, { method: "PATCH", body: JSON.stringify(data) }), onSuccess: () => client.invalidateQueries({ queryKey: ["labels"] }) });
}
export function useDeleteLabel() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiFetch(`/labels/${id}`, { method: "DELETE" }), onSuccess: () => { client.invalidateQueries({ queryKey: ["labels"] }); client.invalidateQueries({ queryKey: ["conversations"] }); } });
}
