import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { AssessmentFlow } from "@/components/wellness/AssessmentFlow";
import { CompanionTools } from "@/components/wellness/CompanionTools";
import { WellnessHistory } from "@/components/wellness/WellnessHistory";
import { WellnessWheel } from "@/components/wellness/WellnessWheel";
import { buttonVariants } from "@/components/ui/button";
import { listWellnessAssessments } from "@/lib/db/wellness";
import { cn } from "@/lib/utils";
import type { WellnessDimension } from "@/lib/wellness";

export default async function WellnessPage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string; retake?: string; completed?: string }>;
}) {
  const params = await searchParams;
  const assessments = await listWellnessAssessments();
  const latest = assessments[0] ?? null;
  const showAssessment = !latest || params.retake === "1";

  if (showAssessment) return <AssessmentFlow firstRun={params.first === "1" || !latest} />;

  const focusDimensions = latest.entries
    .filter((entry) => entry.focus_state === "active_focus")
    .map((entry) => entry.dimension as WellnessDimension);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="signal-label">Your private reflection</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Wellness Wheel</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Last updated {formatAssessmentDate(latest.created_at)}. Ratings are observations, and your chosen focus remains yours to change.
          </p>
        </div>
        <Link href="/wellness?retake=1" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Take a new snapshot
        </Link>
      </header>

      {params.completed === "1" && (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm" role="status">
          Your private snapshot has been saved. You can change your focus by taking another one at any time.
        </p>
      )}

      <div className="surface-panel p-5 sm:p-7">
        <WellnessWheel entries={latest.entries} />
      </div>
      <CompanionTools focusDimensions={focusDimensions} />
      <WellnessHistory assessments={assessments} />
    </div>
  );
}

function formatAssessmentDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
