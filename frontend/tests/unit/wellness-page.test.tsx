import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listWellnessAssessments: vi.fn(),
}));

vi.mock("@/lib/db/wellness", () => ({
  listWellnessAssessments: mocks.listWellnessAssessments,
}));

import WellnessPage from "@/app/(app)/wellness/page";

describe("WellnessPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("replaces an entirely unrated Wheel with a calm next step", async () => {
    mocks.listWellnessAssessments.mockResolvedValue([{
      id: "assessment-empty",
      created_at: "2026-07-19T10:00:00.000Z",
      entries: [{
        dimension: "environmental",
        current_rating: null,
        desired_rating: null,
        focus_state: "active_focus",
      }],
    }]);

    render(await WellnessPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Nothing is being scored." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /take a snapshot \(about 2 minutes\)/i })).toHaveAttribute("href", "/wellness?retake=1");
    expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/environmental · focus/i)).not.toBeInTheDocument();
  });
});
