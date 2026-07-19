import { ArrowUpRight } from "lucide-react";
import { companionToolsFor } from "@/lib/companion-tools";
import type { WellnessDimension } from "@/lib/wellness";

export function CompanionTools({ focusDimensions }: { focusDimensions: WellnessDimension[] }) {
  const tools = companionToolsFor(focusDimensions);
  if (!tools.length) return null;

  return (
    <section className="surface-panel p-5 sm:p-6" aria-labelledby="companion-tools-title">
      <p className="signal-label">Optional, independent projects</p>
      <h2 id="companion-tools-title" className="mt-2 text-xl font-semibold">Companion tools</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        These links may be useful for the areas you chose. They are not integrations, receive none of your DeskOps data, and are not affiliated with DeskOps.
      </p>
      <ul className="mt-5 divide-y divide-border/70 border-y border-border/70">
        {tools.map((tool) => (
          <li key={tool.name}>
            <a
              href={tool.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start justify-between gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>
                <span className="font-semibold transition-colors duration-150 group-hover:text-primary">{tool.name}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{tool.description}</span>
                <span className="mt-1 block font-mono text-xs text-muted-foreground">{tool.licence} · source repository</span>
              </span>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
