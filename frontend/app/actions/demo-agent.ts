"use server";

import { cookies } from "next/headers";
import {
  createDemoAgentProposal,
  validateDemoAgentInput,
  type DemoAgentProposal,
} from "@/lib/demo-agents/registry";
import { acquireDemoAgentRequest, withDemoAgentTimeout } from "@/lib/agent/rate-limit";

export type DemoAgentActionResult =
  | { ok: true; proposal: DemoAgentProposal }
  | { ok: false; code: "demo_disabled" | "event_not_started" | "event_ended" | "daily_allowance_used" | "global_budget_used" | "too_busy" | "invalid_request"; error: string };

const DEMO_SESSION_COOKIE = "deskops-demo-session";

/**
 * The public demo never receives a Supabase identity, personal workspace data
 * or live integrations. This cookie only groups requests for an allowance.
 */
export async function draftDemoAgentAction(input: unknown): Promise<DemoAgentActionResult> {
  const validated = validateDemoAgentInput(input);
  if (!validated.ok) return { ok: false, code: "invalid_request", error: validated.error };

  const sessionId = await demoSessionId();
  const lease = await acquireDemoAgentRequest(sessionId);
  if (!lease.ok) return { ok: false, code: lease.code, error: demoAgentGateMessage(lease.code) };

  try {
    const proposal = await withDemoAgentTimeout(Promise.resolve(createDemoAgentProposal(validated.value)), lease.timeoutMs);
    return { ok: true, proposal };
  } catch {
    return { ok: false, code: "too_busy", error: "The demo agent did not finish in time. Try again shortly." };
  } finally {
    await lease.release();
  }
}

async function demoSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  if (existing && /^[a-z0-9-]{20,}$/i.test(existing)) return existing;

  const sessionId = crypto.randomUUID();
  cookieStore.set(DEMO_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6,
  });
  return sessionId;
}

function demoAgentGateMessage(code: Exclude<DemoAgentActionResult, { ok: true }> ["code"]) {
  const messages: Record<Exclude<DemoAgentActionResult, { ok: true }> ["code"], string> = {
    demo_disabled: "The public demo is not active right now.",
    event_not_started: "The demo event has not opened yet.",
    event_ended: "The demo event window has closed.",
    daily_allowance_used: "This demo session has used its allowance for today. Try again tomorrow.",
    global_budget_used: "The shared demo budget is resting for today. Please come back tomorrow.",
    too_busy: "The demo is handling a busy moment. Please try again shortly.",
    invalid_request: "Use a short synthetic scenario and one allowed stream.",
  };
  return messages[code];
}
