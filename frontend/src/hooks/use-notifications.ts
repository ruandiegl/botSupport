import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useSocketEvent } from "@/lib/use-socket-events";
import type { AgentNotification, NotificationListResponse } from "@/types";

type NotificationPayload =
  | AgentNotification[]
  | { items?: AgentNotification[]; data?: AgentNotification[]; unreadCount?: number; meta?: { total?: number; unreadCount?: number; page?: number; limit?: number; totalPages?: number } };

const emptyResponse: NotificationListResponse = {
  items: [], page: 1, limit: 30, total: 0, unreadCount: 0, totalPages: 0,
};

function normalize(payload: NotificationPayload): NotificationListResponse {
  if (Array.isArray(payload)) {
    return { ...emptyResponse, items: payload, total: payload.length, unreadCount: payload.filter((item) => !item.readAt && !item.dismissedAt).length };
  }
  const response = payload as Exclude<NotificationPayload, AgentNotification[]>;
  const meta = response.meta ?? {};
  const items = response.items ?? response.data ?? [];
  const unreadCount = response.unreadCount ?? meta.unreadCount ?? items.filter((item) => !item.readAt && !item.dismissedAt).length;
  const total = meta.total ?? response.items?.length ?? items.length;
  const limit = meta.limit ?? 30;
  return { items, page: meta.page ?? 1, limit, total, unreadCount, totalPages: meta.totalPages ?? Math.ceil(total / limit) };
}

function isMissingEndpoint(error: unknown) {
  return error instanceof Error && /HTTP 404|HTTP 405|HTTP 501/.test(error.message);
}

export function useNotifications(enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery<NotificationListResponse>({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      try {
        const payload = await apiFetch<NotificationPayload>("/notifications?unreadOnly=false&page=1&limit=30");
        return normalize(payload);
      } catch (error) {
        if (isMissingEndpoint(error)) return emptyResponse;
        throw error;
      }
    },
    enabled,
    staleTime: 5_000,
    retry: false,
  });

  const unreadCountQuery = useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      try {
        const response = await apiFetch<{ count?: number }>("/notifications/unread-count");
        return response.count ?? 0;
      } catch (error) {
        if (isMissingEndpoint(error)) return 0;
        throw error;
      }
    },
    enabled,
    staleTime: 5_000,
    retry: false,
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);
  useSocketEvent("notification:new", refresh);
  useSocketEvent("notification:read", refresh);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      try { return await apiFetch(`/notifications/${id}/read`, { method: "POST" }); }
      catch (error) { if (isMissingEndpoint(error)) return {}; throw error; }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "list"] });
      const previous = queryClient.getQueryData<NotificationListResponse>(["notifications", "list"]);
      if (previous) {
        const existing = previous.items.find((item) => item.id === id);
        const wasUnread = Boolean(existing && !existing.readAt && !existing.dismissedAt);
        const previousCount = queryClient.getQueryData<number>(["notifications", "unread-count"]);
        if (wasUnread && previousCount !== undefined) queryClient.setQueryData(["notifications", "unread-count"], Math.max(0, previousCount - 1));
        queryClient.setQueryData<NotificationListResponse>(["notifications", "list"], {
          ...previous,
          items: previous.items.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item),
          unreadCount: Math.max(0, previous.unreadCount - (wasUnread ? 1 : 0)),
        });
      }
      return { previous };
    },
    onError: (_error, _id, context) => { if (context?.previous) queryClient.setQueryData(["notifications", "list"], context.previous); },
    onSettled: refresh,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      try { return await apiFetch("/notifications/read-all", { method: "POST" }); }
      catch (error) { if (isMissingEndpoint(error)) return {}; throw error; }
    },
    onMutate: async () => {
      const previous = queryClient.getQueryData<NotificationListResponse>(["notifications", "list"]);
      if (previous) {
        queryClient.setQueryData<NotificationListResponse>(["notifications", "list"], { ...previous, unreadCount: 0, items: previous.items.map((item) => item.readAt || item.dismissedAt ? item : { ...item, readAt: new Date().toISOString() }) });
        queryClient.setQueryData(["notifications", "unread-count"], 0);
      }
      return { previous };
    },
    onError: (_error, _variables, context) => { if (context?.previous) queryClient.setQueryData(["notifications", "list"], context.previous); },
    onSettled: refresh,
  });

  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      try { return await apiFetch(`/notifications/${id}/dismiss`, { method: "POST" }); }
      catch (error) { if (isMissingEndpoint(error)) return {}; throw error; }
    },
    onMutate: async (id) => {
      const previous = queryClient.getQueryData<NotificationListResponse>(["notifications", "list"]);
      if (previous) {
        const existing = previous.items.find((item) => item.id === id);
        const wasUnread = Boolean(existing && !existing.readAt && !existing.dismissedAt);
        if (wasUnread) {
          const previousCount = queryClient.getQueryData<number>(["notifications", "unread-count"]);
          if (previousCount !== undefined) queryClient.setQueryData(["notifications", "unread-count"], Math.max(0, previousCount - 1));
        }
        const dismissedAt = new Date().toISOString();
        queryClient.setQueryData<NotificationListResponse>(["notifications", "list"], { ...previous, unreadCount: Math.max(0, previous.unreadCount - (wasUnread ? 1 : 0)), items: previous.items.map((item) => item.id === id ? { ...item, readAt: item.readAt ?? dismissedAt, dismissedAt } : item) });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => { if (context?.previous) queryClient.setQueryData(["notifications", "list"], context.previous); },
    onSettled: refresh,
  });

  return {
    ...query,
    notifications: query.data?.items ?? [],
    unreadCount: unreadCountQuery.data ?? query.data?.unreadCount ?? 0,
    markRead,
    markAllRead,
    dismiss,
  };
}
