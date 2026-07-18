import { test, expect } from "@playwright/test";

test("public landing page explains the human approval boundary", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /clear the noise/i })).toBeVisible();
  await expect(page.getByText("Private by default. Skippable by design. AI cannot act without your approval.")).toBeVisible();
});

test("protected queue sends an unauthenticated user to the redesigned login", async ({ page }) => {
  await page.goto("/queue");
  await expect(page).toHaveURL(/\/login\?next=%2Fqueue$/);
  await expect(page.getByRole("heading", { name: /put life admin in its place/i })).toBeVisible();
});
