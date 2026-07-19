"use client";

import { useState, useTransition } from "react";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { polishInvoiceAction } from "@/app/actions/agent";
import type { InvoiceDraft } from "@/lib/agent/draftInvoice";
import { AGENT_BUSY_MESSAGE } from "@/lib/agent/draft-error";

export function InvoiceDraftPanel({ draft }: { draft: InvoiceDraft }) {
  const [summary, setSummary] = useState(draft.summary);
  const [descriptions, setDescriptions] = useState(() => Object.fromEntries(draft.line_items.map((item) => [item.ticket_id, item.description])));
  const [polishing, startPolishTransition] = useTransition();
  const [polishError, setPolishError] = useState("");

  function polishCopy() {
    startPolishTransition(async () => {
      setPolishError("");
      let result: Awaited<ReturnType<typeof polishInvoiceAction>>;
      try {
        result = await polishInvoiceAction({
          ...draft,
          summary,
          line_items: draft.line_items.map((item) => ({ ...item, description: descriptions[item.ticket_id] ?? item.description })),
        });
      } catch {
        setPolishError(AGENT_BUSY_MESSAGE);
        return;
      }
      if (!result.ok) {
        if (result.code === "rate_limited" || result.code === "temporarily_unavailable") {
          setPolishError(result.error);
        } else {
          toast.error(result.error);
        }
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
          <h2 className="mt-1 text-lg font-semibold">Occupational work invoice</h2>
        </div>
        <Button type="button" variant="secondary" onClick={polishCopy} disabled={polishing || draft.line_items.length === 0}>
          <Sparkles className="mr-2 h-4 w-4" aria-hidden />
          {polishing ? "Polishing…" : "Polish copy with AI"}
        </Button>
      </div>
      {polishError && <p className="text-sm text-muted-foreground" role="alert">{polishError}</p>}

      <div className="space-y-1.5">
        <label htmlFor="invoice-summary" className="text-sm font-medium">Summary</label>
        <Textarea
          id="invoice-summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={2}
          disabled={polishing}
        />
      </div>

      {draft.line_items.length === 0 ? (
        <div className="rounded-lg border bg-secondary/40 p-4 text-center">
          <FileText className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
          <p className="mt-2 text-sm font-medium">No completed work tickets yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Complete a ticket in this legacy Career stream to include it in the review-only invoice draft.</p>
        </div>
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
                  <td className="py-3 pr-4">
                    <Textarea
                      aria-label="Line item description"
                      value={descriptions[item.ticket_id] ?? item.description}
                      onChange={(event) => setDescriptions((current) => ({ ...current, [item.ticket_id]: event.target.value }))}
                      rows={2}
                      disabled={polishing}
                    />
                  </td>
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
