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
  open: number;
  queued: number;
  inProgress: number;
  bot: number;
  closed: number;
  mine: number;
  unread: number;
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
  params.set("sort", filters.sort ?? "operational");
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  return params.toString();
}

export function useListConversations(filters: ConversationFilters) {
  const queryString = buildQuery(filters);
  return useQuery<ConversationQueryResult>({
    queryKey: ["conversations", filters],
    queryFn: async () => {
      try {
        const payload = await apiFetch<ConversationEnvelope>(`/conversations?${queryString}`);
        return normalizeResponse(payload, filters);
      } catch (error) {
        // Keep development and older deployments usable while the paginated API rolls out.
        // The fallback still asks for the operational status and applies the remainder locally.
        const legacyParams = new URLSearchParams();
        if (filters.status && filters.status !== "ALL") legacyParams.set("status", filters.status);
        if (filters.departmentId && filters.departmentId !== "ALL") legacyParams.set("departmentId", filters.departmentId);
        const payload = await apiFetch<Conversation[]>(`/conversations${legacyParams.toString() ? `?${legacyParams}` : ""}`);
        if (!Array.isArray(payload)) throw error;

        const filtered = payload
          .filter((item) => !filters.search.trim() || `${item.contact.name} ${item.contact.phone} ${item.lastMessage}`.toLowerCase().includes(filters.search.trim().toLowerCase()))
          .filter((item) => !filters.assignedAgentId || !filters.fallbackAssignedAgentId || item.assignedAgentId === filters.fallbackAssignedAgentId)
          .filter((item) => !filters.openOnly || item.status !== "CLOSED")
          .filter((item) => !filters.unreadOnly || item.unreadCount > 0)
          .filter((item) => {
            const timestamp = filters.dateField === "createdAt" ? item.startedAt : item.lastActivityAt ?? item.startedAt;
            return (!filters.from || timestamp >= filters.from) && (!filters.to || timestamp < filters.to);
          })
          .sort((left, right) => {
            if (filters.sort === "oldest") return left.startedAt.localeCompare(right.startedAt) || left.id.localeCompare(right.id);
            if (filters.sort === "recent") return (right.lastActivityAt ?? right.startedAt).localeCompare(left.lastActivityAt ?? left.startedAt) || left.id.localeCompare(right.id);
            const rank: Record<string, number> = { QUEUED: 0, IN_PROGRESS: 1, BOT: 2, CLOSED: 3 };
            const rankDiff = (rank[left.status] ?? 9) - (rank[right.status] ?? 9);
            if (rankDiff !== 0) return rankDiff;
            if (left.status === "QUEUED" && right.status === "QUEUED") {
              const queuedDiff = (left.queuedAt ?? left.startedAt).localeCompare(right.queuedAt ?? right.startedAt);
              if (queuedDiff !== 0) return queuedDiff;
            }
            return (right.lastActivityAt ?? right.startedAt).localeCompare(left.lastActivityAt ?? left.startedAt) || left.id.localeCompare(right.id);
          });

        const start = (filters.page - 1) * filters.limit;
        const items = filtered.slice(start, start + filters.limit);
        return {
          items,
          page: filters.page,
          limit: filters.limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / filters.limit)),
          appliedFilters: { ...filters },
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
