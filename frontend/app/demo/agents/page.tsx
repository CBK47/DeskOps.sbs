import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { AgentAccessGuide } from "@/components/agent/AgentAccessGuide";
import { DemoHeader } from "@/components/demo/DemoHeader";
import { DEMO_AGENT_IDS, DEMO_AGENT_REGISTRY, DEMO_STREAMS } from "@/lib/demo-agents/registry";

export const metadata: Metadata = {
  title: "DeskOps demo agent access",
  description: "A public explanation of the scoped, approval-based DeskOps agent access model.",
  robots: { index: true, follow: true },
};

export default function DemoAgentsPage() {
  return (
    <main className="min-h-dvh pb-16 pt-6 sm:pb-20 sm:pt-8">
      <a href="#demo-agents-main" className="skip-link">Skip to agent access model</a>
      <DemoHeader active="agents" />

      <div id="demo-agents-main" className="mx-auto mt-10 max-w-7xl space-y-6 px-4 sm:mt-14 sm:px-6">
        <AgentAccessGuide streams={DEMO_STREAMS} isDemo />

        <section className="surface-panel overflow-hidden" aria-labelledby="demo-agent-roster-title">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-7">
            <div>
              <p className="signal-label">Simulated roster</p>
              <h2 id="demo-agent-roster-title" className="mt-1 text-xl font-semibold">Six examples of scoped operators.</h2>
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{DEMO_AGENT_IDS.length} profiles</span>
          </div>
          <ul className="divide-y divide-border/70">
            {DEMO_AGENT_IDS.map((agentId) => {
              const agent = DEMO_AGENT_REGISTRY[agentId];
              const allowedStreams = DEMO_STREAMS.filter((stream) => agent.allowedStreamIds.includes(stream.id)).map((stream) => stream.name).join(", ");
              return (
                <li key={agent.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4 sm:px-7">
                  <div className="flex min-w-0 gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary"><Bot className="h-4 w-4" aria-hidden /></span>
                    <div>
                      <p className="font-semibold">{agent.name}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <p className="max-w-xs text-sm leading-6 text-muted-foreground"><span className="font-medium text-foreground">Permitted streams:</span> {allowedStreams}</p>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border/70 px-5 py-4 sm:px-7">
            <Link href="/demo" className="text-link">Try assigning an agent in the first-session walkthrough <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
