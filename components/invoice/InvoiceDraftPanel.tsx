"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { polishInvoiceAction } from "@/app/actions/agent";
import type { InvoiceDraft } from "@/lib/agent/draftInvoice";

export function InvoiceDraftPanel({ draft }: { draft: InvoiceDraft }) {
  const [summary, setSummary] = useState(draft.summary);
  const [descriptions, setDescriptions] = useState(() => Object.fromEntries(draft.line_items.map((item) => [item.ticket_id, item.description])));
  const [polishing, startPolishTransition] = useTransition();

  function polishCopy() {
    startPolishTransition(async () => {
      let result: Awaited<ReturnType<typeof polishInvoiceAction>>;
      try {
        result = await polishInvoiceAction({
          ...draft,
          summary,
          line_items: draft.line_items.map((item) => ({ ...item, description: descriptions[item.ticket_id] ?? item.description })),
        });
      } catch {
        toast.error("DeskOps could not polish this invoice draft. You can still review it manually.");
        return;
      }
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSummary(result.polish.summary);
      setDescriptions(Object.fromEntries(result.polish.line_items.map((item) => [item.ticket_id, item.description])));
      toast.success("Invoice copy ready to review");
    });
  }

  return (
    <section className="space-y-5 rounded-lg border bg-card/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Review-only draft</p>
          <h2 className="mt-1 text-lg font-semibold">Career work invoice</h2>
        </div>
        <Button type="button" variant="secondary" onClick={polishCopy} disabled={polishing || draft.line_items.length === 0}>
          <Sparkles className="mr-2 h-4 w-4" aria-hidden />
          {polishing ? "Polishing…" : "Polish copy with AI"}
        </Button>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="invoice-summary" className="text-sm font-medium">Summary</label>
        <Textarea id="invoice-summary" value={summary} onChange={(event) => setSummary(event.target.value)} rows={2} />
      </div>

      {draft.line_items.length === 0 ? (
        <p className="rounded-md bg-secondary px-3 py-4 text-sm text-muted-foreground">No closed Career tickets are available for this draft yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="pb-2 pr-4 font-medium">Description</th>
                <th className="pb-2 px-3 text-right font-medium">Hours</th>
                <th className="pb-2 px-3 text-right font-medium">Rate</th>
                <th className="pb-2 pl-3 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {draft.line_items.map((item) => (
                <tr key={item.ticket_id} className="border-b border-border/70 align-top">
                  <td className="py-3 pr-4"><Textarea value={descriptions[item.ticket_id] ?? item.description} onChange={(event) => setDescriptions((current) => ({ ...current, [item.ticket_id]: event.target.value }))} rows={2} /></td>
                  <td className="px-3 py-4 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="px-3 py-4 text-right font-mono tabular-nums">{formatPence(item.rate_pence)}</td>
                  <td className="pl-3 py-4 text-right font-mono tabular-nums">{formatPence(item.subtotal_pence)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-4 text-right font-semibold">Total</td>
                <td className="pl-3 pt-4 text-right font-mono font-semibold tabular-nums">{formatPence(draft.total_pence)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <p className="text-xs leading-5 text-muted-foreground">Each completed ticket is shown as one hour because DeskOps does not yet track time. This draft is not saved, exported, or sent.</p>
    </section>
  );
}

function formatPence(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}
