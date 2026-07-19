import { parseTicketText, type TicketDraft } from "@/lib/agent/parseTicket";
import {
  DEMO_AGENT_REGISTRY,
  DEMO_STREAMS,
  type DemoAgentDraftInput,
  type DemoAgentProposal,
} from "@/lib/demo-agents/registry";
import type { LifeDomain } from "@/lib/db/streams";

const DEMO_STREAM_DOMAINS: Record<DemoAgentDraftInput["streamId"], LifeDomain | null> = {
  home: null,
  family: "family",
  money: "money",
  studio: "career",
  systems: "career",
};

export async function draftLiveDemoAgentProposal(input: DemoAgentDraftInput): Promise<DemoAgentProposal> {
  const stream = DEMO_STREAMS.find((candidate) => candidate.id === input.streamId);
  if (!stream) throw new Error("Choose one of the available synthetic streams.");

  const draft = await parseTicketText(input.prompt, [{
    id: stream.id,
    name: stream.name,
    life_domain: DEMO_STREAM_DOMAINS[stream.id],
    archived: false,
  }]);

  return liveTicketDraftToProposal(input, draft);
}

export function liveTicketDraftToProposal(input: DemoAgentDraftInput, draft: TicketDraft): DemoAgentProposal {
  const profile = DEMO_AGENT_REGISTRY[input.agentId];
  return {
    version: 1,
    agentId: input.agentId,
    streamId: input.streamId,
    status: "proposed",
    title: draft.title.slice(0, 120),
    summary: draft.notes || `${profile.name} prepared one bounded next step for review.`,
    rationale: `GPT-5.6 structured the synthetic request for ${profile.name}. No tool, credential, memory or external integration was accessed.`,
    priority: draft.priority,
    approval: {
      required: true,
      state: "awaiting_human",
      message: "Draft only. Review, edit or dismiss it before it enters this synthetic queue.",
    },
    simulatedTools: profile.simulatedTools.map((name) => ({ name, state: "not_called" })),
  };
}
