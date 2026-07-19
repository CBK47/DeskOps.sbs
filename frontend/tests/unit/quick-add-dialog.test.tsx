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
    createTicketSafe.mockResolvedValue({ ok: true });
  });

  it("offers a stream setup path instead of an invalid ticket form", () => {
    render(<QuickAddDialog streams={[]} />);

    expect(screen.getByText("Create a stream first")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Set up a stream" })).toHaveAttribute("href", "/streams");
    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
  });

  it("lets the user edit an AI draft and add it with one ordinary submit action", async () => {
    render(<QuickAddDialog streams={[{ id: "stream-home", name: "Home" }]} />);

    const naturalLanguage = screen.getByLabelText("Describe it naturally");
    fireEvent.change(naturalLanguage, { target: { value: "renew the van insurance next Friday" } });
    fireEvent.click(screen.getByRole("button", { name: "Draft" }));

    await screen.findByText("I've drafted this. You decide.");
    expect(screen.getByText("Drafted for you. Edit or add.")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add ticket" }).filter((button) => button.getAttribute("type") === "submit")).toHaveLength(1);

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Renew van insurance after comparing quotes" } });
    fireEvent.submit(screen.getByLabelText("Title").closest("form") as HTMLFormElement);

    await waitFor(() => expect(createTicketSafe).toHaveBeenCalledOnce());
  });

  it("renders a calm inline retry message when the AI service is busy", async () => {
    draftTicketAction.mockResolvedValueOnce({
      ok: false,
      code: "rate_limited",
      error: "Busy moment. Try again shortly.",
    });

    render(<QuickAddDialog streams={[{ id: "stream-home", name: "Home" }]} />);

    fireEvent.change(screen.getByLabelText("Describe it naturally"), { target: { value: "renew the van insurance" } });
    fireEvent.click(screen.getByRole("button", { name: "Draft" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Busy moment. Try again shortly.");
    expect(toastError).not.toHaveBeenCalled();
  });
});
