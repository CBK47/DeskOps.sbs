import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <Link href="/" className="text-link">← DeskOps</Link>
      <p className="signal-label mt-16">Plain-language project notice</p>
      <h1 className="mt-4 text-5xl font-semibold">Terms</h1>
      <p className="mt-8 text-lg leading-8 text-muted-foreground">DeskOps is a personal organisation tool. Its wellness reflection is not medical or therapeutic advice. You remain responsible for reviewing every AI draft, task, priority and external action.</p>
      <p className="mt-8 text-sm leading-6 text-muted-foreground">The public source is provided under its repository licence. Operators should publish terms suited to their own deployment before offering the service to others.</p>
    </main>
  );
}
