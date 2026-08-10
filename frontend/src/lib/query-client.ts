import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5, // 5 segundos
      refetchInterval: 1000 * 10, // polling suave a cada 10s para atualização ao vivo
      retry: 1,
    },
  },
});
