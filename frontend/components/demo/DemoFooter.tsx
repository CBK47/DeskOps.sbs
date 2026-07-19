import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

export function DemoFooter() {
  return (
    <footer className="mx-auto mt-10 max-w-7xl border-t border-border/70 px-4 pt-6 text-sm text-muted-foreground sm:mt-14 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex max-w-3xl items-start gap-2 leading-6">
          <LockKeyhole className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <span><strong className="font-semibold text-foreground">For Build Week judges:</strong> an email magic link opens your own isolated workspace, including the private queue and complete Rebalance flow. Live GPT-5.6 drafting activates only when the hosted workspace has an OpenAI key configured.</span>
        </p>
        <Link href="/login" className="text-link">Open private sign-in <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </div>
    </footer>
  );
}
