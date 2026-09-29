/**
 * Catalogue of business models the local planner can recommend.
 *
 * Each entry carries the metadata needed to (a) judge whether it fits a given
 * founder and (b) produce a concrete plan: economics, startup costs, marketing
 * channels and the risks that actually bite in that model.
 */

import type { BusinessPlanInput } from "./contracts";
import { containsAny, clamp } from "./helpers";

export interface ModelCostItem {
  item: string;
  /** Share of the starting budget this line should consume (0–1). */
  weight: number;
  /** What to do instead when the founder has no budget. */
  freeAlternative: string;
}

export interface BusinessModel {
  id: string;
  label: string;
  /** Business preferences (from onboarding) that make this a natural fit. */
  fits: string[];
  /** Skills that make the founder unusually effective here. */
  skillAffinity: string[];
  experienceAffinity: string[];
  minHoursPerDay: number;
  minBudget: number;
  /** Realistic monthly revenue from one client/customer, in USD-equivalent terms. */
  monthlyValuePerClient: number;
  /** How many clients one person can serve well alongside everything else. */
  maxClients: number;
  nameIdeas: string[];
  idea: string;
  problemSolved: string;
  targetCustomer: string;
  offer: string;
  revenueModel: string;
  costItems: ModelCostItem[];
  channels: string[];
  contentIdeas: string[];
  outreachStrategy: string;
  risks: string[];
}

export const BUSINESS_MODELS: BusinessModel[] = [
  {
    id: "freelance-service",
    label: "Freelance service",
    fits: ["Online business", "Service business", "Doesn't matter"],
    skillAffinity: [
      "Programming",
      "Design",
      "Writing",
      "Marketing",
      "Video editing",
      "Sales",
      "Communication",
    ],
    experienceAffinity: ["Beginner", "Intermediate", "Advanced"],
    minHoursPerDay: 2,
    minBudget: 0,
    monthlyValuePerClient: 400,
    maxClients: 6,
    nameIdeas: ["{city} Studio", "Northline Works", "Clearwork"],
    idea: "Productise one freelance skill into a fixed-scope package aimed at a specific type of business.",
    problemSolved:
      "Small businesses need specialist work done well, but cannot justify hiring for it full-time.",
    targetCustomer:
      "Owners of small businesses and solo founders who have the budget for the work but not for a hire.",
    offer:
      "A fixed-scope, fixed-price package delivered in a stated number of days, with one revision round included.",
    revenueModel: "Per-project fees, converted into a monthly retainer after the second project.",
    costItems: [
      { item: "Domain and hosting", weight: 0.15, freeAlternative: "A free portfolio page on Notion or Carrd" },
      { item: "Invoicing and contracts", weight: 0.1, freeAlternative: "Free invoicing tools and a written agreement by email" },
      { item: "Outreach tooling", weight: 0.25, freeAlternative: "Manual outreach from a spreadsheet of 50 prospects" },
      { item: "Paid advertising test", weight: 0.5, freeAlternative: "Post daily in two communities where your buyers already gather" },
    ],
    channels: ["LinkedIn", "Direct outreach", "Referrals", "Freelance marketplaces"],
    contentIdeas: [
      "A before/after breakdown of one piece of work you did",
      "Three mistakes you see businesses make in your specialty",
      "A one-page checklist your buyer can use immediately",
    ],
    outreachStrategy:
      "Send 10 personal messages a day to businesses that clearly show the problem you fix, referencing something specific about them.",
    risks: [
      "Feast-and-famine income until you convert projects into retainers",
      "Scope creep on fixed-price work eating the margin",
      "Competing on price instead of on a defined outcome",
    ],
  },
  {
    id: "local-service",
    label: "Local service business",
    fits: ["Local business", "Service business", "Doesn't matter"],
    skillAffinity: ["Sales", "Communication", "Marketing"],
    experienceAffinity: ["Beginner", "Intermediate"],
    minHoursPerDay: 3,
    minBudget: 100,
    monthlyValuePerClient: 120,
    maxClients: 25,
    nameIdeas: ["{city} Home Care", "Bright Local", "{city} Pros"],
    idea: "Run a reliable, scheduled local service with transparent pricing and same-week availability.",
    problemSolved:
      "Local customers struggle to find someone who answers the phone, shows up on time, and charges a clear price.",
    targetCustomer:
      "Homeowners and small businesses nearby who need dependable help on a recurring basis.",
    offer:
      "A published price list, guaranteed response within a few hours, and a recurring visit schedule.",
    revenueModel: "Recurring visits for steady income, plus one-off jobs at a premium rate.",
    costItems: [
      { item: "Basic equipment and supplies", weight: 0.5, freeAlternative: "Borrow or rent equipment for the first three jobs" },
      { item: "Local advertising", weight: 0.3, freeAlternative: "Free Google Business Profile plus posts in local groups" },
      { item: "Printed price lists and cards", weight: 0.2, freeAlternative: "A price list sent as an image over WhatsApp" },
    ],
    channels: [
      "Google Business Profile",
      "Local Facebook groups",
      "WhatsApp",
      "Neighbourhood referrals",
    ],
    contentIdeas: [
      "A short clip of a job before and after",
      "A pricing explainer that removes the fear of being overcharged",
      "A testimonial from a repeat customer",
    ],
    outreachStrategy:
      "Walk or message 15 nearby households or businesses a day, leave a price list, and ask for one specific booking.",
    risks: [
      "Revenue capped by the hours you can physically work",
      "No-shows and cancellations eroding a day's earnings",
      "Underpricing because the price was guessed rather than calculated",
    ],
  },
  {
    id: "digital-product",
    label: "Digital product",
    fits: ["Online business", "Digital product", "Product business", "Doesn't matter"],
    skillAffinity: [
      "Design",
      "Writing",
      "Programming",
      "Video editing",
      "Social media",
      "Marketing",
    ],
    experienceAffinity: ["Beginner", "Intermediate", "Advanced"],
    minHoursPerDay: 2,
    minBudget: 0,
    monthlyValuePerClient: 25,
    maxClients: 200,
    nameIdeas: ["{city} Templates", "The Shortcut Shop", "Ready Set Systems"],
    idea: "Build one focused digital product that removes a specific, repeatable piece of work for your buyer.",
    problemSolved:
      "People waste hours rebuilding something that already exists as a template, checklist, or short course.",
    targetCustomer:
      "People already trying to solve this problem themselves, who would rather buy the finished version.",
    offer:
      "A single downloadable product that produces a usable result within an hour of purchase.",
    revenueModel: "One-time sales with near-zero marginal cost, plus a higher-priced upsell.",
    costItems: [
      { item: "Design and file tooling", weight: 0.2, freeAlternative: "Free tiers of a design tool" },
      { item: "Storefront and checkout", weight: 0.3, freeAlternative: "Sell directly through a payment link" },
      { item: "Launch promotion", weight: 0.5, freeAlternative: "Organic posts and a giveaway in relevant communities" },
    ],
    channels: ["TikTok", "Instagram", "Email list", "Reddit communities", "Pinterest"],
    contentIdeas: [
      "Show the finished result your product produces in under 30 seconds",
      "A free mini version of the product as a lead magnet",
      "A side-by-side of doing the task manually versus with your product",
    ],
    outreachStrategy:
      "Answer questions in communities where your buyer already asks for this exact solution, then link the free version.",
    risks: [
      "Building for months before anyone confirms they would pay",
      "A crowded market where your product is indistinguishable",
      "Traffic that never converts because there is no email list",
    ],
  },
  {
    id: "coaching-consulting",
    label: "Coaching and consulting",
    fits: ["Online business", "Service business", "Doesn't matter"],
    skillAffinity: ["Communication", "Sales", "Marketing", "Finance", "Writing"],
    experienceAffinity: ["Intermediate", "Advanced"],
    minHoursPerDay: 2,
    minBudget: 0,
    monthlyValuePerClient: 500,
    maxClients: 8,
    nameIdeas: ["{city} Advisory", "Signal & Scale", "The Next Step Co."],
    idea: "Sell structured 1:1 guidance that gets a specific type of person from a defined problem to a defined result.",
    problemSolved:
      "People stall because they lack an experienced outside view on a decision that matters to them.",
    targetCustomer:
      "Professionals and owners who are stuck on one expensive decision and want it resolved quickly.",
    offer:
      "A fixed-length engagement with a stated outcome, a set number of sessions, and async support between them.",
    revenueModel: "Fixed-price packages, with a smaller paid diagnostic session as the entry point.",
    costItems: [
      { item: "Scheduling and payment tooling", weight: 0.3, freeAlternative: "A free calendar link plus payment requests" },
      { item: "Presentation and worksheet templates", weight: 0.2, freeAlternative: "Plain shared documents" },
      { item: "Outreach and visibility", weight: 0.5, freeAlternative: "Publish one useful post a day and answer questions publicly" },
    ],
    channels: ["LinkedIn", "Referrals", "Workshops", "Newsletter"],
    contentIdeas: [
      "A breakdown of one decision that cost someone a lot of money",
      "A short framework with three steps your buyer can apply today",
      "A client result told with permission, with the numbers included",
    ],
    outreachStrategy:
      "Offer 5 free 20-minute diagnostic calls a week, then convert the people with a real problem into a paid engagement.",
    risks: [
      "Being seen as advice rather than a service with a measurable outcome",
      "A calendar full of unpaid calls",
      "Results that depend on the client doing the work, not on you",
    ],
  },
  {
    id: "social-media-management",
    label: "Social media management",
    fits: ["Online business", "Service business", "Digital product", "Doesn't matter"],
    skillAffinity: ["Social media", "Video editing", "Design", "Writing", "Marketing"],
    experienceAffinity: ["Beginner", "Intermediate", "Advanced"],
    minHoursPerDay: 2,
    minBudget: 0,
    monthlyValuePerClient: 300,
    maxClients: 6,
    nameIdeas: ["{city} Content Co.", "Loop Studio", "Always On Media"],
    idea: "Run the content engine for a small number of businesses that have no time to post consistently.",
    problemSolved:
      "Small businesses know they should be posting but never do it consistently, so they stay invisible.",
    targetCustomer:
      "Local businesses and personal brands with something worth showing and nobody to run it.",
    offer:
      "A monthly package: a set number of posts and short videos, plus a simple monthly performance summary.",
    revenueModel: "Flat monthly retainers, with a one-off setup fee for the first month.",
    costItems: [
      { item: "Editing software", weight: 0.2, freeAlternative: "A free mobile editing app" },
      { item: "Stock assets", weight: 0.2, freeAlternative: "Film the client's own premises and product" },
      { item: "Outreach and sample production", weight: 0.6, freeAlternative: "Produce one free sample post for five target businesses" },
    ],
    channels: ["Instagram", "TikTok", "Direct messages", "Referrals"],
    contentIdeas: [
      "A monthly results summary you can post yourself as proof",
      "One free sample post per prospect, made before they reply",
      "A short clip explaining why consistency beats production value",
    ],
    outreachStrategy:
      "Pick 20 local businesses with weak or stalled profiles, make one sample post for each, and send it unasked.",
    risks: [
      "Clients cancelling in month two once novelty fades",
      "Unlimited revision requests destroying the effective hourly rate",
      "Everything depending on platforms you do not control",
    ],
  },
  {
    id: "ecommerce-reselling",
    label: "E-commerce and reselling",
    fits: ["Product business", "Online business", "Doesn't matter"],
    skillAffinity: ["Marketing", "Sales", "Design", "Social media"],
    experienceAffinity: ["Beginner", "Intermediate", "Advanced"],
    minHoursPerDay: 3,
    minBudget: 250,
    monthlyValuePerClient: 45,
    maxClients: 120,
    nameIdeas: ["{city} Finds", "Market Lane", "Stockwell Goods"],
    idea: "Source a narrow, in-demand product and sell it through a marketplace plus your own channels.",
    problemSolved:
      "Buyers cannot easily find a trustworthy local source for this specific product at a fair price.",
    targetCustomer:
      "Buyers who already search for this product and want a reliable seller with fast delivery.",
    offer:
      "A tightly curated product range with clear photos, honest descriptions, and fast dispatch.",
    revenueModel: "Product margin per unit, improved by buying in larger quantities as demand is proven.",
    costItems: [
      { item: "Opening stock", weight: 0.6, freeAlternative: "Pre-sell one order and buy only after the customer pays" },
      { item: "Packaging and shipping supplies", weight: 0.15, freeAlternative: "Reuse clean packaging for the first orders" },
      { item: "Listing photos and promotion", weight: 0.25, freeAlternative: "Photograph in daylight and list for free on marketplaces" },
    ],
    channels: ["Marketplace listings", "Instagram", "TikTok", "Local pickup", "WhatsApp"],
    contentIdeas: [
      "A packing video that shows the quality of what arrives",
      "A comparison between your product and the cheap alternative",
      "A short clip answering the most common pre-purchase question",
    ],
    outreachStrategy:
      "List on one marketplace and message 10 past buyers of similar products a day with a first-order discount.",
    risks: [
      "Tying cash up in stock that does not sell",
      "Thin margins wiped out by returns and shipping",
      "A supplier or platform changing terms without warning",
    ],
  },
];

export interface ModelScore {
  model: BusinessModel;
  score: number;
  reasons: string[];
}

/**
 * Scores every model against the founder's inputs and returns them best-first.
 * Pure and deterministic — the same onboarding answers always rank the same way.
 */
export function rankModels(input: BusinessPlanInput): ModelScore[] {
  const skills = input.skills ?? [];
  const preferences = input.preferences ?? [];

  const scored = BUSINESS_MODELS.map((model) => {
    const reasons: string[] = [];
    let score = 0;

    const preferenceHits = model.fits.filter((fit) =>
      preferences.includes(fit)
    ).length;
    if (preferenceHits > 0) {
      score += 3 + (preferenceHits - 1);
      reasons.push("matches the business type you asked for");
    }

    const skillHits = model.skillAffinity.filter((skill) =>
      skills.includes(skill)
    ).length;
    if (skillHits > 0) {
      score += skillHits * 2;
      reasons.push(
        `uses ${skillHits} skill${skillHits === 1 ? "" : "s"} you already have`
      );
    }

    if (input.startingBudget >= model.minBudget) {
      score += 2;
    } else {
      score -= 4;
      reasons.push("needs more starting capital than you have set aside");
    }

    if (input.hoursPerDay >= model.minHoursPerDay) {
      score += 2;
    } else {
      score -= 5;
      reasons.push("normally needs more hours per day than you have");
    }

    if (model.experienceAffinity.includes(input.experience)) {
      score += 1;
    }

    return { model, score, reasons };
  });

  return scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.model.id.localeCompare(b.model.id);
  });
}

export function selectModel(input: BusinessPlanInput): ModelScore {
  return rankModels(input)[0];
}

/** Upper bound on monthly revenue if the founder serves this model solo. */
export function modelCapacity(model: BusinessModel): number {
  return model.monthlyValuePerClient * model.maxClients;
}

/** Builds a short, readable business name from the model's patterns. */
export function buildBusinessName(
  model: BusinessModel,
  input: BusinessPlanInput,
  seed: string
): string {
  const city = input.city?.trim() || "Local";
  const patterns = model.nameIdeas.length > 0 ? model.nameIdeas : [model.label];
  const index = seed.length % patterns.length;
  const chosen = patterns[index];
  const name = chosen.replace(/\{city\}/g, city);
  // Keep it to a sane display width.
  return name.length > 40 ? chosen.replace(/\{city\}/g, "Local") : name;
}

export function modelMentionsSkill(model: BusinessModel, skill: string): boolean {
  return containsAny(model.skillAffinity.join(" "), [skill]);
}

/** Confidence in a model choice, 0–1, derived from how well it scored. */
export function modelConfidence(score: number): number {
  return clamp(0.4 + score * 0.06, 0.4, 0.95);
}
