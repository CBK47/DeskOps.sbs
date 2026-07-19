export type DemoAgentRuntimeConfig = {
  enabled: boolean;
  killSwitch: boolean;
  eventStartAt: string | null;
  eventEndAt: string | null;
  perUserDailyLimit: number;
  globalDailyLimit: number;
  maxConcurrent: number;
  timeoutMs: number;
};

export const DEMO_AGENT_DEFAULTS = {
  perUserDailyLimit: 12,
  globalDailyLimit: 300,
  maxConcurrent: 4,
  timeoutMs: 8_000,
} as const;

export function demoAgentRuntimeConfig(values: Record<string, string | undefined>): DemoAgentRuntimeConfig {
  return {
    enabled: values.DEMO_AGENTS_ENABLED === "true",
    killSwitch: values.DEMO_AGENT_KILL_SWITCH === "true",
    eventStartAt: validIsoInstant(values.DEMO_AGENT_EVENT_START_AT),
    eventEndAt: validIsoInstant(values.DEMO_AGENT_EVENT_END_AT),
    perUserDailyLimit: boundedInteger(values.DEMO_AGENT_USER_DAILY_LIMIT, DEMO_AGENT_DEFAULTS.perUserDailyLimit, 1, 100),
    globalDailyLimit: boundedInteger(values.DEMO_AGENT_GLOBAL_DAILY_LIMIT, DEMO_AGENT_DEFAULTS.globalDailyLimit, 1, 10_000),
    maxConcurrent: boundedInteger(values.DEMO_AGENT_MAX_CONCURRENCY, DEMO_AGENT_DEFAULTS.maxConcurrent, 1, 50),
    timeoutMs: boundedInteger(values.DEMO_AGENT_TIMEOUT_MS, DEMO_AGENT_DEFAULTS.timeoutMs, 1_000, 30_000),
  };
}

function boundedInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function validIsoInstant(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
