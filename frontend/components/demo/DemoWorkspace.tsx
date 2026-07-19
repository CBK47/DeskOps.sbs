"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDashed,
  ClipboardPlus,
  LockKeyhole,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { draftDemoAgentAction, type DemoAgentActionResult } from "@/app/actions/demo-agent";
import {
  DEMO_AGENT_IDS,
  DEMO_AGENT_REGISTRY,
  DEMO_STREAMS,
  type DemoAgentId,
  type DemoAgentProposal,
  type DemoStreamId,
} from "@/lib/demo-agents/registry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type DemoTicket = {
  title: string;
  streamId: DemoStreamId;
  priority: "low" | "medium" | "high" | "urgent";
  source: "you" | "agent";
  agentId?: DemoAgentId;
};

type DemoStep = "streams" | "capture" | "assist";

type DemoConversationMessage = {
  id: string;
  author: "person" | "agent";
  agentId?: DemoAgentId;
  content: string;
};

const DEFAULT_STREAM_IDS: DemoStreamId[] = ["home", "family", "studio"];
const DEFAULT_CAPTURE = "Book the boiler service before autumn.";
const SUGGESTED_AGENT_PROMPTS = [
  "Plan one small Saturday reset for the kitchen, then choose one thing that makes Monday easier.",
  "Help me make this week feel less scattered without adding a long list.",
  "Turn this synthetic tangle into one clear, reversible next step.",
] as const;

const STREAM_TONES: Record<DemoStreamId, string> = {
  home: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  family: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  money: "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  studio: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  systems: "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

const STEPS: Array<{ id: DemoStep; number: string; label: string; detail: string }> = [
  { id: "streams", number: "01", label: "Choose your areas", detail: "Give recurring life admin a home." },
  { id: "capture", number: "02", label: "Capture one thing", detail: "Turn a loose thought into a clear next step." },
  { id: "assist", number: "03", label: "Add help, if useful", detail: "Assign a demo agent to a stream." },
];

export function DemoWorkspace() {
  const [step, setStep] = useState<DemoStep>("streams");
  const [activeStreamIds, setActiveStreamIds] = useState<DemoStreamId[]>(DEFAULT_STREAM_IDS);
  const [captureStreamId, setCaptureStreamId] = useState<DemoStreamId>("home");
  const [captureText, setCaptureText] = useState(DEFAULT_CAPTURE);
  const [agentStreamId, setAgentStreamId] = useState<DemoStreamId>("home");
  const [agentId, setAgentId] = useState<DemoAgentId>("echo");
  const [agentAssignments, setAgentAssignments] = useState<Partial<Record<DemoStreamId, DemoAgentId>>>({});
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState<DemoConversationMessage[]>([]);
  const [proposal, setProposal] = useState<DemoAgentProposal | null>(null);
  const [demoQueue, setDemoQueue] = useState<DemoTicket[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activeStreams = useMemo(
    () => DEMO_STREAMS.filter((stream) => activeStreamIds.includes(stream.id)),
    [activeStreamIds],
  );
  const agentOptions = useMemo(
    () => DEMO_AGENT_IDS.filter((id) => DEMO_AGENT_REGISTRY[id].allowedStreamIds.includes(agentStreamId)),
    [agentStreamId],
  );
  const selectedAgent = DEMO_AGENT_REGISTRY[agentId];
  const assignedAgentId = agentAssignments[agentStreamId];
  const assignedAgent = assignedAgentId ? DEMO_AGENT_REGISTRY[assignedAgentId] : null;
  const hasCapture = demoQueue.some((ticket) => ticket.source === "you");

  function setAgentStream(nextStreamId: DemoStreamId) {
    setAgentStreamId(nextStreamId);
    const nextOptions = DEMO_AGENT_IDS.filter((id) => DEMO_AGENT_REGISTRY[id].allowedStreamIds.includes(nextStreamId));
    if (!nextOptions.includes(agentId)) setAgentId(nextOptions[0] ?? "echo");
    setProposal(null);
    setConversation([]);
    setFeedback(null);
  }

  function selectAgent(nextAgentId: DemoAgentId) {
    setAgentId(nextAgentId);
    setProposal(null);
    setConversation([]);
    setFeedback(null);
  }

  function toggleStream(streamId: DemoStreamId) {
    const isActive = activeStreamIds.includes(streamId);
    if (isActive && activeStreamIds.length === 1) {
      setFeedback("Keep at least one stream. DeskOps needs one place to put the next thing.");
      return;
    }

    const nextStreamIds = isActive
      ? activeStreamIds.filter((id) => id !== streamId)
      : DEMO_STREAMS.filter((stream) => [...activeStreamIds, streamId].includes(stream.id)).map((stream) => stream.id);

    setActiveStreamIds(nextStreamIds);
    const nextDefault = nextStreamIds.includes(captureStreamId) ? captureStreamId : nextStreamIds[0];
    setCaptureStreamId(nextDefault);
    setAgentAssignments((current) => {
      const next = { ...current };
      delete next[streamId];
      return next;
    });
    if (!nextStreamIds.includes(agentStreamId)) setAgentStream(nextDefault);
    setFeedback(null);
  }

  function continueToCapture() {
    setStep("capture");
    setFeedback(null);
  }

  function submitCapture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = toTicketTitle(captureText);
    if (!title) {
      setFeedback("Write a small, synthetic next step to add it to the demo queue.");
      return;
    }
    setDemoQueue((tickets) => [{ title, streamId: captureStreamId, priority: "medium", source: "you" }, ...tickets]);
    setCaptureText("");
    setStep("assist");
    setFeedback("Added to your browser-only queue. Now choose whether any stream would benefit from a little help.");
  }

  function assignAgent() {
    const isNewAssignment = assignedAgentId !== agentId;
    setAgentAssignments((current) => ({ ...current, [agentStreamId]: agentId }));
    setProposal(null);
    if (isNewAssignment) {
      setConversation([
        {
          id: `agent-welcome-${agentId}-${agentStreamId}`,
          author: "agent",
          agentId,
          content: agentGreeting(selectedAgent.name, agentStreamId),
        },
      ]);
    }
    setFeedback(`${selectedAgent.name} is now assigned to ${streamName(agentStreamId)} in this demo session. Every draft will still wait for you.`);
  }

  function submitDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    if (assignedAgentId !== agentId) {
      setProposal(null);
      setFeedback(`Assign ${selectedAgent.name} to ${streamName(agentStreamId)} before asking for a draft.`);
      return;
    }

    const message = prompt.trim();
    if (!message) {
      setFeedback(`Write a short synthetic message for ${selectedAgent.name}.`);
      return;
    }

    setProposal(null);
    setConversation((messages) => [
      ...messages,
      { id: `person-${Date.now()}`, author: "person", content: message },
    ]);

    startTransition(async () => {
      const result: DemoAgentActionResult = await draftDemoAgentAction({ agentId, streamId: agentStreamId, prompt: message });
      if (!result.ok) {
        setProposal(null);
        setFeedback(result.error);
        return;
      }
      setProposal(result.proposal);
      setConversation((messages) => [
        ...messages,
        {
          id: `agent-${Date.now()}`,
          author: "agent",
          agentId,
          content: `${result.proposal.summary} I have prepared one draft for you to review below.`,
        },
      ]);
      setPrompt("");
      setFeedback(`${selectedAgent.name} prepared a reviewable draft. Nothing has been added to the queue.`);
    });
  }

  function approveProposal() {
    if (!proposal) return;
    setDemoQueue((tickets) => [
      { title: proposal.title, streamId: proposal.streamId, priority: proposal.priority, source: "agent", agentId: proposal.agentId },
      ...tickets,
    ]);
    setFeedback("Added to this browser's synthetic demo queue. Nothing was saved to a real account.");
    setProposal(null);
  }

  function resetDemo() {
    setStep("streams");
    setActiveStreamIds(DEFAULT_STREAM_IDS);
    setCaptureStreamId("home");
    setCaptureText(DEFAULT_CAPTURE);
    setAgentStreamId("home");
    setAgentId("echo");
    setAgentAssignments({});
    setPrompt("");
    setConversation([]);
    setProposal(null);
    setDemoQueue([]);
    setFeedback("Demo reset. Nothing from this browser session was saved.");
  }

  return (
    <div className="space-y-6">
      <header className="demo-heading">
        <div>
          <p className="signal-label">Public walkthrough · browser-only synthetic data</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold sm:text-4xl">Start with the parts of life already asking for you.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            This is what DeskOps feels like just after a first sign-in. Give a few areas a home, capture one next step, then decide whether an agent belongs anywhere at all.
          </p>
        </div>
        <div className="demo-access-note">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
          <span>No account created</span>
        </div>
      </header>

      <section className="surface-panel overflow-hidden" aria-labelledby="first-session-title">
        <div className="border-b border-border/70 px-5 py-4 sm:px-7">
          <p className="signal-label">First session</p>
          <h2 id="first-session-title" className="mt-1 text-xl font-semibold">A small workspace, not another system to maintain.</h2>
        </div>
        <ol className="grid divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STEPS.map((item) => {
            const isCurrent = item.id === step;
            const isComplete = STEPS.findIndex((stepItem) => stepItem.id === step) > STEPS.findIndex((stepItem) => stepItem.id === item.id);
            return (
              <li key={item.id} className={cn("flex gap-3 px-5 py-4 sm:px-6", isCurrent && "bg-secondary/45")}>
                <span className={cn("font-mono text-xs font-semibold tabular-nums", isCurrent || isComplete ? "text-primary" : "text-muted-foreground")}>{item.number}</span>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="surface-panel overflow-hidden xl:sticky xl:top-20">
          <div className="border-b border-border/70 px-5 py-4">
            <p className="signal-label">Your trial workspace</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Streams keep the recurring areas of life separate without making the queue feel fragmented.</p>
          </div>
          <ul className="divide-y divide-border/70" aria-label="Active demo streams">
            {activeStreams.map((stream) => {
              const assignedId = agentAssignments[stream.id];
              return (
                <li key={stream.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", STREAM_TONES[stream.id])} aria-hidden />
                    {stream.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{assignedId ? DEMO_AGENT_REGISTRY[assignedId].name : "No agent"}</span>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border/70 p-3">
            <Button type="button" variant="ghost" className="min-h-11 w-full justify-start" onClick={resetDemo}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Reset walkthrough
            </Button>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="surface-panel p-5 sm:p-7" aria-labelledby="stream-setup-title">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border/70 pb-6">
              <div>
                <p className="signal-label">01 · Stream setup</p>
                <h2 id="stream-setup-title" className="mt-2 text-2xl font-semibold sm:text-3xl">What deserves its own place?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Start with a few areas you return to. You can add, archive and rename these in a real DeskOps workspace.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-medium text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden /> {activeStreams.length} selected
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2" aria-label="Choose demo streams">
              {DEMO_STREAMS.map((stream) => {
                const selected = activeStreamIds.includes(stream.id);
                return (
                  <button
                    key={stream.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleStream(stream.id)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px",
                      selected ? STREAM_TONES[stream.id] : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", selected ? "bg-current" : "bg-muted-foreground/50")} aria-hidden />
                    {stream.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
              <p className="text-sm text-muted-foreground">Enough structure to orient yourself, not enough to become a project.</p>
              <Button type="button" size="lg" className="min-h-11" onClick={continueToCapture}>
                Capture a first item <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </section>

          {step !== "streams" && (
            <section className="surface-panel p-5 sm:p-7" aria-labelledby="first-capture-title">
              <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border/70 pb-6">
                <div>
                  <p className="signal-label">02 · First capture</p>
                  <h2 id="first-capture-title" className="mt-2 text-2xl font-semibold">Give one loose thought a clear next step.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">DeskOps starts with capture, not a perfect plan. This public walkthrough only keeps the item in this browser.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" aria-hidden /> You decide what enters
                </span>
              </div>

              <form className="mt-6" onSubmit={submitCapture}>
                <label className="grid gap-1 text-xs font-medium text-foreground">
                  Put it in
                  <select
                    value={captureStreamId}
                    onChange={(event) => setCaptureStreamId(event.target.value as DemoStreamId)}
                    className="h-11 max-w-52 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {activeStreams.map((stream) => <option key={stream.id} value={stream.id}>{stream.name}</option>)}
                  </select>
                </label>
                <label htmlFor="demo-capture" className="sr-only">First synthetic task</label>
                <Textarea
                  id="demo-capture"
                  value={captureText}
                  onChange={(event) => setCaptureText(event.target.value)}
                  maxLength={160}
                  className="mt-4 min-h-24 resize-y"
                  aria-describedby="demo-capture-hint"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p id="demo-capture-hint" className="text-xs leading-5 text-muted-foreground">Use a made-up example. The demo does not save personal information.</p>
                  <Button type="submit" size="lg" className="min-h-11">
                    <ClipboardPlus className="h-4 w-4" aria-hidden /> {hasCapture ? "Add another item" : "Add to my queue"}
                  </Button>
                </div>
              </form>
            </section>
          )}

          {step === "assist" && (
            <section className="surface-panel p-5 sm:p-7" aria-labelledby="agent-assignment-title">
              <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border/70 pb-6">
                <div>
                  <p className="signal-label">03 · Optional agent assignment</p>
                  <h2 id="agent-assignment-title" className="mt-2 text-2xl font-semibold">Talk with help only where it earns its place.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Demo Agents are one feature in DeskOps, not the point of it. Assign one to a suitable stream, have a short synthetic conversation, then decide whether any draft belongs in the queue.</p>
                  <Link href="/demo/agents" className="text-link mt-3">See how agent access stays scoped <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                </div>
                <span className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-medium text-foreground">
                  <LockKeyhole className="h-3.5 w-3.5 text-primary" aria-hidden /> Approval always required
                </span>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
                <div className="space-y-4">
                  <label className="grid gap-1 text-xs font-medium text-foreground">
                    Stream
                    <select
                      value={agentStreamId}
                      onChange={(event) => setAgentStream(event.target.value as DemoStreamId)}
                      disabled={pending}
                      className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {activeStreams.map((stream) => <option key={stream.id} value={stream.id}>{stream.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-foreground">
                    Demo Agent
                    <select
                      value={agentId}
                      onChange={(event) => selectAgent(event.target.value as DemoAgentId)}
                      disabled={pending}
                      className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {agentOptions.map((id) => <option key={id} value={id}>{DEMO_AGENT_REGISTRY[id].name} · {DEMO_AGENT_REGISTRY[id].role}</option>)}
                    </select>
                  </label>
                </div>

                <div className="rounded-lg border border-border bg-secondary/35 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary"><Bot className="h-4 w-4" aria-hidden /></span>
                    <div>
                      <p className="font-semibold">{selectedAgent.name}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{selectedAgent.tone}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">Can work with: {DEMO_STREAMS.filter((stream) => selectedAgent.allowedStreamIds.includes(stream.id)).map((stream) => stream.name).join(", ")}.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
                <p className="text-sm text-muted-foreground">
                  {assignedAgent ? `${assignedAgent.name} is assigned to ${streamName(agentStreamId)} in this demo.` : `No agent is assigned to ${streamName(agentStreamId)} yet.`}
                </p>
                <Button type="button" variant={assignedAgentId === agentId ? "secondary" : "default"} className="min-h-11" onClick={assignAgent} disabled={pending}>
                  <MessageCircle className="h-4 w-4" aria-hidden /> {assignedAgentId === agentId ? `Open ${selectedAgent.name}'s conversation` : `Assign ${selectedAgent.name}`}
                </Button>
              </div>

              {assignedAgentId === agentId && (
                <div className="mt-7 overflow-hidden rounded-lg border border-border bg-background/45">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary"><MessageCircle className="h-4 w-4" aria-hidden /></span>
                      <div>
                        <p className="text-sm font-semibold">Talk to {selectedAgent.name}</p>
                        <p className="text-xs text-muted-foreground">Scoped to {streamName(agentStreamId)} · synthetic only</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Draft-only replies</span>
                  </div>

                  <ol className="max-h-80 space-y-3 overflow-y-auto px-4 py-4" aria-label={`${selectedAgent.name} conversation`} role="log" aria-live="polite">
                    {conversation.map((message) => (
                      <li key={message.id} className={cn("flex", message.author === "person" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[34rem] break-words rounded-lg px-3 py-2.5 text-sm leading-6",
                          message.author === "person" ? "bg-primary text-primary-foreground" : "border border-border bg-secondary/60 text-foreground",
                        )}>
                          <p className={cn("mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em]", message.author === "person" ? "text-primary-foreground/70" : "text-primary")}>
                            {message.author === "person" ? "You" : message.agentId ? DEMO_AGENT_REGISTRY[message.agentId].name : selectedAgent.name}
                          </p>
                          <p>{message.content}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <form className="border-t border-border/70 p-4" onSubmit={submitDraft}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label htmlFor="demo-agent-message" className="text-sm font-semibold">Message {selectedAgent.name}</label>
                      <span className="text-xs text-muted-foreground">One small, synthetic scenario at a time</span>
                    </div>
                    <Textarea
                      id="demo-agent-message"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      maxLength={600}
                      disabled={pending}
                      placeholder="Ask for a small next step, an outline, or a way to make a synthetic situation clearer."
                      className="mt-3 min-h-24 resize-y"
                      aria-describedby="demo-agent-message-hint"
                    />
                    <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested synthetic messages">
                      {SUGGESTED_AGENT_PROMPTS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setPrompt(suggestion)}
                          disabled={pending}
                          className="min-h-11 rounded-md border border-border bg-secondary/35 px-2.5 py-1.5 text-left text-xs leading-5 text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p id="demo-agent-message-hint" className="max-w-xl text-xs leading-5 text-muted-foreground">The sandbox rejects email addresses and credentials. No real integrations are connected, and every response stays draft-only.</p>
                      <Button type="submit" size="lg" className="min-h-11" disabled={pending}>
                        {pending ? <CircleDashed className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                        {pending ? "Thinking…" : `Send to ${selectedAgent.name}`}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          )}

          {proposal && (
            <section className="surface-panel p-5 sm:p-7" aria-labelledby="proposal-title">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
                <div>
                  <p className="signal-label">Approval checkpoint</p>
                  <h2 id="proposal-title" className="mt-2 text-xl font-semibold">Nothing enters the queue by itself.</h2>
                </div>
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" aria-hidden /> Draft only</span>
              </div>
              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{proposal.title}</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{proposal.summary}</p>
                </div>
                <span className="rounded-md bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground">{proposal.priority}</span>
              </div>
              <p className="mt-5 border-t border-border/70 pt-5 text-sm leading-6 text-muted-foreground">{proposal.rationale}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" className="min-h-11" onClick={approveProposal}><CheckCircle2 className="h-4 w-4" aria-hidden /> Add to demo queue</Button>
                <Button type="button" variant="ghost" className="min-h-11" onClick={() => { setProposal(null); setFeedback("Draft dismissed. The synthetic queue is unchanged."); }}><X className="h-4 w-4" aria-hidden /> Dismiss draft</Button>
              </div>
            </section>
          )}

          <section className="surface-panel overflow-hidden" aria-labelledby="demo-queue-title">
            <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-7">
              <div>
                <p className="signal-label">This browser only</p>
                <h2 id="demo-queue-title" className="mt-1 text-xl font-semibold">Your first DeskOps queue</h2>
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{demoQueue.length} items</span>
            </div>
            {demoQueue.length > 0 ? (
              <ul className="divide-y divide-border/70">
                {demoQueue.map((ticket, index) => (
                  <li key={`${ticket.title}-${index}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ticket.source === "you" ? "You captured this" : `${ticket.agentId ? DEMO_AGENT_REGISTRY[ticket.agentId].name : "Demo Agent"} · simulated proposal`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      <span>{streamName(ticket.streamId)}</span><span>·</span><span>{ticket.priority}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid min-h-40 place-items-center px-5 text-center">
                <div>
                  <span className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-secondary text-muted-foreground"><ClipboardPlus className="h-4 w-4" aria-hidden /></span>
                  <p className="mt-3 font-medium">Your queue is waiting for one useful thing.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Capture a small next step when you are ready.</p>
                </div>
              </div>
            )}
          </section>

          {feedback && <p className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm leading-6 text-foreground" role="status">{feedback}</p>}
        </div>
      </div>
    </div>
  );
}

function streamName(streamId: DemoStreamId) {
  return DEMO_STREAMS.find((stream) => stream.id === streamId)?.name ?? "this stream";
}

function agentGreeting(agentName: string, streamId: DemoStreamId) {
  return `I’m ${agentName}. I can help with one small, synthetic next step for ${streamName(streamId)}. Tell me what feels tangled, then you decide whether the draft belongs in your queue.`;
}

function toTicketTitle(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const sentence = trimmed.split(/[.!?]/)[0]?.trim() || trimmed;
  const normalised = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return normalised.slice(0, 120);
}
