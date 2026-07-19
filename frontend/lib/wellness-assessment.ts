import {
  isWellnessDimension,
  type WellnessDimension,
  type WellnessFocusState,
  type WellnessReminder,
} from "@/lib/wellness";

const FOCUS_STATES: WellnessFocusState[] = ["active_focus", "background", "not_tracking"];
const REMINDERS: WellnessReminder[] = ["never", "monthly", "quarterly", "custom"];

export type WellnessEntryInput = {
  dimension: WellnessDimension;
  current_rating: number | null;
  desired_rating: number | null;
  focus_state: WellnessFocusState;
  areas: string[];
};

export type WellnessAssessmentInput = {
  entries: WellnessEntryInput[];
  reminder: WellnessReminder;
  customReminderDays: number | null;
};

export function validateAssessment(input: WellnessAssessmentInput): WellnessAssessmentInput {
  if (!Array.isArray(input.entries) || input.entries.length < 1 || input.entries.length > 8) {
    throw new Error("Choose at least one dimension.");
  }

  const dimensions = new Set<WellnessDimension>();
  const entries = input.entries.map((entry) => {
    if (!isWellnessDimension(entry.dimension) || dimensions.has(entry.dimension)) {
      throw new Error("Each selected dimension must be unique.");
    }
    dimensions.add(entry.dimension);
    if (!FOCUS_STATES.includes(entry.focus_state)) throw new Error("Choose a valid focus state.");
    validateRating(entry.current_rating);
    validateRating(entry.desired_rating);
    const areas = entry.areas
      .filter((area): area is string => typeof area === "string")
      .map((area) => area.trim())
      .filter(Boolean)
      .slice(0, 8)
      .map((area) => area.slice(0, 80));
    return { ...entry, areas };
  });

  const activeFocusCount = entries.filter((entry) => entry.focus_state === "active_focus").length;
  if (activeFocusCount < 1 || activeFocusCount > 3) {
    throw new Error("Choose between one and three areas you actually want support with.");
  }

  if (!REMINDERS.includes(input.reminder)) throw new Error("Choose a valid reminder preference.");
  const customReminderDays = input.reminder === "custom" ? input.customReminderDays : null;
  if (input.reminder === "custom" && (!Number.isInteger(customReminderDays) || customReminderDays! < 7 || customReminderDays! > 365)) {
    throw new Error("Choose a custom reminder between 7 and 365 days.");
  }

  return { entries, reminder: input.reminder, customReminderDays };
}

function validateRating(value: number | null) {
  if (value !== null && (!Number.isInteger(value) || value < 1 || value > 10)) {
    throw new Error("Ratings must be between 1 and 10, or left blank.");
  }
}
