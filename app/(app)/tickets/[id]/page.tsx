import { notFound } from "next/navigation";
import { getTicket } from "@/lib/db/tickets";
import { TicketForm } from "@/components/ticket/TicketForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { closeTicketAction, deleteTicketAction, updateTicketAction } from "@/app/actions/tickets";
import { StreamPill } from "@/components/stream/StreamPill";
import { DeleteTicketButton } from "@/components/ticket/DeleteTicketButton";
import { STATUS_LABELS } from "@/lib/ticket-options";

export const runtime = "edge";

// Dark-aware per DESIGN.md.
const STATUS_COLOR: Record<string, string> = {
  open:        "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  done:        "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelled:   "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
};

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getTicket(params.id);
  if (!ticket) notFound();

  const update = updateTicketAction.bind(null, params.id);
  const close  = closeTicketAction.bind(null, params.id);
  const del    = deleteTicketAction.bind(null, params.id);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StreamPill name={ticket.stream.name} color={ticket.stream.color} />
          <Badge variant="outline" className={STATUS_COLOR[ticket.status] ?? ""}>
            {STATUS_LABELS[ticket.status] ?? ticket.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {ticket.status !== "done" && (
            <form action={close}><Button type="submit" variant="secondary">Mark done</Button></form>
          )}
          <DeleteTicketButton action={del} />
        </div>
      </header>

      <TicketForm action={update} ticket={ticket} submitLabel="Save changes" />
    </div>
  );
}
