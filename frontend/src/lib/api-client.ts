const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMessage = errorJson.error;
    } catch {
      // Ignora erro de parse de JSON se a resposta for texto puro
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
