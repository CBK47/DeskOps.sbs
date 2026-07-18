const WINDOW_MS = 60_000;
export const AGENT_REQUEST_LIMIT = 10;

const requestTimesByUser = new Map<string, number[]>();

// ponytail: per-isolate memory limiter; move to KV/Durable Object if real traffic arrives.
export function takeAgentRequestSlot(userId: string, now = Date.now()): boolean {
  const windowStart = now - WINDOW_MS;
  const recentRequests = (requestTimesByUser.get(userId) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recentRequests.length >= AGENT_REQUEST_LIMIT) {
    requestTimesByUser.set(userId, recentRequests);
    return false;
  }

  recentRequests.push(now);
  requestTimesByUser.set(userId, recentRequests);
  pruneExpiredUsers(windowStart);
  return true;
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
