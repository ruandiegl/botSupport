import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Agent, Conversation, Message, MessagePage } from "@/types";

export function useGetConversation(id: string) {
  return useQuery<Conversation>({
    queryKey: ["conversation", id],
    queryFn: () => apiFetch<Conversation>(`/conversations/${id}`),
    enabled: !!id,
  });
}

export function useLoadPreviousMessages(id: string) {
  const queryClient = useQueryClient();
  return useMutation<MessagePage, Error, { before: string }>({
    mutationFn: ({ before }) =>
      apiFetch<MessagePage>(`/conversations/${id}/messages?limit=50&before=${encodeURIComponent(before)}`),
    onSuccess: (page) => {
      queryClient.setQueryData<Conversation>(["conversation", id], (current) => {
        if (!current) return current;
        const existingIds = new Set(current.messages.map((message) => message.id));
        const older = page.items.filter((message) => !existingIds.has(message.id));
        return {
          ...current,
          messages: [...older, ...current.messages],
          messagesPagination: page.pagination,
        };
      });
    },
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
      queryClient.invalidateQueries({ queryKey: ["conversations"], refetchType: "none" });
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
    onSuccess: (message) => {
      queryClient.setQueryData<Conversation>(["conversation", id], (current) => {
        if (!current || current.messages.some((item) => item.id === message.id)) return current;
        return {
          ...current,
          messages: [...current.messages, message],
          lastMessage: message.content,
          lastActivityAt: message.createdAt,
          ...(current.status === "DRAFT" ? { status: "OPEN" as const, queuedAt: message.createdAt } : {}),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"], refetchType: "none" });
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
      queryClient.invalidateQueries({ queryKey: ["conversations"], refetchType: "none" });
    },
  });
}

export function useEligibleAssignees(id: string, enabled = true) {
  return useQuery<{ items: Agent[] }>({
    queryKey: ["conversation-assignees", id],
    queryFn: () => apiFetch<{ items: Agent[] }>(`/conversations/${id}/assignees`),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });
}

export function useDelegateConversation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, { agentId: string; reason?: string }>({
    mutationFn: (data) => apiFetch<Conversation>(`/conversations/${id}/delegate`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["conversation", id], updated);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useCloseConversation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, { reason?: "NORMAL" | "INACTIVITY" | "SILENT" } | void>({
    mutationFn: (data) =>
      apiFetch<Conversation>(`/conversations/${id}/close`, {
        method: "POST",
        ...(data ? { body: JSON.stringify(data) } : {}),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["conversation", id], updated);
      queryClient.invalidateQueries({ queryKey: ["conversations"], refetchType: "none" });
    },
  });
}
