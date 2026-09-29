/**
 * Challenge generation.
 *
 * Asks a configured remote provider for a structured challenge; when none is
 * available, the local bank supplies a gradeable one for the requested activity
 * and difficulty. Either way the student receives a real, scorable problem.
 */

import type { ActivityType, Difficulty, Subject } from "@/types";
import { generateStructured } from "./provider";
import { buildChallenge } from "./local/challenges";
import type { ChallengeOutput } from "./local/contracts";

export type Challenge = ChallengeOutput;

export class ChallengeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChallengeError";
  }
}

const XP_BY_TYPE: Record<ActivityType, number> = {
  ai_detective: 25,
  prompt_battle: 30,
  solve_it: 35,
  explain_it: 20,
  fact_check: 25,
};

const TYPE_INSTRUCTIONS: Record<ActivityType, string> = {
  ai_detective:
    "Create a passage containing two or three subtle errors for the student to find.",
  prompt_battle:
    "Give a goal and ask the student to write the best possible prompt for it.",
  solve_it: "Create a problem that must be solved with clear reasoning shown.",
  explain_it:
    "Ask the student to explain a concept accurately in their own words.",
  fact_check:
    "Present several claims and ask which ones need verification and why.",
};

function buildSystemPrompt(
  type: ActivityType,
  subject: Subject,
  difficulty: Difficulty
): string {
  const difficultyGuide =
    difficulty === "easy"
      ? "Use simple concepts and straightforward problems."
      : difficulty === "hard"
        ? "Use advanced concepts and require precise, well-justified answers."
        : "Balance complexity with accessibility.";

  return `You are an assessment designer creating a "${type.replace(
    /_/g,
    " "
  )}" challenge for ${subject} at ${difficulty} difficulty.

${TYPE_INSTRUCTIONS[type]}
${difficultyGuide}

Use an engaging real-world mission or mystery rather than a generic textbook question. Write user-facing text in Spanish without Markdown. Keep the question under 90 words and each hint under 25 words.
For solve_it, ai_detective and fact_check include exactly four distinct, plausible options with exactly one correct option; correctAnswer must equal that option verbatim. For prompt_battle and explain_it use an empty options array and ask for a short creative response.
The challenge must have one defensible correct answer, three progressive hints
(from gentle to nearly explicit), and a short explanation of the skill it tests.

Return ONLY a JSON object with exactly this shape:
{
  "title": string,
  "description": string,
  "content": string,
  "correctAnswer": string,
  "options": string[],
  "hints": [string, string, string],
  "explanation": string
}`;
}

/** Validates raw model output, returning null when it cannot be used. */
function parseChallenge(
  raw: unknown,
  type: ActivityType
): ChallengeOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const text = (key: string): string =>
    typeof record[key] === "string" ? (record[key] as string).trim() : "";

  const title = text("title");
  const content = text("content");
  const correctAnswer = text("correctAnswer");
  if (!title || !content || !correctAnswer) return null;

  const hints = Array.isArray(record.hints)
    ? record.hints
        .filter((hint): hint is string => typeof hint === "string")
        .map((hint) => hint.trim())
        .filter(Boolean)
    : [];

  const options = Array.isArray(record.options) ? record.options.filter((item): item is string => typeof item === "string" && !!item.trim()).map((item) => item.trim()) : [];
  const needsOptions = ["solve_it", "ai_detective", "fact_check"].includes(type);
  if (needsOptions && (options.length !== 4 || new Set(options).size !== 4 || !options.includes(correctAnswer))) return null;

  return {
    options: needsOptions ? options : [],
    title,
    description: text("description") || "Complete this challenge.",
    content,
    correctAnswer,
    hints:
      hints.length > 0
        ? hints
        : ["Break the problem into what you know and what you need to find."],
    explanation: text("explanation"),
    xpBase: XP_BY_TYPE[type] ?? 25,
  };
}

export async function generateChallenge(
  type: ActivityType,
  subject: Subject,
  difficulty: Difficulty,
  /** Varies the local bank selection; defaults to the current time. */
  seed: string = String(Date.now())
): Promise<Challenge> {
  const result = await generateStructured<ChallengeOutput>({
    request: {
      context: { feature: "challenge" },
      system: buildSystemPrompt(type, subject, difficulty),
      user: `Generate one ${type.replace(
        /_/g,
        " "
      )} challenge for ${subject} at ${difficulty} difficulty.`,
      temperature: 0.8,
      maxTokens: 1500,
    },
    parse: (raw) => parseChallenge(raw, type),
    local: () => buildChallenge({ type, subject, difficulty, seed }),
  });

  return result.data;
}
