import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WellnessWheel } from "@/components/wellness/WellnessWheel";

describe("WellnessWheel", () => {
  it("renders low ratings neutrally and untracked dimensions explicitly", () => {
    render(<WellnessWheel entries={[
      { dimension: "physical", current_rating: 1, desired_rating: 6, focus_state: "background" },
      { dimension: "emotional", current_rating: null, desired_rating: null, focus_state: "not_tracking" },
    ]} />);

    const values = screen.getByRole("list", { name: "Wellness Wheel values" });
    const physical = within(values).getByText("Physical").closest("li");
    const emotional = within(values).getByText("Emotional").closest("li");

    expect(physical).toHaveTextContent("1/10");
    expect(physical?.className).not.toMatch(/destructive|warning|red/);
    expect(emotional).toHaveTextContent("Untracked");
    expect(screen.getByRole("img")).toHaveAccessibleName(/Emotional: untracked/);
  });
});
