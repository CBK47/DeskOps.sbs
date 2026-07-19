"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_WELLNESS_ASSESSMENTS } from "@/lib/demo-wellness";
import { selectRebalanceDimension } from "@/lib/rebalance";

type DemoRebalanceState = "review" | "added" | "dismissed";

const STORAGE_KEY = "deskops:demo:rebalance";
const INITIAL_DRAFT = {
  title: "Review one recurring household cost",
  notes: "Open one recent bill, note its renewal date, then decide whether it needs a follow-up.",
};

export function DemoRebalance() {
  const latest = DEMO_WELLNESS_ASSESSMENTS[0];
  const selection = useMemo(() => selectRebalanceDimension({
    id: latest.id,
    entries: latest.entries.map((entry) => ({ ...entry, areas: [], created_at: latest.created_at })),
  }), [latest]);
  const [state, setState] = useState<DemoRebalanceState>("review");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(INITIAL_DRAFT);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored === "added" || stored === "dismissed") setState(stored);
    } catch {
      // Browser storage is optional. The public demo still works in memory.
    }
  }, []);

  if (!selection) return null;

  function choose(next: DemoRebalanceState) {
    setState(next);
    setEditing(false);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Browser storage is optional. The public demo still works in memory.
    }
  }

  function reset() {
    setDraft(INITIAL_DRAFT);
    choose("review");
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Browser storage is optional. The public demo still works in memory.
    }
  }

  if (state === "dismissed") {
    return (
      <section className="surface-panel p-5 sm:p-7" aria-labelledby="demo-rebalance-dismissed-title">
        <p className="signal-label">Rebalance is optional</p>
        <h2 id="demo-rebalance-dismissed-title" className="mt-2 text-2xl font-semibold">Nothing was added.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Not now is a complete decision. The reflection remains useful without becoming more work.</p>
        <Button type="button" variant="secondary" className="mt-5" onClick={reset}><RotateCcw className="h-4 w-4" aria-hidden /> Restore the example</Button>
      </section>
    );
  }

  return (
    <section className="surface-panel border-primary/25 p-5 sm:p-7" aria-labelledby="demo-rebalance-title">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border/70 pb-5">
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="signal-label">Rebalance · simulated draft</p>
            <h2 id="demo-rebalance-title" className="mt-2 text-2xl font-semibold">One small step, not another list.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">DeskOps selects the tracked gap deterministically. AI may help draft the response, but it cannot choose the focus or add the ticket.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-foreground">
          {selection.label} · {selection.current_rating} → {selection.desired_rating}
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="rounded-lg border border-border bg-secondary/35 p-4">
          <p className="text-sm font-semibold">Why Financial?</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">It is the active focus among the joint-largest tracked gaps. The same inputs always produce the same selection.</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-sm">
            <div><dt className="text-muted-foreground">Current</dt><dd className="mt-1 font-mono tabular-nums">{selection.current_rating} / 10</dd></div>
            <div><dt className="text-muted-foreground">Desired</dt><dd className="mt-1 font-mono tabular-nums">{selection.desired_rating} / 10</dd></div>
          </dl>
        </div>

        <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
          {editing ? (
            <div className="grid gap-4">
              <label className="space-y-1.5 text-sm font-medium">Title<Input autoFocus value={draft.title} maxLength={160} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
              <label className="space-y-1.5 text-sm font-medium">Notes<Textarea value={draft.notes} maxLength={1200} rows={3} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-semibold">{draft.title}</p>
                <span className="review-flag">DRAFT ONLY</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{draft.notes}</p>
              <p className="mt-4 border-t border-border/70 pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Money · low pressure · browser only</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={() => choose("added")} disabled={!draft.title.trim()}>{state === "added" ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : null}{state === "added" ? "Added to demo queue" : "Add to demo queue"}</Button>
            {!editing && state !== "added" && <Button type="button" variant="secondary" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" aria-hidden /> Edit</Button>}
            {editing && <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Finish editing</Button>}
            <Button type="button" variant="ghost" onClick={() => choose("dismissed")}>Not now</Button>
          </div>
        </div>
      </div>

      {state === "added" && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5" role="status">
          <p className="inline-flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" aria-hidden /> Added to this browser-only example. No account or real ticket was created.</p>
          <Button type="button" variant="ghost" onClick={reset}><RotateCcw className="h-4 w-4" aria-hidden /> Reset example</Button>
        </div>
      )}
    </section>
  );
}
