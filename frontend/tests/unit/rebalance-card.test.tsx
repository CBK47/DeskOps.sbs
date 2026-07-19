import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  draftRebalanceAction: vi.fn(),
  createTicketSafe: vi.fn(),
  refresh: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/app/actions/agent", () => ({ draftRebalanceAction: mocks.draftRebalanceAction }));
vi.mock("@/app/actions/tickets", () => ({ createTicketSafe: mocks.createTicketSafe }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

import { RebalanceCard } from "@/components/rebalance/RebalanceCard";

const stream = { id: "11111111-1111-4111-8111-111111111111", name: "Home" };
const selection = {
  assessment_id: "assessment-1",
  dimension: "physical" as const,
  label: "Physical",
  current_rating: 4,
  desired_rating: 8,
  gap: 4,
  focus_state: "active_focus" as const,
  areas: ["Fitness and movement"],
  rated_at: "2026-07-18T12:00:00.000Z",
};

describe("RebalanceCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    mocks.draftRebalanceAction.mockResolvedValue({
      ok: true,
      dimension: "physical",
      draft: {
        title: "Take a ten-minute walk",
        notes: "Choose a comfortable route and leave the rest of the hour open.",
        stream_id: stream.id,
        suggested_stream_name: stream.name,
      },
    });
    mocks.createTicketSafe.mockResolvedValue({ ok: true });
  });

  it("lets the user edit the one suggestion and add it with one action", async () => {
    render(<RebalanceCard assessmentId="assessment-add" selection={selection} streams={[stream]} />);

    await screen.findByText("Take a ten-minute walk");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Title")).toHaveFocus();
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Walk around the block" } });
    fireEvent.click(screen.getByRole("button", { name: "Add ticket" }));

    await waitFor(() => expect(mocks.createTicketSafe).toHaveBeenCalledOnce());
    const formData = mocks.createTicketSafe.mock.calls[0][1] as FormData;
    expect(formData.get("title")).toBe("Walk around the block");
    expect(formData.get("priority")).toBe("low");
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Rebalance ticket added");
  });

  it("dismisses the suggestion for the browser session", async () => {
    render(<RebalanceCard assessmentId="assessment-dismiss" selection={selection} streams={[stream]} />);

    await screen.findByText("Take a ten-minute walk");
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));

    expect(screen.queryByText("One thing to rebalance")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem("deskops:rebalance:assessment-dismiss")).toBe("dismissed");
    expect(mocks.createTicketSafe).not.toHaveBeenCalled();
  });

  it("offers a working retry after a calm transient failure", async () => {
    mocks.draftRebalanceAction
      .mockResolvedValueOnce({ ok: false, code: "temporarily_unavailable", error: "Busy moment. Try again shortly." })
      .mockResolvedValueOnce({
        ok: true,
        dimension: "physical",
        draft: {
          title: "Take a ten-minute walk",
          notes: "Choose a comfortable route.",
          stream_id: stream.id,
          suggested_stream_name: stream.name,
        },
      });

    render(<RebalanceCard assessmentId="assessment-retry" selection={selection} streams={[stream]} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Busy moment. Try again shortly.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Take a ten-minute walk")).toBeInTheDocument();
    expect(mocks.draftRebalanceAction).toHaveBeenCalledTimes(2);
  });
});
