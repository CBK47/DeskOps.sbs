import { describe, expect, it } from "vitest";
import { validateAssessment, type WellnessAssessmentInput } from "@/lib/wellness-assessment";
import { companionToolsFor } from "@/lib/companion-tools";
import { hasWellnessRatingData } from "@/lib/wellness";

const validInput: WellnessAssessmentInput = {
  entries: [
    {
      dimension: "physical",
      current_rating: 6,
      desired_rating: 8,
      focus_state: "active_focus",
      areas: ["Fitness and movement"],
    },
    {
      dimension: "social",
      current_rating: null,
      desired_rating: null,
      focus_state: "background",
      areas: [],
    },
  ],
  reminder: "quarterly",
  customReminderDays: null,
};

describe("validateAssessment", () => {
  it("keeps optional ratings separate from the chosen active focus", () => {
    expect(validateAssessment(validInput)).toEqual(validInput);
  });

  it("does not allow a completed assessment without a user-chosen focus", () => {
    expect(() => validateAssessment({
      ...validInput,
      entries: validInput.entries.map((entry) => ({ ...entry, focus_state: "background" as const })),
    })).toThrow("Choose between one and three areas you actually want support with.");
  });

  it("never accepts zero as an assessment rating", () => {
    expect(() => validateAssessment({
      ...validInput,
      entries: [{ ...validInput.entries[0], current_rating: 0 }],
    })).toThrow("Ratings must be between 1 and 10, or left blank.");
  });

  it("requires a safe custom reminder cadence", () => {
    expect(() => validateAssessment({ ...validInput, reminder: "custom", customReminderDays: 2 }))
      .toThrow("Choose a custom reminder between 7 and 365 days.");
  });
});

describe("companionToolsFor", () => {
  it("returns typed external links only for selected focus dimensions", () => {
    const tools = companionToolsFor(["financial"]);
    expect(tools.map((tool) => tool.name)).toEqual(["Actual Budget", "Paperless-ngx"]);
    expect(tools.every((tool) => tool.href.startsWith("https://github.com/"))).toBe(true);
  });
});

describe("hasWellnessRatingData", () => {
  it("treats a focus without ratings as an unfinished snapshot", () => {
    expect(hasWellnessRatingData([
      { current_rating: null, desired_rating: null },
    ])).toBe(false);
    expect(hasWellnessRatingData([
      { current_rating: null, desired_rating: 7 },
    ])).toBe(true);
  });
});
