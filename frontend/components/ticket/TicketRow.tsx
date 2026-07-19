import Link from "next/link";
import { StreamPill } from "@/components/stream/StreamPill";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, RECURRENCE_LABELS } from "@/lib/ticket-options";
import type { Ticket } from "@/lib/db/tickets";
import { toLondonIsoDate } from "@/lib/dates";

// Dark-aware per docs/DESIGN.md.
const PRIORITY_COLOR: Record<string, string> = {
  low:    "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  high:   "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};

export function TicketRow({ ticket, density = "comfortable" }: { ticket: Ticket & { stream: { id: string; name: string; color: string } }; density?: "comfortable" | "compact" }) {
  const overdue = ticket.due_date && ticket.due_date < toLondonIsoDate(new Date()) && ticket.status !== "done";
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="group block transition-colors duration-150 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <div className={`grid grid-cols-[1fr_auto] items-center gap-2 ${density === "compact" ? "px-4 py-2.5" : "px-4 py-4"}`}>
        <div className="min-w-0">
          <div className="truncate font-medium transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none">{ticket.title}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <StreamPill name={ticket.stream.name} color={ticket.stream.color} />
            <Badge variant="outline" className={PRIORITY_COLOR[ticket.priority]}>
              {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
            </Badge>
            {ticket.recurrence !== "none" && (
              <Badge variant="outline" className="text-muted-foreground">
                ↻ {RECURRENCE_LABELS[ticket.recurrence] ?? ticket.recurrence}
              </Badge>
            )}
            {ticket.due_date && (
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  overdue ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground"
                }`}
              >
                due {ticket.due_date}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
