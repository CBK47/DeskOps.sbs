import { describe, expect, it } from "vitest";
import {
  AGENT_RATE_LIMIT_WINDOW_MS,
  AGENT_REQUEST_LIMIT,
  nextAgentRateLimitState,
} from "@/lib/agent/rate-limit-config";

describe("agent rate-limit state", () => {
  it("allows the configured number of requests and blocks the next one", () => {
    let timestamps: number[] = [];

    for (let request = 0; request < AGENT_REQUEST_LIMIT; request += 1) {
      const result = nextAgentRateLimitState(timestamps, 10_000 + request);
      expect(result.allowed).toBe(true);
      timestamps = result.timestamps;
    }

    expect(nextAgentRateLimitState(timestamps, 20_000)).toEqual({
      allowed: false,
      timestamps,
    });
  });

  it("drops expired and invalid timestamps before making the next decision", () => {
    const now = 100_000;
    const result = nextAgentRateLimitState([
      now - AGENT_RATE_LIMIT_WINDOW_MS - 1,
      Number.NaN,
      now - 1,
    ], now);

    expect(result).toEqual({ allowed: true, timestamps: [now - 1, now] });
  });
});
