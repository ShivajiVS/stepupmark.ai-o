import axios from "axios";
import { z } from "zod";

import { env } from "~/app/config/env";

import { clearAccessToken, setAccessToken } from "./session";

export const REFRESH_PATH = "/auth/refresh";

// Deliberately not apiClient: that would re-enter the 401 interceptor and recurse.
const refreshClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 15_000,
  withCredentials: true,
});

const refreshResponseSchema = z.object({ accessToken: z.string().min(1) });

// Refresh tokens are single-use, so parallel 401s must share one request.
// Racing them would spend the token and sign the user out.
let inFlight: Promise<void> | null = null;

export function refreshSession(): Promise<void> {
  inFlight ??= runRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function runRefresh(): Promise<void> {
  try {
    const response = await refreshClient.post(REFRESH_PATH);
    setAccessToken(refreshResponseSchema.parse(response.data).accessToken);
  } catch (error) {
    clearAccessToken();
    throw error;
  }
}
