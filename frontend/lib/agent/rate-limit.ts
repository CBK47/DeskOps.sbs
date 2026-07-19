import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AGENT_RATE_LIMIT_WINDOW_MS, nextAgentRateLimitState } from "./rate-limit-config";

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
};

export async function takeAgentRequestSlot(userId: string, now = Date.now()): Promise<boolean> {
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
}
