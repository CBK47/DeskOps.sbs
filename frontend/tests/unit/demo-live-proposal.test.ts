import { describe, expect, it } from "vitest";
import { liveTicketDraftToProposal } from "@/lib/demo-agents/live-proposal";

describe("live demo proposal mapping", () => {
  it("keeps a GPT ticket draft inside the selected synthetic stream and human approval gate", () => {
    const proposal = liveTicketDraftToProposal(
      { agentId: "echo", streamId: "home", prompt: "Plan one synthetic Saturday reset." },
      {
        title: "Reset one kitchen surface",
        notes: "Clear and wipe one surface, then stop.",
        priority: "low",
        recurrence: "none",
        due_date: null,
        stream_id: "home",
        suggested_stream_name: "Home",
      },
    );

    expect(proposal).toMatchObject({
      agentId: "echo",
      streamId: "home",
      title: "Reset one kitchen surface",
      priority: "low",
      approval: { required: true, state: "awaiting_human" },
    });
    expect(proposal.rationale).toContain("No tool, credential, memory or external integration was accessed");
    expect(proposal.simulatedTools.every((tool) => tool.state === "not_called")).toBe(true);
  });
});
