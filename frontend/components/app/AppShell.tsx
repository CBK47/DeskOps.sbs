import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { QuickAddDialog } from "@/components/ticket/QuickAddDialog";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { NavLink } from "@/components/app/NavLink";
import { listStreams } from "@/lib/db/streams";
import { Bot, CircleUserRound, ListTodo, Radar, Rows3, Workflow } from "lucide-react";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [{ data: { user } }, streams] = await Promise.all([
    supabase.auth.getUser(),
    listStreams(),
  ]);
  const streamsLite = streams
    .filter((s) => !s.archived)
    .map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#app-main" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/queue"
            className="brand-lockup rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="brand-mark" aria-hidden>DO</span>
            <span>DeskOps</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Main navigation">
            <NavLink href="/queue"><ListTodo className="h-4 w-4" aria-hidden /> Queue</NavLink>
            <NavLink href="/wellness"><Radar className="h-4 w-4" aria-hidden /> Wellness</NavLink>
            <NavLink href="/streams"><Rows3 className="h-4 w-4" aria-hidden /> Streams</NavLink>
            <NavLink href="/agents"><Bot className="h-4 w-4" aria-hidden /> Agents</NavLink>
          </nav>
          <div className="flex items-center gap-1">
            <span className="hidden max-w-48 truncate rounded-md border border-border/70 px-2 py-1 font-mono text-[11px] text-muted-foreground lg:block" title={user?.email ?? undefined}>
              {user?.email}
            </span>
            <ThemeToggle />
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm" className="hidden sm:inline-flex">Sign out</Button>
              <Button type="submit" variant="ghost" size="icon-sm" className="sm:hidden" aria-label="Sign out"><CircleUserRound className="h-4 w-4" /></Button>
            </form>
          </div>
        </div>
      </header>
      <main id="app-main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-7 sm:px-6 sm:pb-10 sm:pt-9">{children}</main>
      <nav className="mobile-nav md:hidden" aria-label="Mobile navigation">
        <NavLink href="/queue"><ListTodo className="h-5 w-5" aria-hidden /><span>Queue</span></NavLink>
        <NavLink href="/wellness"><Radar className="h-5 w-5" aria-hidden /><span>Wellness</span></NavLink>
        <NavLink href="/streams"><Workflow className="h-5 w-5" aria-hidden /><span>Streams</span></NavLink>
        <NavLink href="/agents"><Bot className="h-5 w-5" aria-hidden /><span>Agents</span></NavLink>
      </nav>
      <QuickAddDialog streams={streamsLite} />
    </div>
  );
}
