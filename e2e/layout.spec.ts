import { expect, test, type Page } from "@playwright/test";

// A viewport matrix, not a browser matrix — the single chromium project in
// playwright.config.ts stays as it is. Scoping the widths to this one file keeps
// the other specs from being re-run five times over.

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/app");
}

async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
}

test.describe("a very narrow phone", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("keeps navigation in a drawer and never scrolls sideways", async ({ page }) => {
    await signIn(page);
    await expectNoSidewaysScroll(page);

    await expect(page.getByRole("link", { name: "Overview" })).toHaveCount(0);

    await page.getByRole("button", { name: "Toggle Sidebar" }).click();

    const drawer = page.getByRole("dialog");
    await expect(drawer.getByRole("link", { name: "Overview" })).toBeVisible();
    await expectNoSidewaysScroll(page);
  });
});

test.describe("a tablet", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("starts on the icon rail, which is too narrow to give up 16rem", async ({ page }) => {
    await signIn(page);

    await expect(page.locator('[data-slot="sidebar"]')).toHaveAttribute("data-state", "collapsed");
    await expectNoSidewaysScroll(page);
  });
});

test.describe("a laptop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("starts expanded, and a collapse survives a reload", async ({ page }) => {
    await signIn(page);

    const sidebar = page.locator('[data-slot="sidebar"]');
    await expect(sidebar).toHaveAttribute("data-state", "expanded");

    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");

    // Proves the whole cookie round-trip: sidebar.tsx writes it, and the route's
    // clientLoader reads it back before first paint.
    await page.reload();
    await expect(page.locator('[data-slot="sidebar"]')).toHaveAttribute("data-state", "collapsed");
    await expectNoSidewaysScroll(page);
  });
});

test.describe("a 4K display", () => {
  test.use({ viewport: { width: 2560, height: 1440 } });

  test("widens the content column to its cap rather than stretching it", async ({ page }) => {
    await signIn(page);

    const width = await page
      .locator("#app-content")
      .evaluate((element) => element.getBoundingClientRect().width);

    // max-w-8xl is 96rem. Anything at or under 80rem would mean the 4xl step
    // never engaged; anything above means the cap is not being applied.
    expect(width).toBeLessThanOrEqual(1536);
    expect(width).toBeGreaterThan(1280);
    await expectNoSidewaysScroll(page);
  });
});
