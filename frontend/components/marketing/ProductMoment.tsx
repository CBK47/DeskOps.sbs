import { Check, CornerDownRight } from "lucide-react";

const wheelValues = [7, 5, 6, 8, 4, 7, 6, 5];

export function ProductMoment() {
  return (
    <div className="product-moment" aria-label="Example showing natural-language capture becoming a reviewed task and a Wellness Wheel update">
      <div className="product-moment-topline">
        <span className="flex items-center gap-2"><span className="status-light" aria-hidden /> DeskOps review</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">PRIVATE WORKSPACE</span>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b border-border/70 p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <p className="signal-label">Natural-language capture</p>
          <div className="moment-input mt-4">
            Renew the home insurance next Friday, high priority
            <span className="moment-cursor" aria-hidden />
          </div>
          <div className="moment-connector" aria-hidden><CornerDownRight className="h-4 w-4" /></div>
          <div className="moment-draft">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold">Renew home insurance</p>
              <span className="review-flag">DRAFT</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
              <div><dt className="text-muted-foreground">Area</dt><dd className="mt-1 font-medium">Everyday money</dd></div>
              <div><dt className="text-muted-foreground">Priority</dt><dd className="mt-1 font-medium">High</dd></div>
              <div><dt className="text-muted-foreground">Due</dt><dd className="mt-1 font-mono text-xs">24 JUL 2026</dd></div>
              <div><dt className="text-muted-foreground">Decision</dt><dd className="mt-1 flex items-center gap-1.5 font-medium"><Check className="h-3.5 w-3.5 text-primary" aria-hidden /> Waiting for you</dd></div>
            </dl>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border/70 pt-4">
              <span className="text-xs text-muted-foreground">AI proposed these fields</span>
              <span className="moment-approve">Review and add</span>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <p className="signal-label">Wellness Wheel</p>
          <div className="mini-wheel mt-5" aria-hidden>
            {wheelValues.map((value, index) => (
              <span key={index} className="mini-wheel-ray" style={{ "--ray": index, "--score": value } as React.CSSProperties} />
            ))}
            <span className="mini-wheel-core">YOU</span>
          </div>
          <p className="mt-6 text-sm leading-6 text-muted-foreground">The task joins one queue. Your reflective ratings stay separate, private and optional.</p>
          <div className="mt-5 border-t border-border/70 pt-4">
            <div className="flex items-center justify-between text-sm"><span>Financial</span><span className="font-mono text-xs">6 / 10</span></div>
            <div className="mt-3 flex items-center justify-between text-sm"><span>Chosen focus</span><span className="font-mono text-xs text-primary">OCCUPATIONAL</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
