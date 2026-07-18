import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const draftTicketAction = vi.fn();
const createTicketSafe = vi.fn();
const routerRefresh = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
  usePathname: () => "/queue",
}));

vi.mock("@/app/actions/agent", () => ({
  draftTicketAction: (...args: unknown[]) => draftTicketAction(...args),
}));

vi.mock("@/app/actions/tickets", () => ({
  createTicketSafe: (...args: unknown[]) => createTicketSafe(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, name, value }: { children: React.ReactNode; name?: string; value?: string }) => (
    <div>
      {name ? <input type="hidden" name={name} value={value ?? ""} readOnly /> : null}
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder ?? ""}</span>,
}));

import { QuickAddDialog } from "@/components/ticket/QuickAddDialog";

describe("QuickAddDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    draftTicketAction.mockResolvedValue({
      ok: true,
      draft: {
        title: "Renew the van insurance",
        notes: "",
        priority: "high",
        recurrence: "none",
        due_date: "2026-07-24",
        stream_id: "stream-home",
        suggested_stream_name: "Home",
      },
    });
  });

  it("offers a stream setup path instead of an invalid ticket form", () => {
    render(<QuickAddDialog streams={[]} />);

    expect(screen.getByText("Create a stream first")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Set up a stream" })).toHaveAttribute("href", "/streams");
    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
  });

  it("requires a fresh AI draft when the natural-language source changes", async () => {
    render(<QuickAddDialog streams={[{ id: "stream-home", name: "Home" }]} />);

    const naturalLanguage = screen.getByLabelText("Describe it naturally");
    fireEvent.change(naturalLanguage, { target: { value: "renew the van insurance next Friday" } });
    fireEvent.click(screen.getByRole("button", { name: "Draft" }));

    await screen.findByText("AI draft ready for your review");

    const reviewCheckbox = screen.getByLabelText("I have reviewed this AI draft.");
    fireEvent.click(reviewCheckbox);
    expect(reviewCheckbox).toBeChecked();

    fireEvent.change(naturalLanguage, { target: { value: "renew the van insurance next month instead" } });

    expect(screen.getByText("The description changed after this draft was generated. Redraft before adding the ticket.")).toBeInTheDocument();
    expect(reviewCheckbox).not.toBeChecked();
    expect(reviewCheckbox).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redraft" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm and add ticket" })).toBeDisabled();

    fireEvent.submit(screen.getByRole("button", { name: "Confirm and add ticket" }).closest("form") as HTMLFormElement);

    expect(createTicketSafe).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith("Redraft the AI ticket after changing the description.");
  });

  it("re-enables review after the user redrafts the updated description", async () => {
    draftTicketAction
      .mockResolvedValueOnce({
        ok: true,
        draft: {
          title: "Renew the van insurance",
          notes: "",
          priority: "high",
          recurrence: "none",
          due_date: "2026-07-24",
          stream_id: "stream-home",
          suggested_stream_name: "Home",
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        draft: {
          title: "Renew the van insurance in August",
          notes: "",
          priority: "medium",
          recurrence: "none",
          due_date: "2026-08-14",
          stream_id: "stream-home",
          suggested_stream_name: "Home",
        },
      });

    render(<QuickAddDialog streams={[{ id: "stream-home", name: "Home" }]} />);

    const naturalLanguage = screen.getByLabelText("Describe it naturally");
    fireEvent.change(naturalLanguage, { target: { value: "renew the van insurance next Friday" } });
    fireEvent.click(screen.getByRole("button", { name: "Draft" }));
    await screen.findByDisplayValue("Renew the van insurance");

    fireEvent.click(screen.getByLabelText("I have reviewed this AI draft."));
    fireEvent.change(naturalLanguage, { target: { value: "renew the van insurance in August" } });

    fireEvent.click(screen.getByRole("button", { name: "Redraft" }));

    await waitFor(() => expect(screen.getByDisplayValue("Renew the van insurance in August")).toBeInTheDocument());

    const reviewCheckbox = screen.getByLabelText("I have reviewed this AI draft.");
    expect(reviewCheckbox).toBeEnabled();
    expect(reviewCheckbox).not.toBeChecked();
    expect(screen.getByText("Any change requires you to confirm your review again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm and add ticket" })).toBeDisabled();
  });
});
