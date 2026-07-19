"use server";
import { redirect } from "next/navigation";
import { createTicket, deleteTicket, updateTicket, getTicket } from "@/lib/db/tickets";
import { nextOccurrence } from "@/lib/recurrence";
import type { TicketStatus, TicketPriority, RecurrenceRule } from "@/lib/db/tickets";

const PRIORITIES: TicketPriority[]  = ["low","medium","high","urgent"];
const RULES:      RecurrenceRule[]  = ["none","daily","weekly","monthly","yearly"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class TicketInputError extends Error {}

function readPriority(fd: FormData): TicketPriority {
  const v = String(fd.get("priority") ?? "medium");
  return (PRIORITIES.includes(v as TicketPriority) ? v : "medium") as TicketPriority;
}
function readRecurrence(fd: FormData): RecurrenceRule {
  const v = String(fd.get("recurrence") ?? "none");
  return (RULES.includes(v as RecurrenceRule) ? v : "none") as RecurrenceRule;
}
function readDate(fd: FormData): string | null {
  const v = String(fd.get("due_date") ?? "").trim();
  if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new TicketInputError("Enter a valid due date.");
  return v ? v : null;
}

function readTicketFormData(formData: FormData) {
  const title     = String(formData.get("title") ?? "").trim();
  const stream_id = String(formData.get("stream_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!title) throw new TicketInputError("Enter a ticket title.");
  if (title.length > 160) throw new TicketInputError("Keep the ticket title to 160 characters or fewer.");
  if (!UUID_PATTERN.test(stream_id)) throw new TicketInputError("Choose a valid stream.");
  if (notes.length > 1200) throw new TicketInputError("Keep the notes to 1,200 characters or fewer.");

  return {
    title,
    stream_id,
    notes:      notes || null,
    priority:   readPriority(formData),
    recurrence: readRecurrence(formData),
    due_date:   readDate(formData),
  };
}

async function insertTicketFromFormData(formData: FormData) {
  await createTicket(readTicketFormData(formData));
}

export type TicketActionResult = { ok: true } | { ok: false; error: string };

// This action is called directly (not through <form action>) from
// QuickAddDialog. The caller refreshes the router after a successful result,
// keeping the server response small and making the update explicit.
export async function createTicketSafe(
  _prev: TicketActionResult | null,
  formData: FormData,
): Promise<TicketActionResult> {
  try {
    await insertTicketFromFormData(formData);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: friendlyTicketError(e, "DeskOps could not add that ticket. Please try again.") };
  }
}

export async function updateTicketAction(id: string, formData: FormData) {
  let errorMessage: string | null = null;
  try {
    await updateTicket(id, readTicketFormData(formData));
  } catch (error) {
    errorMessage = friendlyTicketError(error, "DeskOps could not save those changes. Please try again.");
  }

  if (errorMessage) redirectToTicket(id, "error", errorMessage);
  redirectToTicket(id, "notice", "Ticket updated.");
}

export async function closeTicketAction(id: string) {
  let errorMessage: string | null = null;
  try {
    const t = await getTicket(id);
    if (!t) throw new TicketInputError("That ticket could not be found.");
    await updateTicket(id, { status: "done" as TicketStatus });

    // Spawn next occurrence for recurring tickets.
    const nextDue = nextOccurrence(t.due_date, t.recurrence, t.recurrence_anchor_day);
    if (nextDue) {
      await createTicket({
        title:      t.title,
        stream_id:  t.stream_id,
        notes:      t.notes,
        priority:   t.priority,
        recurrence: t.recurrence,
        due_date:   nextDue,
        recurrence_anchor_day: t.recurrence_anchor_day,
      });
    }
  } catch (error) {
    errorMessage = friendlyTicketError(error, "DeskOps could not mark that ticket done. Please try again.");
  }

  if (errorMessage) redirectToTicket(id, "error", errorMessage);
  redirectToTicket(id, "notice", "Ticket marked done.");
}

export async function deleteTicketAction(id: string) {
  try {
    await deleteTicket(id);
  } catch {
    redirectToTicket(id, "error", "DeskOps could not delete that ticket. Please try again.");
  }
  redirect("/queue?notice=Ticket%20deleted.");
}

function friendlyTicketError(error: unknown, fallback: string) {
  return error instanceof TicketInputError ? error.message : fallback;
}

function redirectToTicket(id: string, kind: "error" | "notice", message: string): never {
  redirect(`/tickets/${encodeURIComponent(id)}?${kind}=${encodeURIComponent(message)}`);
}
