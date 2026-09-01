import { delay, http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { env } from "~/app/config/env";
import { server } from "~/mocks/server";

import { refreshSession } from "./auth-refresh";
import { clearAccessToken, getAccessToken } from "./session";

const refreshUrl = `${env.VITE_API_URL}/auth/refresh`;

afterEach(() => {
  clearAccessToken();
});

describe("refreshSession", () => {
  it("issues one request when several callers refresh at once", async () => {
    let calls = 0;
    server.use(
      http.post(refreshUrl, async () => {
        calls += 1;
        await delay(20);
        return HttpResponse.json({ accessToken: "fresh-token" });
      }),
    );

    await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    expect(calls).toBe(1);
    expect(getAccessToken()).toBe("fresh-token");
  });

  it("clears the token and rejects every caller when the refresh fails", async () => {
    server.use(http.post(refreshUrl, () => new HttpResponse(null, { status: 401 })));

    const results = await Promise.allSettled([refreshSession(), refreshSession()]);

    expect(results.map((result) => result.status)).toEqual(["rejected", "rejected"]);
    expect(getAccessToken()).toBeNull();
  });

  it("starts a new request once the previous one has settled", async () => {
    let calls = 0;
    server.use(
      http.post(refreshUrl, () => {
        calls += 1;
        return HttpResponse.json({ accessToken: `token-${String(calls)}` });
      }),
    );

    await refreshSession();
    await refreshSession();

    expect(calls).toBe(2);
    expect(getAccessToken()).toBe("token-2");
  });
});
