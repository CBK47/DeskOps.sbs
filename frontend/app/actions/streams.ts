"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createStream as dbCreateStream, archiveStream as dbArchive } from "@/lib/db/streams";

// These actions redirect to their current page after a mutation. A redirect
// produces a fresh request and response without relying on implicit cache
// invalidation in the action response.

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
  const supabase = await createClient();
  const { error } = await supabase.rpc("seed_initial_streams");
  if (error) throw error;
  redirect("/streams");
}

export async function seedDemoWorkspaceAction() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("seed_demo_tickets");
  if (error) throw error;
  redirect("/queue");
}
