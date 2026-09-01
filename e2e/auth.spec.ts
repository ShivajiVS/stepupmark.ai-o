import { expect, test } from "@playwright/test";

test("signing in lands on the app overview without leaking credentials", async ({ page }) => {
  const visited: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) visited.push(frame.url());
  });

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/app");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // The route is client-rendered, so the form is never live markup that could
  // fall back to a native GET and write the password into the URL and history.
  expect(visited.some((entry) => entry.includes("password"))).toBe(false);
});

test("registering a new account signs you in without leaking the password", async ({ page }) => {
  const visited: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) visited.push(frame.url());
  });

  await page.goto("/register");

  await page.getByLabel("Name").fill("Grace Hopper");
  await page.getByLabel("Email").fill(`grace-${Date.now().toString()}@example.com`);
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await page.getByLabel("Password", { exact: true }).fill("a-fresh-password");
  await page.getByLabel("Confirm password").fill("a-fresh-password");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await page.getByLabel("Verification code").pressSequentially("123456");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL("/app");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(visited.some((entry) => entry.includes("password"))).toBe(false);
});

test("an unauthenticated visit to a protected route redirects to sign-in and back", async ({
  page,
}) => {
  await page.goto("/app");

  // /app is the only protected page, so the landing assertion below cannot
  // distinguish "redirectTo was honoured" from "redirectTo was ignored and the
  // default applied". What this still guards is that the parameter is built and
  // round-trips intact; safeRedirectTo's own behaviour is covered exhaustively
  // in src/features/auth/redirect.test.ts.
  await expect(page).toHaveURL("/sign-in?redirectTo=%2Fapp");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/app");
});
