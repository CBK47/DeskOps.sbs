"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createStream as dbCreateStream, archiveStream as dbArchive } from "@/lib/db/streams";

const STREAM_COLORS = new Set([
  "slate", "sky", "amber", "orange", "stone", "indigo", "emerald",
  "rose", "lime", "pink", "red", "cyan", "violet",
]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// These actions redirect to their current page after a mutation. A redirect
// produces a fresh request and response without relying on implicit cache
// invalidation in the action response.

export async function createStreamAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const requestedColor = String(formData.get("color") ?? "slate");
  const color = STREAM_COLORS.has(requestedColor) ? requestedColor : "slate";

  if (!name) redirectWithMessage("error", "Enter a stream name.");
  if (name.length > 80) redirectWithMessage("error", "Keep the stream name to 80 characters or fewer.");

  let errorMessage: string | null = null;
  try {
    await dbCreateStream({ name, color });
  } catch (error) {
    errorMessage = friendlyStreamError(error, "DeskOps could not add that stream. Please try again.");
  }

  if (errorMessage) redirectWithMessage("error", errorMessage);
  redirectWithMessage("notice", "Stream added.");
}

export async function archiveStreamAction(id: string, archived: boolean) {
  if (!UUID_PATTERN.test(id)) redirectWithMessage("error", "That stream could not be found.");

  let errorMessage: string | null = null;
  try {
    await dbArchive(id, archived);
  } catch (error) {
    errorMessage = friendlyStreamError(error, `DeskOps could not ${archived ? "archive" : "restore"} that stream. Please try again.`);
  }

  if (errorMessage) redirectWithMessage("error", errorMessage);
  redirectWithMessage("notice", archived ? "Stream archived." : "Stream restored.");
}

export async function seedInitialStreamsAction() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("seed_initial_streams");
  if (error) redirectWithMessage("error", "DeskOps could not create the starter streams. Please try again.");
  redirectWithMessage("notice", "Starter streams added.");
}

export async function seedDemoWorkspaceAction() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("seed_demo_tickets");
  if (error) redirectWithMessage("error", "DeskOps could not set up the demo workspace. Please try again.");
  redirect("/queue");
}

function redirectWithMessage(kind: "error" | "notice", message: string): never {
  redirect(`/streams?${kind}=${encodeURIComponent(message)}`);
}

function friendlyStreamError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.includes("already exists")) return error.message;
  return fallback;
}
