"use server";

import { listStreams } from "@/lib/db/streams";
import { parseTicketText, type TicketDraft } from "@/lib/agent/parseTicket";
import { polishInvoiceCopy, type InvoiceDraft, type InvoicePolishResult } from "@/lib/agent/draftInvoice";
import { AGENT_BUSY_MESSAGE, ticketDraftErrorMessage } from "@/lib/agent/draft-error";
import { takeAgentRequestSlot } from "@/lib/agent/rate-limit";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { isInvoiceActionEnabled } from "@/lib/features";
import { getLatestWellnessAssessment } from "@/lib/db/wellness";
import {
  draftRebalanceTicket,
  selectRebalanceDimension,
  type RebalanceTicketDraft,
} from "@/lib/rebalance";

export type AgentActionErrorCode = "unauthenticated" | "rate_limited" | "temporarily_unavailable" | "invalid_request" | "not_configured" | "feature_disabled";
export type AgentActionFailure = { ok: false; code: AgentActionErrorCode; error: string };

export type TicketDraftResult = { ok: true; draft: TicketDraft } | AgentActionFailure;
export type RebalanceDraftActionResult = {
  ok: true;
  dimension: string;
  draft: RebalanceTicketDraft;
} | AgentActionFailure;

export async function draftTicketAction(text: string): Promise<TicketDraftResult> {
  const userId = await authenticatedUserId();
  if (!userId) return unauthenticatedFailure();
  if (!takeAgentRequestSlot(userId)) return busyFailure("rate_limited");

  try {
    const draft = await parseTicketText(text, await listStreams());
    return { ok: true, draft };
  } catch (error) {
    const message = ticketDraftErrorMessage(error);
    if (message === AGENT_BUSY_MESSAGE) return busyFailure("temporarily_unavailable");
    return {
      ok: false,
      code: message.startsWith("AI drafting is not configured") ? "not_configured" : "invalid_request",
      error: message,
    };
  }
}

export type InvoicePolishActionResult = { ok: true; polish: InvoicePolishResult } | AgentActionFailure;

export async function polishInvoiceAction(draft: InvoiceDraft): Promise<InvoicePolishActionResult> {
  const userId = await authenticatedUserId();
  if (!userId) return unauthenticatedFailure();
  if (!isInvoiceActionEnabled()) {
    return { ok: false, code: "feature_disabled", error: "Invoice drafting is unavailable in this workspace." };
  }
  if (!takeAgentRequestSlot(userId)) return busyFailure("rate_limited");

  try {
    return { ok: true, polish: await polishInvoiceCopy(draft) };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("AI drafting is not configured")) {
      return { ok: false, code: "not_configured", error: "AI polish is not configured for this deployment yet." };
    }
    return busyFailure("temporarily_unavailable");
  }
}

export async function draftRebalanceAction(assessmentId: string): Promise<RebalanceDraftActionResult> {
  const userId = await authenticatedUserId();
  if (!userId) return unauthenticatedFailure();

  const [assessment, streams] = await Promise.all([
    getLatestWellnessAssessment(),
    listStreams(),
  ]);
  if (!assessment || assessment.id !== assessmentId) {
    return { ok: false, code: "invalid_request", error: "Your Wellness snapshot changed. Refresh to see the latest reflection." };
  }

  const selection = selectRebalanceDimension(assessment);
  if (!selection) {
    return { ok: false, code: "invalid_request", error: "There is no tracked gap to rebalance in this snapshot." };
  }
  if (!streams.some((stream) => !stream.archived)) {
    return { ok: false, code: "invalid_request", error: "Create a stream before drafting a rebalance step." };
  }
  if (!takeAgentRequestSlot(userId)) return busyFailure("rate_limited");

  try {
    return {
      ok: true,
      dimension: selection.dimension,
      draft: await draftRebalanceTicket(selection, streams),
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("AI drafting is not configured")) {
      return { ok: false, code: "not_configured", error: "AI drafting is not configured for this deployment yet." };
    }
    return busyFailure("temporarily_unavailable");
  }
}

async function authenticatedUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user?.id ?? null;
  } catch {
    return null;
  }
}

function unauthenticatedFailure(): AgentActionFailure {
  return { ok: false, code: "unauthenticated", error: "Your session has ended. Sign in again to continue." };
}

function busyFailure(code: "rate_limited" | "temporarily_unavailable"): AgentActionFailure {
  return { ok: false, code, error: AGENT_BUSY_MESSAGE };
}
