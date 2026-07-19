import type { WellnessWheelEntry } from "@/components/wellness/WellnessWheel";

export type DemoWellnessAssessment = {
  id: string;
  created_at: string;
  entries: WellnessWheelEntry[];
};

export const DEMO_WELLNESS_ASSESSMENTS: DemoWellnessAssessment[] = [
  {
    id: "demo-wellness-july",
    created_at: "2026-07-10T09:00:00.000Z",
    entries: [
      entry("physical", 7, 8, "background"),
      entry("emotional", 6, 7, "background"),
      entry("intellectual", 8, 8, "background"),
      entry("social", 7, 7, "background"),
      entry("spiritual", null, null, "not_tracking"),
      entry("occupational", 7, 8, "background"),
      entry("environmental", 7, 8, "background"),
      entry("financial", 7, 8, "active_focus"),
    ],
  },
  {
    id: "demo-wellness-april",
    created_at: "2026-04-12T09:00:00.000Z",
    entries: [
      entry("physical", 6, 8, "background"),
      entry("emotional", 5, 7, "background"),
      entry("intellectual", 7, 8, "background"),
      entry("social", 6, 7, "background"),
      entry("spiritual", null, null, "not_tracking"),
      entry("occupational", 6, 8, "background"),
      entry("environmental", 6, 8, "background"),
      entry("financial", 5, 8, "active_focus"),
    ],
  },
  {
    id: "demo-wellness-january",
    created_at: "2026-01-18T09:00:00.000Z",
    entries: [
      entry("physical", 6, 8, "background"),
      entry("emotional", 5, 7, "background"),
      entry("intellectual", 7, 8, "background"),
      entry("social", 5, 7, "background"),
      entry("spiritual", null, null, "not_tracking"),
      entry("occupational", 6, 8, "background"),
      entry("environmental", 5, 8, "background"),
      entry("financial", 4, 8, "active_focus"),
    ],
  },
];

export const DEMO_WELLNESS_TRENDS = [
  {
    dimension: "Financial",
    change: "4 → 7",
    copy: "A steady focus on money admin, reminders and a clearer queue made the next step less opaque.",
  },
  {
    dimension: "Environmental",
    change: "5 → 7",
    copy: "Home tasks moved out of memory and into a stream that could be reviewed when there was time.",
  },
  {
    dimension: "Social",
    change: "5 → 7",
    copy: "Small follow-ups became visible without turning relationships into a performance target.",
  },
] as const;

function entry(
  dimension: WellnessWheelEntry["dimension"],
  current_rating: number | null,
  desired_rating: number | null,
  focus_state: WellnessWheelEntry["focus_state"],
): WellnessWheelEntry {
  return { dimension, current_rating, desired_rating, focus_state };
}
