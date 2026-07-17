import { getOpenAIClient } from "@/lib/agent/openai";
import type { Ticket } from "@/lib/db/tickets";

export type InvoiceTicket = Pick<Ticket, "id" | "title" | "notes" | "closed_at">;

export type InvoiceLineItem = {
  ticket_id: string;
  description: string;
  quantity: number;
  rate_pence: number;
  subtotal_pence: number;
};

export type InvoiceDraft = {
  line_items: InvoiceLineItem[];
  total_pence: number;
  summary: string;
};

export type InvoicePolishResult = {
  line_items: Array<Pick<InvoiceLineItem, "ticket_id" | "description">>;
  summary: string;
};

export const DEFAULT_HOURLY_RATE = 85;

export type HourlyRateParseResult = {
  rate: number;
  valid: boolean;
};

export function parseHourlyRate(value: string | undefined): HourlyRateParseResult {
  if (value === undefined) return { rate: DEFAULT_HOURLY_RATE, valid: true };

  const input = value.trim();
  if (!/^\d{1,5}(?:\.\d{1,2})?$/.test(input)) {
    return { rate: DEFAULT_HOURLY_RATE, valid: false };
  }

  const rate = Number(input);
  return Number.isFinite(rate) && rate >= 0.01 && rate <= 10_000
    ? { rate, valid: true }
    : { rate: DEFAULT_HOURLY_RATE, valid: false };
}

export function buildInvoiceDraft(tickets: InvoiceTicket[], ratePerHour: number): InvoiceDraft {
  const rate_pence = toPence(ratePerHour);
  const line_items = tickets.map((ticket) => ({
    ticket_id: ticket.id,
    description: ticket.notes?.trim() ? `${ticket.title}: ${ticket.notes.trim()}` : ticket.title,
    // DeskOps does not yet track time. A visible one-hour assumption keeps
    // the draft useful without pretending that the model did the maths.
    quantity: 1,
    rate_pence,
    subtotal_pence: rate_pence,
  }));

  return {
    line_items,
    total_pence: line_items.reduce((total, item) => total + item.subtotal_pence, 0),
    summary: "Professional services completed.",
  };
}

export async function polishInvoiceCopy(draft: InvoiceDraft): Promise<InvoicePolishResult> {
  const { client, model } = getOpenAIClient();
  const response = await client.responses.create({
    model,
    store: false,
    input: [
      {
        role: "developer",
        content: [
          "You polish an invoice draft for human review.",
          "Use concise, professional UK English. Never alter ticket IDs, quantities, rates, subtotals, totals, dates, or make up work.",
          "Return a one-sentence summary and a rewritten description for every supplied line item.",
        ].join("\n"),
      },
      { role: "user", content: JSON.stringify({ line_items: draft.line_items, summary: draft.summary }) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "invoice_copy",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["line_items", "summary"],
          properties: {
            summary: { type: "string" },
            line_items: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["ticket_id", "description"],
                properties: {
                  ticket_id: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!response.output_text) throw new Error("DeskOps could not polish this invoice draft.");
  return normaliseInvoicePolish(JSON.parse(response.output_text), draft);
}

export function normaliseInvoicePolish(value: unknown, draft: InvoiceDraft): InvoicePolishResult {
  const raw = value as { line_items?: Array<{ ticket_id?: unknown; description?: unknown }>; summary?: unknown };
  const polishedById = new Map(
    (raw.line_items ?? [])
      .filter((item): item is { ticket_id: string; description: string } => typeof item.ticket_id === "string" && typeof item.description === "string")
      .map((item) => [item.ticket_id, item.description.trim().slice(0, 500)]),
  );
  return {
    line_items: draft.line_items.map((item) => ({
      ticket_id: item.ticket_id,
      description: polishedById.get(item.ticket_id) || item.description,
    })),
    summary: typeof raw.summary === "string" && raw.summary.trim() ? raw.summary.trim().slice(0, 400) : draft.summary,
  };
}

function toPence(ratePerHour: number): number {
  if (!Number.isFinite(ratePerHour) || ratePerHour < 0.01 || ratePerHour > 10_000) {
    throw new Error("Enter an hourly rate between £0.01 and £10,000.");
  }
  const pence = Math.round(ratePerHour * 100);
  if (Math.abs(ratePerHour - pence / 100) > Number.EPSILON) {
    throw new Error("Enter an hourly rate in whole pennies.");
  }
  return pence;
}
