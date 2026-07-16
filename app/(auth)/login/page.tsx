"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const [pending, setPending] = useState(false);

  async function onGoogleClick() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success, Supabase navigates away — we won't see this. On error, surface.
    if (error) {
      setPending(false);
      toast.error(error.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-8">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Sign in to DeskOps</h1>
        <p className="text-sm text-muted-foreground">Use your Google account to continue.</p>

        <Button
          type="button"
          className="w-full"
          disabled={pending}
          onClick={onGoogleClick}
        >
          <GoogleGlyph />
          {pending ? "Redirecting…" : "Continue with Google"}
        </Button>
      </div>
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
