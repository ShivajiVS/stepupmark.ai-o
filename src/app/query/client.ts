import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "~/services/api/errors";

// A factory rather than a shared instance: server rendering needs one cache per
// request, otherwise one user's data would be served to the next.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry(failureCount, error) {
          // 4xx responses are deterministic; retrying only delays the error state.
          if (isApiError(error) && error.status !== undefined && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// Route loaders need to reach the same cache the components read from. On the
// server each request gets its own; in the browser one instance spans navigations.
export function getQueryClient(): QueryClient {
  if (typeof document === "undefined") return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
