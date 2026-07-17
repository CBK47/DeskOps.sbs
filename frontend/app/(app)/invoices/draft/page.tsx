import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceDraftPanel } from "@/components/invoice/InvoiceDraftPanel";
import { buildInvoiceDraft, parseHourlyRate } from "@/lib/agent/draftInvoice";
import { getStream } from "@/lib/db/streams";
import { listCompletedTicketsForStream } from "@/lib/db/tickets";

export default async function InvoiceDraftPage({
  searchParams,
}: {
  searchParams: Promise<{ stream?: string; rate?: string }>;
}) {
  const { stream: streamId, rate } = await searchParams;
  if (!streamId) notFound();

  const stream = await getStream(streamId);
  if (!stream || stream.life_domain !== "career") notFound();

  const rateResult = parseHourlyRate(rate);
  const tickets = await listCompletedTicketsForStream(stream.id);
  const draft = buildInvoiceDraft(tickets, rateResult.rate);

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
            <Input
              id="rate"
              name="rate"
              type="number"
              min="0.01"
              max="10000"
              step="0.01"
              defaultValue={rateResult.rate}
              aria-describedby={rateResult.valid ? undefined : "rate-help"}
              aria-invalid={!rateResult.valid}
              className="w-28"
            />
            {!rateResult.valid && (
              <p id="rate-help" className="max-w-56 text-xs leading-5 text-destructive" role="status">
                Use a rate from £0.01 to £10,000 with no more than two decimal places. £85 has been restored.
              </p>
            )}
          </div>
          <Button type="submit" variant="secondary">Update</Button>
        </form>
      </header>
      <InvoiceDraftPanel draft={draft} />
    </div>
  );
}
