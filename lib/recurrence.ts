import { addDays, addMonths, addYears, lastDayOfMonth, parseISO, format } from "date-fns";
import type { RecurrenceRule } from "@/lib/db/tickets";

export function nextOccurrence(
  dueDate: string | null,
  rule: RecurrenceRule,
  anchorDay?: number | null,
): string | null {
  if (!dueDate || rule === "none") return null;
  const d = parseISO(dueDate);
  const desiredDay = anchorDay ?? d.getDate();

  switch (rule) {
    case "daily":   return format(addDays(d, 1),  "yyyy-MM-dd");
    case "weekly":  return format(addDays(d, 7),  "yyyy-MM-dd");
    case "monthly": return format(clampToMonthEnd(addMonths(d, 1), desiredDay), "yyyy-MM-dd");
    case "yearly":  return format(clampToMonthEnd(addYears(d, 1),  desiredDay), "yyyy-MM-dd");
  }
}

function clampToMonthEnd(target: Date, desiredDay: number): Date {
  const last = lastDayOfMonth(target).getDate();
  const result = new Date(target);
  result.setDate(Math.min(desiredDay, last));
  return result;
}
