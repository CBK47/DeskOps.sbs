"use server";
import { redirect } from "next/navigation";
import { createTicket, deleteTicket, updateTicket, getTicket } from "@/lib/db/tickets";
import { nextOccurrence } from "@/lib/recurrence";
import type { TicketStatus, TicketPriority, RecurrenceRule } from "@/lib/db/tickets";

const PRIORITIES: TicketPriority[]  = ["low","medium","high","urgent"];
const RULES:      RecurrenceRule[]  = ["none","daily","weekly","monthly","yearly"];

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
  return v ? v : null;
}

async function insertTicketFromFormData(formData: FormData) {
  const title     = String(formData.get("title") ?? "").trim();
  const stream_id = String(formData.get("stream_id") ?? "");
  if (!title)     throw new Error("Title is required");
  if (!stream_id) throw new Error("Stream is required");

  await createTicket({
    title,
    stream_id,
    notes:      String(formData.get("notes") ?? "") || null,
    priority:   readPriority(formData),
    recurrence: readRecurrence(formData),
    due_date:   readDate(formData),
  });
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
    return { ok: false, error: e instanceof Error ? e.message : "Failed to add ticket" };
  }
}

export async function updateTicketAction(id: string, formData: FormData) {
  const title     = String(formData.get("title") ?? "").trim();
  const stream_id = String(formData.get("stream_id") ?? "");
  if (!title)     throw new Error("Title is required");
  if (!stream_id) throw new Error("Stream is required");

  await updateTicket(id, {
    title,
    stream_id,
    notes:      String(formData.get("notes") ?? "") || null,
    priority:   readPriority(formData),
    recurrence: readRecurrence(formData),
    due_date:   readDate(formData),
  });
  // Redirecting to the same path produces a fresh request and response.
  redirect(`/tickets/${id}`);
}

export async function closeTicketAction(id: string) {
  const t = await getTicket(id);
  if (!t) throw new Error("Ticket not found");
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
  redirect(`/tickets/${id}`);
}

export async function deleteTicketAction(id: string) {
  await deleteTicket(id);
  redirect("/");
}
