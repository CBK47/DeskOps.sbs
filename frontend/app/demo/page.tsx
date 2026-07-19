import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoWorkspace } from "@/components/demo/DemoWorkspace";

export const metadata: Metadata = {
  title: "DeskOps demo agents",
  description: "A public synthetic sandbox for DeskOps' simulated demo agents.",
  robots: { index: true, follow: true },
};

export default function DemoPage() {
  return (
    <main className="min-h-dvh pb-16 pt-6 sm:pb-20 sm:pt-8">
      <a href="#demo-main" className="skip-link">Skip to demo workspace</a>
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="brand-lockup rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="brand-mark" aria-hidden>DO</span><span>DeskOps</span>
        </Link>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Private sign-in
        </Link>
      </header>
      <div id="demo-main" className="mx-auto mt-10 max-w-7xl px-4 sm:mt-14 sm:px-6">
        <DemoWorkspace />
      </div>
    </main>
  );
}
