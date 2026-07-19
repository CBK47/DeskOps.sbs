import { Check, Pencil, Sparkles, X } from "lucide-react";

export function RebalanceMoment() {
  return (
    <div className="product-moment" aria-label="DeskOps Rebalance selecting a Wellness gap and proposing one reviewable step">
      <div className="product-moment-topline">
        <span className="flex items-center gap-2"><span className="status-light" aria-hidden /> Rebalance review</span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">DETERMINISTIC PICK</span>
      </div>
      <div className="p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="signal-label">One thing to rebalance</p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-xl font-semibold">Financial</h3>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">7 → 8</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">The largest tracked gap is selected by rules. AI drafts only the small, editable step.</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-primary/25 bg-primary/5 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Review one recurring household cost</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Open one recent bill, note its renewal date, then decide whether it needs a follow-up.</p>
            </div>
            <span className="review-flag">DRAFT</span>
          </div>
          <p className="mt-4 border-t border-border/70 pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Money · low pressure · waiting for you</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Example Rebalance decisions">
          <span className="moment-approve inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" aria-hidden /> Add ticket</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold"><Pencil className="h-3.5 w-3.5" aria-hidden /> Edit</span>
          <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-muted-foreground"><X className="h-3.5 w-3.5" aria-hidden /> Not now</span>
        </div>
      </div>
    </div>
  );
}
