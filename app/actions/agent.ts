"use server";

import { listStreams } from "@/lib/db/streams";
import { parseTicketText, type TicketDraft } from "@/lib/agent/parseTicket";

export type TicketDraftResult = { ok: true; draft: TicketDraft } | { ok: false; error: string };

export async function draftTicketAction(text: string): Promise<TicketDraftResult> {
  try {
    const draft = await parseTicketText(text, await listStreams());
    return { ok: true, draft };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("AI drafting is not configured")) {
      return { ok: false, error: "AI drafting is not configured for this deployment yet." };
    }
    return { ok: false, error: "DeskOps could not draft a ticket. Please check the details and try again." };
  }
}
