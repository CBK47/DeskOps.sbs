"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/app/ThemeToggle";

const LOGIN_PRINCIPLES = [
  "Private by default",
  "AI stays draft-only",
  "You approve every action",
];

type ProviderAvailability = {
  google: boolean;
  github: boolean;
  email: boolean;
};

export default function LoginPage() {
  const [pending, setPending] = useState<"google" | "github" | "email" | null>(null);
  const [authError, setAuthError] = useState(false);
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [providers, setProviders] = useState<ProviderAvailability>({ google: true, github: false, email: false });

  useEffect(() => {
    setAuthError(new URLSearchParams(window.location.search).get("error") === "auth");

    let cancelled = false;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: anonKey } })
        .then((response) => response.ok ? response.json() : null)
        .then((settings: { external?: Partial<ProviderAvailability> } | null) => {
          if (!cancelled && settings?.external) {
            setProviders({
              google: settings.external.google === true,
              github: settings.external.github === true,
              email: settings.external.email === true,
            });
          }
        })
        .catch(() => undefined);
    }

    return () => { cancelled = true; };
  }, []);

  function callbackUrl() {
    const callback = new URL("/auth/callback", window.location.origin);
    const next = new URLSearchParams(window.location.search).get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) callback.searchParams.set("next", next);
    return callback.toString();
  }

  async function onOAuthClick(provider: "google" | "github") {
    setPending(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl() },
    });
    // On success, Supabase navigates away — we won't see this. On error, surface.
    if (error) {
      setPending(null);
      toast.error(error.message);
    }
  }

  async function onMagicLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("email");
    setMagicLinkSent(false);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: callbackUrl(),
        shouldCreateUser: true,
      },
    });

    setPending(null);
    if (error) {
      toast.error(error.message);
      return;
    }

    setMagicLinkSent(true);
    toast.success("Magic link sent");
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

            <div className={`mt-7 grid gap-2 ${providers.google && providers.github ? "sm:grid-cols-2" : ""}`}>
              {providers.google && (
                <Button
                  type="button"
                  size="lg"
                  className="h-12 shadow-[0_12px_30px_rgba(58,91,199,0.2)]"
                  disabled={pending !== null}
                  onClick={() => onOAuthClick("google")}
                  aria-describedby="login-agency-note"
                >
                  <GoogleGlyph />
                  {pending === "google" ? "Opening Google…" : "Google"}
                </Button>
              )}
              {providers.github && (
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12"
                  disabled={pending !== null}
                  onClick={() => onOAuthClick("github")}
                  aria-describedby="login-agency-note"
                >
                  <GitHubGlyph />
                  {pending === "github" ? "Opening GitHub…" : "GitHub"}
                </Button>
              )}
            </div>

            {providers.email && (
              <>
                <div className="my-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground" aria-hidden>
                  <span className="h-px flex-1 bg-border" />
                  <span>or use email</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <form className="space-y-3" onSubmit={onMagicLinkSubmit}>
                  <label htmlFor="login-email" className="sr-only">Email address</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="login-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 flex-1 px-3"
                      required
                      disabled={pending !== null}
                      aria-describedby="login-email-note"
                    />
                    <Button type="submit" size="lg" variant="secondary" className="h-11" disabled={pending !== null}>
                      <Mail aria-hidden />
                      {pending === "email" ? "Sending…" : magicLinkSent ? "Resend link" : "Email me a link"}
                    </Button>
                  </div>
                  {magicLinkSent && (
                    <p className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-left text-xs leading-5 text-foreground" role="status" aria-live="polite">
                      Check your inbox. The sign-in link is single-use and returns you to DeskOps.
                    </p>
                  )}
                </form>
              </>
            )}

            <p id="login-agency-note" className="mt-5 text-xs leading-5 text-muted-foreground">
              These options confirm your identity only. DeskOps does not ask for repository, Gmail, Calendar or Drive access.
            </p>
            <p id="login-email-note" className="mt-2 text-xs leading-5 text-muted-foreground">
              New here? Sign in, then choose <span className="text-foreground">Set up demo workspace</span> for private sample data.
            </p>
            <Link href="/demo" className="text-link mt-4 inline-flex text-xs">Explore the public synthetic demo instead</Link>
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

function GitHubGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 7c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}
