// Base UI's <Select.Value> renders the raw `value` unless an `items` map is
// supplied — these give the trigger a real label instead of "low"/"none" etc.
// Plain constants only (no server-only imports) so client components can use them too.
export const PRIORITY_ITEMS = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const RECURRENCE_ITEMS = [
  { value: "none",    label: "None" },
  { value: "daily",   label: "Daily" },
  { value: "weekly",  label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly",  label: "Yearly" },
] as const;

export const STATUS_ITEMS = [
  { value: "open",        label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done",        label: "Done" },
  { value: "cancelled",   label: "Cancelled" },
] as const;

// Raw enum values never reach the UI (docs/DESIGN.md) — look labels up here.
function toLabels(items: ReadonlyArray<{ value: string; label: string }>): Record<string, string> {
  return Object.fromEntries(items.map((i) => [i.value, i.label]));
}
export const PRIORITY_LABELS   = toLabels(PRIORITY_ITEMS);
export const RECURRENCE_LABELS = toLabels(RECURRENCE_ITEMS);
export const STATUS_LABELS     = toLabels(STATUS_ITEMS);
