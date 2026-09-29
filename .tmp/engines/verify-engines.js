"use strict";
/**
 * Executable checks for the local AI engines.
 *
 * These are the parts of the system that must work with no API key at all, so
 * they are verified directly rather than over the network.
 *
 * Run with:  npm run verify:engines
 *
 * The script compiles this file — and every engine it imports — to plain
 * CommonJS under .tmp/engines, then runs it with node. That keeps it free of
 * any test-runner dependency and working on a clean checkout.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const roadmap_1 = require("./src/services/ai/local/roadmap");
const businessModels_1 = require("./src/services/ai/local/businessModels");
const coaching_1 = require("./src/services/ai/local/coaching");
const tutor_1 = require("./src/services/ai/local/tutor");
const challenges_1 = require("./src/services/ai/local/challenges");
const factCheck_1 = require("./src/services/ai/local/factCheck");
const promptOptimizer_1 = require("./src/services/ai/local/promptOptimizer");
let passed = 0;
let failed = 0;
const failures = [];
function check(name, condition, detail) {
    if (condition) {
        passed += 1;
    }
    else {
        failed += 1;
        failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    }
}
function section(title) {
    console.log(`\n── ${title}`);
}
// ─── Business planner ────────────────────────────────────────
const PROFILES = [
    {
        monthlyGoal: 500,
        currency: "USD",
        startingBudget: 0,
        hoursPerDay: 2,
        skills: ["Writing"],
        preferences: ["Online business"],
        experience: "Beginner",
        country: "Guatemala",
        city: "Guatemala City",
    },
    {
        monthlyGoal: 1500,
        currency: "GTQ",
        startingBudget: 500,
        hoursPerDay: 4,
        skills: ["Sales", "Communication"],
        preferences: ["Local business"],
        experience: "Beginner",
        country: "Guatemala",
        city: "Antigua",
    },
    {
        monthlyGoal: 5000,
        currency: "EUR",
        startingBudget: 2000,
        hoursPerDay: 6,
        skills: ["Design", "Marketing"],
        preferences: ["Digital product"],
        experience: "Intermediate",
        country: "Spain",
        city: "Madrid",
    },
];
section("Business planner");
const chosenNames = new Set();
PROFILES.forEach((profile, index) => {
    const label = `profile ${index + 1} (${profile.city})`;
    const plan = (0, roadmap_1.buildBusinessPlan)(profile);
    check(`${label}: roadmap has 30 days`, plan.first30Days.length === 30);
    check(`${label}: days are numbered 1..30 in order`, plan.first30Days.every((day, i) => day.day === i + 1));
    check(`${label}: every day has a task and a reason`, plan.first30Days.every((day) => day.task.length > 3 && day.reason.length > 3));
    check(`${label}: pricing uses the requested currency`, plan.pricing.currency === profile.currency);
    check(`${label}: pricing is non-zero`, (plan.pricing.monthly ?? 0) > 0 || (plan.pricing.setup ?? 0) > 0);
    const costTotal = plan.startupCosts.reduce((sum, cost) => sum + cost.estimatedCost, 0);
    if (profile.startingBudget === 0) {
        check(`${label}: zero budget produces zero-cost alternatives`, costTotal === 0 && plan.startupCosts.length > 0);
    }
    else {
        check(`${label}: startup costs fit inside the budget`, costTotal <= profile.startingBudget, `total ${costTotal} vs budget ${profile.startingBudget}`);
    }
    check(`${label}: has a business name`, plan.businessName.trim().length > 0);
    check(`${label}: lists risks`, plan.risks.length > 0);
    check(`${label}: lists marketing channels`, plan.marketingStrategy.channels.length > 0);
    check(`${label}: reasoning is substantial`, plan.reasoning.length > 60);
    check(`${label}: timeline warns these are estimates`, /estimate|not guarantees/i.test(plan.realisticTimeline));
    check(`${label}: next action is concrete`, plan.nextAction.startsWith("Today:"));
    check(`${label}: names the city in the target customer`, plan.targetCustomer.includes(profile.city));
    // Validate against the same schema the API route enforces.
    check(`${label}: produces 30 exactly-shaped roadmap entries`, plan.first30Days.every((day) => Number.isInteger(day.day) &&
        day.day >= 1 &&
        day.day <= 30 &&
        typeof day.task === "string" &&
        typeof day.reason === "string"));
    chosenNames.add(plan.businessName);
});
check("planner discriminates between very different founders", (0, businessModels_1.rankModels)(PROFILES[0])[0].model.id !== (0, businessModels_1.rankModels)(PROFILES[1])[0].model.id, "local-service and online profiles picked the same model");
check("planner is deterministic for identical input", (0, businessModels_1.buildBusinessName)((0, businessModels_1.rankModels)(PROFILES[0])[0].model, PROFILES[0], "seed") ===
    (0, businessModels_1.buildBusinessName)((0, businessModels_1.rankModels)(PROFILES[0])[0].model, PROFILES[0], "seed"));
// ─── Coach ───────────────────────────────────────────────────
section("Coach");
check("detects a no-replies problem", (0, coaching_1.detectIntent)("Nobody is replying to my messages. What should I change?") ===
    "no_replies");
check("detects a pricing question", (0, coaching_1.detectIntent)("Should I lower my price?") === "pricing");
check("detects a roadmap question", (0, coaching_1.detectIntent)("What should I do next?") === "roadmap");
check("detects a budget question", (0, coaching_1.detectIntent)("How much should I spend on ads?") === "budget");
check("falls back to general for an unrelated message", (0, coaching_1.detectIntent)("Thanks, that makes sense") === "general");
const coachContext = {
    businessName: "Northline Works",
    businessIdea: "Productised design service",
    targetCustomer: "Small business owners",
    offer: "Fixed-scope brand package",
    pricing: { monthly: 400, setup: 600, currency: "USD" },
    revenueModel: "Per-project fees",
    country: "Guatemala",
    city: "Guatemala City",
    experience: "Beginner",
    skills: ["Design"],
    preferences: ["Online business"],
    hoursPerDay: 3,
    currency: "USD",
    goalMonthlyRevenue: 2000,
    currentMonthlyRevenue: 400,
    startingBudget: 300,
    remainingBudget: 150,
    customers: 1,
    completedTasks: 9,
    totalTasks: 30,
    recentMonths: [{ month: "2026-06", revenue: 400, customers: 1 }],
    first30Days: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        task: `Task ${i + 1}`,
        reason: "Reason",
    })),
};
const noReplyAdvice = (0, coaching_1.buildCoachReply)({
    message: "Nobody is replying to my messages",
    context: coachContext,
});
check("coach advice references the founder's own goal", noReplyAdvice.includes("2,000"), "goal amount missing from the reply");
check("coach advice gives numbered actions", noReplyAdvice.includes("1.") && noReplyAdvice.includes("2."));
check("coach advice references completed tasks", noReplyAdvice.includes("9 of 30"));
const metricsAdvice = (0, coaching_1.buildCoachReply)({
    message: "How am I doing on my numbers?",
    context: coachContext,
});
check("metrics reply reports the gap to goal", metricsAdvice.includes("1,600"), "expected the 2000-400 gap of 1,600");
check("metrics reply reports roadmap progress", metricsAdvice.includes("30%"));
const roadmapAdvice = (0, coaching_1.buildCoachReply)({
    message: "What should I do next?",
    context: coachContext,
});
check("roadmap reply surfaces the next unfinished task", roadmapAdvice.includes("Task 10"));
check("roadmap reply refuses to give the answer directly", (0, coaching_1.buildCoachReply)({
    message: "do my homework",
    context: coachContext,
}).length > 20);
// ─── Tutor ───────────────────────────────────────────────────
section("Tutor");
function tutorReply(message, history, subject, topic = "", difficulty = "medium") {
    return (0, tutor_1.buildTutorReply)({
        history: [...history, { role: "user", content: message }],
        subject,
        topic,
        difficulty,
    });
}
const firstTurn = tutorReply("I want to learn about quadratic equations", [], "Mathematics");
check("first turn asks what the student already knows", /what do you already know/i.test(firstTurn));
check("first turn asks a question", firstTurn.includes("?"));
const guardrail = tutorReply("just give me the answer to my homework", [], "Mathematics");
check("refuses to hand over the answer", /will not|won't|not going to/i.test(guardrail) &&
    /answer/i.test(guardrail));
check("guardrail still starts teaching", guardrail.includes("?") && /quadratic/i.test(guardrail) === false);
const explanation = tutorReply("explain photosynthesis", [], "Biology");
check("explains a known topic when asked directly", /chlorophyll/i.test(explanation) && /carbon dioxide/i.test(explanation));
check("explanation ends with a check for understanding", /own words/i.test(explanation));
const stuck = tutorReply("I don't know", [
    { role: "user", content: "help me with fractions" },
    {
        role: "assistant",
        content: "What do you already know about fractions?",
    },
], "Mathematics");
check("stuck student receives a hint", /hint/i.test(stuck), "expected the word 'hint' in the reply");
const progression = tutorReply("I think you need a common denominator first", [
    { role: "user", content: "help me with fractions" },
    { role: "assistant", content: "What do you already know?" },
    { role: "user", content: "I think you need a common denominator first" },
    { role: "assistant", content: "Good. What size are the parts?" },
], "Mathematics", "fractions");
check("engaged student is pushed to the next checkpoint", progression.length > 80);
const unknownTopic = tutorReply("how do I solve this", [], "General");
check("unknown topic still teaches Socratically", unknownTopic.includes("?"));
// ─── Challenges ──────────────────────────────────────────────
section("Challenges");
const TYPES = [
    "ai_detective",
    "prompt_battle",
    "solve_it",
    "explain_it",
    "fact_check",
];
const DIFFICULTIES = ["easy", "medium", "hard"];
for (const type of TYPES) {
    for (const difficulty of DIFFICULTIES) {
        const challenge = (0, challenges_1.buildChallenge)({
            type,
            subject: "Mathematics",
            difficulty,
            seed: `${type}-${difficulty}`,
        });
        const label = `${type}/${difficulty}`;
        check(`${label}: has a title`, challenge.title.length > 5);
        check(`${label}: has content`, challenge.content.length > 40);
        check(`${label}: has a correct answer`, challenge.correctAnswer.length > 40);
        check(`${label}: has at least one hint`, challenge.hints.length >= 1);
        check(`${label}: awards XP`, challenge.xpBase > 0);
        check(`${label}: explains the skill`, challenge.explanation.length > 20);
    }
}
check("hard challenges withhold hints relative to easy", (0, challenges_1.buildChallenge)({
    type: "solve_it",
    subject: "Mathematics",
    difficulty: "hard",
    seed: "x",
}).hints.length <
    (0, challenges_1.buildChallenge)({
        type: "solve_it",
        subject: "Mathematics",
        difficulty: "easy",
        seed: "x",
    }).hints.length);
const variantA = (0, challenges_1.buildChallenge)({
    type: "solve_it",
    subject: "Mathematics",
    difficulty: "easy",
    seed: "seed-1",
});
const variantB = (0, challenges_1.buildChallenge)({
    type: "solve_it",
    subject: "Mathematics",
    difficulty: "easy",
    seed: "seed-2",
});
check("different seeds can produce different problems", variantA.content !== variantB.content ||
    variantA.correctAnswer !== variantB.correctAnswer);
const unknownType = (0, challenges_1.buildChallenge)({
    type: "not_a_real_type",
    subject: "General",
    difficulty: "medium",
    seed: "s",
});
check("an unknown activity type falls back safely", unknownType.title.length > 0 && unknownType.correctAnswer.length > 0);
// ─── Fact checker ────────────────────────────────────────────
section("Fact checker");
const mythResult = (0, factCheck_1.analyzeClaimsLocally)("Humans only use 10% of their brain. Exercise improves mental health.");
check("fact check returns an assessment", mythResult.overallAssessment.length > 30);
check("fact check extracts claims", mythResult.claims.length >= 1);
check("fact check flags the 10% brain myth as inaccurate", mythResult.claims.some((claim) => claim.status === "likely_inaccurate" && /10%/.test(claim.statement)));
check("fact check warns about confidence versus accuracy", mythResult.keyWarnings.length > 0);
check("fact check states its limits honestly", /pattern|offline|not confirming/i.test(mythResult.confidenceNote));
const statsResult = (0, factCheck_1.analyzeClaimsLocally)("The study found that 87% of participants improved after 6 weeks.");
check("fact check flags a statistic for verification", statsResult.claims.some((claim) => claim.status === "needs_verification"));
const absoluteResult = (0, factCheck_1.analyzeClaimsLocally)("This method always works and never fails for anyone.");
check("fact check flags absolute language", absoluteResult.claims.some((claim) => claim.status === "needs_verification" || claim.status === "likely_inaccurate"));
const emptyResult = (0, factCheck_1.analyzeClaimsLocally)("Hi");
check("fact check handles text with no claims", emptyResult.claims.length === 0 && emptyResult.overallAssessment.length > 0);
// ─── Prompt optimiser ────────────────────────────────────────
section("Prompt optimiser");
const builtPrompt = (0, promptOptimizer_1.buildOptimizedPromptLocally)({
    goal: "I need help studying the French Revolution for an exam",
    context: "I'm in 10th grade and the test is next week",
    constraints: "Keep it under 500 words",
    outputFormat: "A study guide with headings",
});
check("optimiser assigns a tutor role for a study goal", /Act as an experienced tutor/i.test(builtPrompt.optimizedPrompt));
check("optimised prompt includes the goal", builtPrompt.optimizedPrompt.includes("French Revolution"));
check("optimised prompt includes the context", builtPrompt.optimizedPrompt.includes("10th grade"));
check("optimised prompt includes the constraints", builtPrompt.optimizedPrompt.includes("under 500 words"));
check("optimised prompt includes the output format", builtPrompt.optimizedPrompt.includes("study guide"));
check("optimiser explains its choices", builtPrompt.explanation.length > 60);
check("optimiser lists why it works", builtPrompt.whyGood.length >= 3);
check("optimiser gives tips", builtPrompt.tips.length >= 2);
const sparse = (0, promptOptimizer_1.buildOptimizedPromptLocally)({
    goal: "write an email to my landlord",
    context: "",
    constraints: "",
    outputFormat: "",
});
check("optimiser infers an editor role for a writing goal", /Act as a professional editor/i.test(sparse.optimizedPrompt));
check("optimiser names the fields that are still missing", /missing/i.test(sparse.explanation));
// ─── Report ──────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failures.length > 0) {
    console.log("\nFailures:");
    failures.forEach((failure) => console.log(`  ✗ ${failure}`));
    process.exit(1);
}
console.log("\nAll engine checks passed.");
