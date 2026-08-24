import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Agent, Conversation, Department } from "@/types";

export interface ConversationFilters {
  status: string;
  departmentId: string;
  search: string;
  dateField: "lastActivityAt" | "createdAt";
  from: string;
  to: string;
  page: number;
  limit: number;
  assignedAgentId?: "me";
  openOnly?: boolean;
  unreadOnly?: boolean;
  labelIds?: string[];
  fallbackAssignedAgentId?: string;
  sort?: "operational" | "recent" | "oldest";
}

export interface ConversationQueryResult {
  items: Conversation[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  appliedFilters?: Record<string, unknown>;
  counts?: ConversationMetricCounts;
  /** Indicates that the backend returned the legacy array response. */
  legacy: boolean;
}

export interface ConversationMetricCounts {
  /** Added in the paginated response; older deployments can omit it. */
  all?: number;
  open: number;
  inProgress: number;
  closed: number;
  mine: number;
  unread: number;
}

function useDebouncedValue(value: string, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);
  return debounced;
}

type ConversationEnvelope =
  | Conversation[]
  | {
      items?: Conversation[];
      data?: Conversation[];
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
      counts?: ConversationMetricCounts;
      meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
    };

function normalizeResponse(payload: ConversationEnvelope, filters: ConversationFilters): ConversationQueryResult {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: filters.page,
      limit: filters.limit,
      total: payload.length,
      totalPages: Math.max(1, Math.ceil(payload.length / filters.limit)),
      appliedFilters: { ...filters },
      counts: undefined,
      legacy: true,
    };
  }

  const envelope = payload as Exclude<ConversationEnvelope, Conversation[]>;
  const meta = envelope.meta ?? {};
  const items = envelope.items ?? envelope.data ?? [];
  const page = envelope.page ?? meta.page ?? filters.page;
  const limit = envelope.limit ?? meta.limit ?? filters.limit;
  const total = envelope.total ?? meta.total ?? items.length;
  const totalPages = envelope.totalPages ?? meta.totalPages ?? Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return {
    items,
    page,
    limit,
    total,
    totalPages,
    appliedFilters: { ...filters },
    counts: envelope.counts,
    legacy: false,
  };
}

function buildQuery(filters: ConversationFilters) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
  if (filters.departmentId && filters.departmentId !== "ALL") params.set("departmentId", filters.departmentId);
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.dateField) params.set("dateField", filters.dateField);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.assignedAgentId) params.set("assignedAgentId", filters.assignedAgentId);
  if (filters.openOnly) params.set("openOnly", "true");
  if (filters.unreadOnly) params.set("unreadOnly", "true");
  if (filters.labelIds?.length) params.set("labelIds", filters.labelIds.join(","));
  params.set("sort", filters.sort ?? "operational");
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  return params.toString();
}

export function useListConversations(filters: ConversationFilters) {
  const debouncedSearch = useDebouncedValue(filters.search.trim());
  const effectiveFilters: ConversationFilters = { ...filters, search: debouncedSearch };
  const queryString = buildQuery(effectiveFilters);
  return useQuery<ConversationQueryResult>({
    queryKey: ["conversations", effectiveFilters],
    queryFn: async ({ signal }) => {
      try {
        const payload = await apiFetch<ConversationEnvelope>(`/conversations?${queryString}`, { signal });
        return normalizeResponse(payload, effectiveFilters);
      } catch (error) {
        // Keep development and older deployments usable while the paginated API rolls out.
        // The fallback still asks for the operational status and applies the remainder locally.
        const legacyParams = new URLSearchParams();
        if (effectiveFilters.status && effectiveFilters.status !== "ALL") legacyParams.set("status", effectiveFilters.status);
        if (effectiveFilters.departmentId && effectiveFilters.departmentId !== "ALL") legacyParams.set("departmentId", effectiveFilters.departmentId);
        const payload = await apiFetch<Conversation[]>(`/conversations${legacyParams.toString() ? `?${legacyParams}` : ""}`, { signal });
        if (!Array.isArray(payload)) throw error;

        const filtered = payload
          .filter((item) => !effectiveFilters.search.trim() || `${item.contact.name} ${item.contact.phone} ${item.contact.email ?? ""} ${item.groupChatName ?? ""} ${item.lastMessage} ${item.searchMatch?.snippet ?? ""}`.toLowerCase().includes(effectiveFilters.search.trim().toLowerCase()))
          .filter((item) => !effectiveFilters.assignedAgentId || !effectiveFilters.fallbackAssignedAgentId || item.assignedAgentId === effectiveFilters.fallbackAssignedAgentId)
          .filter((item) => !effectiveFilters.openOnly || item.status !== "CLOSED")
          .filter((item) => !effectiveFilters.unreadOnly || item.unreadCount > 0)
          .filter((item) => !effectiveFilters.labelIds?.length || item.labels?.some((label) => effectiveFilters.labelIds?.includes(label.id)))
          .filter((item) => {
            const timestamp = effectiveFilters.dateField === "createdAt" ? item.startedAt : item.lastActivityAt ?? item.startedAt;
            return (!effectiveFilters.from || timestamp >= effectiveFilters.from) && (!effectiveFilters.to || timestamp < effectiveFilters.to);
          })
          .sort((left, right) => {
            if (effectiveFilters.sort === "oldest") return left.startedAt.localeCompare(right.startedAt) || left.id.localeCompare(right.id);
            if (effectiveFilters.sort === "recent") return (right.lastActivityAt ?? right.startedAt).localeCompare(left.lastActivityAt ?? left.startedAt) || left.id.localeCompare(right.id);
            const rank: Record<string, number> = { OPEN: 0, IN_PROGRESS: 1, CLOSED: 2 };
            const rankDiff = (rank[left.status] ?? 9) - (rank[right.status] ?? 9);
            if (rankDiff !== 0) return rankDiff;
            if (left.status === "OPEN" && right.status === "OPEN") {
              const queuedDiff = (left.queuedAt ?? left.startedAt).localeCompare(right.queuedAt ?? right.startedAt);
              if (queuedDiff !== 0) return queuedDiff;
            }
            return (right.lastActivityAt ?? right.startedAt).localeCompare(left.lastActivityAt ?? left.startedAt) || left.id.localeCompare(right.id);
          });

        const start = (effectiveFilters.page - 1) * effectiveFilters.limit;
        const items = filtered.slice(start, start + effectiveFilters.limit);
        return {
          items,
          page: effectiveFilters.page,
          limit: effectiveFilters.limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / effectiveFilters.limit)),
          appliedFilters: { ...effectiveFilters },
          legacy: true,
        };
      }
    },
    placeholderData: (previous) => previous,
    staleTime: 5_000,
  });
}

export function useListDepartments() {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => apiFetch<Department[]>("/departments"),
    staleTime: 60_000,
  });
}

export function useListAgents() {
  return useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: () => apiFetch<Agent[]>("/agents"),
    staleTime: 30_000,
  });
}
