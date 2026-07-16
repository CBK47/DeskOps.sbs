import { listStreams } from "@/lib/db/streams";
import { StreamPill } from "@/components/stream/StreamPill";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { archiveStreamAction, createStreamAction, seedDemoWorkspaceAction } from "@/app/actions/streams";

export const runtime = "edge";

// Keys mirror StreamPill's COLOR_CLASSES so a chosen colour always renders.
const STREAM_COLORS = [
  "slate", "sky", "amber", "orange", "stone", "indigo", "emerald",
  "rose", "lime", "pink", "red", "cyan", "violet",
];

export default async function StreamsPage() {
  const streams = await listStreams();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Streams</h1>
        {streams.length === 0 && (
          <form action={seedDemoWorkspaceAction}>
            <Button type="submit" variant="secondary">Set up demo workspace</Button>
          </form>
        )}
      </header>

      <form action={createStreamAction} className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="name">New stream</Label>
          <Input id="name" name="name" placeholder="e.g. House" required />
        </div>
        <select
          name="color"
          defaultValue="slate"
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm w-32"
        >
          {STREAM_COLORS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button type="submit">Add</Button>
      </form>

      <ul className="divide-y overflow-hidden rounded-lg border bg-card/40">
        {streams.map(s => (
          <li key={s.id} className="flex items-center justify-between gap-3 p-3 transition-colors duration-150 hover:bg-accent/40">
            <div className="flex items-center gap-2">
              <StreamPill name={s.name} color={s.color} />
              {s.archived && <span className="text-xs text-muted-foreground">archived</span>}
            </div>
            <div className="flex items-center gap-1">
              {s.life_domain === "career" && !s.archived && <Link href={`/invoices/draft?stream=${s.id}`} className="rounded-lg px-2 py-1 text-sm text-cbk-blue hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Draft invoice</Link>}
              <form action={archiveStreamAction.bind(null, s.id, !s.archived)}>
                <Button type="submit" variant="ghost" size="sm">{s.archived ? "Unarchive" : "Archive"}</Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
