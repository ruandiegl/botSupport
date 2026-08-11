import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Conversation, Message } from "@/types";

export function useGetConversation(id: string) {
  return useQuery<Conversation>({
    queryKey: ["conversation", id],
    queryFn: () => apiFetch<Conversation>(`/conversations/${id}`),
    enabled: !!id,
  });
}

export function useMarkConversationRead(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, void>({
    mutationFn: () =>
      apiFetch<Conversation>(`/conversations/${id}/read`, {
        method: "POST",
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["conversation", id], updated);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSendMessage(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Message, Error, { content: string }>({
    mutationFn: (data) =>
      apiFetch<Message>(`/conversations/${id}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useAssumeConversation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, { agentId: string }>({
    mutationFn: (data) =>
      apiFetch<Conversation>(`/conversations/${id}/assume`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["conversation", id], updated);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCloseConversation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, void>({
    mutationFn: () =>
      apiFetch<Conversation>(`/conversations/${id}/close`, {
        method: "POST",
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["conversation", id], updated);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
