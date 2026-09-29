/**
 * Local prompt optimiser.
 *
 * Restructures a rough idea into an explicit prompt — role, task, context,
 * constraints, output format — and explains which parts the student supplied
 * and which are still missing. The teaching point is that the structure is what
 * makes a prompt reliable, not clever wording.
 */

import type { PromptBuildInput, PromptBuildOutput } from "./contracts";
import { containsAny, pick, truncate } from "./helpers";

const ROLES: { keywords: string[]; role: string }[] = [
  {
    keywords: ["study", "revise", "revision", "exam", "learn", "homework", "understand"],
    role: "an experienced tutor who explains ideas in plain language and checks that I have understood before moving on",
  },
  {
    keywords: ["essay", "write", "writing", "article", "email", "letter", "draft", "edit"],
    role: "a professional editor who writes clearly and concisely and cuts anything that does not earn its place",
  },
  {
    keywords: ["business", "startup", "market", "customer", "revenue", "pricing", "profit", "sell"],
    role: "a pragmatic business advisor who focuses on what I can act on this week and names the risks honestly",
  },
  {
    keywords: ["code", "programming", "debug", "function", "api", "app", "software", "bug"],
    role: "a senior software engineer who explains the trade-offs behind each choice, not just the answer",
  },
  {
    keywords: ["design", "ui", "ux", "layout", "logo", "brand"],
    role: "a product designer who prioritises clarity, accessibility and usability over decoration",
  },
  {
    keywords: ["recipe", "cook", "meal", "dinner", "food"],
    role: "a practical home cook who works with the ingredients and time I actually have",
  },
  {
    keywords: ["plan", "schedule", "roadmap", "timeline", "organise", "organize"],
    role: "a project planner who produces realistic schedules rather than optimistic ones",
  },
  {
    keywords: ["data", "analyse", "analyze", "statistics", "chart", "spreadsheet", "research"],
    role: "a data analyst who states assumptions explicitly and separates correlation from causation",
  },
];

const DEFAULT_ROLE =
  "a knowledgeable assistant who is precise, avoids filler and tells me when something is uncertain";

function inferRole(goal: string): string {
  const match = ROLES.find((entry) => containsAny(goal, entry.keywords));
  return match?.role ?? DEFAULT_ROLE;
}

const EXTRA_TIPS = [
  "Add an example of the output you want. One concrete example improves results more than three extra sentences of instruction.",
  "Tell the AI what to do when it is unsure. 'Say so if you do not know' prevents confident guessing.",
  "Ask for reasoning before the conclusion. That makes errors far easier to spot.",
  "State what you do NOT want. Negative constraints remove whole categories of unusable output.",
  "Ask the AI to ask you a clarifying question first when the task is ambiguous.",
  "Give the audience explicitly. 'Explain it to a 14-year-old' changes everything about the wording.",
  "Cap the length. 'Under 300 words' forces prioritisation.",
];

/** Builds an optimised prompt without any network access. */
export function buildOptimizedPromptLocally(
  input: PromptBuildInput
): PromptBuildOutput {
  const goal = input.goal.trim();
  const context = input.context.trim();
  const constraints = input.constraints.trim();
  const outputFormat = input.outputFormat.trim();

  const role = inferRole(goal);
  const seed = `${goal}:${outputFormat}`;

  const sections: string[] = [`Act as ${role}.`];

  sections.push(`Task: ${goal}`);

  if (context) sections.push(`Context you should assume: ${context}`);
  else sections.push("Context: (none given — ask me for any background you need)");

  if (constraints) {
    sections.push(
      `Constraints:\n${constraints
        .split(/[;\n]|(?:\s+and\s+)/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => `- ${item}`)
        .join("\n")}`
    );
  } else {
    sections.push(
      "Constraints: keep it practical and specific. Do not pad it with generalities."
    );
  }

  sections.push(
    outputFormat
      ? `Output format: ${outputFormat}`
      : "Output format: use short sections with headings, and keep it as brief as the task allows."
  );

  if (constraints) {
    sections.push(
      "Before answering, ask me one clarifying question if anything above is ambiguous."
    );
  }

  const optimizedPrompt = sections.join("\n\n");

  const supplied: string[] = [];
  const missing: string[] = [];
  (context ? supplied : missing).push("context");
  (constraints ? supplied : missing).push("constraints");
  (outputFormat ? supplied : missing).push("an output format");

  const explanationParts: string[] = [
    `The prompt now names a role, states the task, and separates context from constraints — so the AI does not have to guess what matters.`,
  ];
  if (supplied.length > 0) {
    explanationParts.push(
      `You supplied ${supplied.join(", ")}, which is what stops the answer drifting into generic advice.`
    );
  }
  if (missing.length > 0) {
    explanationParts.push(
      `It is still missing ${missing.join(
        ", "
      )} — adding those would sharpen the result the most.`
    );
  }
  explanationParts.push(
    `The role line matters because it changes the vocabulary and the level of depth the AI chooses.`
  );

  const whyGood: string[] = [
    "Starts with a role, which sets the vocabulary and depth of the answer.",
    context
      ? "Includes your background, so the answer is written for your situation rather than a generic reader."
      : "States the task plainly and up front, so there is nothing to misinterpret.",
    constraints
      ? "Sets boundaries, which removes whole categories of unusable output."
      : "Keeps the request focused instead of sprawling.",
    outputFormat
      ? "Specifies the shape of the answer, so it arrives ready to use."
      : "Leaves the format open, which suits open-ended questions.",
  ];

  const tips = missing.length > 0
    ? [
        `Add ${missing[0]} next time — it is the single biggest improvement you could make to this prompt.`,
        ...pickTwo(EXTRA_TIPS, seed),
      ]
    : pickTwo(EXTRA_TIPS, seed).concat([
        "Now try tightening the length constraint. Fewer words forces the AI to prioritise what matters.",
      ]);

  return {
    optimizedPrompt,
    explanation: explanationParts.join(" "),
    whyGood,
    tips,
  };
}

/** Deterministically picks two distinct tips from the pool. */
function pickTwo(pool: string[], seed: string): string[] {
  const first = pick(pool, seed);
  const remaining = pool.filter((tip) => tip !== first);
  return [first, pick(remaining, `${seed}:second`)];
}

/** Exposed so callers can show a short preview of the goal in the UI. */
export function describeGoal(goal: string): string {
  return truncate(goal, 80);
}
