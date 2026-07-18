"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[60vh] place-items-center p-8">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          That action did not complete. Your data is usually fine, but the page failed to update. Try again.
        </p>
        <div className="flex justify-center gap-2">
          <Button type="button" onClick={reset}>Try again</Button>
          <Link href="/queue">
            <Button type="button" variant="outline">Back to queue</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
