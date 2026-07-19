import { describe, expect, it } from "vitest";
import {
  DEMO_AGENT_IDS,
  DEMO_AGENT_REGISTRY,
  createDemoAgentProposal,
  getAllowedDemoStreams,
  validateDemoAgentInput,
  validateDemoAgentProposal,
} from "@/lib/demo-agents/registry";

describe("demo agent registry", () => {
  it("defines six simulated profiles with only permitted synthetic streams", () => {
    expect(DEMO_AGENT_IDS).toHaveLength(6);
    for (const id of DEMO_AGENT_IDS) {
      const profile = DEMO_AGENT_REGISTRY[id];
      expect(profile.provider).toBe("simulated");
      expect(profile.approval).toBe("required");
      expect(getAllowedDemoStreams(id)).not.toHaveLength(0);
    }
  });

  it("rejects an agent and stream combination outside the registry permission", () => {
    expect(validateDemoAgentInput({
      agentId: "skippy",
      streamId: "systems",
      prompt: "Set up the synthetic household schedule.",
    })).toEqual({ ok: false, error: "That agent is not permitted to use this synthetic stream." });
  });

  it("rejects personal identifiers and credentials from the public demo", () => {
    expect(validateDemoAgentInput({ agentId: "echo", streamId: "home", prompt: "Email alex@example.com about the keys." }).ok).toBe(false);
    expect(validateDemoAgentInput({ agentId: "codex", streamId: "systems", prompt: "api_key=sk_test_secret_value_123456" }).ok).toBe(false);
  });

  it("returns a validated, approval-required proposal without calling an external tool", () => {
    const input = validateDemoAgentInput({
      agentId: "spark",
      streamId: "systems",
      prompt: "Check the synthetic backup monitor and write one reversible recovery step.",
    });
    if (!input.ok) throw new Error(input.error);

    const proposal = createDemoAgentProposal(input.value);
    expect(validateDemoAgentProposal(proposal)).toBe(true);
    expect(proposal.approval).toMatchObject({ required: true, state: "awaiting_human" });
    expect(proposal.simulatedTools).toEqual(expect.arrayContaining([
      expect.objectContaining({ state: "not_called" }),
    ]));
    expect(proposal.rationale).toContain("No external system, memory or credential was accessed.");
  });
});
