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
  await expect(page.getByRole("heading", { name: /welcome to deskops/i })).toBeVisible();
});

test("marketing content remains available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /a system that leaves room for judgement/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /a wider view, without a scorecard/i })).toBeVisible();

  await context.close();
});

test("public entry points fit a phone viewport without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of ["/", "/login"]) {
    await page.goto(path);
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflows, `${path} should fit the viewport`).toBe(false);
  }
});

test("login exposes an authentication failure as an alert", async ({ page }) => {
  await page.goto("/login?error=auth");
  await expect(page.getByRole("alert").filter({ hasText: "Authentication did not complete" })).toBeVisible();
});

test("login offers social and passwordless entry without a shared demo account", async ({ page }) => {
  await page.route("**/auth/v1/settings", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ external: { google: true, github: true, email: true } }),
  }));
  await page.goto("/login");

  await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByRole("button", { name: "Email me a link" })).toBeVisible();
  await expect(page.getByText(/set up demo workspace/i)).toBeVisible();
});
