import { test, expect } from "@playwright/test";

test("public landing page explains the human approval boundary", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /clear the noise/i })).toBeVisible();
  await expect(page.getByText("Private by default. Skippable by design. AI cannot act without your approval.")).toBeVisible();
  await expect(page.getByRole("link", { name: /try the interactive demo/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /github repository/i })).toBeVisible();
});

test("protected queue sends an unauthenticated user to the redesigned login", async ({ page }) => {
  await page.goto("/queue");
  await expect(page).toHaveURL(/\/login\?next=%2Fqueue$/);
  await expect(page.getByRole("heading", { name: /welcome to deskops/i })).toBeVisible();
});

test("security contact is public without authentication", async ({ request }) => {
  const response = await request.get("/.well-known/security.txt");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  await expect(response.text()).resolves.toContain(
    "Contact: https://github.com/CBK47/DeskOps.sbs/security/advisories/new",
  );
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
  await expect(page.getByText("0 items", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /capture a first item/i }).click();
  await page.getByLabel("First synthetic task").fill("Book a synthetic boiler service before autumn.");
  await page.getByRole("button", { name: "Add to my queue" }).click();

  await expect(page.getByRole("heading", { name: /talk with help only where it earns its place/i })).toBeVisible();
  await expect(page.getByText("1 items", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Assign Echo" }).click();
  await expect(page.getByRole("log", { name: "Echo conversation" })).toContainText(/I’m Echo/i);
  await page.getByLabel("Message Echo").fill("Plan one small synthetic Saturday reset for the kitchen.");
  await page.getByRole("button", { name: "Send to Echo" }).click();

  await expect(page.getByRole("button", { name: /add to demo queue/i })).toBeVisible();
  await expect(page.getByRole("log", { name: "Echo conversation" })).toContainText(/prepared one draft for you to review below/i);
  await page.getByRole("button", { name: /add to demo queue/i }).click();
  await expect(page.getByRole("status")).toContainText(/nothing was saved to a real account/i);
  await expect(page.getByRole("heading", { name: /your first deskops queue/i })).toBeVisible();
  await expect(page.getByText("2 items", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /reset walkthrough/i }).click();
  await expect(page.getByText("0 items", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /what deserves its own place/i })).toBeVisible();
});

test("public demo companion pages explain Wellness history and agent boundaries", async ({ page }) => {
  await page.goto("/demo/wellness");
  await expect(page.getByRole("heading", { name: /reflection becomes more useful when you can see the change/i })).toBeVisible();
  await expect(page.getByText("Financial", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("4 → 7", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /one small step, not another list/i })).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Title").fill("Review one sample renewal date");
  await page.getByRole("button", { name: "Finish editing" }).click();
  await page.getByRole("button", { name: "Add to demo queue" }).click();
  await expect(page.getByRole("status")).toContainText(/browser-only example/i);

  await page.goto("/demo/agents");
  await expect(page.getByRole("heading", { name: /agents work inside the boundaries you set/i })).toBeVisible();
  await expect(page.getByText(/no repository, gmail, calendar, drive or other service access/i)).toBeVisible();
  await expect(page.getByText("Six examples of scoped operators.")).toBeVisible();
});

test("public pages render a continuous scroll at desktop and phone widths", async ({ page }, testInfo) => {
  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "phone", width: 390, height: 844 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const path of ["/", "/demo", "/demo/wellness", "/demo/agents"]) {
      await page.goto(path);
      const layout = await page.evaluate(() => {
        const blocks = Array.from(document.querySelectorAll("main > section, main > header, main > div, main > footer"))
          .map((element) => element.getBoundingClientRect())
          .filter((rect) => rect.height > 0)
          .map((rect) => ({ top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY }))
          .sort((left, right) => left.top - right.top);
        const gaps = blocks.slice(1).map((block, index) => Math.max(0, block.top - blocks[index].bottom));
        const hiddenMarketingSections = Array.from(document.querySelectorAll(".marketing-reveal"))
          .filter((element) => {
            const style = window.getComputedStyle(element);
            return Number(style.opacity) < 0.99 || style.visibility === "hidden" || style.display === "none";
          }).length;
        return {
          height: document.documentElement.scrollHeight,
          maxGap: Math.max(0, ...gaps),
          overflows: document.documentElement.scrollWidth > window.innerWidth,
          textLength: document.querySelector("main")?.textContent?.trim().length ?? 0,
          hiddenMarketingSections,
        };
      });

      expect(layout.height, `${path} should extend beyond one viewport`).toBeGreaterThan(viewport.height);
      expect(layout.maxGap, `${path} should not contain a blank scroll region`).toBeLessThan(viewport.height);
      expect(layout.overflows, `${path} should fit ${viewport.name}`).toBe(false);
      expect(layout.textLength, `${path} should render meaningful content`).toBeGreaterThan(500);
      expect(layout.hiddenMarketingSections, `${path} should not hide content from capture tools`).toBe(0);

      await page.screenshot({
        path: testInfo.outputPath(`${viewport.name}-${path.replaceAll("/", "-").replace(/^-/, "") || "home"}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
  }
});
