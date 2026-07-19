import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type DemoSection = "first-session" | "wellness" | "agents";

const DEMO_LINKS: Array<{ id: DemoSection; href: string; label: string }> = [
  { id: "first-session", href: "/demo", label: "First session" },
  { id: "wellness", href: "/demo/wellness", label: "Wellness" },
  { id: "agents", href: "/demo/agents", label: "Agents" },
];

export function DemoHeader({ active }: { active: DemoSection }) {
  return (
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
      <Link href="/" className="brand-lockup min-h-11 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="brand-mark" aria-hidden>DO</span><span>DeskOps</span>
      </Link>

      <nav className="order-3 grid w-full grid-cols-3 gap-1 border-t border-border/70 pt-3 text-sm sm:order-none sm:flex sm:w-auto sm:border-0 sm:pt-0" aria-label="Demo navigation">
        {DEMO_LINKS.map((link) => {
          const current = link.id === active;
          return (
            <Link
              key={link.id}
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-md px-3 py-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px",
                current ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Private sign-in
      </Link>
    </header>
  );
}
