import { describe, expect, it } from "vitest";

import { safeRedirectTo } from "./redirect";

describe("safeRedirectTo", () => {
  it.each([
    ["/app/users", "/app/users"],
    ["/app/users?q=ada", "/app/users?q=ada"],
    [undefined, "/app"],
    [null, "/app"],
    ["", "/app"],
    ["//evil.com", "/app"],
    ["/\\evil.com", "/app"],
    ["https://evil.com", "/app"],
    ["app/users", "/app"],
  ])("resolves %s to %s", (input, expected) => {
    expect(safeRedirectTo(input)).toBe(expected);
  });
});
