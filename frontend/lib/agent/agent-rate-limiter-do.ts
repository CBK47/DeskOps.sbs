import { DurableObject } from "cloudflare:workers";
import { nextAgentRateLimitState } from "./rate-limit-config";

type RateLimitStorage = {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
};

type RateLimitContext = {
  storage: RateLimitStorage;
};

type RateLimitRequest = {
  now?: unknown;
};

const REQUEST_TIMESTAMPS_KEY = "request-timestamps";

/**
 * One SQLite-backed object is addressed per authenticated user. Cloudflare
 * serialises each object's storage operations, which makes the sliding-window
 * decision atomic without routing every DeskOps user through one singleton.
 */
export class AgentRateLimiter extends DurableObject {
  private readonly storage: RateLimitStorage;

  constructor(ctx: RateLimitContext, env: unknown) {
    super(ctx, env);
    this.storage = ctx.storage;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    let body: RateLimitRequest;
    try {
      body = await request.json() as RateLimitRequest;
    } catch {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const now = typeof body.now === "number" && Number.isFinite(body.now) ? body.now : Date.now();
    const stored = await this.storage.get<number[]>(REQUEST_TIMESTAMPS_KEY) ?? [];
    const result = nextAgentRateLimitState(stored, now);
    await this.storage.put(REQUEST_TIMESTAMPS_KEY, result.timestamps);
    return Response.json({ allowed: result.allowed });
  }
}
