import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface ZApiConfig {
  id?: string;
  instanceId: string;
  token?: string;
  clientToken?: string;
  webhookUrl?: string;
  isActive: boolean;
  autoReply: boolean;
  hasToken?: boolean;
  hasClientToken?: boolean;
  instancePhoneMasked?: string | null;
  groupsEnabled: boolean;
  groupCooldownSeconds: number;
  groupConfirmInGroup: boolean;
  groupConfirmMessage?: string | null;
  updatedAt?: string;
}

export interface ZApiTestResponse {
  connected: boolean;
  message: string;
}

export interface ZApiQrCodeResponse {
  connected: boolean;
  qrCode?: string;
  error?: string;
  message?: string;
}

export function useGetZApiConfig() {
  return useQuery<ZApiConfig>({
    queryKey: ["zapi-config"],
    queryFn: () => apiFetch<ZApiConfig>("/zapi/config"),
  });
}

export function useGetZApiQrCode(enabled = true) {
  return useQuery<ZApiQrCodeResponse>({
    queryKey: ["zapi-qrcode"],
    queryFn: () => apiFetch<ZApiQrCodeResponse>("/zapi/qr-code"),
    enabled,
    refetchInterval: (query) => {
      // Se já estiver conectado, desacelera o polling (a cada 10s). Se estiver tentando conectar, faz polling a cada 3s para detectar a leitura do QR Code.
      const data = query.state.data;
      if (data?.connected) return 10000;
      return 3000;
    },
  });
}

export function useUpdateZApiConfig() {
  const queryClient = useQueryClient();
  return useMutation<ZApiConfig, Error, Partial<ZApiConfig>>({
    mutationFn: (data) =>
      apiFetch<ZApiConfig>("/zapi/config", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(["zapi-config"], saved);
      queryClient.invalidateQueries({ queryKey: ["zapi-qrcode"] });
    },
  });
}

export function useTestZApiConnection() {
  const queryClient = useQueryClient();
  return useMutation<ZApiTestResponse, Error, { instanceId?: string; token?: string }>({
    mutationFn: (data) =>
      apiFetch<ZApiTestResponse>("/zapi/test", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zapi-qrcode"] });
    },
  });
}

export function useDisconnectZApi() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, void>({
    mutationFn: () =>
      apiFetch<{ success: boolean; message: string }>("/zapi/disconnect", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zapi-qrcode"] });
      queryClient.invalidateQueries({ queryKey: ["zapi-config"] });
    },
  });
}

export function useSetZApiWebhook() {
  return useMutation<{ success: boolean; message: string }, Error, { webhookUrl: string }>({
    mutationFn: (data) =>
      apiFetch<{ success: boolean; message: string }>("/zapi/webhook-url", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
