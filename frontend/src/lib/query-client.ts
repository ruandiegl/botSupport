import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Atualizações operacionais chegam pelo Socket.IO. Não fazer polling global.
      staleTime: 1000 * 5,
      retry: 1,
    },
  },
});
