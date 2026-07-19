import { Check, CornerDownRight } from "lucide-react";

export function HeroCaptureMoment() {
  return (
    <div className="product-moment" aria-label="DeskOps turning a natural-language capture into a reviewable draft">
      <div className="product-moment-topline">
        <span className="flex items-center gap-2"><span className="status-light" aria-hidden /> DeskOps review</span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">DRAFT ONLY</span>
      </div>
      <div className="p-5 sm:p-6">
        <p className="signal-label">Natural-language capture</p>
        <div className="moment-input mt-4">
          Renew the home insurance next Friday, high priority
          <span className="moment-cursor" aria-hidden />
        </div>
        <div className="moment-connector" aria-hidden><CornerDownRight className="h-4 w-4" /></div>
        <div className="moment-draft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Renew home insurance</p>
              <p className="mt-1 text-xs text-muted-foreground">Money · High · 24 Jul</p>
            </div>
            <span className="review-flag">REVIEW</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/70 pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" aria-hidden /> Waiting for you</span>
            <span className="moment-approve">Review and add</span>
          </div>
        </div>
      </div>
    </div>
  );
}
