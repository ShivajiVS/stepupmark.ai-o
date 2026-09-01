import { isRouteErrorResponse } from "react-router";

import { isApiError, type ApiErrorKind } from "~/services/api/errors";

export type ErrorDescription = {
  title: string;
  description: string;
  status: number | undefined;
};

const TITLE_BY_KIND: Record<ApiErrorKind, string> = {
  validation: "Check your details",
  unauthorized: "Sign in to continue",
  forbidden: "No access",
  not_found: "Not found",
  conflict: "Out of date",
  rate_limited: "Slow down",
  timeout: "Request timed out",
  network: "You appear to be offline",
  server: "Server error",
  unknown: "Something went wrong",
};

export function describeError(error: unknown): ErrorDescription {
  if (isRouteErrorResponse(error)) {
    return error.status === 404
      ? {
          status: 404,
          title: "Page not found",
          description: "That page doesn't exist or has moved.",
        }
      : {
          status: error.status,
          title: "Something went wrong",
          description: "This page couldn't be loaded.",
        };
  }

  if (isApiError(error)) {
    return { title: TITLE_BY_KIND[error.kind], description: error.message, status: error.status };
  }

  return {
    title: "Something went wrong",
    description: "An unexpected error occurred. Try again.",
    status: undefined,
  };
}
