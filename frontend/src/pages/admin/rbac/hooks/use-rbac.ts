import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissionData {
  role: string;
  resources: Record<string, { view: boolean; create: boolean; update: boolean; delete: boolean; delegate?: boolean; publish?: boolean; use?: boolean }>;
  screens: Record<string, boolean>;
}

export function useGetRoles() {
  return useQuery<Role[]>({
    queryKey: ["rbac-roles"],
    queryFn: () => apiFetch<Role[]>("/rbac/roles"),
  });
}

export function useGetRolePermissions(role: string) {
  return useQuery<RolePermissionData>({
    queryKey: ["rbac-permissions", role],
    queryFn: () => apiFetch<RolePermissionData>(`/rbac/permissions/${role}`),
    enabled: Boolean(role),
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, data }: { role: string; data: Partial<RolePermissionData> }) =>
      apiFetch<RolePermissionData>(`/rbac/permissions/${role}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rbac-permissions", variables.role] });
    },
  });
}
