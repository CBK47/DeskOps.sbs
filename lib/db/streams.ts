import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/types.gen";

export type Stream = Database["public"]["Tables"]["streams"]["Row"];
export type StreamInsert = Database["public"]["Tables"]["streams"]["Insert"];
export type LifeDomain = Database["public"]["Enums"]["life_domain"];

export function sortStreamsForPicker<T extends Pick<Stream, "name" | "archived">>(streams: T[]): T[] {
  return [...streams].sort((a, b) => {
    if (a.archived !== b.archived) return a.archived ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
}

export async function listStreams(): Promise<Stream[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("streams").select("*");
  if (error) throw error;
  return sortStreamsForPicker(data ?? []);
}

export async function createStream(input: { name: string; color?: string }): Promise<Stream> {
  const supabase = createServerSupabase();
  // Pre-check for a duplicate name instead of catching the Postgres unique
  // violation after the fact — Next's redirect() must never be reachable
  // from a code path that also has a try/catch in the same function (its
  // own docs warn about this), and having one crashed this action's
  // subsequent redirect() on Cloudflare's edge runtime even though the
  // insert itself always succeeded.
  const { data: existing } = await supabase
    .from("streams")
    .select("id")
    .eq("name", input.name)
    .maybeSingle();
  if (existing) throw new Error(`A stream named "${input.name}" already exists.`);

  // user_id defaults to auth.uid() at the DB level — no need to fetch the
  // user client-side first (that extra getUser() call was ALSO crashing
  // Server Actions that redirect(), see migration 20260703000001).
  // Omit color when undefined so the DB default ('slate') takes over.
  const { data, error } = await supabase
    .from("streams")
    .insert({ name: input.name, color: input.color })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function archiveStream(id: string, archived: boolean): Promise<Stream> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("streams")
    .update({ archived })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
