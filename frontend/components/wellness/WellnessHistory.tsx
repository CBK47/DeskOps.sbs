import type { WellnessAssessmentWithEntries } from "@/lib/db/wellness";
import { WELLNESS_DIMENSIONS } from "@/lib/wellness";

export function WellnessHistory({ assessments }: { assessments: WellnessAssessmentWithEntries[] }) {
  if (assessments.length < 2) return null;

  return (
    <section className="surface-panel p-5 sm:p-6" aria-labelledby="wellness-history-title">
      <p className="signal-label">Private history</p>
      <h2 id="wellness-history-title" className="mt-2 text-xl font-semibold">Past snapshots</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Compare what you chose to track. No streaks, rankings or judgement.</p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[58rem] text-left text-sm">
          <caption className="sr-only">Current ratings recorded in each completed Wellness Wheel snapshot. A dash means no rating was recorded.</caption>
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th className="pb-3 font-medium">Date</th>
              {WELLNESS_DIMENSIONS.map((dimension) => (
                <th key={dimension.id} className="px-2 pb-3 text-center font-medium">{dimension.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {assessments.map((assessment) => {
              const byDimension = new Map(assessment.entries.map((entry) => [entry.dimension, entry]));
              return (
                <tr key={assessment.id}>
                  <td className="py-4 pr-5 font-mono text-xs tabular-nums">{formatAssessmentDate(assessment.created_at)}</td>
                  {WELLNESS_DIMENSIONS.map((dimension) => {
                    const entry = byDimension.get(dimension.id);
                    const active = entry?.focus_state === "active_focus";
                    const value = entry?.focus_state === "not_tracking" || entry?.current_rating === null || entry === undefined ? "—" : String(entry.current_rating);
                    return (
                      <td key={dimension.id} className="px-2 py-4 text-center font-mono text-xs tabular-nums">
                        <span className={active ? "font-semibold text-primary" : "text-muted-foreground"} aria-label={`${dimension.label}: ${value === "—" ? "not rated" : `${value} out of 10`}${active ? ", active focus" : ""}`}>
                          {value}{active ? " ·" : ""}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatAssessmentDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
