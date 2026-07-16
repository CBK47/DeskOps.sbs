import { describe, expect, it } from "vitest";
import { normaliseTicketCandidate } from "@/lib/agent/parseTicket";

const streams = [
  { id: "home", name: "Home", life_domain: null, archived: false },
  { id: "money", name: "Money", life_domain: "money", archived: false },
  { id: "admin", name: "Admin", life_domain: null, archived: false },
] as const;

describe("normaliseTicketCandidate", () => {
  it("resolves a supplied stream name case-insensitively", () => {
    const draft = normaliseTicketCandidate({
      title: "Book the van MOT",
      notes: "",
      priority: "high",
      recurrence: "none",
      due_date: "2026-07-21",
      suggested_stream_name: "HOME",
      suggested_life_domain: null,
    }, streams, new Date("2026-07-16"));

    expect(draft).toMatchObject({ stream_id: "home", priority: "high", due_date: "2026-07-21" });
  });

  it("uses the suggested life domain when no stream name matches", () => {
    const draft = normaliseTicketCandidate({
      title: "Renew insurance",
      notes: "",
      priority: "medium",
      recurrence: "none",
      due_date: null,
      suggested_stream_name: "Insurance",
      suggested_life_domain: "money",
    }, streams);

    expect(draft.stream_id).toBe("money");
  });

  it("clamps invalid values and falls back to Admin", () => {
    const draft = normaliseTicketCandidate({
      title: "  ",
      notes: 123,
      priority: "critical",
      recurrence: "fortnightly",
      due_date: "tomorrow",
      suggested_stream_name: null,
      suggested_life_domain: "unknown",
    }, streams);

    expect(draft).toMatchObject({
      title: "Untitled task",
      notes: "",
      priority: "medium",
      recurrence: "none",
      due_date: null,
      stream_id: "admin",
    });
  });
});
