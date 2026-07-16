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

// Deliberately skips revalidatePath — this is called directly (not via
// <form action>) from QuickAddDialog, and on Cloudflare's edge runtime the
// RSC-payload-in-response that revalidatePath triggers doesn't reliably
// make it back through next-on-pages' action-dispatch shim for direct
// invocations: the insert always succeeds, but the client promise
// sometimes never resolves as expected. The caller does router.refresh()
// instead, which is a plain client-side re-fetch with no such dependency.
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
  // revalidatePath's RSC-payload-in-response doesn't reliably survive
  // next-on-pages' edge runtime (see createTicketSafe above) — redirecting
  // to the same path forces a genuine fresh request/response instead.
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
