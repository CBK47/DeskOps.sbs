import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      ...process.env,
      DEMO_AGENTS_ENABLED: "true",
      DEMO_AGENT_LIVE_AI: "false",
      DEMO_AGENT_EVENT_START_AT: "2026-07-19T00:00:00.000Z",
      DEMO_AGENT_EVENT_END_AT: "2026-08-02T23:59:59.999Z",
      DEMO_AGENT_USER_DAILY_LIMIT: "12",
      DEMO_AGENT_GLOBAL_DAILY_LIMIT: "300",
      DEMO_AGENT_MAX_CONCURRENCY: "4",
      DEMO_AGENT_TIMEOUT_MS: "8000",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
