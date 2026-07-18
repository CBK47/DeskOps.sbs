import { describe, expect, it } from "vitest";
import { ticketDraftErrorMessage } from "@/lib/agent/draft-error";

describe("ticketDraftErrorMessage", () => {
  it("keeps safe, actionable drafting errors for the user", () => {
    expect(ticketDraftErrorMessage(new Error("Create a stream before asking DeskOps to draft a ticket.")))
      .toBe("Create a stream before asking DeskOps to draft a ticket.");
    expect(ticketDraftErrorMessage(new Error("Keep the AI draft request to 1,200 characters or fewer.")))
      .toBe("Keep the AI draft request to 1,200 characters or fewer.");
  });

  it("explains missing AI configuration without exposing other failures", () => {
    expect(ticketDraftErrorMessage(new Error("AI drafting is not configured. Add OPENAI_API_KEY and OPENAI_MODEL to the server environment.")))
      .toBe("AI drafting is not configured for this deployment yet.");
    expect(ticketDraftErrorMessage(new Error("Responses API timeout: internal detail")))
      .toBe("Busy moment — try again shortly.");
  });
});
