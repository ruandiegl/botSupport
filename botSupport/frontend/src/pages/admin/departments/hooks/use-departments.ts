import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Department } from "@/types";

export interface DepartmentInput {
  name: string;
  description?: string;
  procedures?: Array<{
    title: string;
    content: string;
    order?: number;
  }>;
}

export function useListDepartments() {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => apiFetch<Department[]>("/departments"),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation<Department, Error, { data: DepartmentInput }>({
    mutationFn: ({ data }) =>
      apiFetch<Department>("/departments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation<Department, Error, { id: string; data: Partial<DepartmentInput> }>({
    mutationFn: ({ id, data }) =>
      apiFetch<Department>(`/departments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) =>
      apiFetch<void>(`/departments/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}
