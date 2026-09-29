/**
 * Reads the student's newest message.
 *
 * Everything the tutor does next depends on this: a student asking to be handed
 * the answer, one who is stuck, one who has made a genuine attempt and one who
 * is just saying hello all need different teaching moves. Classifying that in
 * one place keeps the pedagogy in the engine readable.
 */

import { containsAny } from "@/services/ai/local/helpers";
import {
  findLinearEquation,
  normalizeMathText,
  type LinearEquation,
} from "./math/linear";

export type StudentIntent =
  | "answer-demand"
  | "stuck"
  | "frustrated"
  | "explain-request"
  | "greeting"
  | "attempt";

export interface StudentTurn {
  /** The raw text of the message. */
  text: string;
  /** Lower-cased, whitespace-collapsed, for signal matching. */
  normalized: string;
  intent: StudentIntent;
  /** An equation written in this message, if any. */
  equation: LinearEquation | null;
  isQuestion: boolean;
  wordCount: number;
}

/** Direct requests to be given the answer rather than taught. */
const ANSWER_DEMANDS = [
  "do my homework",
  "do it for me",
  "give me the answer",
  "give me the answers",
  "give me the solution",
  "just give me",
  "just tell me",
  "just solve",
  "tell me the answer",
  "what is the answer",
  "what's the answer",
  "whats the answer",
  "solve it for me",
  "solve this for me",
  "answer only",
  "need the answers",
  "i need the answer",
  "write my essay",
  "write it for me",
  "cheat",
];

/** The student has stalled and needs a hint rather than another question. */
const STUCK_SIGNALS = [
  "i don't know",
  "i dont know",
  "i do not know",
  "idk",
  "no idea",
  "i'm stuck",
  "im stuck",
  "i am stuck",
  "stuck",
  "confused",
  "i don't understand",
  "i dont understand",
  "i do not understand",
  "doesn't make sense",
  "does not make sense",
  "i'm lost",
  "im lost",
  "help me",
  "no clue",
  "not sure how",
  "don't get it",
  "dont get it",
];

/** Discouragement. The right move is to shrink the problem, not push harder. */
const FRUSTRATION_SIGNALS = [
  "this is dumb",
  "this is stupid",
  "i hate",
  "too hard",
  "too difficult",
  "i can't do this",
  "i cant do this",
  "i give up",
  "impossible",
  "i'm bad at",
  "im bad at",
  "this is pointless",
];

/** Requests for a direct explanation. */
const EXPLAIN_SIGNALS = [
  "explain",
  "what is",
  "what are",
  "what does",
  "what's",
  "whats",
  "how does",
  "how do",
  "tell me about",
  "describe",
  "define",
  "meaning of",
  "difference between",
  "why does",
  "why do",
];

const GREETINGS = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "hola",
];

/** Chooses the intent, most specific signal first. */
function classify(normalized: string, wordCount: number): StudentIntent {
  if (containsAny(normalized, ANSWER_DEMANDS)) return "answer-demand";
  if (containsAny(normalized, FRUSTRATION_SIGNALS)) return "frustrated";
  if (containsAny(normalized, STUCK_SIGNALS)) return "stuck";

  // "explain" alone is a request; so is an actual question about a concept.
  if (containsAny(normalized, EXPLAIN_SIGNALS)) return "explain-request";

  if (wordCount <= 3 && containsAny(normalized, GREETINGS)) return "greeting";

  return "attempt";
}

/** Classifies the student's newest message. */
export function analyseStudentTurn(text: string): StudentTurn {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  const wordCount = normalized ? normalized.split(" ").length : 0;

  return {
    text: text.trim(),
    normalized,
    intent: classify(normalized, wordCount),
    equation: findLinearEquation(text),
    isQuestion: text.includes("?") || containsAny(normalized, EXPLAIN_SIGNALS),
    wordCount,
  };
}

/**
 * True when the message looks like an answer to a question the tutor asked,
 * rather than a new question of the student's own.
 *
 * Short replies with a symbol, digit or equation are treated as attempts; a
 * full sentence asking something new is not.
 */
export function looksLikeAttempt(turn: StudentTurn): boolean {
  if (turn.intent !== "attempt") return false;
  if (turn.isQuestion && turn.wordCount > 6) return false;

  const stripped = normalizeMathText(turn.text);
  if (!stripped) return false;
  if (/[=+\-*/^]/.test(stripped)) return true;
  if (/\d/.test(stripped)) return true;

  // Short declarative replies ("because you divide both sides") count too.
  return turn.wordCount <= 12;
}
