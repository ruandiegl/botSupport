import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type BusinessHoursInterval = { id?: string; weekday: number; start: string; end: string; sortOrder?: number };
export type BusinessHoursException = { id?: string; localDate: string; kind: "CLOSED" | "SPECIAL_HOURS"; intervals?: Array<{ start: string; end: string }>; reason?: string | null };
export type BusinessHoursPolicy = {
  id: string; departmentId: string | null; enabled: boolean; mode: "SCHEDULE_ONLY" | "SCHEDULE_AND_ONLINE" | "ONLINE_ONLY"; timezone: string;
  outsideMessage: string; noAgentMessage: string | null; noticeFrequency: "ONCE_PER_WINDOW" | "COOLDOWN"; messageCooldownMinutes: number; revision: number;
  intervals: BusinessHoursInterval[]; exceptions: BusinessHoursException[]; updatedAt: string;
};
export type BusinessHoursPayload = Omit<BusinessHoursPolicy, "id" | "revision" | "updatedAt" | "intervals" | "exceptions"> & {
  revision?: number; intervals: BusinessHoursInterval[]; exceptions: BusinessHoursException[];
};

export function useBusinessHours() {
  return useQuery<BusinessHoursPolicy[]>({ queryKey: ["business-hours"], queryFn: () => apiFetch<BusinessHoursPolicy[]>("/business-hours") });
}
export function useCreateBusinessHours() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (data: BusinessHoursPayload) => apiFetch<BusinessHoursPolicy>("/business-hours", { method: "POST", body: JSON.stringify(data) }), onSuccess: () => client.invalidateQueries({ queryKey: ["business-hours"] }) });
}
export function useUpdateBusinessHours() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: BusinessHoursPayload }) => apiFetch<BusinessHoursPolicy>("/business-hours/" + id, { method: "PATCH", body: JSON.stringify(data) }), onSuccess: () => client.invalidateQueries({ queryKey: ["business-hours"] }) });
}
export function useDisableBusinessHours() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, revision }: { id: string; revision: number }) => apiFetch<BusinessHoursPolicy>("/business-hours/" + id + "/disable", { method: "PATCH", body: JSON.stringify({ revision }) }), onSuccess: () => client.invalidateQueries({ queryKey: ["business-hours"] }) });
}
export function useBusinessHoursPreview() {
  return useMutation({ mutationFn: (data: { departmentId?: string | null; at?: string; agentsOnline?: boolean }) => apiFetch<any>("/business-hours/preview", { method: "POST", body: JSON.stringify(data) }) });
}
