import type { TicketPriority } from "@/lib/db/tickets";

export const DEMO_AGENT_IDS = ["echo", "skippy", "codex", "claude", "xiangwei", "spark"] as const;
export type DemoAgentId = typeof DEMO_AGENT_IDS[number];

export const DEMO_STREAMS = [
  { id: "home", name: "Home", colour: "cyan" },
  { id: "family", name: "Family", colour: "violet" },
  { id: "money", name: "Money", colour: "amber" },
  { id: "studio", name: "Studio", colour: "blue" },
  { id: "systems", name: "Systems", colour: "slate" },
] as const;
export type DemoStreamId = typeof DEMO_STREAMS[number]["id"];

export type DemoAgentCapability = "brainstorm" | "draft" | "review" | "route" | "monitor" | "orchestrate";

export type DemoAgentProfile = {
  id: DemoAgentId;
  name: string;
  role: string;
  tone: string;
  provider: "simulated";
  capabilities: readonly DemoAgentCapability[];
  allowedStreamIds: readonly DemoStreamId[];
  approval: "required";
  simulatedTools: readonly string[];
};

export const DEMO_AGENT_REGISTRY: Record<DemoAgentId, DemoAgentProfile> = {
  echo: {
    id: "echo",
    name: "Echo",
    role: "Brainstorming, collaboration and orchestration",
    tone: "Warm, practical and good at turning a loose thought into a shared next move.",
    provider: "simulated",
    capabilities: ["brainstorm", "draft", "orchestrate"],
    allowedStreamIds: ["home", "family", "studio", "systems"],
    approval: "required",
    simulatedTools: ["synthetic project board", "synthetic notes"],
  },
  skippy: {
    id: "skippy",
    name: "Skippy",
    role: "Personal and household assistant",
    tone: "Sassy when useful, kind when it matters, and relentlessly specific about the next practical step.",
    provider: "simulated",
    capabilities: ["brainstorm", "draft", "route"],
    allowedStreamIds: ["home", "family", "money"],
    approval: "required",
    simulatedTools: ["synthetic household checklist"],
  },
  codex: {
    id: "codex",
    name: "Codex",
    role: "Coding and implementation agent",
    tone: "Concrete, test-minded and focused on the smallest reversible change.",
    provider: "simulated",
    capabilities: ["draft", "review", "route"],
    allowedStreamIds: ["studio", "systems"],
    approval: "required",
    simulatedTools: ["simulated repository index", "simulated test runner"],
  },
  claude: {
    id: "claude",
    name: "Claude",
    role: "Architecture, review and documentation agent",
    tone: "Thoughtful, structured and clear about trade-offs before implementation.",
    provider: "simulated",
    capabilities: ["draft", "review", "orchestrate"],
    allowedStreamIds: ["studio", "systems"],
    approval: "required",
    simulatedTools: ["simulated architecture notes", "simulated documentation index"],
  },
  xiangwei: {
    id: "xiangwei",
    name: "Xiangwei",
    role: "Low-cost, China-first routing for non-sensitive work",
    tone: "Lean, bounded and careful to keep sensitive work out of the route.",
    provider: "simulated",
    capabilities: ["draft", "route"],
    allowedStreamIds: ["studio", "systems"],
    approval: "required",
    simulatedTools: ["simulated low-cost routing table"],
  },
  spark: {
    id: "spark",
    name: "Spark",
    role: "Local infrastructure, automation, monitoring and media",
    tone: "Operational, observable and calm under pressure.",
    provider: "simulated",
    capabilities: ["draft", "monitor", "route"],
    allowedStreamIds: ["home", "studio", "systems"],
    approval: "required",
    simulatedTools: ["simulated local status feed", "simulated runbook"],
  },
};

export type DemoAgentDraftInput = {
  agentId: DemoAgentId;
  streamId: DemoStreamId;
  prompt: string;
};

export type DemoAgentProposal = {
  version: 1;
  agentId: DemoAgentId;
  streamId: DemoStreamId;
  status: "proposed";
  title: string;
  summary: string;
  rationale: string;
  priority: TicketPriority;
  approval: {
    required: true;
    state: "awaiting_human";
    message: string;
  };
  simulatedTools: Array<{ name: string; state: "not_called" }>;
};

export function isDemoAgentId(value: unknown): value is DemoAgentId {
  return typeof value === "string" && DEMO_AGENT_IDS.includes(value as DemoAgentId);
}

export function isDemoStreamId(value: unknown): value is DemoStreamId {
  return typeof value === "string" && DEMO_STREAMS.some((stream) => stream.id === value);
}

export function getDemoAgentProfile(agentId: DemoAgentId) {
  return DEMO_AGENT_REGISTRY[agentId];
}

export function getAllowedDemoStreams(agentId: DemoAgentId) {
  const profile = getDemoAgentProfile(agentId);
  return DEMO_STREAMS.filter((stream) => profile.allowedStreamIds.includes(stream.id));
}

export function isDemoAgentAllowedForStream(agentId: DemoAgentId, streamId: DemoStreamId) {
  return getDemoAgentProfile(agentId).allowedStreamIds.includes(streamId);
}

export function validateDemoAgentInput(input: unknown):
  | { ok: true; value: DemoAgentDraftInput }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Choose a demo agent, stream and synthetic prompt." };
  const candidate = input as Partial<DemoAgentDraftInput>;
  if (!isDemoAgentId(candidate.agentId)) return { ok: false, error: "That demo agent is not available." };
  if (!isDemoStreamId(candidate.streamId)) return { ok: false, error: "Choose one of the available synthetic streams." };
  if (!isDemoAgentAllowedForStream(candidate.agentId, candidate.streamId)) {
    return { ok: false, error: "That agent is not permitted to use this synthetic stream." };
  }
  if (typeof candidate.prompt !== "string" || !candidate.prompt.trim()) {
    return { ok: false, error: "Describe a synthetic scenario for the demo agent." };
  }
  if (candidate.prompt.trim().length > 600) return { ok: false, error: "Keep the demo scenario to 600 characters or fewer." };
  if (containsSensitiveDemoInput(candidate.prompt)) {
    return { ok: false, error: "Use synthetic demo text only. Do not paste an email address, API key or credential." };
  }

  return {
    ok: true,
    value: {
      agentId: candidate.agentId,
      streamId: candidate.streamId,
      prompt: candidate.prompt.trim(),
    },
  };
}

export function createDemoAgentProposal(input: DemoAgentDraftInput): DemoAgentProposal {
  const profile = getDemoAgentProfile(input.agentId);
  const title = conciseTitle(input.prompt);
  const priority = /urgent|today|blocked|broken|overdue/i.test(input.prompt) ? "high" : "medium";

  const proposal: DemoAgentProposal = {
    version: 1,
    agentId: profile.id,
    streamId: input.streamId,
    status: "proposed",
    title,
    summary: proposalSummary(profile.id, title),
    rationale: proposalRationale(profile.id, input.prompt),
    priority,
    approval: {
      required: true,
      state: "awaiting_human",
      message: "Draft only. Review, edit or dismiss it before it enters this synthetic queue.",
    },
    simulatedTools: profile.simulatedTools.map((name) => ({ name, state: "not_called" })),
  };

  return validateDemoAgentProposal(proposal) ? proposal : fallbackProposal(input);
}

export function validateDemoAgentProposal(value: unknown): value is DemoAgentProposal {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoAgentProposal>;
  return candidate.version === 1
    && isDemoAgentId(candidate.agentId)
    && isDemoStreamId(candidate.streamId)
    && candidate.status === "proposed"
    && typeof candidate.title === "string"
    && candidate.title.length > 0
    && candidate.title.length <= 120
    && typeof candidate.summary === "string"
    && candidate.summary.length > 0
    && typeof candidate.rationale === "string"
    && ["low", "medium", "high", "urgent"].includes(candidate.priority as string)
    && candidate.approval?.required === true
    && candidate.approval?.state === "awaiting_human"
    && Array.isArray(candidate.simulatedTools)
    && candidate.simulatedTools.every((tool) => typeof tool?.name === "string" && tool.state === "not_called")
    && isDemoAgentAllowedForStream(candidate.agentId, candidate.streamId);
}

function conciseTitle(prompt: string) {
  const sentence = prompt.split(/[.!?]/)[0]?.trim() || prompt.trim();
  const cleaned = sentence.replace(/^(please |can you |could you |help me )/i, "").trim();
  const title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return title.slice(0, 120) || "Review the synthetic scenario";
}

function proposalSummary(agentId: DemoAgentId, title: string) {
  const summaries: Record<DemoAgentId, string> = {
    echo: `Turn “${title}” into one shared next move, then leave the owner in control.`,
    skippy: `Keep “${title}” small enough to finish before it becomes tomorrow's dramatic subplot.`,
    codex: `Frame “${title}” as the smallest testable change, with a clear review point.`,
    claude: `Separate the decision in “${title}” from its implementation detail before committing effort.`,
    xiangwei: `Route “${title}” through a light, non-sensitive first pass and retain a human checkpoint.`,
    spark: `Make “${title}” observable, reversible and easy to verify locally.`,
  };
  return summaries[agentId];
}

function proposalRationale(agentId: DemoAgentId, prompt: string) {
  const context = prompt.replace(/\s+/g, " ").slice(0, 180);
  const openers: Record<DemoAgentId, string> = {
    echo: "Echo identified a collaboration-sized next step from",
    skippy: "Skippy reduced the household-sized tangle in",
    codex: "Codex found a bounded implementation step in",
    claude: "Claude isolated the architectural decision in",
    xiangwei: "Xiangwei kept the non-sensitive routing request narrow in",
    spark: "Spark selected an observable local operation from",
  };
  return `${openers[agentId]} “${context}”. No external system, memory or credential was accessed.`;
}

function fallbackProposal(input: DemoAgentDraftInput): DemoAgentProposal {
  return {
    version: 1,
    agentId: input.agentId,
    streamId: input.streamId,
    status: "proposed",
    title: "Review the synthetic scenario",
    summary: "Create one small, reviewable next step.",
    rationale: "The simulated demo agent kept the scenario within the synthetic workspace.",
    priority: "medium",
    approval: { required: true, state: "awaiting_human", message: "Draft only. Review, edit or dismiss it before it enters this synthetic queue." },
    simulatedTools: getDemoAgentProfile(input.agentId).simulatedTools.map((name) => ({ name, state: "not_called" })),
  };
}

function containsSensitiveDemoInput(value: string) {
  return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value)
    || /\b(?:sk|rk|ghp|xoxb)_[A-Za-z0-9_-]{12,}\b/.test(value)
    || /\b(?:password|secret|api[ _-]?key)\s*[:=]\s*\S+/i.test(value);
}
