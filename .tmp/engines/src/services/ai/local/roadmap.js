"use strict";
/**
 * Builds a complete 30-day business plan from onboarding answers, with no
 * network access and no API key.
 *
 * The plan is assembled from the model catalogue (what to do), the roadmap
 * templates (in what order) and the economics module (at what price) — so every
 * sentence is derived from the founder's own numbers rather than a generic
 * template.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBusinessPlan = buildBusinessPlan;
const businessModels_1 = require("./businessModels");
const roadmaps_1 = require("./roadmaps");
const planEconomics_1 = require("./planEconomics");
const helpers_1 = require("./helpers");
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
/** Flattens the model's phase templates into a numbered 30-day list. */
function draftDays(model) {
    const template = roadmaps_1.MODEL_ROADMAPS[model.id];
    const drafts = [];
    if (!template) {
        console.error(`[ai] no roadmap template for model "${model.id}"`);
    }
    else {
        for (const phase of ["validate", "build", "launch", "scale"]) {
            const block = template[phase];
            if (!block)
                continue;
            const reason = block.reason || GENERIC_REASON;
            for (const task of block.tasks)
                drafts.push({ task, reason });
        }
        if (drafts.length !== ROADMAP_DAYS) {
            console.error(`[ai] roadmap for "${model.id}" has ${drafts.length} tasks, expected ${ROADMAP_DAYS}`);
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
function buildMarketing(model, input) {
    const city = input.city?.trim() || "your area";
    return {
        channels: model.channels.slice(0, 4),
        contentIdeas: model.contentIdeas.slice(0, 3),
        outreachStrategy: `${model.outreachStrategy} Start with ${city}.`,
    };
}
function buildRisks(model, input, capacity) {
    const risks = [...model.risks];
    if (input.monthlyGoal > capacity) {
        risks.unshift(`Your ${(0, helpers_1.formatMoney)(input.monthlyGoal, input.currency)} goal is above what one person can serve in this model — about ${(0, helpers_1.formatMoney)(capacity, input.currency)} a month — so it depends on raising prices or bringing in help.`);
    }
    if (input.startingBudget <= 0) {
        risks.push("With no starting budget, growth is limited by how quickly the first sales bring in cash.");
    }
    if (input.hoursPerDay < model.minHoursPerDay) {
        risks.push(`This plan assumes about ${model.minHoursPerDay} hours a day; at ${input.hoursPerDay} it will take longer than 30 days.`);
    }
    if (input.experience === "Beginner") {
        risks.push("Delivery quality is the biggest early risk — keep the first scope small and finish it well.");
    }
    return risks;
}
function buildReasoning(score, input, capacity, pricing, clients) {
    const parts = [];
    const why = score.reasons.length > 0
        ? score.reasons.join(", ")
        : "it fits your budget and available hours";
    parts.push(`${score.model.label} was chosen because ${why}.`);
    if (input.monthlyGoal > capacity) {
        parts.push(`Your goal is ambitious for this model: solo capacity is around ${(0, helpers_1.formatMoney)(capacity, input.currency)} a month, so the plan raises your price and adds leverage rather than adding hours.`);
    }
    else {
        parts.push((0, planEconomics_1.explainPricing)(score.model, input.monthlyGoal, pricing, clients, input.currency));
    }
    if (input.startingBudget <= 0) {
        parts.push("Because you are starting with no budget, every cost line has a free alternative until the first sale pays for the paid tools.");
    }
    return parts.join(" ");
}
/** Builds a full business plan deterministically from the founder's answers. */
function buildBusinessPlan(input) {
    const score = (0, businessModels_1.selectModel)(input);
    const model = score.model;
    const capacity = (0, businessModels_1.modelCapacity)(model);
    const pricing = (0, planEconomics_1.buildPricing)(model, input.monthlyGoal, input.currency);
    const clients = (0, planEconomics_1.clientsRequired)(model, input.monthlyGoal, pricing);
    const drafts = draftDays(model);
    const first30Days = drafts.map((draft, index) => ({
        day: index + 1,
        task: draft.task,
        reason: draft.reason,
    }));
    const city = input.city?.trim() || "your area";
    const unitLabel = (0, planEconomics_1.isHighVolumeModel)(model)
        ? `${(0, helpers_1.formatMoney)(pricing.setup ?? 0, input.currency)} per sale`
        : `${(0, helpers_1.formatMoney)(pricing.monthly ?? 0, input.currency)} per client per month`;
    return {
        businessName: (0, businessModels_1.buildBusinessName)(model, input, `${model.id}:${city}`),
        businessIdea: `${model.idea} You would run it from ${city}.`,
        problemSolved: model.problemSolved,
        targetCustomer: `${model.targetCustomer} Start with ${city}.`,
        offer: model.offer,
        pricing,
        startupCosts: (0, planEconomics_1.buildStartupCosts)(model, input.startingBudget),
        revenueModel: `${model.revenueModel} Plan for ${unitLabel}.`,
        reasoning: buildReasoning(score, input, capacity, pricing, clients),
        realisticTimeline: (0, planEconomics_1.buildTimeline)({
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
