/**
 * Local challenge generator.
 *
 * Picks a gradeable problem from the bank for the requested activity type and
 * difficulty, rotates between variants so "Next Challenge" produces something
 * new, and withholds hints as difficulty rises.
 */

import {
  CHALLENGE_BANK,
  type ChallengeDifficulty,
  type ChallengeType,
} from "./challengeBank";
import type { ChallengeInput, ChallengeOutput } from "./contracts";
import { pick } from "./helpers";

const XP_BY_TYPE: Record<ChallengeType, number> = {
  ai_detective: 25,
  prompt_battle: 30,
  solve_it: 35,
  explain_it: 20,
  fact_check: 25,
};

const VALID_TYPES: ChallengeType[] = [
  "ai_detective",
  "prompt_battle",
  "solve_it",
  "explain_it",
  "fact_check",
];

/** How the answer should be written at each level. */
const DIFFICULTY_FRAMING: Record<ChallengeDifficulty, string> = {
  easy: "Take your time — accuracy matters far more than speed.",
  medium: "Give a complete answer and show your reasoning, not just the conclusion.",
  hard: "Precision counts here. Vague or partial answers will not score well.",
};

/** Fewer hints as difficulty rises — the point is to need them less. */
const HINTS_BY_DIFFICULTY: Record<ChallengeDifficulty, number> = {
  easy: 3,
  medium: 2,
  hard: 1,
};

function normalizeType(value: string): ChallengeType {
  const candidate = value?.trim().toLowerCase() as ChallengeType;
  return VALID_TYPES.includes(candidate) ? candidate : "solve_it";
}

function normalizeDifficulty(value: string): ChallengeDifficulty {
  const candidate = value?.trim().toLowerCase();
  return candidate === "easy" || candidate === "hard" ? candidate : "medium";
}

/** Builds a complete challenge without any network access. */
export function buildChallenge(input: ChallengeInput): ChallengeOutput {
  const type = normalizeType(input.type);
  const difficulty = normalizeDifficulty(input.difficulty);
  const template = CHALLENGE_BANK[`${type}:${difficulty}`];
  const variant = pick(
    template.variants,
    `${input.seed ?? ""}:${input.subject}:${type}:${difficulty}`
  );

  const subjectNote =
    input.subject && input.subject !== "General"
      ? `\n\nSubject focus: ${input.subject}.`
      : "";

  return {
    title: template.title,
    description: `${template.description} ${DIFFICULTY_FRAMING[difficulty]}`,
    content: `${variant.content}${subjectNote}`,
    correctAnswer: variant.correctAnswer,
    hints: template.hints.slice(
      0,
      Math.max(1, HINTS_BY_DIFFICULTY[difficulty])
    ),
    explanation: template.explanation,
    xpBase: XP_BY_TYPE[type],
  };
}
