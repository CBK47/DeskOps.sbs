import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssessmentFlow } from "@/components/wellness/AssessmentFlow";
import { skipWellnessAssessmentAction } from "@/app/actions/wellness";

vi.mock("@/app/actions/wellness", () => ({
  saveWellnessAssessmentAction: vi.fn(),
  skipWellnessAssessmentAction: vi.fn(),
}));

describe("AssessmentFlow", () => {
  beforeEach(() => {
    vi.mocked(skipWellnessAssessmentAction).mockClear();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    vi.stubGlobal("scrollTo", vi.fn());
  });

  it("advances in place when Begin when ready is clicked", () => {
    render(<AssessmentFlow firstRun />);

    fireEvent.click(screen.getByRole("button", { name: /begin when ready/i }));

    expect(screen.getByRole("heading", { name: /eight dimensions, entirely optional/i })).toBeInTheDocument();
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
    expect(skipWellnessAssessmentAction).not.toHaveBeenCalled();
  });
});
