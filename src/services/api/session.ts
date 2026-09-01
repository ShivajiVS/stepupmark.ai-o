// The access token is held in memory only. A module-level value would be shared
// across concurrent requests if this ran on the server, so every authenticated
// call is made from the browser: /app routes render client-side.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
