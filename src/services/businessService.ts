import type { SupabaseClient } from "@supabase/supabase-js";
import { monthKey } from "@/lib/utils";
import type {
  Business,
  BusinessProgress,
  BusinessTask,
  OnboardingData,
  ProgressEntry,
} from "@/types";
import type { BusinessResult } from "@/types";

interface CreateBusinessInput extends OnboardingData {
  result: BusinessResult;
  userId: string;
}

export async function createBusiness(
  supabase: SupabaseClient,
  input: CreateBusinessInput
): Promise<{ business: Business; tasks: BusinessTask[] } | null> {
  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
      user_id: input.userId,
      name: input.result.businessName,
      goal_monthly_revenue: input.monthlyGoal,
      current_monthly_revenue: 0,
      starting_budget: input.startingBudget,
      starting_budget_currency: input.currency,
      remaining_budget: input.startingBudget,
      customers: 0,
      hours_per_day: input.hoursPerDay,
      skills: input.skills,
      preferences: input.preferences,
      experience: input.experience,
      country: input.country,
      city: input.city,
      idea: input.result.businessIdea,
      problem_solved: input.result.problemSolved,
      target_customer: input.result.targetCustomer,
      offer: input.result.offer,
      pricing: input.result.pricing,
      startup_costs: input.result.startupCosts,
      revenue_model: input.result.revenueModel,
      reasoning: input.result.reasoning,
      realistic_timeline: input.result.realisticTimeline,
      marketing_strategy: input.result.marketingStrategy,
      risks: input.result.risks,
      next_action: input.result.nextAction,
    })
    .select()
    .single();

  if (error || !business) {
    console.error("Failed to create business:", error);
    return null;
  }

  const tasks = input.result.first30Days.map((task) => ({
    business_id: business.id,
    day: task.day,
    title: task.task,
    description: task.reason,
    reason: task.reason,
    status: "pending",
  }));

  const { data: createdTasks, error: tasksError } = await supabase
    .from("tasks")
    .insert(tasks)
    .select();

  if (tasksError || !createdTasks) {
    console.error("Failed to create tasks:", tasksError);
    return null;
  }

  const initialProgress = {
    business_id: business.id,
    month: monthKey(),
    revenue: 0,
    customers: 0,
  };
  const { error: progressError } = await supabase
    .from("progress")
    .insert(initialProgress);

  if (progressError) {
    console.error("Failed to create initial progress:", progressError);
  }

  return { business: business as Business, tasks: createdTasks as BusinessTask[] };
}

export async function getBusinesses(
  supabase: SupabaseClient,
  userId: string
): Promise<Business[]> {
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Business[];
}

export async function getBusiness(
  supabase: SupabaseClient,
  businessId: string,
  userId: string
): Promise<{ business: Business | null; tasks: BusinessTask[] }> {
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .eq("user_id", userId)
    .maybeSingle();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("business_id", businessId)
    .order("day", { ascending: true });

  return {
    business: (business ?? null) as Business | null,
    tasks: (tasks ?? []) as BusinessTask[],
  };
}

export function computeProgress(
  business: Business,
  tasks: BusinessTask[]
): BusinessProgress {
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const totalTasks = tasks.length;
  const percent =
    business.goal_monthly_revenue > 0
      ? Math.min(100, (business.current_monthly_revenue / business.goal_monthly_revenue) * 100)
      : 0;

  return {
    goal: business.goal_monthly_revenue,
    current: business.current_monthly_revenue,
    progressPercent: Math.round(percent),
    remaining: Math.max(0, business.goal_monthly_revenue - business.current_monthly_revenue),
    remainingBudget: business.remaining_budget,
    completedTasks,
    totalTasks,
  };
}

export async function updateRevenueCustomers(
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
  input: { revenue: number; customers: number }
): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .update({
      current_monthly_revenue: input.revenue,
      customers: input.customers,
    })
    .eq("id", businessId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) {
    console.error("Failed to update business progress:", error);
    return null;
  }

  // Create/update month entry for the dashboard chart
  const key = monthKey();
  const { data: existing } = await supabase
    .from("progress")
    .select("*")
    .eq("business_id", businessId)
    .eq("month", key)
    .maybeSingle();

  const progressEntry = {
    business_id: businessId,
    month: key,
    revenue: input.revenue,
    customers: input.customers,
  } satisfies Partial<ProgressEntry>;

  if (existing) {
    await supabase
      .from("progress")
      .update({ revenue: input.revenue, customers: input.customers })
      .eq("id", existing.id);
  } else {
    await supabase.from("progress").insert(progressEntry);
  }

  return data as Business;
}

export async function getMonthlyProgress(
  supabase: SupabaseClient,
  businessId: string
): Promise<ProgressEntry[]> {
  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("business_id", businessId)
    .order("month", { ascending: true })
    .limit(12);
  return (data ?? []) as ProgressEntry[];
}

export async function updateRemainingBudget(
  supabase: SupabaseClient,
  businessId: string,
  remainingBudget: number
) {
  return supabase
    .from("businesses")
    .update({ remaining_budget: Math.max(0, remainingBudget) })
    .eq("id", businessId);
}

export async function toggleTask(
  supabase: SupabaseClient,
  taskId: string,
  businessId: string,
  userId: string,
  completed: boolean
): Promise<BusinessTask | null> {
  const action = completed
    ? { status: "done", completed_at: new Date().toISOString() }
    : { status: "pending", completed_at: null };

  const { data, error } = await supabase
    .from("tasks")
    .update(action)
    .eq("id", taskId)
    .eq("business_id", businessId)
    .select()
    .single();

  if (error || !data) {
    console.error("Failed to toggle task:", error);
    return null;
  }

  // Only the owner can reach a business_id that matches. Verify ownership
  // defensively on the API layer too.
  void userId;
  return data as BusinessTask;
}
