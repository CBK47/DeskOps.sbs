import { describe, expect, it } from "vitest";
import { computeWheelScores, wheelFilterHref } from "@/lib/wheel";

const today = new Date("2026-07-16T12:00:00Z");
const health = { id: "health", life_domain: "health" } as const;

describe("computeWheelScores", () => {
  it("keeps an all-done domain healthy", () => {
    const scores = computeWheelScores([
      { stream_id: "health", status: "done", due_date: "2026-07-10", closed_at: "2026-07-15T10:00:00Z" },
    ], [health], today);

    expect(scores.find((score) => score.domain === "health")).toMatchObject({
      score: 10,
      openCount: 0,
      overdueCount: 0,
    });
  });

  it("lowers a domain with many overdue items", () => {
    const tickets = Array.from({ length: 8 }, (_, index) => ({
      stream_id: "health",
      status: "open" as const,
      due_date: `2026-07-0${index + 1}`,
      closed_at: null,
    }));
    const scores = computeWheelScores(tickets, [health], today);

    expect(scores.find((score) => score.domain === "health")).toMatchObject({
      score: 0,
      openCount: 8,
      overdueCount: 8,
    });
  });

  it("greys a domain with no mapped stream", () => {
    const scores = computeWheelScores([], [health], today);

    expect(scores.find((score) => score.domain === "career")).toMatchObject({
      score: null,
      openCount: 0,
      overdueCount: 0,
    });
  });

  it("clamps scores into the zero-to-ten range", () => {
    const tickets = Array.from({ length: 40 }, () => ({
      stream_id: "health",
      status: "open" as const,
      due_date: "2026-06-01",
      closed_at: null,
    }));
    const scores = computeWheelScores(tickets, [health], today);

    expect(scores.find((score) => score.domain === "health")?.score).toBe(0);
  });

  it("uses the London calendar day for overdue work", () => {
    const scores = computeWheelScores([
      { stream_id: "health", status: "open", due_date: "2026-07-17", closed_at: null },
    ], [health], new Date("2026-07-17T23:30:00Z"));

    expect(scores.find((score) => score.domain === "health")).toMatchObject({
      score: 8.2,
      overdueCount: 1,
    });
  });

  it("counts work completed earlier on the current London day", () => {
    const scores = computeWheelScores([
      { stream_id: "health", status: "done", due_date: null, closed_at: "2026-07-17T23:00:00Z" },
    ], [health], new Date("2026-07-17T23:30:00Z"));

    expect(scores.find((score) => score.domain === "health")).toMatchObject({ score: 10 });
  });
});

describe("wheelFilterHref", () => {
  it("preserves every mapped stream when filtering a life domain", () => {
    expect(wheelFilterHref(["home and family", "family-admin"])).toBe("/queue?stream=home+and+family&stream=family-admin");
  });

  it("does not offer a filter for an unmapped life domain", () => {
    expect(wheelFilterHref([])).toBeNull();
  });
});
