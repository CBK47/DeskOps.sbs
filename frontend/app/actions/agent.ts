"use server";

import { listStreams } from "@/lib/db/streams";
import { parseTicketText, type TicketDraft } from "@/lib/agent/parseTicket";
import { polishInvoiceCopy, type InvoiceDraft, type InvoicePolishResult } from "@/lib/agent/draftInvoice";
import { ticketDraftErrorMessage } from "@/lib/agent/draft-error";

export type TicketDraftResult = { ok: true; draft: TicketDraft } | { ok: false; error: string };

export async function draftTicketAction(text: string): Promise<TicketDraftResult> {
  try {
    const draft = await parseTicketText(text, await listStreams());
    return { ok: true, draft };
  } catch (error) {
    return { ok: false, error: ticketDraftErrorMessage(error) };
  }
}

export type InvoicePolishActionResult = { ok: true; polish: InvoicePolishResult } | { ok: false; error: string };

export async function polishInvoiceAction(draft: InvoiceDraft): Promise<InvoicePolishActionResult> {
  try {
    return { ok: true, polish: await polishInvoiceCopy(draft) };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("AI drafting is not configured")) {
      return { ok: false, error: "AI polish is not configured for this deployment yet." };
    }
    return { ok: false, error: "DeskOps could not polish this invoice draft. You can still review it manually." };
  }
}
