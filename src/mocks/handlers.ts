import { delay, http, HttpResponse } from "msw";
import { z } from "zod";

import { env } from "~/app/config/env";

import { demoAccessToken, demoCredentials, demoOtp, demoRefreshToken, demoUser } from "./data";

const url = (path: string) => `${env.VITE_API_URL}${path}`;

// The mock backend validates independently of the client schemas: sharing them
// would hide the case where the two drift apart.
const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const registrationSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  password: z.string().min(8).max(72),
  acceptTerms: z.literal(true),
});

const otpRequestSchema = z.object({ email: z.email() });
const otpVerifySchema = z.object({ challengeId: z.string().min(1), code: z.string().length(6) });
const resetPasswordRequestSchema = z.object({
  resetToken: z.string().min(1),
  password: z.string().min(8).max(72),
});

function unauthorized() {
  return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
}

function isAuthorized(request: Request) {
  return request.headers.get("Authorization") === `Bearer ${demoAccessToken}`;
}

function invalidCode() {
  return HttpResponse.json(
    { fieldErrors: { code: ["Incorrect or expired code."] } },
    { status: 422 },
  );
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// In-memory only: a page reload clears these, matching how a real challenge/reset
// token would expire rather than persist indefinitely.
type PendingChallenge =
  { kind: "register"; email: string; name: string } | { kind: "reset"; email: string };
const challenges = new Map<string, PendingChallenge>();
const resetTokens = new Map<string, string>();

export const handlers = [
  http.post(url("/auth/login"), async ({ request }) => {
    await delay(150);
    const parsed = credentialsSchema.safeParse(await request.json());

    if (!parsed.success) {
      return HttpResponse.json(
        { fieldErrors: z.flattenError(parsed.error).fieldErrors },
        { status: 422 },
      );
    }

    const { email, password } = parsed.data;
    if (email !== demoCredentials.email || password !== demoCredentials.password) {
      return HttpResponse.json(
        { fieldErrors: { password: ["Incorrect email or password."] } },
        {
          status: 422,
        },
      );
    }

    return HttpResponse.json(
      { accessToken: demoAccessToken, user: demoUser },
      { headers: { "Set-Cookie": `refreshToken=${demoRefreshToken}; Path=/; SameSite=Lax` } },
    );
  }),

  http.post(url("/auth/register/start"), async ({ request }) => {
    await delay(150);
    const parsed = registrationSchema.safeParse(await request.json());

    if (!parsed.success) {
      return HttpResponse.json(
        { fieldErrors: z.flattenError(parsed.error).fieldErrors },
        { status: 422 },
      );
    }

    const { name, email } = parsed.data;
    if (email === demoCredentials.email) {
      return HttpResponse.json(
        { fieldErrors: { email: ["Already registered."] } },
        { status: 422 },
      );
    }

    const challengeId = newId("chal");
    challenges.set(challengeId, { kind: "register", email, name });
    return HttpResponse.json({ challengeId });
  }),

  http.post(url("/auth/register/verify"), async ({ request }) => {
    await delay(150);
    const parsed = otpVerifySchema.safeParse(await request.json());

    if (!parsed.success) {
      return HttpResponse.json(
        { fieldErrors: z.flattenError(parsed.error).fieldErrors },
        { status: 422 },
      );
    }

    const { challengeId, code } = parsed.data;
    const pending = challenges.get(challengeId);
    if (pending?.kind !== "register" || code !== demoOtp) return invalidCode();

    challenges.delete(challengeId);
    return HttpResponse.json(
      {
        accessToken: demoAccessToken,
        user: { id: newId("u"), name: pending.name, email: pending.email },
      },
      { headers: { "Set-Cookie": `refreshToken=${demoRefreshToken}; Path=/; SameSite=Lax` } },
    );
  }),

  http.post(url("/auth/forgot-password/start"), async ({ request }) => {
    await delay(150);
    const parsed = otpRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return HttpResponse.json(
        { fieldErrors: z.flattenError(parsed.error).fieldErrors },
        { status: 422 },
      );
    }

    const challengeId = newId("chal");
    challenges.set(challengeId, { kind: "reset", email: parsed.data.email });
    return HttpResponse.json({ challengeId });
  }),

  http.post(url("/auth/forgot-password/verify"), async ({ request }) => {
    await delay(150);
    const parsed = otpVerifySchema.safeParse(await request.json());

    if (!parsed.success) {
      return HttpResponse.json(
        { fieldErrors: z.flattenError(parsed.error).fieldErrors },
        { status: 422 },
      );
    }

    const { challengeId, code } = parsed.data;
    const pending = challenges.get(challengeId);
    if (pending?.kind !== "reset" || code !== demoOtp) return invalidCode();

    challenges.delete(challengeId);
    const resetToken = newId("reset");
    resetTokens.set(resetToken, pending.email);
    return HttpResponse.json({ resetToken });
  }),

  http.post(url("/auth/forgot-password/reset"), async ({ request }) => {
    await delay(150);
    const parsed = resetPasswordRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return HttpResponse.json(
        { fieldErrors: z.flattenError(parsed.error).fieldErrors },
        { status: 422 },
      );
    }

    if (!resetTokens.has(parsed.data.resetToken)) {
      return HttpResponse.json({ message: "Invalid or expired reset link." }, { status: 401 });
    }

    resetTokens.delete(parsed.data.resetToken);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(url("/auth/refresh"), ({ cookies }) => {
    if (cookies.refreshToken !== demoRefreshToken) return unauthorized();
    return HttpResponse.json({ accessToken: demoAccessToken });
  }),

  http.post(url("/auth/logout"), () => {
    return new HttpResponse(null, {
      status: 204,
      headers: { "Set-Cookie": "refreshToken=; Path=/; Max-Age=0" },
    });
  }),

  http.get(url("/auth/me"), ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    return HttpResponse.json(demoUser);
  }),
];
