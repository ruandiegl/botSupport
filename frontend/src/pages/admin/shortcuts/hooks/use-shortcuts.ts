import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Shortcut, ShortcutScope, ShortcutType } from "@/types";

export interface ShortcutInput {
  title: string;
  message: string;
  type: ShortcutType;
  scope: ShortcutScope;
  departmentId?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ShortcutFilters {
  q?: string;
  type?: ShortcutType | "ALL";
  scope?: ShortcutScope | "ALL";
  active?: "ALL" | "true" | "false";
}

export interface ShortcutListResponse { items: Shortcut[]; total: number; page: number; limit: number }

export function useListShortcuts(filters: ShortcutFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type && filters.type !== "ALL") params.set("type", filters.type);
  if (filters.scope && filters.scope !== "ALL") params.set("scope", filters.scope);
  if (filters.active && filters.active !== "ALL") params.set("active", filters.active);
  return useQuery<ShortcutListResponse>({
    queryKey: ["shortcuts", filters],
    queryFn: () => apiFetch(`/shortcuts?${params.toString()}`),
  });
}

function mutationWithRefresh<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shortcuts"] }),
  });
}

export function useCreateShortcut() {
  return mutationWithRefresh<{ data: ShortcutInput }>(({ data }) => apiFetch("/shortcuts", { method: "POST", body: JSON.stringify(data) }));
}

export function useUpdateShortcut() {
  return mutationWithRefresh<{ id: string; data: Partial<ShortcutInput> }>(({ id, data }) => apiFetch(`/shortcuts/${id}`, { method: "PATCH", body: JSON.stringify(data) }));
}

export function useSetShortcutActive() {
  return mutationWithRefresh<{ id: string; isActive: boolean }>(({ id, isActive }) => apiFetch(`/shortcuts/${id}/activate`, { method: "POST", body: JSON.stringify({ isActive }) }));
}

export function useArchiveShortcut() {
  return mutationWithRefresh<{ id: string }>(({ id }) => apiFetch(`/shortcuts/${id}`, { method: "DELETE" }));
}
