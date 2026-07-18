"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Check, LockKeyhole } from "lucide-react";

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
      <div className="login-grid" aria-hidden />
      <Link href="/" className="brand-lockup absolute left-5 top-5 z-10 sm:left-8 sm:top-8" aria-label="DeskOps home"><span className="brand-mark" aria-hidden>DO</span><span>DeskOps</span></Link>
      <section className="login-panel animate-hero-in motion-reduce:animate-none" aria-labelledby="login-title">
        <div className="max-w-xl">
          <p className="signal-label">Your private command centre</p>
          <h1 id="login-title" className="mt-5 text-balance text-5xl font-semibold leading-none sm:text-7xl">Put life admin in its place.</h1>
          <p className="mt-6 max-w-lg text-pretty text-lg leading-8 text-muted-foreground">One calm queue, a reflective Wellness Wheel, and AI drafts that wait for your decision.</p>
          <ul className="mt-9 space-y-4 text-sm">
            {[
              "Capture scattered work in one reviewable queue",
              "Choose your own wellness focus, or skip it entirely",
              "Keep every AI suggestion draft-only until you approve it",
            ].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /><span>{item}</span></li>)}
          </ul>
        </div>

        <div className="login-action-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><LockKeyhole className="h-4 w-4" aria-hidden /></span>
            <div><p className="font-semibold">Return to your desk</p><p className="text-sm text-muted-foreground">Use your Google account to continue.</p></div>
          </div>
          {authError && <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">Authentication did not complete. Please try again.</p>}
          <Button type="button" size="lg" className="mt-6 h-11 w-full" disabled={pending} onClick={onGoogleClick} aria-describedby="login-agency-note">
            <GoogleGlyph />
            {pending ? "Opening Google…" : "Sign in with Google"}
          </Button>
          <p id="login-agency-note" className="mt-5 text-xs leading-5 text-muted-foreground">DeskOps uses Google only for sign-in. It does not ask for access to your email, calendar or Drive.</p>
          <div className="mt-6 flex gap-4 border-t border-border/70 pt-4 text-xs text-muted-foreground"><Link href="/privacy" className="hover:text-foreground">Privacy</Link><Link href="/terms" className="hover:text-foreground">Terms</Link></div>
        </div>
      </section>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.2-5.5 4.2a6.1 6.1 0 1 1 0-12.2c2 0 3.3.8 4 1.6l2.7-2.6A9.8 9.8 0 0 0 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4 9.6-9.8 0-.7-.1-1.3-.2-2H12z"
      />
    </svg>
  );
}
