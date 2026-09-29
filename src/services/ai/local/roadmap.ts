/**
 * Builds a complete 30-day business plan from onboarding answers, with no
 * network access and no API key.
 *
 * The plan is assembled from the model catalogue (what to do), the roadmap
 * templates (in what order) and the economics module (at what price) — so every
 * sentence is derived from the founder's own numbers rather than a generic
 * template.
 */

import type {
  BusinessPlanInput,
  BusinessPlanOutput,
  MarketingStrategy,
  RoadmapDay,
} from "./contracts";
import {
  buildBusinessName,
  modelCapacity,
  selectModel,
  type BusinessModel,
  type ModelScore,
} from "./businessModels";
import { MODEL_ROADMAPS } from "./roadmaps";
import {
  buildPricing,
  buildStartupCosts,
  buildTimeline,
  clientsRequired,
  explainPricing,
  isHighVolumeModel,
  type PlanPricing,
} from "./planEconomics";
import { formatMoney } from "./helpers";

const ROADMAP_DAYS = 30;
const GENERIC_REASON = "Keeping daily momentum on the plan";

const GENERIC_TASKS = [
  "Follow up with everyone who has not replied yet",
  "Publish one piece of proof about your work",
  "Talk to three potential customers today",
  "Improve the offer using the feedback you received",
  "Ask one happy contact for a referral",
  "Review your numbers and cut what is not working",
  "Reach out to five new prospects",
  "Improve the first thing a customer sees",
  "Plan tomorrow's outreach before you stop for the day",
  "Ask a customer what nearly stopped them buying",
];

interface DayDraft {
  task: string;
  reason: string;
}

/** Flattens the model's phase templates into a numbered 30-day list. */
function draftDays(model: BusinessModel): DayDraft[] {
  const template = MODEL_ROADMAPS[model.id];
  const drafts: DayDraft[] = [];

  if (!template) {
    console.error(`[ai] no roadmap template for model "${model.id}"`);
  } else {
    for (const phase of ["validate", "build", "launch", "scale"] as const) {
      const block = template[phase];
      if (!block) continue;
      const reason = block.reason || GENERIC_REASON;
      for (const task of block.tasks) drafts.push({ task, reason });
    }
    if (drafts.length !== ROADMAP_DAYS) {
      console.error(
        `[ai] roadmap for "${model.id}" has ${drafts.length} tasks, expected ${ROADMAP_DAYS}`
      );
    }
  }

  // Never ship a short plan: pad with generic momentum tasks.
  let index = 0;
  while (drafts.length < ROADMAP_DAYS) {
    drafts.push({
      task: GENERIC_TASKS[index % GENERIC_TASKS.length],
      reason: GENERIC_REASON,
    });
    index += 1;
  }

  return drafts.slice(0, ROADMAP_DAYS);
}

function buildMarketing(
  model: BusinessModel,
  input: BusinessPlanInput
): MarketingStrategy {
  const city = input.city?.trim() || "your area";
  return {
    channels: model.channels.slice(0, 4),
    contentIdeas: model.contentIdeas.slice(0, 3),
    outreachStrategy: `${model.outreachStrategy} Start with ${city}.`,
  };
}

function buildRisks(
  model: BusinessModel,
  input: BusinessPlanInput,
  capacity: number
): string[] {
  const risks = [...model.risks];

  if (input.monthlyGoal > capacity) {
    risks.unshift(
      `Your ${formatMoney(
        input.monthlyGoal,
        input.currency
      )} goal is above what one person can serve in this model — about ${formatMoney(
        capacity,
        input.currency
      )} a month — so it depends on raising prices or bringing in help.`
    );
  }
  if (input.startingBudget <= 0) {
    risks.push(
      "With no starting budget, growth is limited by how quickly the first sales bring in cash."
    );
  }
  if (input.hoursPerDay < model.minHoursPerDay) {
    risks.push(
      `This plan assumes about ${model.minHoursPerDay} hours a day; at ${input.hoursPerDay} it will take longer than 30 days.`
    );
  }
  if (input.experience === "Beginner") {
    risks.push(
      "Delivery quality is the biggest early risk — keep the first scope small and finish it well."
    );
  }

  return risks;
}

function buildReasoning(
  score: ModelScore,
  input: BusinessPlanInput,
  capacity: number,
  pricing: PlanPricing,
  clients: number
): string {
  const parts: string[] = [];
  const why =
    score.reasons.length > 0
      ? score.reasons.join(", ")
      : "it fits your budget and available hours";

  parts.push(`${score.model.label} was chosen because ${why}.`);

  if (input.monthlyGoal > capacity) {
    parts.push(
      `Your goal is ambitious for this model: solo capacity is around ${formatMoney(
        capacity,
        input.currency
      )} a month, so the plan raises your price and adds leverage rather than adding hours.`
    );
  } else {
    parts.push(
      explainPricing(
        score.model,
        input.monthlyGoal,
        pricing,
        clients,
        input.currency
      )
    );
  }

  if (input.startingBudget <= 0) {
    parts.push(
      "Because you are starting with no budget, every cost line has a free alternative until the first sale pays for the paid tools."
    );
  }

  return parts.join(" ");
}

/** Builds a full business plan deterministically from the founder's answers. */
export function buildBusinessPlan(
  input: BusinessPlanInput
): BusinessPlanOutput {
  const score = selectModel(input);
  const model = score.model;
  const capacity = modelCapacity(model);

  const pricing = buildPricing(model, input.monthlyGoal, input.currency);
  const clients = clientsRequired(model, input.monthlyGoal, pricing);
  const drafts = draftDays(model);

  const first30Days: RoadmapDay[] = drafts.map((draft, index) => ({
    day: index + 1,
    task: draft.task,
    reason: draft.reason,
  }));

  const city = input.city?.trim() || "your area";
  const unitLabel = isHighVolumeModel(model)
    ? `${formatMoney(pricing.setup ?? 0, input.currency)} per sale`
    : `${formatMoney(pricing.monthly ?? 0, input.currency)} per client per month`;

  return {
    businessName: buildBusinessName(model, input, `${model.id}:${city}`),
    businessIdea: `${model.idea} You would run it from ${city}.`,
    problemSolved: model.problemSolved,
    targetCustomer: `${model.targetCustomer} Start with ${city}.`,
    offer: model.offer,
    pricing,
    startupCosts: buildStartupCosts(model, input.startingBudget),
    revenueModel: `${model.revenueModel} Plan for ${unitLabel}.`,
    reasoning: buildReasoning(score, input, capacity, pricing, clients),
    realisticTimeline: buildTimeline({
      goal: input.monthlyGoal,
      capacity,
      pricing,
      model,
      currency: input.currency,
    }),
    first30Days,
    marketingStrategy: buildMarketing(model, input),
    risks: buildRisks(model, input, capacity),
    nextAction: `Today: ${first30Days[0]?.task ?? "write down your offer"}.`,
  };
}
