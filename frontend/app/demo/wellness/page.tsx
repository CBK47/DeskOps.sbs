import type { Metadata } from "next";
import { DemoHeader } from "@/components/demo/DemoHeader";
import { DemoWellnessJourney } from "@/components/demo/DemoWellnessJourney";

export const metadata: Metadata = {
  title: "DeskOps demo Wellness history",
  description: "A public synthetic example of DeskOps Wellness reflections over time.",
  robots: { index: true, follow: true },
};

export default function DemoWellnessPage() {
  return (
    <main className="min-h-dvh pb-16 pt-6 sm:pb-20 sm:pt-8">
      <a href="#demo-wellness-main" className="skip-link">Skip to demo Wellness history</a>
      <DemoHeader active="wellness" />
      <div id="demo-wellness-main" className="mx-auto mt-10 max-w-7xl px-4 sm:mt-14 sm:px-6">
        <DemoWellnessJourney />
      </div>
    </main>
  );
}
