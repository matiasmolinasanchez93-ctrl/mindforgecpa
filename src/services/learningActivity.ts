import type { SupabaseClient } from "@supabase/supabase-js";

export async function saveToolActivity(
  supabase: SupabaseClient, userId: string,
  feature: "prompt_builder" | "fact_checker", title: string, preview: string
): Promise<boolean> {
  // Tool usage is activity, not a graded answer: no invented score or XP.
  const { error } = await supabase.from("activity_attempts").insert({
    student_id: userId, activity_type: feature, activity_title: title.slice(0, 160),
    subject: "General", score: 0, xp_earned: 0, hints_used: 0, was_independent: false,
    details: { source: "tool", preview: preview.slice(0, 8000) },
  });
  if (error) console.warn("[activity] could not save tool use:", error.message);
  return !error;
}
