import Link from "next/link";

export default function PrivacyPage() {
  return <LegalPage title="Privacy" copy="DeskOps stores the task and wellness information you choose to save against your authenticated account. The application uses Supabase row-level policies to limit records to their owner. AI drafting sends only the text needed for the draft and is configured with storage disabled. Do not enter information you do not want processed by the services you configure for your deployment." />;
}

function LegalPage({ title, copy }: { title: string; copy: string }) {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <Link href="/" className="text-link">← DeskOps</Link>
      <p className="signal-label mt-16">Plain-language project notice</p>
      <h1 className="mt-4 text-5xl font-semibold">{title}</h1>
      <p className="mt-8 text-lg leading-8 text-muted-foreground">{copy}</p>
      <p className="mt-8 text-sm leading-6 text-muted-foreground">This open-source project notice is not legal advice and may need adapting before another operator deploys DeskOps.</p>
    </main>
  );
}
