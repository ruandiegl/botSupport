import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import type { AgentWorkloadResponse } from "@/types"

interface AgentWorkloadOptions {
  enabled?: boolean
  includeOffline?: boolean
  limit?: number
}

export function useAgentWorkload({
  enabled = true,
  includeOffline = true,
  limit = 100,
}: AgentWorkloadOptions = {}) {
  return useQuery<AgentWorkloadResponse>({
    queryKey: ["agent-workload", { includeOffline, limit }],
    queryFn: () => apiFetch<AgentWorkloadResponse>(
      `/agents/workload?includeOffline=${includeOffline}&limit=${limit}`,
    ),
    enabled,
    staleTime: 5_000,
    retry: 1,
  })
}
