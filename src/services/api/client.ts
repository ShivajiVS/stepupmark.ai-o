import axios, { type InternalAxiosRequestConfig } from "axios";

import { env } from "~/app/config/env";

import { REFRESH_PATH, refreshSession } from "./auth-refresh";
import { toApiError } from "./errors";
import { getAccessToken } from "./session";

type RetriedConfig = InternalAxiosRequestConfig & { retried?: boolean };

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 15_000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token !== null) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw toApiError(error);

    const config: RetriedConfig | undefined = error.config;

    if (
      config === undefined ||
      error.response?.status !== 401 ||
      config.retried === true ||
      config.url === REFRESH_PATH
    ) {
      throw toApiError(error);
    }

    try {
      await refreshSession();
    } catch {
      // Surfaced as `unauthorized`; the /app route boundary handles sign-in.
      throw toApiError(error);
    }

    config.retried = true;
    return apiClient(config);
  },
);
