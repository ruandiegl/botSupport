import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { AgentWorkloadResponse } from "@/types";

export function useAgentWorkload(enabled = true) {
  return useQuery<AgentWorkloadResponse>({
    queryKey: ["agent-workload"],
    queryFn: () => apiFetch<AgentWorkloadResponse>("/agents/workload?includeOffline=true&limit=100"),
    enabled,
    staleTime: 5_000,
    retry: 1,
  });
}
