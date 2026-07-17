import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/types.gen";
import { toLondonIsoDate } from "@/lib/dates";

export type Ticket          = Database["public"]["Tables"]["tickets"]["Row"];
export type TicketInsert    = Database["public"]["Tables"]["tickets"]["Insert"];
export type TicketStatus    = Database["public"]["Enums"]["ticket_status"];
export type TicketPriority  = Database["public"]["Enums"]["ticket_priority"];
export type RecurrenceRule  = Database["public"]["Enums"]["recurrence_rule"];

export type DueWindow = "any" | "overdue" | "today" | "week" | "later" | "none";

export type TicketFilters = {
  status:     TicketStatus[];
  streamIds:  string[];
  priorities: TicketPriority[];
  due:        DueWindow;
};

const ALL_STATUSES: TicketStatus[] = ["open", "in_progress", "done", "cancelled"];
const ALL_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];
const ALL_DUE: DueWindow[] = ["any", "overdue", "today", "week", "later", "none"];

export function parseTicketFilters(params: URLSearchParams): TicketFilters {
  const statusParam = params.getAll("status").filter((s): s is TicketStatus => ALL_STATUSES.includes(s as TicketStatus));
  const status      = statusParam.length ? statusParam : (["open", "in_progress"] as TicketStatus[]);
  const streamIds   = params.getAll("stream");
  const priorities  = params.getAll("priority").filter((p): p is TicketPriority => ALL_PRIORITIES.includes(p as TicketPriority));
  const dueRaw      = params.get("due") ?? "any";
  const due         = (ALL_DUE.includes(dueRaw as DueWindow) ? dueRaw : "any") as DueWindow;
  return { status, streamIds, priorities, due };
}

export function dueDateBounds(window: Exclude<DueWindow, "any" | "none">, now = new Date()) {
  const today = toLondonIsoDate(now);
  if (window === "overdue" || window === "today") return { today };

  return { today, weekEnd: addCalendarDays(today, 7) };
}

export async function listTickets(filters: TicketFilters): Promise<(Ticket & { stream: { id: string; name: string; color: string } })[]> {
  const supabase = createServerSupabase();
  let q = supabase
    .from("tickets")
    .select("*, stream:streams(id, name, color)")
    .in("status", filters.status)
    .order("due_date",  { ascending: true,  nullsFirst: false })
    .order("priority",  { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.streamIds.length)  q = q.in("stream_id", filters.streamIds);
  if (filters.priorities.length) q = q.in("priority",  filters.priorities);

  switch (filters.due) {
    case "overdue": q = q.lt("due_date", dueDateBounds("overdue").today); break;
    case "today":   q = q.eq("due_date", dueDateBounds("today").today); break;
    case "week": {
      const { today, weekEnd } = dueDateBounds("week");
      q = q.gte("due_date", today).lte("due_date", weekEnd);
      break;
    }
    case "later":   q = q.gt("due_date", dueDateBounds("later").weekEnd); break;
    case "none":    q = q.is("due_date", null); break;
    case "any":     break;
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as (Ticket & { stream: { id: string; name: string; color: string } })[];
}

function addCalendarDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function countAllTickets(): Promise<number> {
  const supabase = createServerSupabase();
  const { count, error } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function getTicket(id: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select("*, stream:streams(id, name, color)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;  // Ticket-with-stream object, or null when no row matched
}

export async function listClosedTicketsForStream(streamId: string): Promise<Ticket[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("stream_id", streamId)
    .in("status", ["done", "cancelled"])
    .order("closed_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTicket(input: Omit<TicketInsert, "user_id">): Promise<Ticket> {
  const supabase = createServerSupabase();
  // user_id defaults to auth.uid() at the DB level — no need to fetch the
  // user client-side first (that extra getUser() call was crashing Server
  // Actions that also redirect(), see migration 20260703000001).
  const { data, error } = await supabase
    .from("tickets")
    .insert({ ...input })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateTicket(id: string, patch: Partial<Pick<Ticket, "title" | "notes" | "stream_id" | "status" | "priority" | "due_date" | "recurrence">>): Promise<Ticket> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("tickets").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteTicket(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) throw error;
}
