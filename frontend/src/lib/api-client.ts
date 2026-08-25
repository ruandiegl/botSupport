import { API_BASE_URL } from "./api-config";

const BASE_URL = API_BASE_URL;

export type ApiFetchOptions = RequestInit & {
  onUploadProgress?: (progress: number) => void;
};

function parseResponse<T>(status: number, responseText: string): T {
  if (status < 200 || status >= 300) {
    let errorMessage = `Erro HTTP ${status}`;
    try {
      const errorJson = JSON.parse(responseText) as { error?: string };
      if (errorJson.error) errorMessage = errorJson.error;
    } catch {
      // Ignora erro de parse se a resposta for texto puro.
    }
    throw new Error(errorMessage);
  }

  if (status === 204 || !responseText) return {} as T;
  return JSON.parse(responseText) as T;
}

function xhrFetch<T>(url: string, options: ApiFetchOptions, token: string | null): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = options.body as XMLHttpRequestBodyInit | null | undefined;
    const headers = new Headers(options.headers);
    const onUploadProgress = options.onUploadProgress;
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      if (options.signal) options.signal.removeEventListener("abort", abortRequest);
      callback();
    };
    const abortRequest = () => {
      xhr.abort();
      finish(() => reject(new DOMException("A requisição foi cancelada.", "AbortError")));
    };

    xhr.open(options.method || "GET", url, true);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (!(body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    headers.forEach((value, key) => xhr.setRequestHeader(key, value));
    if (options.signal?.aborted) {
      abortRequest();
      return;
    }
    options.signal?.addEventListener("abort", abortRequest, { once: true });
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onUploadProgress) {
        onUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.onload = () => finish(() => {
      try {
        resolve(parseResponse<T>(xhr.status, xhr.responseText));
      } catch (error) {
        reject(error);
      }
    });
    xhr.onerror = () => finish(() => reject(new TypeError("Falha ao enviar o arquivo. Verifique sua conexão.")));
    xhr.onabort = () => finish(() => reject(new DOMException("A requisição foi cancelada.", "AbortError")));
    try {
      xhr.send(body);
    } catch (error) {
      finish(() => reject(error));
    }
  });
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = `${BASE_URL}/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = localStorage.getItem("gtfbot_token");
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (isFormData && options.onUploadProgress) return xhrFetch<T>(url, options, token);

  const { onUploadProgress: _onUploadProgress, ...requestOptions } = options;
  const response = await fetch(url, {
    ...requestOptions,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...requestOptions.headers,
    },
  });

  return parseResponse<T>(response.status, await response.text());
}
