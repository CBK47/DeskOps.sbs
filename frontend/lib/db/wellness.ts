import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/types.gen";

export type WellnessAssessment = Database["public"]["Tables"]["wellness_assessments"]["Row"];
export type WellnessEntry = Database["public"]["Tables"]["wellness_assessment_entries"]["Row"];
export type WellnessAssessmentWithEntries = WellnessAssessment & { entries: WellnessEntry[] };

export async function listWellnessAssessments(limit = 6): Promise<WellnessAssessmentWithEntries[]> {
  const supabase = await createServerSupabase();
  const { data: assessments, error } = await supabase
    .from("wellness_assessments")
    .select("*")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!assessments?.length) return [];

  const { data: entries, error: entriesError } = await supabase
    .from("wellness_assessment_entries")
    .select("*")
    .in("assessment_id", assessments.map((assessment) => assessment.id));

  if (entriesError) throw entriesError;
  const byAssessment = new Map<string, WellnessEntry[]>();
  for (const entry of entries ?? []) {
    const group = byAssessment.get(entry.assessment_id) ?? [];
    group.push(entry);
    byAssessment.set(entry.assessment_id, group);
  }

  return assessments.map((assessment) => ({
    ...assessment,
    entries: byAssessment.get(assessment.id) ?? [],
  }));
}

export async function getLatestWellnessAssessment() {
  return (await listWellnessAssessments(1))[0] ?? null;
}

export async function hasWellnessOnboardingDecision() {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from("wellness_assessments")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return (count ?? 0) > 0;
}
