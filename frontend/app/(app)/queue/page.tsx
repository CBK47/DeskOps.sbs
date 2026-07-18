import Link from "next/link";
import { ArrowRight, Inbox, SearchX } from "lucide-react";
import { countAllTickets, listTickets, parseTicketFilters } from "@/lib/db/tickets";
import { listStreams } from "@/lib/db/streams";
import { getLatestWellnessAssessment } from "@/lib/db/wellness";
import { TicketRow } from "@/components/ticket/TicketRow";
import { TicketFilters } from "@/components/ticket/TicketFilters";
import { WellnessWheel } from "@/components/wellness/WellnessWheel";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value != null) params.append(key, value);
  }
  const filters = parseTicketFilters(params);
  const density = params.get("density") === "compact" ? "compact" : "comfortable";
  const [tickets, streams, latestAssessment] = await Promise.all([
    listTickets(filters),
    listStreams(),
    getLatestWellnessAssessment(),
  ]);
  const hasAnyTickets = tickets.length > 0 || (await countAllTickets()) > 0;

  return (
    <div className="space-y-6">
      <header className="queue-heading">
        <div>
          <p className="signal-label">Personal operations</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Your queue</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">One place for the work of real life. Capture quickly, then decide with context.</p>
        </div>
        <div className="queue-count">
          <span className="font-mono text-3xl font-medium tabular-nums">{tickets.length}</span>
          <span className="text-xs text-muted-foreground">shown now</span>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[23rem_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-20">
          {latestAssessment ? (
            <div className="surface-panel p-5">
              <WellnessWheel entries={latestAssessment.entries} compact />
              <Link href="/wellness" className="text-link mt-5 inline-flex items-center gap-2">
                View private history <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="surface-panel p-5">
              <p className="signal-label">Private and optional</p>
              <h2 className="mt-3 text-2xl font-semibold">Begin your Wellness Wheel</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Create a reflective snapshot without turning untracked parts of life into zeroes.</p>
              <Link href="/wellness?first=1" className="primary-cta mt-6 w-full">Start when ready <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          )}
        </aside>

        <section aria-labelledby="queue-list-title" className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="signal-label">Work to review</p>
              <h2 id="queue-list-title" className="mt-1 text-xl font-semibold">Tickets</h2>
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{density}</span>
          </div>
          <TicketFilters streams={streams.filter((stream) => !stream.archived).map((stream) => ({ id: stream.id, name: stream.name }))} />

          {tickets.length === 0 ? (
            hasAnyTickets ? (
              <EmptyState
                icon={<SearchX className="h-7 w-7" aria-hidden />}
                title="Nothing matches these filters"
                hint="Adjust the controls above or clear the current view."
              />
            ) : (
              <EmptyState
                icon={<Inbox className="h-7 w-7" aria-hidden />}
                title="Your desk is clear"
                hint="Create a stream, then use capture to add the first thing you are carrying."
                action={<Link href="/streams" className="text-link mt-4 inline-flex">Set up a stream</Link>}
              />
            )
          ) : (
            <ul className="ticket-list">
              {tickets.map((ticket, index) => (
                <li
                  key={ticket.id}
                  className="animate-fade-up motion-reduce:animate-none"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <TicketRow ticket={ticket} density={density} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, hint, action }: { icon: React.ReactNode; title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{hint}</p>
      {action}
    </div>
  );
}
