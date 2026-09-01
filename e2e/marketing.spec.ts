import { expect, test } from "@playwright/test";

test("the home page serves its prerendered heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "A foundation that stays maintainable" }),
  ).toBeVisible();
});

test("the about page serves its prerendered heading", async ({ page }) => {
  await page.goto("/about");

  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
});
