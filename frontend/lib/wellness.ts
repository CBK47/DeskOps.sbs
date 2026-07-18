export const WELLNESS_DIMENSIONS = [
  {
    id: "physical",
    label: "Physical",
    description: "Movement, nutrition, health, recovery and sustainable habits",
    areas: ["Diet and nutrition", "Fitness and movement", "Health and recovery"],
  },
  {
    id: "emotional",
    label: "Emotional",
    description: "Feelings, stress, resilience, self-understanding and joy",
    areas: ["Stress and resilience", "Self-understanding", "Rest and joy"],
  },
  {
    id: "intellectual",
    label: "Intellectual",
    description: "Learning, curiosity, creativity and meaningful mental challenge",
    areas: ["Learning and skills", "Creativity and curiosity", "Focus and thinking"],
  },
  {
    id: "social",
    label: "Social",
    description: "Relationships, communication, belonging and community",
    areas: ["Family and close relationships", "Friends and community", "Communication and belonging"],
  },
  {
    id: "spiritual",
    label: "Spiritual",
    description: "Purpose, meaning, values and reflection",
    areas: ["Purpose and values", "Practice and reflection", "Meaning and contribution"],
  },
  {
    id: "occupational",
    label: "Occupational",
    description: "Meaningful work across employment, independent work, clients, volunteering or a company you are creating",
    areas: ["Employment and career", "Independent work", "Client and business work"],
  },
  {
    id: "environmental",
    label: "Environmental",
    description: "Supportive living spaces, organisation, surroundings and nature",
    areas: ["Home and living space", "Digital and physical organisation", "Nature and surroundings"],
  },
  {
    id: "financial",
    label: "Financial",
    description: "Everyday money, planning, security, income and future goals",
    areas: ["Everyday money", "Security and planning", "Income, tax and future goals"],
  },
] as const;

export type WellnessDimension = (typeof WELLNESS_DIMENSIONS)[number]["id"];
export type WellnessFocusState = "active_focus" | "background" | "not_tracking";
export type WellnessReminder = "never" | "monthly" | "quarterly" | "custom";

export const WELLNESS_DIMENSION_LABELS = Object.fromEntries(
  WELLNESS_DIMENSIONS.map((dimension) => [dimension.id, dimension.label]),
) as Record<WellnessDimension, string>;

export const WELLNESS_FOCUS_LABELS: Record<WellnessFocusState, string> = {
  active_focus: "Active focus",
  background: "Background",
  not_tracking: "Not tracking right now",
};

export function isWellnessDimension(value: unknown): value is WellnessDimension {
  return typeof value === "string" && WELLNESS_DIMENSIONS.some((dimension) => dimension.id === value);
}
