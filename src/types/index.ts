import { z } from "zod";

// ─── Education Platform Types ────────────────────────────────

export type UserRole = "student" | "teacher";

export type Subject =
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "History"
  | "Economics"
  | "English"
  | "General";

export type Difficulty = "easy" | "medium" | "hard";

export type ActivityType =
  | "ai_detective"
  | "prompt_battle"
  | "solve_it"
  | "explain_it"
  | "fact_check";

// ─── Database row types ──────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  onboarding_completed: boolean;
  xp: number;
  level: number;
  streak: number;
  last_active_date: string | null;
  grade: string;
  school_name: string;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  subject: string;
  join_code: string;
  created_at: string;
}

export interface ClassMember {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_name: string;
  score: number;
  total_attempts: number;
  independent_correct: number;
  updated_at: string;
}

export interface AiSession {
  id: string;
  student_id: string;
  /** Derived from the student's first question, or renamed by them. */
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  created_at: string;
  updated_at: string;
}

export interface AiSessionMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  hints_used: number;
  created_at: string;
}

/** A conversation as shown in the sidebar and on the dashboard. */
export interface ConversationSummary {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  created_at: string;
  updated_at: string;
  /** Number of stored messages, used to show progress without loading them. */
  messageCount: number;
}

/** A message as rendered in the chat transcript. */
export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ActivityAttempt {
  id: string;
  student_id: string;
  activity_type: string;
  activity_title: string;
  subject: string;
  score: number;
  xp_earned: number;
  hints_used: number;
  was_independent: boolean;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  created_at: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string;
  activity_type: string;
  subject: string;
  difficulty: string;
  due_date: string | null;
  created_at: string;
}

// ─── Skill display names ─────────────────────────────────────

export const SKILL_DISPLAY_NAMES: Record<string, string> = {
  ai_literacy: "Alfabetización en IA",
  critical_thinking: "Pensamiento crítico",
  problem_solving: "Resolución de problemas",
  research: "Investigación",
  verification: "Verificación",
  ai_independence: "Independencia de la IA",
};

export const ALL_SKILLS = [
  "ai_literacy",
  "critical_thinking",
  "problem_solving",
  "research",
  "verification",
  "ai_independence",
] as const;

export type SkillKey = (typeof ALL_SKILLS)[number];

// ─── Gamification helpers ────────────────────────────────────

export function xpForLevel(level: number): number {
  return level * 100;
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpNeeded = 100;
  let xpAccumulated = 0;
  while (xpAccumulated + xpNeeded <= totalXp) {
    xpAccumulated += xpNeeded;
    level++;
    xpNeeded = level * 100;
  }
  return level;
}

export function xpProgressInLevel(totalXp: number): {
  currentLevelXp: number;
  neededForNext: number;
  percent: number;
} {
  let level = 1;
  let xpNeeded = 100;
  let xpAccumulated = 0;
  while (xpAccumulated + xpNeeded <= totalXp) {
    xpAccumulated += xpNeeded;
    level++;
    xpNeeded = level * 100;
  }
  const currentLevelXp = totalXp - xpAccumulated;
  return {
    currentLevelXp,
    neededForNext: xpNeeded,
    percent: Math.round((currentLevelXp / xpNeeded) * 100),
  };
}

// ─── Legacy types (kept for backward compatibility) ──────────

export type Skill =
  | "Sales"
  | "Marketing"
  | "Programming"
  | "Design"
  | "Video editing"
  | "Social media"
  | "Writing"
  | "Finance"
  | "Communication"
  | "Other";

export type BusinessPreference =
  | "Online business"
  | "Local business"
  | "Service business"
  | "Product business"
  | "Digital product"
  | "Doesn't matter";

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export type Currency = "USD" | "GTQ" | "EUR" | "MXN" | "COP" | "PEN" | "ARS" | "Other";

export interface OnboardingData {
  monthlyGoal: number;
  currency: Currency;
  startingBudget: number;
  hoursPerDay: number;
  skills: Skill[];
  preferences: BusinessPreference[];
  experience: ExperienceLevel;
  country: string;
  city: string;
}

export const pricingSchema = z.object({
  setup: z.number().optional(),
  monthly: z.number().optional(),
  currency: z.string(),
});

export const startupCostSchema = z.object({
  item: z.string(),
  estimatedCost: z.number(),
});

export const roadmapTaskSchema = z.object({
  day: z.number().int().min(1).max(30),
  task: z.string(),
  reason: z.string(),
});

export const businessResultSchema = z.object({
  businessName: z.string(),
  businessIdea: z.string(),
  problemSolved: z.string(),
  targetCustomer: z.string(),
  offer: z.string(),
  pricing: pricingSchema,
  startupCosts: z.array(startupCostSchema),
  revenueModel: z.string(),
  reasoning: z.string(),
  realisticTimeline: z.string(),
  first30Days: z.array(roadmapTaskSchema),
  marketingStrategy: z.object({
    channels: z.array(z.string()),
    contentIdeas: z.array(z.string()),
    outreachStrategy: z.string(),
  }),
  risks: z.array(z.string()),
  nextAction: z.string(),
});

export type BusinessResult = z.infer<typeof businessResultSchema>;

export interface Business {
  id: string;
  user_id: string;
  name: string;
  goal_monthly_revenue: number;
  current_monthly_revenue: number;
  starting_budget: number;
  starting_budget_currency: string;
  remaining_budget: number;
  customers: number;
  hours_per_day: number;
  skills: string[];
  preferences: string[];
  experience: string;
  country: string;
  city: string;
  idea: string;
  problem_solved: string;
  target_customer: string;
  offer: string;
  pricing: { setup?: number; monthly?: number; currency: string };
  startup_costs: { item: string; estimatedCost: number }[];
  revenue_model: string;
  reasoning: string;
  realistic_timeline: string;
  marketing_strategy: {
    channels: string[];
    contentIdeas: string[];
    outreachStrategy: string;
  };
  risks: string[];
  next_action: string;
  status: "active" | "paused" | "completed";
  created_at: string;
}

export type TaskStatus = "pending" | "done";

export interface BusinessTask {
  id: string;
  business_id: string;
  day: number;
  title: string;
  description: string;
  reason: string;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
}

export interface ProgressEntry {
  id: string;
  business_id: string;
  recorded_at: string;
  month: string;
  revenue: number;
  customers: number;
}

export interface CoachMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface BusinessProgress {
  goal: number;
  current: number;
  progressPercent: number;
  remaining: number;
  remainingBudget: number;
  completedTasks: number;
  totalTasks: number;
}
