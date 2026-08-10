import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Conversation, Department } from "@/types";

export function useListConversations(status?: string, departmentId?: string) {
  const queryParams = new URLSearchParams();
  if (status && status !== "ALL") queryParams.append("status", status);
  if (departmentId && departmentId !== "ALL") queryParams.append("departmentId", departmentId);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery<Conversation[]>({
    queryKey: ["conversations", status, departmentId],
    queryFn: () => apiFetch<Conversation[]>(`/conversations${queryString}`),
  });
}

export function useListDepartments() {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => apiFetch<Department[]>("/departments"),
  });
}
