import type { WellnessAssessmentWithEntries } from "@/lib/db/wellness";
import { selectRebalanceDimension } from "@/lib/rebalance";
import { RebalanceCard } from "@/components/rebalance/RebalanceCard";

type RebalanceStream = { id: string; name: string };

export function RebalanceSuggestion({
  assessment,
  streams,
}: {
  assessment: WellnessAssessmentWithEntries | null;
  streams: RebalanceStream[];
}) {
  if (!assessment || streams.length === 0) return null;
  const selection = selectRebalanceDimension(assessment);
  if (!selection) return null;

  return (
    <RebalanceCard
      assessmentId={assessment.id}
      selection={selection}
      streams={streams}
    />
  );
}
