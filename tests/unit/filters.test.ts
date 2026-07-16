import { describe, it, expect } from "vitest";
import { parseTicketFilters, type TicketFilters } from "@/lib/db/tickets";

describe("parseTicketFilters", () => {
  it("defaults to open status, no other filters", () => {
    const f = parseTicketFilters(new URLSearchParams(""));
    expect(f).toEqual<TicketFilters>({
      status:     ["open", "in_progress"],
      streamIds:  [],
      priorities: [],
      due:        "any",
    });
  });

  it("reads multi-value params", () => {
    const f = parseTicketFilters(new URLSearchParams("stream=a&stream=b&priority=high&due=overdue"));
    expect(f.streamIds).toEqual(["a", "b"]);
    expect(f.priorities).toEqual(["high"]);
    expect(f.due).toBe("overdue");
  });

  it("accepts status=done", () => {
    const f = parseTicketFilters(new URLSearchParams("status=done"));
    expect(f.status).toEqual(["done"]);
  });

  it("drops unknown enum values and falls back to defaults", () => {
    const f = parseTicketFilters(new URLSearchParams("status=banana&priority=extreme"));
    // No valid status -> default; no valid priority -> empty.
    expect(f.status).toEqual(["open", "in_progress"]);
    expect(f.priorities).toEqual([]);
  });

  it("falls back to 'any' for a garbage due value", () => {
    const f = parseTicketFilters(new URLSearchParams("due=whenever"));
    expect(f.due).toBe("any");
  });

  it("keeps valid values and drops invalid ones in a mixed param", () => {
    const f = parseTicketFilters(new URLSearchParams("status=done&status=banana"));
    expect(f.status).toEqual(["done"]);
  });
});
