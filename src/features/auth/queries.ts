import { queryOptions } from "@tanstack/react-query";

import { fetchCurrentUser } from "./api/auth.api";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "current-user"] as const,
};

export function currentUserQuery() {
  return queryOptions({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
