import { DurableObject } from "cloudflare:workers";
import {
  acquireDemoAgentLease,
  emptyDemoAgentGateState,
  releaseDemoAgentLease,
  type DemoAgentGateState,
} from "./gate";
import { demoAgentRuntimeConfig, type DemoAgentRuntimeConfig } from "./runtime-config";

type Storage = {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
};

type Context = { storage: Storage };

type AcquireRequest = {
  userId?: unknown;
  now?: unknown;
  leaseId?: unknown;
  config?: unknown;
};

const GATE_STATE_KEY = "demo-agent-gate-state";

/**
 * A single demo-budget object protects the public sandbox as a whole. It is
 * intentionally separate from the per-user sliding-window objects so daily
 * allowance, global budget and concurrency decisions are all atomic.
 */
export class DemoAgentBudget extends DurableObject {
  private readonly storage: Storage;

  constructor(ctx: Context, env: unknown) {
    super(ctx, env);
    this.storage = ctx.storage;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    let body: AcquireRequest;
    try {
      body = await request.json() as AcquireRequest;
    } catch {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const now = typeof body.now === "number" && Number.isFinite(body.now) ? body.now : Date.now();
    const stored = await this.storage.get<DemoAgentGateState>(GATE_STATE_KEY);
    if (new URL(request.url).pathname === "/release") {
      if (typeof body.leaseId !== "string") return Response.json({ error: "Invalid lease" }, { status: 400 });
      const state = releaseDemoAgentLease(stored, body.leaseId, now);
      await this.storage.put(GATE_STATE_KEY, state);
      return Response.json({ released: true });
    }

    if (new URL(request.url).pathname !== "/acquire" || typeof body.userId !== "string" || typeof body.leaseId !== "string") {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const config = runtimeConfigFromPayload(body.config);
    if (!config) return Response.json({ error: "Invalid configuration" }, { status: 400 });

    const result = acquireDemoAgentLease(stored ?? emptyDemoAgentGateState(now), {
      userId: body.userId,
      now,
      leaseId: body.leaseId,
      config,
    });
    await this.storage.put(GATE_STATE_KEY, result.state);
    return Response.json(result.allowed ? { allowed: true, leaseId: result.leaseId } : { allowed: false, code: result.code });
  }
}

function runtimeConfigFromPayload(value: unknown): DemoAgentRuntimeConfig | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<DemoAgentRuntimeConfig>;
  if (typeof candidate.enabled !== "boolean" || typeof candidate.killSwitch !== "boolean") return null;
  if (typeof candidate.perUserDailyLimit !== "number" || typeof candidate.globalDailyLimit !== "number" || typeof candidate.maxConcurrent !== "number" || typeof candidate.timeoutMs !== "number") return null;
  if (candidate.eventStartAt !== null && typeof candidate.eventStartAt !== "string") return null;
  if (candidate.eventEndAt !== null && typeof candidate.eventEndAt !== "string") return null;

  return demoAgentRuntimeConfig({
    DEMO_AGENTS_ENABLED: String(candidate.enabled),
    DEMO_AGENT_KILL_SWITCH: String(candidate.killSwitch),
    DEMO_AGENT_EVENT_START_AT: candidate.eventStartAt ?? undefined,
    DEMO_AGENT_EVENT_END_AT: candidate.eventEndAt ?? undefined,
    DEMO_AGENT_USER_DAILY_LIMIT: String(candidate.perUserDailyLimit),
    DEMO_AGENT_GLOBAL_DAILY_LIMIT: String(candidate.globalDailyLimit),
    DEMO_AGENT_MAX_CONCURRENCY: String(candidate.maxConcurrent),
    DEMO_AGENT_TIMEOUT_MS: String(candidate.timeoutMs),
  });
}
