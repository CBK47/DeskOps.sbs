import { Inbox, SearchX } from "lucide-react";
import { countAllTickets, listTickets, parseTicketFilters } from "@/lib/db/tickets";
import { listStreams } from "@/lib/db/streams";
import { TicketRow } from "@/components/ticket/TicketRow";
import { TicketFilters } from "@/components/ticket/TicketFilters";

export const runtime = "edge";

export default async function QueuePage({ searchParams }: { searchParams: Record<string, string | string[]> }) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (Array.isArray(v)) v.forEach(x => params.append(k, x));
    else if (v != null)   params.append(k, v);
  }
  const filters = parseTicketFilters(params);
  const [tickets, streams] = await Promise.all([
    listTickets(filters),
    listStreams(),
  ]);
  // Only needed to distinguish "no tickets at all" from "none match filters".
  const totalTickets = tickets.length === 0 ? await countAllTickets() : tickets.length;

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Queue</h1>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{tickets.length} shown</span>
      </header>

      <TicketFilters streams={streams.filter(s => !s.archived).map(s => ({ id: s.id, name: s.name }))} />

      {tickets.length === 0 ? (
        totalTickets === 0 ? (
          <EmptyState
            icon={<Inbox className="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden />}
            title="No tickets yet"
            hint="Tap + to capture your first one."
          />
        ) : (
          <EmptyState
            icon={<SearchX className="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden />}
            title="Nothing matches these filters"
            hint="Adjust the chips above, or clear filters."
          />
        )
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border bg-card/40">
          {tickets.map((t, i) => (
            <li
              key={t.id}
              className="animate-fade-up [animation-duration:300ms] [animation-fill-mode:both] motion-reduce:animate-none"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <TicketRow ticket={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed px-8 py-14 text-center">
      {icon}
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
