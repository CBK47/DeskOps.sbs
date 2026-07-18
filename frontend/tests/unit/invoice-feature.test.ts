import { afterEach, describe, expect, it, vi } from "vitest";
import { isInvoiceActionEnabled, isInvoiceFeatureEnabled, isInvoiceUiEnabled } from "@/lib/features";

describe("invoice feature flags", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults every invoice surface to off", () => {
    vi.stubEnv("ENABLE_INVOICES", "");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_INVOICES", "");

    expect(isInvoiceActionEnabled()).toBe(false);
    expect(isInvoiceUiEnabled()).toBe(false);
    expect(isInvoiceFeatureEnabled()).toBe(false);
  });

  it("requires both flags before the complete feature is exposed", () => {
    vi.stubEnv("ENABLE_INVOICES", "true");
    expect(isInvoiceFeatureEnabled()).toBe(false);

    vi.stubEnv("NEXT_PUBLIC_ENABLE_INVOICES", "true");
    expect(isInvoiceActionEnabled()).toBe(true);
    expect(isInvoiceUiEnabled()).toBe(true);
    expect(isInvoiceFeatureEnabled()).toBe(true);
  });
});
