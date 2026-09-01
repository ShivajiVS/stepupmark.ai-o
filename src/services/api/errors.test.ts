import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";

import { ApiError, toApiError } from "./errors";

function axiosErrorWithStatus(status: number, data: unknown = {}) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("request failed", "ERR_BAD_REQUEST", config, null, {
    status,
    statusText: "",
    data,
    headers: {},
    config,
  });
}

describe("toApiError", () => {
  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [409, "conflict"],
    [422, "validation"],
    [429, "rate_limited"],
    [500, "server"],
    [503, "server"],
  ])("maps status %i to %s", (status, kind) => {
    expect(toApiError(axiosErrorWithStatus(status)).kind).toBe(kind);
  });

  it("treats a response-less axios error as a network failure", () => {
    const config = { headers: new AxiosHeaders() };
    const error = new AxiosError("Network Error", "ERR_NETWORK", config);
    expect(toApiError(error).kind).toBe("network");
  });

  it("treats an aborted request as a timeout", () => {
    const config = { headers: new AxiosHeaders() };
    const error = new AxiosError("timeout", "ECONNABORTED", config);
    expect(toApiError(error).kind).toBe("timeout");
  });

  it("keeps field errors from a validation response", () => {
    const error = toApiError(
      axiosErrorWithStatus(422, { fieldErrors: { email: ["Already registered."] } }),
    );
    expect(error.fieldErrors).toEqual({ email: ["Already registered."] });
  });

  it("does not surface backend copy to the user", () => {
    const error = toApiError(axiosErrorWithStatus(500, { message: "pq: duplicate key in users" }));
    expect(error.message).not.toContain("pq:");
  });

  it("passes an existing ApiError through unchanged", () => {
    const original = new ApiError("conflict");
    expect(toApiError(original)).toBe(original);
  });

  it("wraps values that are not errors at all", () => {
    expect(toApiError("boom").kind).toBe("unknown");
  });
});
