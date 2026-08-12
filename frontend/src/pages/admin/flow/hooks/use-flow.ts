import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type {
  Department,
  FlowDefinition,
  FlowRevision,
  FlowValidationResult,
} from "@/types";
import { legacyToRevision, normalizeRevision, revisionToLegacy } from "../lib/flow-model";

async function getDraftWithLegacyFallback(): Promise<FlowRevision> {
  try {
    return normalizeRevision(await apiFetch<FlowRevision>("/flow/draft"));
  } catch {
    const legacy = await apiFetch<FlowDefinition>("/flow");
    return legacyToRevision(legacy);
  }
}

export function useGetFlow() {
  return useQuery<FlowRevision>({
    queryKey: ["flow", "draft"],
    queryFn: getDraftWithLegacyFallback,
  });
}

export function useGetPublishedFlow() {
  return useQuery<FlowRevision | null>({
    queryKey: ["flow", "published"],
    queryFn: async () => {
      try {
        return normalizeRevision(await apiFetch<FlowRevision>("/flow/published"));
      } catch {
        return null;
      }
    },
  });
}

export function useListDepartments() {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => apiFetch<Department[]>("/departments"),
  });
}

async function saveRevision(revision: FlowRevision): Promise<FlowRevision> {
  if (revision.id.startsWith("legacy-draft-")) {
    const saved = await apiFetch<FlowDefinition>("/flow", {
      method: "PUT",
      body: JSON.stringify(revisionToLegacy(revision)),
    });
    return legacyToRevision(saved);
  }
  const saved = await apiFetch<FlowRevision>(`/flow/draft/${revision.id}`, {
    method: "PUT",
    body: JSON.stringify({
      revision: revision.revision,
      nodes: revision.nodes,
      transitions: revision.transitions,
    }),
  });
  return normalizeRevision(saved);
}

export function useSaveFlowDraft() {
  const queryClient = useQueryClient();
  return useMutation<FlowRevision, Error, FlowRevision>({
    mutationFn: saveRevision,
    onSuccess: (saved) => {
      queryClient.setQueryData(["flow", "draft"], saved);
    },
  });
}

export function useValidateFlowDraft() {
  return useMutation<FlowValidationResult, Error, string>({
    mutationFn: (draftId) => apiFetch<FlowValidationResult>(`/flow/draft/${draftId}/validate`, { method: "POST" }),
  });
}

export function usePublishFlowDraft() {
  const queryClient = useQueryClient();
  return useMutation<FlowRevision, Error, FlowRevision>({
    mutationFn: async (revision) => {
      const saved = await saveRevision(revision);
      if (saved.id.startsWith("legacy-draft-")) return saved;
      const validation = await apiFetch<FlowValidationResult>(`/flow/draft/${saved.id}/validate`, { method: "POST" });
      if (!validation.valid) throw new Error(validation.issues.map((issue) => issue.message).join(" "));
      const published = await apiFetch<{ valid: boolean; flow: FlowRevision }>(`/flow/draft/${saved.id}/publish`, { method: "POST" });
      return normalizeRevision(published.flow);
    },
    onSuccess: (published) => {
      queryClient.setQueryData(["flow", "published"], published);
      queryClient.invalidateQueries({ queryKey: ["flow", "draft"] });
    },
  });
}

export function useRestoreFlowRevision() {
  const queryClient = useQueryClient();
  return useMutation<FlowRevision, Error, string>({
    mutationFn: (revisionId) => apiFetch<FlowRevision>(`/flow/revisions/${revisionId}/restore`, { method: "POST" }),
    onSuccess: (restored) => queryClient.setQueryData(["flow", "draft"], normalizeRevision(restored)),
  });
}
