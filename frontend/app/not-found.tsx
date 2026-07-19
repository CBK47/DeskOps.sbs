import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="max-w-lg text-center">
        <p className="font-mono text-xs tracking-widest text-primary">404 · SIGNAL LOST</p>
        <h1 className="mt-5 text-balance text-5xl font-semibold">That page is not on this desk.</h1>
        <p className="mt-5 leading-7 text-muted-foreground">The link may be old, or the page may have moved.</p>
        <Link href="/" className="primary-cta mt-8">Return to DeskOps</Link>
      </div>
    </main>
  );
}
