"use strict";
/**
 * Local business coach.
 *
 * Classifies the founder's message into an intent, derives the numbers that
 * matter from their own business record, then hands both to the matching
 * playbook. The result reads like advice from someone who has seen their
 * dashboard, because every figure comes from it.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectIntent = detectIntent;
exports.buildCoachReply = buildCoachReply;
const coachingPlaybooks_1 = require("./coachingPlaybooks");
const helpers_1 = require("./helpers");
/**
 * Keyword sets per intent, in priority order.
 * Earlier entries win ties, so the most specific situation is matched first.
 */
const INTENT_KEYWORDS = [
    [
        "no_replies",
        [
            "no one is replying",
            "nobody is replying",
            "no one replies",
            "nobody replies",
            "not replying",
            "no replies",
            "no response",
            "no answer",
            "ignoring me",
            "ignored",
            "silent",
            "ghosted",
        ],
    ],
    [
        "retention",
        [
            "keep customers",
            "keep clients",
            "churn",
            "cancelled",
            "cancelling",
            "losing customers",
            "retention",
            "come back",
            "repeat customers",
        ],
    ],
    [
        "pricing",
        [
            "should i change my price",
            "lower my price",
            "raise my price",
            "too expensive",
            "price too",
            "how much should i charge",
            "pricing",
            "discount",
            "undercut",
            "cheaper",
        ],
    ],
    [
        "first_customers",
        [
            "first customer",
            "first client",
            "first sale",
            "get customers",
            "get clients",
            "more customers",
            "nobody is buying",
            "no sales",
            "not selling",
            "find customers",
        ],
    ],
    [
        "scaling",
        [
            "scale",
            "scaling",
            "grow the business",
            "expand",
            "hire someone",
            "double my",
            "next level",
        ],
    ],
    [
        "time",
        [
            "no time",
            "not enough time",
            "too busy",
            "too much work",
            "overwhelmed",
            "hours a day",
            "time management",
            "no bandwidth",
        ],
    ],
    [
        "marketing",
        [
            "marketing",
            "content",
            "advertis",
            " run ads",
            "social media",
            "instagram",
            "tiktok",
            "linkedin",
            "leads",
            "traffic",
            "post more",
        ],
    ],
    [
        "metrics",
        [
            "my numbers",
            "metrics",
            "how am i doing",
            "track my",
            "measure",
            "kpi",
            "progress so far",
        ],
    ],
    [
        "roadmap",
        [
            "what should i do next",
            "what next",
            "next step",
            "roadmap",
            "what should i focus on",
            "focus today",
            "which task",
        ],
    ],
    [
        "budget",
        ["budget", "how much should i spend", "afford", "invest in", "money left"],
    ],
    [
        "confidence",
        [
            "scared",
            "afraid",
            "giving up",
            "want to quit",
            "discouraged",
            "frustrated",
            "losing hope",
            "doubt myself",
            "feel stuck",
        ],
    ],
];
/** Picks the intent whose keywords best match the message. */
function detectIntent(message) {
    const lower = message.toLowerCase();
    let best = {
        intent: "general",
        score: 0,
    };
    for (const [intent, keywords] of INTENT_KEYWORDS) {
        let score = 0;
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                // Multi-word matches are far more reliable than single words.
                score += keyword.includes(" ") ? 2 : 1;
            }
        }
        if (score > best.score) {
            best = { intent, score };
        }
    }
    return best.intent;
}
function unitPrice(context) {
    const pricing = context.pricing ?? {};
    return pricing.monthly ?? pricing.setup ?? 0;
}
/** Builds the coach's reply without any network access. */
function buildCoachReply(input) {
    const { context } = input;
    const intent = detectIntent(input.message);
    const price = unitPrice(context);
    const remaining = Math.max(0, context.goalMonthlyRevenue - context.currentMonthlyRevenue);
    const customersNeeded = price > 0 ? (0, helpers_1.clamp)(Math.ceil(remaining / price), 0, 9999) : 0;
    const completionPercent = context.totalTasks > 0
        ? Math.round((context.completedTasks / context.totalTasks) * 100)
        : 0;
    const money = (amount) => (0, helpers_1.formatMoney)(amount, context.currency);
    const priceLabel = price > 0
        ? `${money(price)} ${context.pricing?.monthly ? "per client per month" : "per sale"}`
        : "not set yet";
    const facts = {
        context,
        money,
        remaining,
        priceLabel,
        customersNeeded,
        nextTask: context.first30Days[context.completedTasks]?.task ?? null,
        completionPercent: (0, helpers_1.clamp)(completionPercent, 0, 100),
    };
    return coachingPlaybooks_1.PLAYBOOKS[intent](facts);
}
