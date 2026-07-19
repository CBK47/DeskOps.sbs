import type { DemoAgentRuntimeConfig } from "./runtime-config";

export type DemoAgentGateCode = "demo_disabled" | "event_not_started" | "event_ended" | "daily_allowance_used" | "global_budget_used" | "too_busy";

export type DemoAgentGateState = {
  day: string;
  globalCount: number;
  userCounts: Record<string, number>;
  activeLeases: Record<string, number>;
};

export type DemoAgentGateResult =
  | { allowed: true; state: DemoAgentGateState; leaseId: string }
  | { allowed: false; state: DemoAgentGateState; code: DemoAgentGateCode };

export function emptyDemoAgentGateState(now = Date.now()): DemoAgentGateState {
  return { day: dayKey(now), globalCount: 0, userCounts: {}, activeLeases: {} };
}

export function acquireDemoAgentLease(
  stored: DemoAgentGateState | undefined,
  { userId, now, leaseId, config }: { userId: string; now: number; leaseId: string; config: DemoAgentRuntimeConfig },
): DemoAgentGateResult {
  const state = normaliseState(stored, now);
  if (!config.enabled || config.killSwitch) return { allowed: false, state, code: "demo_disabled" };
  if (config.eventStartAt && now < Date.parse(config.eventStartAt)) return { allowed: false, state, code: "event_not_started" };
  if (config.eventEndAt && now >= Date.parse(config.eventEndAt)) return { allowed: false, state, code: "event_ended" };
  if ((state.userCounts[userId] ?? 0) >= config.perUserDailyLimit) return { allowed: false, state, code: "daily_allowance_used" };
  if (state.globalCount >= config.globalDailyLimit) return { allowed: false, state, code: "global_budget_used" };
  if (Object.keys(state.activeLeases).length >= config.maxConcurrent) return { allowed: false, state, code: "too_busy" };

  return {
    allowed: true,
    leaseId,
    state: {
      ...state,
      globalCount: state.globalCount + 1,
      userCounts: { ...state.userCounts, [userId]: (state.userCounts[userId] ?? 0) + 1 },
      activeLeases: { ...state.activeLeases, [leaseId]: now + config.timeoutMs },
    },
  };
}

export function releaseDemoAgentLease(stored: DemoAgentGateState | undefined, leaseId: string, now = Date.now()) {
  const state = normaliseState(stored, now);
  const activeLeases = { ...state.activeLeases };
  delete activeLeases[leaseId];
  return { ...state, activeLeases };
}

function normaliseState(stored: DemoAgentGateState | undefined, now: number): DemoAgentGateState {
  const fresh = !stored || stored.day !== dayKey(now) ? emptyDemoAgentGateState(now) : stored;
  const activeLeases = Object.fromEntries(Object.entries(fresh.activeLeases).filter(([, expiresAt]) => Number.isFinite(expiresAt) && expiresAt > now));
  return {
    day: fresh.day,
    globalCount: Number.isFinite(fresh.globalCount) ? Math.max(0, fresh.globalCount) : 0,
    userCounts: Object.fromEntries(Object.entries(fresh.userCounts).filter(([, count]) => Number.isFinite(count) && count > 0)),
    activeLeases,
  };
}

function dayKey(now: number) {
  return new Date(now).toISOString().slice(0, 10);
}
