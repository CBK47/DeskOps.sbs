import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AGENT_RATE_LIMIT_WINDOW_MS, nextAgentRateLimitState } from "./rate-limit-config";
import {
  acquireDemoAgentLease,
  emptyDemoAgentGateState,
  releaseDemoAgentLease,
  type DemoAgentGateCode,
  type DemoAgentGateState,
} from "@/lib/demo-agents/gate";
import { demoAgentRuntimeConfig, type DemoAgentRuntimeConfig } from "@/lib/demo-agents/runtime-config";

export { AGENT_RATE_LIMIT_WINDOW_MS, AGENT_REQUEST_LIMIT } from "./rate-limit-config";

const requestTimesByUser = new Map<string, number[]>();

type AgentRateLimiterStub = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

type AgentRateLimiterNamespace = {
  idFromName(name: string): unknown;
  get(id: unknown): AgentRateLimiterStub;
};

type AgentRateLimiterEnvironment = {
  AGENT_RATE_LIMITER?: AgentRateLimiterNamespace;
  DEMO_AGENT_BUDGET?: DemoAgentBudgetNamespace;
  [key: string]: unknown;
};

type DemoAgentBudgetStub = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

type DemoAgentBudgetNamespace = {
  idFromName(name: string): unknown;
  get(id: unknown): DemoAgentBudgetStub;
};

export type DemoAgentRequestLease =
  | { ok: true; timeoutMs: number; release: () => Promise<void> }
  | { ok: false; code: DemoAgentGateCode | "too_busy" };

let localDemoGateState: DemoAgentGateState | undefined;

export async function takeAgentRequestSlot(userId: string, now = Date.now()): Promise<boolean> {
  if (usesLocalRateLimitFallback()) return takeInMemoryRequestSlot(userId, now);
  const namespace = cloudflareRateLimiterNamespace();
  if (!namespace) return takeInMemoryRequestSlot(userId, now);

  try {
    const stub = namespace.get(namespace.idFromName(userId));
    const response = await stub.fetch("https://deskops.internal/rate-limit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ now }),
    });
    if (!response.ok) return false;

    const result = await response.json() as { allowed?: unknown };
    return result.allowed === true;
  } catch {
    // A configured production limiter must fail closed so an infrastructure
    // fault cannot turn into unbounded model usage.
    return false;
  }
}

function cloudflareRateLimiterNamespace(): AgentRateLimiterNamespace | null {
  try {
    const env = getCloudflareContext().env as AgentRateLimiterEnvironment;
    return env.AGENT_RATE_LIMITER ?? null;
  } catch {
    // next dev, Node builds and unit tests do not always have a Worker request
    // context. Their fallback is deliberately local to the current process.
    return null;
  }
}

function takeInMemoryRequestSlot(userId: string, now: number): boolean {
  const result = nextAgentRateLimitState(requestTimesByUser.get(userId) ?? [], now);
  requestTimesByUser.set(userId, result.timestamps);
  pruneExpiredUsers(now - AGENT_RATE_LIMIT_WINDOW_MS);
  return result.allowed;
}

function pruneExpiredUsers(windowStart: number) {
  if (requestTimesByUser.size < 1_000) return;

  for (const [userId, timestamps] of requestTimesByUser) {
    if (!timestamps.some((timestamp) => timestamp > windowStart)) requestTimesByUser.delete(userId);
  }
}

export function resetAgentRateLimitForTests() {
  requestTimesByUser.clear();
  localDemoGateState = undefined;
}

export async function acquireDemoAgentRequest(userId: string, now = Date.now()): Promise<DemoAgentRequestLease> {
  const config = currentDemoAgentConfig();
  if (!config.enabled || config.killSwitch) return { ok: false, code: "demo_disabled" };
  if (usesLocalRateLimitFallback()) {
    if (!takeInMemoryRequestSlot(`demo:${userId}`, now)) return { ok: false, code: "too_busy" };
    return acquireLocalDemoAgentRequest(userId, now, crypto.randomUUID(), config);
  }
  if (!(await takeAgentRequestSlot(`demo:${userId}`, now))) return { ok: false, code: "too_busy" };

  const leaseId = crypto.randomUUID();
  const namespace = cloudflareDemoBudgetNamespace();
  if (!namespace) return acquireLocalDemoAgentRequest(userId, now, leaseId, config);

  try {
    const stub = namespace.get(namespace.idFromName("global"));
    const response = await stub.fetch("https://deskops.internal/acquire", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, now, leaseId, config }),
    });
    if (!response.ok) return { ok: false, code: "too_busy" };
    const result = await response.json() as { allowed?: unknown; code?: unknown; leaseId?: unknown };
    if (result.allowed !== true || result.leaseId !== leaseId) {
      return { ok: false, code: demoGateCode(result.code) ?? "too_busy" };
    }

    return {
      ok: true,
      timeoutMs: config.timeoutMs,
      release: async () => {
        try {
          await stub.fetch("https://deskops.internal/release", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ leaseId, now: Date.now() }),
          });
        } catch {
          // The stored expiry is the recovery path if the best-effort release fails.
        }
      },
    };
  } catch {
    return { ok: false, code: "too_busy" };
  }
}

export async function withDemoAgentTimeout<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Demo agent request timed out.")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function acquireLocalDemoAgentRequest(userId: string, now: number, leaseId: string, config: DemoAgentRuntimeConfig): DemoAgentRequestLease {
  const result = acquireDemoAgentLease(localDemoGateState ?? emptyDemoAgentGateState(now), { userId, now, leaseId, config });
  localDemoGateState = result.state;
  if (!result.allowed) return { ok: false, code: result.code };

  return {
    ok: true,
    timeoutMs: config.timeoutMs,
    release: async () => {
      localDemoGateState = releaseDemoAgentLease(localDemoGateState, leaseId);
    },
  };
}

function currentDemoAgentConfig() {
  const environment = cloudflareEnvironment();
  const values = Object.fromEntries(Object.entries(environment).map(([key, value]) => [key, typeof value === "string" ? value : undefined]));
  return demoAgentRuntimeConfig({ ...process.env, ...values });
}

function cloudflareDemoBudgetNamespace(): DemoAgentBudgetNamespace | null {
  return cloudflareEnvironment().DEMO_AGENT_BUDGET as DemoAgentBudgetNamespace | undefined ?? null;
}

function cloudflareEnvironment(): AgentRateLimiterEnvironment {
  try {
    return getCloudflareContext().env as AgentRateLimiterEnvironment;
  } catch {
    return {};
  }
}

function demoGateCode(value: unknown): DemoAgentGateCode | null {
  return typeof value === "string" && ["demo_disabled", "event_not_started", "event_ended", "daily_allowance_used", "global_budget_used", "too_busy"].includes(value)
    ? value as DemoAgentGateCode
    : null;
}

function usesLocalRateLimitFallback() {
  // OpenNext's Next development server exposes placeholder Durable Object
  // namespaces, but cannot run Worker-owned actor exports. Production must
  // fail closed; local development and tests stay deterministic in-process.
  return process.env.NODE_ENV !== "production";
}
