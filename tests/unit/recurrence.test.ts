import { describe, it, expect } from "vitest";
import { nextOccurrence } from "@/lib/recurrence";

describe("nextOccurrence", () => {
  it("returns null for 'none'", () => {
    expect(nextOccurrence("2026-05-15", "none")).toBeNull();
  });

  it("daily adds one day", () => {
    expect(nextOccurrence("2026-05-15", "daily")).toBe("2026-05-16");
  });

  it("weekly adds seven days", () => {
    expect(nextOccurrence("2026-05-15", "weekly")).toBe("2026-05-22");
  });

  it("monthly preserves day-of-month when possible", () => {
    expect(nextOccurrence("2026-01-15", "monthly")).toBe("2026-02-15");
  });

  it("monthly clamps to last day of shorter month", () => {
    expect(nextOccurrence("2026-01-31", "monthly")).toBe("2026-02-28");
  });

  it("yearly adds one year", () => {
    expect(nextOccurrence("2026-05-15", "yearly")).toBe("2027-05-15");
  });

  it("yearly handles Feb 29 by clamping", () => {
    expect(nextOccurrence("2024-02-29", "yearly")).toBe("2025-02-28");
  });

  it("returns null when due_date is null", () => {
    expect(nextOccurrence(null, "daily")).toBeNull();
  });

  it("monthly with anchorDay=31 preserves DOM through Feb (Jan 31 -> Feb 28 then Mar 31)", () => {
    // First call: Jan 31 -> Feb 28 with anchor 31
    expect(nextOccurrence("2026-01-31", "monthly", 31)).toBe("2026-02-28");
    // Second call (after Feb 28 closes): Feb 28 + 1 month with anchor 31 -> Mar 31
    expect(nextOccurrence("2026-02-28", "monthly", 31)).toBe("2026-03-31");
  });

  it("yearly Feb 29 with anchorDay=29 recovers in leap years (2024 -> 2025 (Feb 28) -> 2026 (28) -> 2027 (28) -> 2028 (29 since leap))", () => {
    expect(nextOccurrence("2024-02-29", "yearly", 29)).toBe("2025-02-28");
    expect(nextOccurrence("2025-02-28", "yearly", 29)).toBe("2026-02-28");
    expect(nextOccurrence("2026-02-28", "yearly", 29)).toBe("2027-02-28");
    expect(nextOccurrence("2027-02-28", "yearly", 29)).toBe("2028-02-29");
  });

  it("anchorDay null/undefined falls back to dueDate's day (backward compat)", () => {
    expect(nextOccurrence("2026-01-15", "monthly")).toBe("2026-02-15");
    expect(nextOccurrence("2026-01-15", "monthly", null)).toBe("2026-02-15");
  });

  it("multi-iteration chain with anchorDay=31 recovers full DOM after short months", () => {
    // Feed each output back in; anchor 31 should climb back to 31 whenever the month allows.
    let cur = "2026-01-31";
    cur = nextOccurrence(cur, "monthly", 31)!; expect(cur).toBe("2026-02-28"); // Feb clamps
    cur = nextOccurrence(cur, "monthly", 31)!; expect(cur).toBe("2026-03-31"); // recovers to 31
    cur = nextOccurrence(cur, "monthly", 31)!; expect(cur).toBe("2026-04-30"); // Apr clamps
    cur = nextOccurrence(cur, "monthly", 31)!; expect(cur).toBe("2026-05-31"); // recovers to 31
  });

  it("monthly wraps the year (Dec 31 -> Jan 31 next year)", () => {
    expect(nextOccurrence("2026-12-31", "monthly", 31)).toBe("2027-01-31");
  });

  it("weekly wraps the year (Dec 25 -> Jan 1 next year)", () => {
    expect(nextOccurrence("2026-12-25", "weekly")).toBe("2027-01-01");
  });

  it("daily crosses the spring DST boundary (Europe/London, clocks forward)", () => {
    expect(nextOccurrence("2026-03-28", "daily")).toBe("2026-03-29");
  });

  it("daily crosses the autumn DST boundary (Europe/London, clocks back)", () => {
    expect(nextOccurrence("2026-10-24", "daily")).toBe("2026-10-25");
  });

  it("monthly with anchorDay=31 clamps to Apr 30", () => {
    expect(nextOccurrence("2026-03-31", "monthly", 31)).toBe("2026-04-30");
  });
});
