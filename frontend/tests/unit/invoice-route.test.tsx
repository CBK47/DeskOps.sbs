import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStream: vi.fn(),
  listCompletedTicketsForStream: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/db/streams", () => ({ getStream: mocks.getStream }));
vi.mock("@/lib/db/tickets", () => ({ listCompletedTicketsForStream: mocks.listCompletedTicketsForStream }));
vi.mock("@/components/invoice/InvoiceDraftPanel", () => ({ InvoiceDraftPanel: () => null }));

import InvoiceDraftPage from "@/app/(app)/invoices/draft/page";

describe("invoice draft route flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStream.mockResolvedValue({ id: "stream-work", name: "Work", life_domain: "career" });
    mocks.listCompletedTicketsForStream.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the application 404 before loading data when invoices are off", async () => {
    vi.stubEnv("ENABLE_INVOICES", "false");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_INVOICES", "false");

    await expect(InvoiceDraftPage({ searchParams: Promise.resolve({ stream: "stream-work" }) }))
      .rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.getStream).not.toHaveBeenCalled();
  });

  it("restores the route when both personal-mode flags are on", async () => {
    vi.stubEnv("ENABLE_INVOICES", "true");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_INVOICES", "true");

    const page = await InvoiceDraftPage({ searchParams: Promise.resolve({ stream: "stream-work" }) });

    expect(page.type).toBe("div");
    expect(mocks.getStream).toHaveBeenCalledWith("stream-work");
    expect(mocks.listCompletedTicketsForStream).toHaveBeenCalledWith("stream-work");
  });
});
