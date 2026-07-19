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

  for (const path of ["/", "/login", "/demo", "/demo/wellness", "/demo/agents"]) {
    await page.goto(path);
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflows, `${path} should fit the viewport`).toBe(false);
  }
});

test("public demo navigation remains discoverable on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");

  const navigation = page.getByRole("navigation", { name: "Demo navigation" });
  await expect(navigation.getByRole("link", { name: "First session" })).toBeVisible();
  await navigation.getByRole("link", { name: "Wellness" }).click();
  await expect(page).toHaveURL(/\/demo\/wellness$/);
  await page.getByRole("navigation", { name: "Demo navigation" }).getByRole("link", { name: "Agents" }).click();
  await expect(page).toHaveURL(/\/demo\/agents$/);
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

test("public demo simulates a first session and keeps agent approval local to the browser", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: /start with the parts of life already asking for you/i })).toBeVisible();
  await expect(page.getByText(/no account created/i)).toBeVisible();

  await page.getByRole("button", { name: /capture a first item/i }).click();
  await page.getByLabel("First synthetic task").fill("Book a synthetic boiler service before autumn.");
  await page.getByRole("button", { name: "Add to my queue" }).click();

  await expect(page.getByRole("heading", { name: /talk with help only where it earns its place/i })).toBeVisible();
  await page.getByRole("button", { name: "Assign Echo" }).click();
  await expect(page.getByRole("log", { name: "Echo conversation" })).toContainText(/I’m Echo/i);
  await page.getByLabel("Message Echo").fill("Plan one small synthetic Saturday reset for the kitchen.");
  await page.getByRole("button", { name: "Send to Echo" }).click();

  await expect(page.getByRole("button", { name: /add to demo queue/i })).toBeVisible();
  await expect(page.getByRole("log", { name: "Echo conversation" })).toContainText(/prepared one draft for you to review below/i);
  await page.getByRole("button", { name: /add to demo queue/i }).click();
  await expect(page.getByRole("status")).toContainText(/nothing was saved to a real account/i);
  await expect(page.getByRole("heading", { name: /your first deskops queue/i })).toBeVisible();
});

test("public demo companion pages explain Wellness history and agent boundaries", async ({ page }) => {
  await page.goto("/demo/wellness");
  await expect(page.getByRole("heading", { name: /reflection becomes more useful when you can see the change/i })).toBeVisible();
  await expect(page.getByText(/financial needs attention/i)).toBeVisible();

  await page.goto("/demo/agents");
  await expect(page.getByRole("heading", { name: /agents work inside the boundaries you set/i })).toBeVisible();
  await expect(page.getByText(/no repository, gmail, calendar, drive or other service access/i)).toBeVisible();
  await expect(page.getByText("Six examples of scoped operators.")).toBeVisible();
});
