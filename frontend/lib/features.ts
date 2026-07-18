function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function isInvoiceActionEnabled() {
  return enabled(process.env.ENABLE_INVOICES);
}

export function isInvoiceUiEnabled() {
  return enabled(process.env.NEXT_PUBLIC_ENABLE_INVOICES);
}

export function isInvoiceFeatureEnabled() {
  return isInvoiceActionEnabled() && isInvoiceUiEnabled();
}
