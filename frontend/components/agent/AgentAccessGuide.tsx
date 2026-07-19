import Link from "next/link";
import { ArrowRight, Bot, KeyRound, LockKeyhole, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type AgentAccessStream = {
  id: string;
  name: string;
};

export function AgentAccessGuide({
  streams,
  isDemo = false,
}: {
  streams: readonly AgentAccessStream[];
  isDemo?: boolean;
}) {
  const hasStreams = streams.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-border/70 pb-6">
        <div>
          <p className="signal-label">{isDemo ? "Simulated access model" : "Designed access model"}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold sm:text-4xl">Agents work inside the boundaries you set.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            DeskOps is the source of truth for your queue and decisions. An agent can help with a defined part of that workspace, but it should never become a back door into your whole life.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden /> {isDemo ? "No live connections" : "No connections active"}
        </span>
      </header>

      <section className="surface-panel overflow-hidden" aria-labelledby="agent-access-tldr-title">
        <div className="border-b border-border/70 px-5 py-4 sm:px-7">
          <p className="signal-label">TL;DR</p>
          <h2 id="agent-access-tldr-title" className="mt-1 text-xl font-semibold">Bring your own agent. Grant only the smallest useful access.</h2>
        </div>
        <ol className="divide-y divide-border/70">
          <AccessStep
            number="01"
            icon={<Bot className="h-4 w-4" aria-hidden />}
            title="Choose the operator"
            copy="Use a hosted model, an open-source agent running locally, or a custom tool. DeskOps should not hard-code you to one provider."
          />
          <AccessStep
            number="02"
            icon={<KeyRound className="h-4 w-4" aria-hidden />}
            title="Give it a scoped DeskOps connection"
            copy="The agent would receive a narrow token for your DeskOps instance, never your password or a blanket account credential."
          />
          <AccessStep
            number="03"
            icon={<SlidersHorizontal className="h-4 w-4" aria-hidden />}
            title="Choose the streams and abilities"
            copy="Limit it to the streams it needs, then choose whether it can read the queue, draft work or only make proposals."
          />
          <AccessStep
            number="04"
            icon={<LockKeyhole className="h-4 w-4" aria-hidden />}
            title="Keep consequential work reviewable"
            copy="DeskOps should surface the proposed next step for approval before it changes the queue or reaches an external tool."
          />
        </ol>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="surface-panel p-5 sm:p-7" aria-labelledby="stream-scope-title">
          <p className="signal-label">Scope before capability</p>
          <h2 id="stream-scope-title" className="mt-2 text-2xl font-semibold">An agent belongs to a stream, not everywhere.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A household helper might work in Home and Family. A coding helper might only see Studio and Systems. The queue stays coherent even when each agent is specialised.
          </p>
          {hasStreams ? (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Available streams for scoped agent access">
              {streams.map((stream) => (
                <li key={stream.id} className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground">{stream.name}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-lg border border-border bg-secondary/35 p-4">
              <p className="font-medium">Create a stream before assigning an agent.</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Streams are the first boundary for useful, comprehensible access.</p>
              {!isDemo && <Link href="/streams" className="text-link mt-3">Set up streams <ArrowRight className="h-4 w-4" aria-hidden /></Link>}
            </div>
          )}
        </section>

        <aside className="surface-panel p-5" aria-labelledby="default-access-title">
          <p className="signal-label">By default</p>
          <h2 id="default-access-title" className="mt-2 text-lg font-semibold">Nothing outside DeskOps is shared.</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />No repository, Gmail, Calendar, Drive or other service access.</li>
            <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />No raw passwords or general account credentials.</li>
            <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />No silent queue changes or external side effects.</li>
          </ul>
        </aside>
      </div>

      <p className={cn("rounded-lg border px-4 py-3 text-sm leading-6", isDemo ? "border-primary/25 bg-primary/5 text-foreground" : "border-border bg-secondary/35 text-muted-foreground")}>
        {isDemo
          ? "This public walkthrough only demonstrates the permission model. Its agents are simulated and cannot receive a connection to DeskOps or any external service."
          : "Agent connections and external service integrations are not active in this build. This page documents the permission model DeskOps is designed to enforce when you configure your own agents."}
      </p>
    </div>
  );
}

function AccessStep({
  number,
  icon,
  title,
  copy,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <li className="flex gap-4 px-5 py-5 sm:px-7">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-primary">{number}</p>
        <h3 className="mt-1 font-semibold">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{copy}</p>
      </div>
    </li>
  );
}
