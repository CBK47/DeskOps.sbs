import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  listStreams: vi.fn(),
  responsesCreate: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
}));

vi.mock("@/lib/db/streams", () => ({
  listStreams: mocks.listStreams,
}));

vi.mock("@/lib/agent/openai", () => ({
  getOpenAIClient: () => ({
    client: { responses: { create: mocks.responsesCreate } },
    model: "gpt-test",
  }),
}));

import { draftTicketAction, polishInvoiceAction } from "@/app/actions/agent";
import { AGENT_REQUEST_LIMIT, resetAgentRateLimitForTests } from "@/lib/agent/rate-limit";

const ticketCandidate = {
  title: "Renew the van insurance",
  notes: "Review the renewal quote.",
  priority: "medium",
  recurrence: "none",
  due_date: null,
  suggested_stream_name: "Home",
  suggested_life_domain: "money",
};

describe("AI action boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAgentRateLimitForTests();
    vi.stubEnv("ENABLE_INVOICES", "true");
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mocks.listStreams.mockResolvedValue([
      { id: "stream-home", name: "Home", life_domain: "money", archived: false },
    ]);
    mocks.responsesCreate.mockResolvedValue({ output_text: JSON.stringify(ticketCandidate) });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses anonymous ticket drafts and invoice polish calls", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(draftTicketAction("renew the van insurance")).resolves.toMatchObject({
      ok: false,
      code: "unauthenticated",
    });
    await expect(polishInvoiceAction({ line_items: [], total_pence: 0, summary: "" })).resolves.toMatchObject({
      ok: false,
      code: "unauthenticated",
    });
    expect(mocks.responsesCreate).not.toHaveBeenCalled();
  });

  it("returns a typed limit result after the shared per-user allowance is used", async () => {
    for (let request = 0; request < AGENT_REQUEST_LIMIT; request += 1) {
      await expect(draftTicketAction("renew the van insurance")).resolves.toMatchObject({ ok: true });
    }

    await expect(polishInvoiceAction({ line_items: [], total_pence: 0, summary: "" })).resolves.toEqual({
      ok: false,
      code: "rate_limited",
      error: "Busy moment — try again shortly.",
    });
    expect(mocks.responsesCreate).toHaveBeenCalledTimes(AGENT_REQUEST_LIMIT);
  });

  it("refuses invoice polish when the server feature flag is off", async () => {
    vi.stubEnv("ENABLE_INVOICES", "false");

    await expect(polishInvoiceAction({ line_items: [], total_pence: 0, summary: "" })).resolves.toEqual({
      ok: false,
      code: "feature_disabled",
      error: "Invoice drafting is unavailable in this workspace.",
    });
    expect(mocks.responsesCreate).not.toHaveBeenCalled();
  });

  it("keeps a normal authenticated draft working through the mocked Responses API", async () => {
    await expect(draftTicketAction("renew the van insurance")).resolves.toMatchObject({
      ok: true,
      draft: {
        title: "Renew the van insurance",
        stream_id: "stream-home",
      },
    });
    expect(mocks.responsesCreate).toHaveBeenCalledOnce();
  });

  it("returns the calm retry result for a transient model failure", async () => {
    mocks.responsesCreate.mockRejectedValueOnce(new Error("Responses API timeout: internal detail"));

    await expect(draftTicketAction("renew the van insurance")).resolves.toEqual({
      ok: false,
      code: "temporarily_unavailable",
      error: "Busy moment — try again shortly.",
    });
  });
});
