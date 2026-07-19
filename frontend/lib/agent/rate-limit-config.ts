export const AGENT_RATE_LIMIT_WINDOW_MS = 60_000;
export const AGENT_REQUEST_LIMIT = 10;

export function nextAgentRateLimitState(stored: number[], now: number) {
  const windowStart = now - AGENT_RATE_LIMIT_WINDOW_MS;
  const timestamps = stored.filter((timestamp) => Number.isFinite(timestamp) && timestamp > windowStart);
  const allowed = timestamps.length < AGENT_REQUEST_LIMIT;
  if (allowed) timestamps.push(now);
  return { allowed, timestamps };
}
