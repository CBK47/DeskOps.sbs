import type { Metadata } from "next";
import { DemoHeader } from "@/components/demo/DemoHeader";
import { DemoWorkspace } from "@/components/demo/DemoWorkspace";

export const metadata: Metadata = {
  title: "DeskOps interactive demo",
  description: "A public, synthetic first-session walkthrough of DeskOps.",
  robots: { index: true, follow: true },
};

export default function DemoPage() {
  return (
    <main className="min-h-dvh pb-16 pt-6 sm:pb-20 sm:pt-8">
      <a href="#demo-main" className="skip-link">Skip to demo workspace</a>
      <DemoHeader active="first-session" />
      <div id="demo-main" className="mx-auto mt-10 max-w-7xl px-4 sm:mt-14 sm:px-6">
        <DemoWorkspace />
      </div>
    </main>
  );
}
