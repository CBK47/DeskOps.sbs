import { describe, expect, it } from "vitest";
import { buildInvoiceDraft, normaliseInvoicePolish, parseHourlyRate } from "@/lib/agent/draftInvoice";

describe("buildInvoiceDraft", () => {
  it("creates deterministic one-hour line items and totals in pence", () => {
    const draft = buildInvoiceDraft([
      { id: "one", title: "Prepare handover", notes: "Summarised project work.", closed_at: "2026-07-15T10:00:00Z" },
      { id: "two", title: "Review proposal", notes: null, closed_at: "2026-07-14T10:00:00Z" },
    ], 85);

    expect(draft).toMatchObject({
      total_pence: 17_000,
      line_items: [
        { ticket_id: "one", description: "Prepare handover: Summarised project work.", quantity: 1, rate_pence: 8_500, subtotal_pence: 8_500 },
        { ticket_id: "two", description: "Review proposal", quantity: 1, rate_pence: 8_500, subtotal_pence: 8_500 },
      ],
    });
  });

  it("preserves deterministic maths when AI copy is polished", () => {
    const draft = buildInvoiceDraft([{ id: "one", title: "Prepare handover", notes: null, closed_at: null }], 90);
    const polished = normaliseInvoicePolish({
      summary: "Delivery support completed.",
      line_items: [{ ticket_id: "one", description: "Project handover and delivery support." }],
    }, draft);

    expect(polished).toEqual({
      summary: "Delivery support completed.",
      line_items: [{ ticket_id: "one", description: "Project handover and delivery support." }],
    });
    expect(draft.total_pence).toBe(9_000);
  });

  it("rejects hourly rates below one penny instead of rounding them to zero", () => {
    expect(() => buildInvoiceDraft([], 0.001)).toThrow("Enter an hourly rate between £0.01 and £10,000.");
  });

  it("rejects rates with fractions of a penny instead of rounding the total", () => {
    expect(() => buildInvoiceDraft([], 85.999)).toThrow("Enter an hourly rate in whole pennies.");
  });

  it("only accepts URL rates that can be represented as whole pennies", () => {
    expect(parseHourlyRate("85.50")).toEqual({ rate: 85.5, valid: true });
    expect(parseHourlyRate("85.999")).toEqual({ rate: 85, valid: false });
    expect(parseHourlyRate("1e2")).toEqual({ rate: 85, valid: false });
  });
});
