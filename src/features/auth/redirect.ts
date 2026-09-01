const FALLBACK_PATH = "/app";

// Only a same-origin relative path is safe to redirect to. "//host" and "/\host"
// are protocol-relative: a browser normalises the backslash to a slash and will
// follow either one off-site, so both are rejected alongside anything that isn't
// a bare "/..." path.
export function safeRedirectTo(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return FALLBACK_PATH;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return FALLBACK_PATH;
  }
  return value;
}
