import { describe, expect, it } from "vitest";
import { acquireDemoAgentLease, emptyDemoAgentGateState, releaseDemoAgentLease } from "@/lib/demo-agents/gate";
import { demoAgentRuntimeConfig } from "@/lib/demo-agents/runtime-config";

const now = Date.parse("2026-07-20T12:00:00.000Z");

function config(overrides: Record<string, string> = {}) {
  return demoAgentRuntimeConfig({
    DEMO_AGENTS_ENABLED: "true",
    DEMO_AGENT_EVENT_START_AT: "2026-07-19T00:00:00.000Z",
    DEMO_AGENT_EVENT_END_AT: "2026-08-02T23:59:59.999Z",
    DEMO_AGENT_USER_DAILY_LIMIT: "2",
    DEMO_AGENT_GLOBAL_DAILY_LIMIT: "3",
    DEMO_AGENT_MAX_CONCURRENCY: "1",
    DEMO_AGENT_TIMEOUT_MS: "8000",
    ...overrides,
  });
}

describe("public demo agent gate", () => {
  it("enforces a per-user daily allowance and a global daily budget", () => {
    const first = acquireDemoAgentLease(emptyDemoAgentGateState(now), { userId: "browser-a", now, leaseId: "one", config: config() });
    if (!first.allowed) throw new Error(first.code);
    const second = acquireDemoAgentLease(releaseDemoAgentLease(first.state, "one", now), { userId: "browser-a", now, leaseId: "two", config: config() });
    if (!second.allowed) throw new Error(second.code);
    const third = acquireDemoAgentLease(releaseDemoAgentLease(second.state, "two", now), { userId: "browser-a", now, leaseId: "three", config: config() });
    expect(third).toMatchObject({ allowed: false, code: "daily_allowance_used" });

    const other = acquireDemoAgentLease(releaseDemoAgentLease(second.state, "two", now), { userId: "browser-b", now, leaseId: "four", config: config() });
    if (!other.allowed) throw new Error(other.code);
    const exhausted = acquireDemoAgentLease(releaseDemoAgentLease(other.state, "four", now), { userId: "browser-c", now, leaseId: "five", config: config() });
    expect(exhausted).toMatchObject({ allowed: false, code: "global_budget_used" });
  });

  it("enforces event windows, concurrency and the emergency kill switch", () => {
    const state = emptyDemoAgentGateState(now);
    expect(acquireDemoAgentLease(state, { userId: "browser-a", now, leaseId: "one", config: config({ DEMO_AGENTS_ENABLED: "false" }) })).toMatchObject({ allowed: false, code: "demo_disabled" });
    expect(acquireDemoAgentLease(state, { userId: "browser-a", now, leaseId: "one", config: config({ DEMO_AGENT_EVENT_START_AT: "2026-07-21T00:00:00.000Z" }) })).toMatchObject({ allowed: false, code: "event_not_started" });
    expect(acquireDemoAgentLease(state, { userId: "browser-a", now, leaseId: "one", config: config({ DEMO_AGENT_EVENT_END_AT: "2026-07-20T11:00:00.000Z" }) })).toMatchObject({ allowed: false, code: "event_ended" });
    expect(acquireDemoAgentLease(state, { userId: "browser-a", now, leaseId: "one", config: config({ DEMO_AGENT_KILL_SWITCH: "true" }) })).toMatchObject({ allowed: false, code: "demo_disabled" });

    const first = acquireDemoAgentLease(state, { userId: "browser-a", now, leaseId: "one", config: config() });
    if (!first.allowed) throw new Error(first.code);
    expect(acquireDemoAgentLease(first.state, { userId: "browser-b", now, leaseId: "two", config: config() })).toMatchObject({ allowed: false, code: "too_busy" });
  });

  it("releases a lease and expires abandoned leases after the timeout", () => {
    const first = acquireDemoAgentLease(emptyDemoAgentGateState(now), { userId: "browser-a", now, leaseId: "one", config: config() });
    if (!first.allowed) throw new Error(first.code);
    const released = releaseDemoAgentLease(first.state, "one", now);
    expect(Object.keys(released.activeLeases)).toHaveLength(0);

    const expired = acquireDemoAgentLease(first.state, { userId: "browser-b", now: now + 8_001, leaseId: "two", config: config() });
    expect(expired.allowed).toBe(true);
  });
});
