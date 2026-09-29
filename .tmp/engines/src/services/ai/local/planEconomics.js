"use strict";
/**
 * The numbers behind a generated business plan: what to charge, what it costs
 * to start, and a realistic revenue ramp.
 *
 * Everything here is derived from the founder's actual goal and budget, so two
 * people with different answers never receive the same price list.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHighVolumeModel = isHighVolumeModel;
exports.buildPricing = buildPricing;
exports.clientsRequired = clientsRequired;
exports.buildStartupCosts = buildStartupCosts;
exports.buildTimeline = buildTimeline;
exports.explainPricing = explainPricing;
const helpers_1 = require("./helpers");
/**
 * High-volume models sell many small transactions; the rest sell a small
 * number of recurring engagements. The distinction changes how price is
 * expressed, because "monthly retainer" is meaningless for a template shop.
 */
function isHighVolumeModel(model) {
    return model.maxClients > 30;
}
/**
 * Chooses a price that makes the stated goal reachable with a realistic number
 * of customers, rather than inventing a round number.
 */
function buildPricing(model, goal, currency) {
    const unitFloor = Math.max(1, Math.round(model.monthlyValuePerClient * 0.75));
    const clientsNeeded = (0, helpers_1.clamp)(Math.ceil(goal / Math.max(1, model.monthlyValuePerClient)), 1, model.maxClients);
    const unitPrice = Math.max(unitFloor, (0, helpers_1.niceAmount)(goal / clientsNeeded));
    if (isHighVolumeModel(model)) {
        return { setup: unitPrice, currency };
    }
    return {
        monthly: unitPrice,
        setup: (0, helpers_1.niceAmount)(unitPrice * 1.5),
        currency,
    };
}
/** Number of customers the goal requires at the chosen price. */
function clientsRequired(model, goal, pricing) {
    const unit = isHighVolumeModel(model)
        ? pricing.setup ?? model.monthlyValuePerClient
        : pricing.monthly ?? model.monthlyValuePerClient;
    return (0, helpers_1.clamp)(Math.ceil(goal / Math.max(1, unit)), 1, model.maxClients);
}
/**
 * Splits the starting budget across the model's cost lines.
 * With no budget, returns the free alternatives at zero cost so the plan is
 * still actionable.
 */
function buildStartupCosts(model, budget) {
    if (budget <= 0) {
        return model.costItems.map((item) => ({
            item: `Free option: ${item.freeAlternative}`,
            estimatedCost: 0,
        }));
    }
    const weightTotal = model.costItems.reduce((sum, item) => sum + item.weight, 0) || 1;
    const costs = model.costItems.map((item) => ({
        item: item.item,
        estimatedCost: (0, helpers_1.niceAmount)((budget * item.weight) / weightTotal),
    }));
    // Rounding can push the total over budget; trim the largest line to fit.
    const total = costs.reduce((sum, cost) => sum + cost.estimatedCost, 0);
    if (total > budget) {
        const largest = costs.reduce((a, b) => b.estimatedCost > a.estimatedCost ? b : a);
        largest.estimatedCost = Math.max(0, largest.estimatedCost - (total - budget));
    }
    return costs;
}
/**
 * Produces a month 1 / 3 / 6 revenue ramp.
 *
 * The ramp is intentionally modest early and capped at what the model can
 * actually support, so the projection never promises more than the plan allows.
 */
function buildTimeline(input) {
    const ceiling = Math.min(input.goal, input.capacity);
    const sample = (share) => (0, helpers_1.formatMoney)(Math.max(0, (0, helpers_1.niceAmount)(ceiling * share)), input.currency);
    const unit = isHighVolumeModel(input.model)
        ? input.pricing.setup ?? input.model.monthlyValuePerClient
        : input.pricing.monthly ?? input.model.monthlyValuePerClient;
    const unitLabel = isHighVolumeModel(input.model)
        ? `${(0, helpers_1.formatMoney)(unit, input.currency)} per sale`
        : `${(0, helpers_1.formatMoney)(unit, input.currency)} per client per month`;
    return [
        `Month 1: around ${sample(0.1)}/month — enough to prove the offer works.`,
        `Month 2: around ${sample(0.3)}/month as outreach compounds.`,
        `Month 3: around ${sample(0.55)}/month if you keep the daily outreach going.`,
        `Month 6: around ${sample(1)}/month, assuming ${unitLabel}.`,
        "These are estimates built from your own numbers, not guarantees.",
    ].join(" ");
}
/** Explains, in plain language, why the chosen price was chosen. */
function explainPricing(model, goal, pricing, clients, currency) {
    if (isHighVolumeModel(model)) {
        return `At ${(0, helpers_1.formatMoney)(pricing.setup ?? 0, currency)} per sale, reaching ${(0, helpers_1.formatMoney)(goal, currency)} a month means about ${clients} sales — achievable with steady posting and word of mouth.`;
    }
    return `At ${(0, helpers_1.formatMoney)(pricing.monthly ?? 0, currency)} per client per month, reaching ${(0, helpers_1.formatMoney)(goal, currency)} a month means about ${clients} paying client${clients === 1 ? "" : "s"} — which is what the 30-day plan is built to produce.`;
}
