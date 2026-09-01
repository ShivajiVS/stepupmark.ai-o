import axios from "axios";
import { z } from "zod";

export type ApiErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "timeout"
  | "network"
  | "server"
  | "unknown";

// Backend copy is not written for end users and may leak internals, so the UI
// reads from this map. Only field-level validation text is passed through.
const USER_MESSAGE: Record<ApiErrorKind, string> = {
  validation: "Please check the highlighted fields and try again.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You do not have access to this.",
  not_found: "We couldn't find what you were looking for.",
  conflict: "This changed somewhere else. Refresh and try again.",
  rate_limited: "Too many requests. Wait a moment and try again.",
  timeout: "The request took too long. Try again.",
  network: "We couldn't reach the server. Check your connection.",
  server: "Something went wrong on our end. Try again shortly.",
  unknown: "Something went wrong. Try again.",
};

const problemSchema = z.object({
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(
    kind: ApiErrorKind,
    options: { status?: number; fieldErrors?: Record<string, string[]>; cause?: unknown } = {},
  ) {
    super(USER_MESSAGE[kind], options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status;
    this.fieldErrors = options.fieldErrors;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (!axios.isAxiosError(error)) {
    return new ApiError("unknown", { cause: error });
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return new ApiError("timeout", { cause: error });
  }

  const { response } = error;
  if (response === undefined) {
    return new ApiError("network", { cause: error });
  }

  const kind = kindFromStatus(response.status);
  const problem = problemSchema.safeParse(response.data);

  return new ApiError(kind, {
    status: response.status,
    ...(kind === "validation" && problem.success && problem.data.fieldErrors !== undefined
      ? { fieldErrors: problem.data.fieldErrors }
      : {}),
    cause: error,
  });
}
