"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createStream as dbCreateStream, archiveStream as dbArchive } from "@/lib/db/streams";

// These redirect to the page they're already on instead of calling
// revalidatePath — the RSC-payload-in-response that revalidatePath
// triggers doesn't reliably survive next-on-pages' edge runtime (see
// app/actions/tickets.ts createTicketSafe for the full story). A redirect
// to the same path forces a genuine fresh request/response instead.

export async function createStreamAction(formData: FormData) {
  const name  = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "slate");
  if (!name) throw new Error("Name is required");

  // Duplicate-name detection lives in createStream() as a pre-check —
  // see its comment for why this action must not wrap the insert in a
  // try/catch (redirect() below has to stay reachable, uncaught).
  await dbCreateStream({ name, color });

  redirect("/streams");
}

export async function archiveStreamAction(id: string, archived: boolean) {
  await dbArchive(id, archived);
  redirect("/streams");
}

export async function seedInitialStreamsAction() {
  const supabase = createClient();
  const { error } = await supabase.rpc("seed_initial_streams");
  if (error) throw error;
  redirect("/streams");
}
