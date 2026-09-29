/**
 * Types shared by the deterministic local engines.
 *
 * This module deliberately imports nothing — not even from the app — so the
 * engines stay runnable and testable in isolation, and so a change to a UI type
 * can never silently alter engine behaviour.
 */

// ─── Business plan ───────────────────────────────────────────

export interface BusinessPlanInput {
  monthlyGoal: number;
  currency: string;
  startingBudget: number;
  hoursPerDay: number;
  skills: string[];
  preferences: string[];
  experience: string;
  country: string;
  city: string;
}

export interface RoadmapDay {
  day: number;
  task: string;
  reason: string;
}

export interface StartupCost {
  item: string;
  estimatedCost: number;
}

export interface MarketingStrategy {
  channels: string[];
  contentIdeas: string[];
  outreachStrategy: string;
}

export interface BusinessPlanOutput {
  businessName: string;
  businessIdea: string;
  problemSolved: string;
  targetCustomer: string;
  offer: string;
  pricing: { setup?: number; monthly?: number; currency: string };
  startupCosts: StartupCost[];
  revenueModel: string;
  reasoning: string;
  realisticTimeline: string;
  first30Days: RoadmapDay[];
  marketingStrategy: MarketingStrategy;
  risks: string[];
  nextAction: string;
}

// ─── Coach ───────────────────────────────────────────────────

export interface CoachContext {
  businessName: string;
  businessIdea: string;
  targetCustomer: string;
  offer: string;
  /** Structured pricing so the coach can reason about unit economics. */
  pricing: { setup?: number; monthly?: number; currency: string };
  revenueModel: string;
  country: string;
  city: string;
  experience: string;
  skills: string[];
  preferences: string[];
  hoursPerDay: number;
  currency: string;
  goalMonthlyRevenue: number;
  currentMonthlyRevenue: number;
  startingBudget: number;
  remainingBudget: number;
  customers: number;
  completedTasks: number;
  totalTasks: number;
  recentMonths: { month: string; revenue: number; customers: number }[];
  first30Days: RoadmapDay[];
}

export interface CoachInput {
  message: string;
  context: CoachContext;
}

// ─── Tutor ───────────────────────────────────────────────────

export interface TutorTurn {
  role: "user" | "assistant";
  content: string;
}

export interface TutorInput {
  history: TutorTurn[];
  subject: string;
  topic: string;
  difficulty: string;
}

// ─── Challenges ──────────────────────────────────────────────

export interface ChallengeInput {
  type: string;
  subject: string;
  difficulty: string;
  /** Varies the returned variant so repeated requests produce a new problem. */
  seed?: string;
}

export interface ChallengeOutput {
  title: string;
  description: string;
  content: string;
  options?: string[];
  correctAnswer: string;
  hints: string[];
  explanation: string;
  xpBase: number;
}

// ─── Fact check ──────────────────────────────────────────────

export type ClaimStatus =
  | "likely_accurate"
  | "needs_verification"
  | "likely_inaccurate"
  | "uncertain";

export interface ClaimAssessment {
  statement: string;
  status: ClaimStatus;
  explanation: string;
  suggestedVerification: string;
}

export interface FactCheckOutput {
  overallAssessment: string;
  claims: ClaimAssessment[];
  keyWarnings: string[];
  questionsToInvestigate: string[];
  confidenceNote: string;
}

// ─── Prompt builder ──────────────────────────────────────────

export interface PromptBuildInput {
  goal: string;
  context: string;
  constraints: string;
  outputFormat: string;
}

export interface PromptBuildOutput {
  optimizedPrompt: string;
  explanation: string;
  whyGood: string[];
  tips: string[];
}
