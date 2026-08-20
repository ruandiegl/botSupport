import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Contact, ContactPhone } from "@/types";

export interface ContactDetail extends Contact {
  id: string;
  phones: ContactPhone[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  phones: Array<{ phone: string; label?: string | null; isPrimary?: boolean }>;
  email?: string | null;
  organization?: string | null;
  notes?: string | null;
  contactShareId?: string;
}

export interface ContactListResponse {
  items: ContactDetail[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useContacts(filters: { q?: string; page?: number; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return useQuery<ContactListResponse>({
    queryKey: ["contacts", { q: filters.q?.trim() ?? "", page: filters.page ?? 1, limit: filters.limit ?? 20 }],
    queryFn: () => apiFetch<ContactListResponse>(`/contacts?${params.toString()}`),
    placeholderData: (previous) => previous,
    staleTime: 10_000,
  });
}

export function useContact(id?: string | null, enabled = true) {
  return useQuery<ContactDetail>({
    queryKey: ["contact", id],
    queryFn: () => apiFetch<ContactDetail>(`/contacts/${id}`),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation<ContactDetail, Error, ContactFormData>({
    mutationFn: (data) => apiFetch<ContactDetail>("/contacts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (contact) => {
      queryClient.setQueryData(["contact", contact.id], contact);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });
}

export function useUpdateContact(id: string) {
  const queryClient = useQueryClient();
  return useMutation<ContactDetail, Error, Omit<ContactFormData, "contactShareId">>({
    mutationFn: (data) => apiFetch<ContactDetail>(`/contacts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (contact) => {
      queryClient.setQueryData(["contact", id], contact);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });
}

export interface ContactConversationSummary {
  id: string;
  status: string;
  departmentName?: string | null;
  assignedAgentName?: string | null;
  unreadCount: number;
  startedAt: string;
  lastActivityAt: string;
}

export function useContactConversations(id?: string | null, enabled = true) {
  return useQuery<{ items: ContactConversationSummary[]; total: number }>({
    queryKey: ["contact-conversations", id],
    queryFn: () => apiFetch<{ items: ContactConversationSummary[]; total: number }>(`/contacts/${id}/conversations?openOnly=false&page=1&limit=20`),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { contactId?: string; phone: string; departmentId?: string }>({
    mutationFn: (data) => apiFetch<any>("/conversations", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (conversation) => {
      queryClient.setQueryData(["conversation", conversation.id], conversation);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["contact-conversations"] });
    },
  });
}
