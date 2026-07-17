import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { QuickAddDialog } from "@/components/ticket/QuickAddDialog";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { NavLink } from "@/components/app/NavLink";
import { listStreams } from "@/lib/db/streams";

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Desk<span className="text-cbk-blue dark:text-cbk-blue-hover">Ops</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink href="/">Queue</NavLink>
            <NavLink href="/streams">Streams</NavLink>
            <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />
            <span className="hidden font-mono text-[11px] text-muted-foreground sm:block" title={user?.email ?? undefined}>
              {user?.email}
            </span>
            <ThemeToggle />
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">Sign out</Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      <QuickAddDialog streams={streamsLite} />
    </div>
  );
}
