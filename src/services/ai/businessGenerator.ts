/**
 * Business plan generation.
 *
 * Asks a configured remote provider for a structured plan and validates it
 * strictly. When no provider is available — or the reply fails validation — the
 * deterministic local planner produces the plan instead, so this feature always
 * returns something usable.
 */

import {
  businessResultSchema,
  type BusinessResult,
  type OnboardingData,
} from "@/types";
import { ROADMAP_DAYS } from "@/lib/constants";
import { buildBusinessPrompt, SYSTEM_PROMPT } from "./prompts";
import { generateStructured } from "./provider";
import { buildBusinessPlan } from "./local/roadmap";

export class BusinessGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessGenerationError";
  }
}

/** Pads or trims a roadmap so it is always exactly 30 days, numbered in order. */
function normalizeRoadmap(result: BusinessResult): BusinessResult {
  const byDay = new Map<number, BusinessResult["first30Days"][number]>();
  result.first30Days.forEach((task) => {
    const day = Math.min(ROADMAP_DAYS, Math.max(1, Math.round(task.day)));
    byDay.set(day, { ...task, day });
  });

  const first30Days = Array.from({ length: ROADMAP_DAYS }, (_, index) => {
    const day = index + 1;
    return (
      byDay.get(day) ?? {
        day,
        task: "Follow up with everyone who has not replied yet",
        reason: "Keeping daily momentum on the plan",
      }
    );
  });

  return {
    ...result,
    first30Days,
    startupCosts: result.startupCosts.map((cost) => ({
      ...cost,
      estimatedCost: Math.max(0, Math.round(cost.estimatedCost)),
    })),
  };
}

/** Validates raw model output, returning null when it cannot be used. */
function parsePlan(raw: unknown): BusinessResult | null {
  const parsed = businessResultSchema.safeParse(raw);
  if (!parsed.success) return null;
  if (parsed.data.first30Days.length !== ROADMAP_DAYS) return null;
  return normalizeRoadmap(parsed.data);
}

function onboardingToPlanInput(input: OnboardingData) {
  return {
    monthlyGoal: input.monthlyGoal,
    currency: input.currency,
    startingBudget: input.startingBudget,
    hoursPerDay: input.hoursPerDay,
    skills: [...input.skills],
    preferences: [...input.preferences],
    experience: input.experience,
    country: input.country,
    city: input.city,
  };
}

export async function generateBusiness(
  input: OnboardingData
): Promise<BusinessResult> {
  const result = await generateStructured<BusinessResult>({
    request: {
      context: { feature: "business_plan" },
      system: SYSTEM_PROMPT,
      user: buildBusinessPrompt(input),
      temperature: 0.6,
      maxTokens: 4096,
    },
    parse: parsePlan,
    local: () => {
      const plan = buildBusinessPlan(onboardingToPlanInput(input));
      const validated = businessResultSchema.safeParse(plan);
      if (!validated.success) {
        // A failure here is a bug in the local planner, not user input.
        console.error(
          "[ai] local business plan failed validation",
          validated.error.issues
        );
        throw new BusinessGenerationError(
          "We couldn’t build your plan. Please try again."
        );
      }
      return normalizeRoadmap(validated.data);
    },
  });

  return result.data;
}
