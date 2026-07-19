import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, select, eq, order } = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ from }),
}));

import { listCompletedTicketsForStream } from "@/lib/db/tickets";

describe("listCompletedTicketsForStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    from.mockReturnValue({ select });
    select.mockReturnValue({ eq });
    eq.mockReturnValue({ eq, order });
    order.mockResolvedValue({ data: [], error: null });
  });

  it("only includes completed tickets in an eligible Occupational invoice draft", async () => {
    await expect(listCompletedTicketsForStream("career-stream")).resolves.toEqual([]);

    expect(from).toHaveBeenCalledWith("tickets");
    expect(select).toHaveBeenCalledWith("*");
    expect(eq).toHaveBeenNthCalledWith(1, "stream_id", "career-stream");
    expect(eq).toHaveBeenNthCalledWith(2, "status", "done");
    expect(order).toHaveBeenCalledWith("closed_at", { ascending: false, nullsFirst: false });
  });
});
