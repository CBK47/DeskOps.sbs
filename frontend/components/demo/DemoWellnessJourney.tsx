import { ArrowRight, TrendingUp } from "lucide-react";
import { WellnessHistory } from "@/components/wellness/WellnessHistory";
import { WellnessWheel } from "@/components/wellness/WellnessWheel";
import { DEMO_WELLNESS_ASSESSMENTS, DEMO_WELLNESS_TRENDS } from "@/lib/demo-wellness";

export function DemoWellnessJourney() {
  const latest = DEMO_WELLNESS_ASSESSMENTS[0];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-border/70 pb-6">
        <div>
          <p className="signal-label">Synthetic private history</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold sm:text-4xl">Reflection becomes more useful when you can see the change.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            This sample shows three Wellness snapshots in a browser-only demo. They are observations, not targets, and they never become a scorecard.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-medium text-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden /> 3 snapshots
        </span>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="surface-panel p-5 sm:p-7">
          <WellnessWheel entries={latest.entries} />
        </section>

        <aside className="surface-panel overflow-hidden" aria-labelledby="wellness-change-title">
          <div className="border-b border-border/70 px-5 py-4">
            <p className="signal-label">What changed</p>
            <h2 id="wellness-change-title" className="mt-1 text-xl font-semibold">A focus can be temporary and still matter.</h2>
          </div>
          <ul className="divide-y divide-border/70">
            {DEMO_WELLNESS_TRENDS.map((trend) => (
              <li key={trend.dimension} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold">{trend.dimension}</p>
                  <span className="font-mono text-xs font-semibold tabular-nums text-primary">{trend.change}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{trend.copy}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/70 px-5 py-4 text-sm leading-6 text-muted-foreground">
            A rating is a prompt for reflection, never a measure of worth.
          </div>
        </aside>
      </div>

      <WellnessHistory assessments={DEMO_WELLNESS_ASSESSMENTS} />

      <section className="surface-panel p-5 sm:p-7" aria-labelledby="wellness-queue-link-title">
        <p className="signal-label">The DeskOps connection</p>
        <h2 id="wellness-queue-link-title" className="mt-2 text-2xl font-semibold">Reflection can inform the queue without taking it over.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Someone might decide that Financial needs attention, then capture one practical action in the Money stream. The rating stays private. The person chooses whether it influences the queue at all.
        </p>
        <a href="/demo" className="text-link mt-4">Return to the first-session walkthrough <ArrowRight className="h-4 w-4" aria-hidden /></a>
      </section>
    </div>
  );
}
