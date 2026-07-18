"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { ThemeToggle } from "@/components/app/ThemeToggle";

const LOGIN_PRINCIPLES = [
  "Private by default",
  "AI stays draft-only",
  "You approve every action",
];

export default function LoginPage() {
  const [pending, setPending] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    setAuthError(new URLSearchParams(window.location.search).get("error") === "auth");
  }, []);

  async function onGoogleClick() {
    setPending(true);
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const callback = new URL("/auth/callback", window.location.origin);
    if (next?.startsWith("/") && !next.startsWith("//")) callback.searchParams.set("next", next);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });
    // On success, Supabase navigates away — we won't see this. On error, surface.
    if (error) {
      setPending(false);
      toast.error(error.message);
    }
  }

  return (
    <main className="login-page">
      <header className="login-masthead">
        <Link href="/" className="brand-lockup login-brand-lockup rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="DeskOps home">
          <span className="brand-mark" aria-hidden>DO</span>
          <span>DeskOps</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="login-utility-label hidden font-mono text-[10px] font-medium uppercase tracking-[0.14em] sm:block">Private studio</span>
          <span className="login-theme-control"><ThemeToggle /></span>
        </div>
      </header>

      <section className="login-panel animate-hero-in motion-reduce:animate-none" aria-labelledby="login-title">
        <div className="login-action-card">
          <div className="login-card-topline">
            <span className="flex items-center gap-2"><span className="status-light" aria-hidden /> DeskOps studio</span>
            <span>Private access</span>
          </div>

          <div className="px-6 pb-7 pt-9 text-center sm:px-10 sm:pb-10 sm:pt-11">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" aria-hidden />
            </span>
            <p className="signal-label mt-6">Your private workspace</p>
            <h1 id="login-title" className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to DeskOps</h1>
            <p className="mx-auto mt-4 max-w-sm text-pretty text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Step back into one calm place for clear decisions, reviewable work and everything you are carrying.
            </p>

            {authError && (
              <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left text-sm text-destructive" role="alert">
                Authentication did not complete. Please try again.
              </p>
            )}

            <Button
              type="button"
              size="lg"
              className="mt-7 h-12 w-full shadow-[0_12px_30px_rgba(58,91,199,0.2)]"
              disabled={pending}
              onClick={onGoogleClick}
              aria-describedby="login-agency-note"
            >
              <GoogleGlyph />
              {pending ? "Opening Google…" : "Continue with Google"}
            </Button>
            <p id="login-agency-note" className="mt-4 text-xs leading-5 text-muted-foreground">
              Google is used only to confirm your identity. DeskOps does not request access to Gmail, Calendar or Drive.
            </p>
          </div>
        </div>

        <ul className="login-principles" aria-label="DeskOps principles">
          {LOGIN_PRINCIPLES.map((item) => (
            <li key={item}><span className="status-light" aria-hidden />{item}</li>
          ))}
        </ul>
      </section>

      <footer className="login-footer">
        <span>AI proposes. You decide.</span>
        <nav className="flex items-center gap-4" aria-label="Legal links">
          <Link href="/privacy" className="hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Terms</Link>
        </nav>
      </footer>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.94A6.02 6.02 0 0 1 6.1 12c0-.67.12-1.32.31-1.94V7.44H3.06A10 10 0 0 0 2 12c0 1.62.39 3.15 1.06 4.56l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.8.51 3.84 1.5l2.88-2.89A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.94 5.44l3.35 2.62C7.2 7.7 9.4 5.94 12 5.94Z" />
    </svg>
  );
}
