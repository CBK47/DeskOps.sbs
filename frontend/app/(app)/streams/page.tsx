import { listStreams } from "@/lib/db/streams";
import { StreamPill } from "@/components/stream/StreamPill";
import Link from "next/link";
import { Layers3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { archiveStreamAction, createStreamAction, seedDemoWorkspaceAction } from "@/app/actions/streams";
import { PendingButton } from "@/components/ui/pending-button";
import { isInvoiceFeatureEnabled } from "@/lib/features";

// Keys mirror StreamPill's COLOR_CLASSES so a chosen colour always renders.
const STREAM_COLORS = [
  "slate", "sky", "amber", "orange", "stone", "indigo", "emerald",
  "rose", "lime", "pink", "red", "cyan", "violet",
];

export default async function StreamsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;
  const streams = await listStreams();
  const invoicesEnabled = isInvoiceFeatureEnabled();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <p className="signal-label">Structure without bureaucracy</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Streams</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Give recurring areas of work a clear home. Archive anything you no longer need.</p>
        </div>
        {streams.length === 0 && (
          <form action={seedDemoWorkspaceAction}>
            <PendingButton pendingLabel="Setting up…" variant="secondary">Set up demo workspace</PendingButton>
          </form>
        )}
      </header>

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {notice}
        </div>
      )}

      <form action={createStreamAction} className="surface-panel grid items-end gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:p-5">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="name">New stream</Label>
          <Input id="name" name="name" placeholder="e.g. House" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stream-colour">Colour</Label>
        <select
          id="stream-colour"
          name="color"
          defaultValue="slate"
          aria-label="Stream colour"
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {STREAM_COLORS.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        </div>
        <PendingButton pendingLabel="Adding…" size="lg">Add stream</PendingButton>
      </form>

      {streams.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon"><Layers3 className="h-6 w-6" aria-hidden /></span>
          <p className="mt-4 font-semibold">No streams yet</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Add one above, or create a generic demo workspace to see how the queue works.</p>
        </div>
      ) : <ul className="divide-y overflow-hidden rounded-lg border bg-card/40">
        {streams.map(s => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3 transition-colors duration-150 hover:bg-accent/40">
            <div className="flex min-w-0 items-center gap-2">
              <StreamPill name={s.name} color={s.color} />
              {s.archived && <span className="text-xs text-muted-foreground">archived</span>}
            </div>
            <div className="flex items-center gap-1">
              {invoicesEnabled && s.life_domain === "career" && !s.archived && <Link href={`/invoices/draft?stream=${s.id}`} className="rounded-lg px-2 py-1 text-sm text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Draft Occupational invoice</Link>}
              <form action={archiveStreamAction.bind(null, s.id, !s.archived)}>
                <PendingButton pendingLabel={s.archived ? "Restoring…" : "Archiving…"} variant="ghost" size="sm">{s.archived ? "Unarchive" : "Archive"}</PendingButton>
              </form>
            </div>
          </li>
        ))}
      </ul>}
    </div>
  );
}
