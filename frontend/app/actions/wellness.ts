"use server";

import { redirect } from "next/navigation";
import type { Json } from "@/lib/db/types.gen";
import { createClient } from "@/lib/supabase/server";
import { validateAssessment, type WellnessAssessmentInput } from "@/lib/wellness-assessment";

export async function saveWellnessAssessmentAction(input: WellnessAssessmentInput) {
  const validated = validateAssessment(input);
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_wellness_assessment", {
    p_entries: validated.entries as unknown as Json,
    p_reminder: validated.reminder,
    p_custom_reminder_days: validated.customReminderDays,
  });
  if (error) throw new Error("DeskOps could not save this private snapshot. Please try again.");
  redirect("/wellness?completed=1");
}

export async function skipWellnessAssessmentAction() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("skip_wellness_assessment");
  if (error) throw new Error("DeskOps could not save your choice. Please try again.");
  redirect("/queue");
}
