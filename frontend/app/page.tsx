import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MoveRight } from "lucide-react";
import { ProductMoment } from "@/components/marketing/ProductMoment";
import { Reveal } from "@/components/marketing/Reveal";
import { WELLNESS_DIMENSIONS } from "@/lib/wellness";

export const metadata: Metadata = {
  title: "DeskOps — one calm queue for real life",
  description: "Capture life admin, decide what matters, and reflect privately with an optional Wellness Wheel.",
  openGraph: {
    title: "DeskOps — one calm queue for real life",
    description: "AI drafts. You decide. DeskOps turns the things you are carrying into one reviewable queue.",
    type: "website",
  },
};

const LOOP = ["Capture", "Triage", "Decide", "Review", "Act"];

export default function LandingPage() {
  return (
    <div className="marketing-page">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="marketing-nav">
        <Link href="/" className="brand-lockup" aria-label="DeskOps home">
          <span className="brand-mark" aria-hidden>DO</span>
          <span>DeskOps</span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Public navigation">
          <Link href="#dimensions" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:block">The Wheel</Link>
          <Link href="/login" className="text-link">Sign in</Link>
        </nav>
      </header>

      <main id="main-content">
        <section className="marketing-hero">
          <div className="hero-grid" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28 lg:pt-36">
            <div className="max-w-4xl animate-hero-in motion-reduce:animate-none">
              <p className="signal-label">A private life-operations desk</p>
              <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
                Clear the noise.<br />Keep the decisions.
              </h1>
              <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                DeskOps turns everything you are carrying into one intelligent queue, then helps you notice what deserves care without deciding for you.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/wellness?first=1" className="primary-cta">Start your Wellness Wheel <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                <Link href="/login" className="secondary-cta">Sign in with Google</Link>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">Private by default. Skippable by design. AI cannot act without your approval.</p>
            </div>
            <div className="mt-16 animate-hero-in-delayed motion-reduce:animate-none sm:mt-24">
              <ProductMoment />
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/30">
          <Reveal className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="signal-label">The operating loop</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight sm:text-6xl">A system that leaves room for judgement.</h2>
              </div>
              <div>
                <ol className="loop-line">
                  {LOOP.map((item, index) => (
                    <li key={item}>
                      <span className="font-mono text-xs text-primary">0{index + 1}</span>
                      <span className="mt-2 block font-semibold">{item}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 max-w-2xl text-pretty leading-7 text-muted-foreground">Capture messy inputs. Let AI propose structure. Review every meaningful field. Keep the final decision human.</p>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="dimensions" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <div className="max-w-3xl">
              <p className="signal-label">Dimensions of Wellness</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight sm:text-6xl">A wider view, without a scorecard.</h2>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">Rate only what feels useful. Leave dimensions untracked. Choose your own one to three areas of focus, even when the numbers point elsewhere.</p>
            </div>
            <ol className="dimension-list mt-14">
              {WELLNESS_DIMENSIONS.map((dimension, index) => (
                <li key={dimension.id}>
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{dimension.label}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{dimension.description}.</p>
                  </div>
                  <MoveRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section className="border-y border-border/70 bg-card/30">
          <Reveal className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="signal-label">Occupational, properly understood</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight sm:text-6xl">Work rarely fits one box.</h2>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">Build work that fits your life, whether that is a day job, freelance practice, side hustle, volunteer role, client work, or a company you are creating.</p>
            </div>
            <div className="occupational-map">
              <div className="occupational-root">Occupational <span>active focus</span></div>
              {["Day job", "Side hustle", "Client 1", "Client 2", "Internal work"].map((item, index) => (
                <div key={item} className="occupational-branch"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>{item}</div>
              ))}
              <div className="mt-8 border-t border-border/70 pt-6">
                <p className="signal-label">Reviewable finance path</p>
                <p className="mt-3 max-w-lg leading-7 text-muted-foreground">Completed client tickets can become an invoice draft. Quantities and totals remain deterministic; AI may polish wording, never the figures or the send button.</p>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <div className="trust-panel">
              <div>
                <p className="signal-label">Agency built into the product</p>
                <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-6xl">AI proposes.<br />The person decides.</h2>
              </div>
              <ul className="trust-list">
                {[
                  "AI ticket suggestions stay drafts until you review them.",
                  "Wellness ratings are optional and never set priorities automatically.",
                  "Invoice figures come from deterministic code, not generated text.",
                  "Companion tools are ordinary links; no assessment data is shared.",
                ].map((item) => <li key={item}><Check className="h-4 w-4 text-primary" aria-hidden /><span>{item}</span></li>)}
              </ul>
            </div>
          </Reveal>
        </section>

        <section className="border-y border-border/70 bg-card/30">
          <Reveal className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="signal-label">Clearly labelled roadmap</p>
                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Shared work, later.</h2>
              </div>
              <div className="roadmap-grid">
                {[
                  ["Organisation workspaces", "Separate members, roles and operational records from private wellness data."],
                  ["Client work", "First-class client and project context for Occupational tickets."],
                  ["Client portals", "A contained view of only the records a client is explicitly allowed to see."],
                ].map(([title, copy]) => (
                  <article key={title}><span>ROADMAP</span><h3>{title}</h3><p>{copy}</p></article>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-36">
          <Reveal className="cta-field">
            <p className="signal-label">Start with a private snapshot</p>
            <h2 className="mt-5 max-w-4xl text-balance text-5xl font-semibold leading-none sm:text-7xl">Make room for what matters now.</h2>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">You can skip every question, change focus later, and keep untracked dimensions out of the maths.</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/wellness?first=1" className="primary-cta">Start your Wellness Wheel <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <Link href="/login" className="secondary-cta">Sign in with Google</Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>DeskOps · calm operations for real life</span>
          <nav className="flex flex-wrap gap-5" aria-label="Legal and project links">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <a href="https://github.com/CBK47/DeskOps.sbs" target="_blank" rel="noreferrer" className="hover:text-foreground">Source code</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
