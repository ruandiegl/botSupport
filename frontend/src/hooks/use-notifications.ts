import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useSocketEvent } from "@/lib/use-socket-events";
import type { AgentNotification, NotificationListResponse } from "@/types";

/**
 * Internal browser event used to fan out the single Socket.IO notification
 * subscription to global UI concerns (title, favicon and native alerts).
 * Keeping this in the existing hook prevents a second notification:new
 * listener from being attached by the Shell.
 */
export const NOTIFICATION_RECEIVED_EVENT = "gtfbot:notification-received";
export const OPEN_NOTIFICATIONS_EVENT = "gtfbot:open-notifications";

function dispatchNotificationReceived(notification: AgentNotification) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AgentNotification>(NOTIFICATION_RECEIVED_EVENT, { detail: notification }));
}

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

  const handleNew = useCallback((payload: Partial<AgentNotification>) => {
    if (!payload.id || !payload.title || !payload.createdAt) {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      return;
    }
    const notification = payload as AgentNotification;
    dispatchNotificationReceived(notification);
    queryClient.setQueryData<NotificationListResponse>(["notifications", "list"], (previous) => {
      if (!previous || previous.items.some((item) => item.id === notification.id)) return previous;
      const unread = !notification.readAt && !notification.dismissedAt;
      return {
        ...previous,
        items: [notification, ...previous.items].slice(0, previous.limit),
        total: previous.total + 1,
        unreadCount: previous.unreadCount + (unread ? 1 : 0),
      };
    });
    if (!notification.readAt && !notification.dismissedAt) {
      queryClient.setQueryData<number>(["notifications", "unread-count"], (count) => (count ?? 0) + 1);
    }
  }, [queryClient]);

  const handleRead = useCallback((payload: { notificationId?: string; all?: boolean }) => {
    if (payload.all) {
      queryClient.setQueryData<NotificationListResponse>(["notifications", "list"], (previous) => previous ? {
        ...previous,
        unreadCount: 0,
        items: previous.items.map((item) => item.readAt || item.dismissedAt ? item : { ...item, readAt: new Date().toISOString() }),
      } : previous);
      queryClient.setQueryData(["notifications", "unread-count"], 0);
      return;
    }
    if (!payload.notificationId) return;
    const previous = queryClient.getQueryData<NotificationListResponse>(["notifications", "list"]);
    const existing = previous?.items.find((item) => item.id === payload.notificationId);
    const wasUnread = Boolean(existing && !existing.readAt && !existing.dismissedAt);
    queryClient.setQueryData<NotificationListResponse>(["notifications", "list"], (previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        unreadCount: Math.max(0, previous.unreadCount - (wasUnread ? 1 : 0)),
        items: previous.items.map((item) => item.id === payload.notificationId ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item),
      };
    });
    queryClient.setQueryData<number>(["notifications", "unread-count"], (count) => Math.max(0, (count ?? 0) - (wasUnread ? 1 : 0)));
  }, [queryClient]);

  const handleDismissed = useCallback((payload: { notificationId?: string }) => {
    if (!payload.notificationId) return;
    const previous = queryClient.getQueryData<NotificationListResponse>(["notifications", "list"]);
    const existing = previous?.items.find((item) => item.id === payload.notificationId);
    const wasUnread = Boolean(existing && !existing.readAt && !existing.dismissedAt);
    queryClient.setQueryData<NotificationListResponse>(["notifications", "list"], (previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        unreadCount: Math.max(0, previous.unreadCount - (wasUnread ? 1 : 0)),
        items: previous.items.filter((item) => item.id !== payload.notificationId),
      };
    });
    queryClient.setQueryData<number>(["notifications", "unread-count"], (count) => Math.max(0, (count ?? 0) - (wasUnread ? 1 : 0)));
  }, [queryClient]);

  const handleSocketConnect = useCallback(() => {
    // Socket.IO emits `connect` both on the first connection and after a
    // reconnect. REST reconciles anything missed while the socket was away;
    // this invalidation does not dispatch historical notifications again.
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  useSocketEvent("notification:new", handleNew);
  useSocketEvent("notification:read", handleRead);
  useSocketEvent("notification:dismissed", handleDismissed);
  useSocketEvent("connect", handleSocketConnect);

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
    onSettled: () => {},
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
    onSettled: () => {},
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
    onSettled: () => {},
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
