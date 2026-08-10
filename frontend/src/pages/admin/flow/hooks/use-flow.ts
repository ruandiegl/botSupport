import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { FlowDefinition, Department } from "@/types";

export function useGetFlow() {
  return useQuery<FlowDefinition>({
    queryKey: ["flow"],
    queryFn: () => apiFetch<FlowDefinition>("/flow"),
  });
}

export function useListDepartments() {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => apiFetch<Department[]>("/departments"),
  });
}

export function useUpdateFlow() {
  const queryClient = useQueryClient();
  return useMutation<FlowDefinition, Error, { data: Partial<FlowDefinition> }>({
    mutationFn: ({ data }) =>
      apiFetch<FlowDefinition>("/flow", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(["flow"], saved);
    },
  });
}
