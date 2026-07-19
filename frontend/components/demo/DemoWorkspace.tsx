"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Bot, CheckCircle2, CircleDashed, LockKeyhole, ShieldCheck, Sparkles, X } from "lucide-react";
import { draftDemoAgentAction, type DemoAgentActionResult } from "@/app/actions/demo-agent";
import {
  DEMO_AGENT_IDS,
  DEMO_AGENT_REGISTRY,
  DEMO_STREAMS,
  getAllowedDemoStreams,
  type DemoAgentId,
  type DemoAgentProposal,
  type DemoStreamId,
} from "@/lib/demo-agents/registry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type DemoTicket = Pick<DemoAgentProposal, "title" | "streamId" | "priority" | "agentId">;

const EXAMPLE_PROMPT = "Plan a small Saturday reset for the kitchen, then choose one thing that makes Monday easier.";

export function DemoWorkspace() {
  const [agentId, setAgentId] = useState<DemoAgentId>("echo");
  const [streamId, setStreamId] = useState<DemoStreamId>("home");
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT);
  const [proposal, setProposal] = useState<DemoAgentProposal | null>(null);
  const [demoQueue, setDemoQueue] = useState<DemoTicket[]>([
    { title: "Confirm Friday's dinner plan", streamId: "family", priority: "medium", agentId: "echo" },
    { title: "Review the home-router backup", streamId: "systems", priority: "low", agentId: "spark" },
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedAgent = DEMO_AGENT_REGISTRY[agentId];
  const allowedStreams = useMemo(() => getAllowedDemoStreams(agentId), [agentId]);

  function chooseAgent(nextAgentId: DemoAgentId) {
    setAgentId(nextAgentId);
    const firstAllowedStream = getAllowedDemoStreams(nextAgentId)[0];
    if (firstAllowedStream) setStreamId(firstAllowedStream.id);
    setProposal(null);
    setFeedback(null);
  }

  function submitDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result: DemoAgentActionResult = await draftDemoAgentAction({ agentId, streamId, prompt });
      if (!result.ok) {
        setProposal(null);
        setFeedback(result.error);
        return;
      }
      setProposal(result.proposal);
      setFeedback(null);
    });
  }

  function approveProposal() {
    if (!proposal) return;
    setDemoQueue((tickets) => [{ title: proposal.title, streamId: proposal.streamId, priority: proposal.priority, agentId: proposal.agentId }, ...tickets]);
    setFeedback("Added to this browser's synthetic demo queue. Nothing was saved to a real account.");
    setProposal(null);
  }

  return (
    <div className="space-y-6">
      <header className="demo-heading">
        <div>
          <p className="signal-label">Public sandbox · synthetic data only</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Meet the demo agents</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Explore six simulated roles in a private browser session. They do not connect to Gmail, memory, credentials or production systems.
          </p>
        </div>
        <div className="demo-access-note">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
          <span>No sign-in required</span>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="surface-panel overflow-hidden xl:sticky xl:top-20">
          <div className="border-b border-border/70 px-5 py-4">
            <p className="signal-label">Agent roster</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Every role is a simulated demo agent, and every proposal waits for approval.</p>
          </div>
          <ul className="p-2" aria-label="Demo agent selection">
            {DEMO_AGENT_IDS.map((id) => {
              const agent = DEMO_AGENT_REGISTRY[id];
              const selected = agent.id === agentId;
              return (
                <li key={agent.id}>
                  <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseAgent(agent.id)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px",
                    selected ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/55 hover:text-foreground",
                  )}
                  >
                  <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border", selected ? "border-primary/35 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground")}>
                    <Bot className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{agent.name}</span>
                      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-primary">Demo</span>
                    </span>
                    <span className="mt-1 block text-xs leading-5">{agent.role}</span>
                  </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="space-y-6">
          <section className="surface-panel p-5 sm:p-7" aria-labelledby="agent-studio-title">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border/70 pb-6">
              <div>
                <p className="signal-label">Selected demo agent</p>
                <h2 id="agent-studio-title" className="mt-2 text-2xl font-semibold sm:text-3xl">{selectedAgent.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{selectedAgent.tone}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-medium text-foreground">
                <LockKeyhole className="h-3.5 w-3.5 text-primary" aria-hidden /> Human approval required
              </span>
            </div>

            <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="signal-label">Capabilities</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {selectedAgent.capabilities.map((capability) => <span key={capability} className="rounded-md bg-secondary px-2 py-1 text-xs text-foreground">{capability}</span>)}
                </dd>
              </div>
              <div>
                <dt className="signal-label">Synthetic tools</dt>
                <dd className="mt-3 space-y-1 text-xs leading-5 text-muted-foreground">
                  {selectedAgent.simulatedTools.map((tool) => <span key={tool} className="block">{tool} · not connected</span>)}
                </dd>
              </div>
              <div className="border-t border-border/70 pt-5 sm:col-span-2">
                <dt className="signal-label">Permitted synthetic streams</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {allowedStreams.map((stream) => <span key={stream.id} className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground">{stream.name}</span>)}
                </dd>
              </div>
            </dl>

            <form className="mt-8 border-t border-border/70 pt-6" onSubmit={submitDraft}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="signal-label">Synthetic scenario</p>
                  <p className="mt-2 text-sm text-muted-foreground">Choose an allowed demo stream, then ask for one reviewable next step.</p>
                </div>
                <label className="grid gap-1 text-xs font-medium text-foreground">
                  Demo stream
                  <select
                    value={streamId}
                    onChange={(event) => setStreamId(event.target.value as DemoStreamId)}
                    disabled={pending}
                    className="h-10 min-w-36 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {allowedStreams.map((stream) => <option key={stream.id} value={stream.id}>{stream.name}</option>)}
                  </select>
                </label>
              </div>
              <label htmlFor="demo-scenario" className="sr-only">Synthetic demo scenario</label>
              <Textarea
                id="demo-scenario"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                maxLength={600}
                disabled={pending}
                className="mt-4 min-h-28 resize-y"
                aria-describedby="demo-scenario-hint"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p id="demo-scenario-hint" className="text-xs leading-5 text-muted-foreground">Synthetic text only. The sandbox rejects email addresses and credentials.</p>
                <Button type="submit" size="lg" disabled={pending}>
                  {pending ? <CircleDashed className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
                  {pending ? "Drafting…" : "Draft proposal"}
                </Button>
              </div>
            </form>
          </section>

          <section className="surface-panel p-5 sm:p-7" aria-labelledby="proposal-title">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
              <div>
                <p className="signal-label">Approval checkpoint</p>
                <h2 id="proposal-title" className="mt-2 text-xl font-semibold">Nothing enters the queue by itself</h2>
              </div>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" aria-hidden /> Draft only</span>
            </div>

            {proposal ? (
              <div className="mt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{proposal.title}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{proposal.summary}</p>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground">{proposal.priority}</span>
                </div>
                <p className="mt-5 border-t border-border/70 pt-5 text-sm leading-6 text-muted-foreground">{proposal.rationale}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {proposal.simulatedTools.map((tool) => <span key={tool.name} className="rounded-md border border-border px-2 py-1">{tool.name} · {tool.state.replace("_", " ")}</span>)}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button type="button" onClick={approveProposal}><CheckCircle2 className="h-4 w-4" aria-hidden /> Add to demo queue</Button>
                  <Button type="button" variant="ghost" onClick={() => { setProposal(null); setFeedback("Draft dismissed. The synthetic queue is unchanged."); }}><X className="h-4 w-4" aria-hidden /> Dismiss draft</Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid min-h-36 place-items-center text-center">
                <div>
                  <span className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-secondary text-muted-foreground"><ArrowRight className="h-4 w-4" aria-hidden /></span>
                  <p className="mt-3 font-medium">Select a role and ask for a draft</p>
                  <p className="mt-1 text-sm text-muted-foreground">The proposal will stay here until you approve or dismiss it.</p>
                </div>
              </div>
            )}
            {feedback && <p className="mt-5 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm leading-6 text-foreground" role="status">{feedback}</p>}
          </section>

          <section className="surface-panel overflow-hidden" aria-labelledby="demo-queue-title">
            <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-7">
              <div>
                <p className="signal-label">This browser only</p>
                <h2 id="demo-queue-title" className="mt-1 text-xl font-semibold">Synthetic demo queue</h2>
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{demoQueue.length} items</span>
            </div>
            <ul className="divide-y divide-border/70">
              {demoQueue.map((ticket, index) => {
                const stream = DEMO_STREAMS.find((item) => item.id === ticket.streamId);
                return (
                  <li key={`${ticket.title}-${index}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{DEMO_AGENT_REGISTRY[ticket.agentId].name} · simulated proposal</p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      <span>{stream?.name}</span><span>·</span><span>{ticket.priority}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
