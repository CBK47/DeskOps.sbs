import { describe, expect, it } from "vitest";
import { selectRebalanceDimension, type RebalanceAssessment, type RebalanceEntry } from "@/lib/rebalance";

function entry(patch: Partial<RebalanceEntry> & Pick<RebalanceEntry, "dimension">): RebalanceEntry {
  return {
    current_rating: 5,
    desired_rating: 7,
    focus_state: "background",
    areas: [],
    created_at: "2026-07-18T12:00:00.000Z",
    ...patch,
  };
}

function assessment(entries: RebalanceEntry[]): RebalanceAssessment {
  return { id: "assessment-1", entries };
}

describe("selectRebalanceDimension", () => {
  it("returns nothing without an assessment or a positive tracked gap", () => {
    expect(selectRebalanceDimension(null)).toBeNull();
    expect(selectRebalanceDimension(assessment([
      entry({ dimension: "physical", current_rating: null }),
      entry({ dimension: "social", current_rating: 8, desired_rating: 8 }),
      entry({ dimension: "financial", current_rating: 2, desired_rating: 9, focus_state: "not_tracking" }),
    ]))).toBeNull();
  });

  it("selects the largest desired-minus-current gap", () => {
    const selection = selectRebalanceDimension(assessment([
      entry({ dimension: "physical", current_rating: 5, desired_rating: 8 }),
      entry({ dimension: "social", current_rating: 2, desired_rating: 8 }),
      entry({ dimension: "financial", current_rating: 4, desired_rating: 8 }),
    ]));

    expect(selection).toMatchObject({ dimension: "social", label: "Social", gap: 6 });
  });

  it("uses the person's active focus only when the largest gap is tied", () => {
    const selection = selectRebalanceDimension(assessment([
      entry({ dimension: "physical", current_rating: 3, desired_rating: 8 }),
      entry({ dimension: "emotional", current_rating: 4, desired_rating: 9, focus_state: "active_focus" }),
      entry({ dimension: "financial", current_rating: 1, desired_rating: 9, focus_state: "active_focus" }),
    ]));

    expect(selection?.dimension).toBe("financial");
  });

  it("uses the oldest rating as the final meaningful tie-break", () => {
    const selection = selectRebalanceDimension(assessment([
      entry({ dimension: "intellectual", created_at: "2026-07-18T12:05:00.000Z" }),
      entry({ dimension: "environmental", created_at: "2026-07-18T11:55:00.000Z" }),
    ]));

    expect(selection?.dimension).toBe("environmental");
  });
});
