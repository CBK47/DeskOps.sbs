import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/rebalance/RebalanceCard", () => ({
  RebalanceCard: () => <div data-testid="rebalance-card" />,
}));

import { RebalanceSuggestion } from "@/components/rebalance/RebalanceSuggestion";

describe("RebalanceSuggestion", () => {
  it("renders nothing when there is no assessment", () => {
    const { container } = render(<RebalanceSuggestion assessment={null} streams={[{ id: "stream-1", name: "Home" }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the assessment has no tracked positive gap", () => {
    const { container } = render(<RebalanceSuggestion
      assessment={{
        id: "assessment-1",
        user_id: "user-1",
        status: "completed",
        reminder: "never",
        custom_reminder_days: null,
        created_at: "2026-07-18T12:00:00.000Z",
        entries: [{
          id: "entry-1",
          assessment_id: "assessment-1",
          user_id: "user-1",
          dimension: "physical",
          current_rating: null,
          desired_rating: null,
          focus_state: "not_tracking",
          areas: [],
          created_at: "2026-07-18T12:00:00.000Z",
        }],
      }}
      streams={[{ id: "stream-1", name: "Home" }]}
    />);
    expect(container).toBeEmptyDOMElement();
  });
});
