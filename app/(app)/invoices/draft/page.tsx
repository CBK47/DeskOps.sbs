import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceDraftPanel } from "@/components/invoice/InvoiceDraftPanel";
import { buildInvoiceDraft } from "@/lib/agent/draftInvoice";
import { getStream } from "@/lib/db/streams";
import { listClosedTicketsForStream } from "@/lib/db/tickets";

export const runtime = "edge";

export default async function InvoiceDraftPage({ searchParams }: { searchParams: { stream?: string; rate?: string } }) {
  const streamId = searchParams.stream;
  if (!streamId) notFound();

  const stream = await getStream(streamId);
  if (!stream || stream.life_domain !== "career") notFound();

  const rate = parseRate(searchParams.rate);
  const tickets = await listClosedTicketsForStream(stream.id);
  const draft = buildInvoiceDraft(tickets, rate);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{stream.name}</p>
          <h1 className="mt-1 text-xl font-semibold">Draft invoice</h1>
        </div>
        <form className="flex items-end gap-2" method="get">
          <input type="hidden" name="stream" value={stream.id} />
          <div className="space-y-1.5">
            <Label htmlFor="rate">Hourly rate</Label>
            <Input id="rate" name="rate" type="number" min="0.01" max="10000" step="0.01" defaultValue={rate} className="w-28" />
          </div>
          <Button type="submit" variant="secondary">Update</Button>
        </form>
      </header>
      <InvoiceDraftPanel draft={draft} />
    </div>
  );
}

function parseRate(value: string | undefined) {
  const parsed = Number(value ?? "85");
  return Number.isFinite(parsed) && parsed >= 0.01 && parsed <= 10_000 ? parsed : 85;
}
