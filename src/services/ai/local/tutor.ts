/**
 * Local Socratic tutor.
 *
 * The pedagogy is deliberate and mirrors the product's promise: the tutor does
 * not hand over answers. It opens by finding out what the student already knows,
 * advances one checkpoint at a time, escalates hints only when the student is
 * genuinely stuck, and explains a concept directly when that is the better
 * teaching move — always followed by a check for understanding.
 */

import type { TutorInput } from "./contracts";
import { TUTOR_TOPICS, type TutorTopic } from "./tutorTopics";
import { TOPIC_EXPLANATIONS } from "./tutorExplanations";
import {
  explanationReply,
  genericQuestionReply,
  guardrailReply,
  hintReply,
  openerReply,
  progressReply,
  type TutorContext,
  type TutorDifficulty,
} from "./tutorReplies";
import { containsAny, pick } from "./helpers";

/** Explicit requests to be given the answer rather than taught. */
const ANSWER_DEMANDS = [
  "do my homework",
  "give me the answer",
  "give me the answers",
  "just give me",
  "just tell me",
  "tell me the answer",
  "what is the answer",
  "what's the answer",
  "whats the answer",
  "write my essay",
  "solve it for me",
  "solve this for me",
  "answer only",
  "need the answers",
  "give me the solution",
];

/** Signals that the student has stalled and needs a hint. */
const STUCK_SIGNALS = [
  "i don't know",
  "i dont know",
  "idk",
  "no idea",
  "i'm stuck",
  "im stuck",
  "stuck",
  "confused",
  "i don't understand",
  "i dont understand",
  "doesn't make sense",
  "does not make sense",
  "help me",
  "i'm lost",
  "im lost",
];

/** Requests for a direct explanation. */
const EXPLAIN_SIGNALS = [
  "explain",
  "what is",
  "what are",
  "what does",
  "how does",
  "how do",
  "tell me about",
  "describe",
  "define",
  "meaning of",
];

/** Rotating probes keep the questioning from feeling scripted. */
const PROBES = [
  "What is your reasoning there?",
  "How would you check whether that is right?",
  "What would change if the numbers were different?",
  "Can you give me an example of that?",
  "Why does that step work — not just what to do?",
  "What would happen if you did the opposite?",
];

const GENERIC_CHECKPOINTS = [
  "State the idea in your own words, without the textbook phrasing",
  "Identify exactly where your understanding stops",
  "Apply it to one example you have not seen before",
];

const GENERIC_HINTS = [
  "Separate what you know from what you still need to find out, and write both down.",
  "Look for the definition or rule that connects those two things.",
  "Try the simplest possible version of the problem first, then add the complication back.",
];

const GENERIC_MISCONCEPTIONS = [
  "Recognising a term is not the same as understanding it",
  "Skipping steps because the answer feels obvious",
];

function normalizeDifficulty(value: string): TutorDifficulty {
  return value === "easy" || value === "hard" ? value : "medium";
}

/** Scores every known topic against the topic field and everything the student wrote. */
function matchTopic(input: TutorInput): TutorTopic | null {
  const haystack = [
    input.topic,
    input.subject,
    ...input.history
      .filter((turn) => turn.role === "user")
      .map((turn) => turn.content),
  ]
    .join(" ")
    .toLowerCase();

  let best: { topic: TutorTopic; score: number } | null = null;

  for (const topic of TUTOR_TOPICS) {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (haystack.includes(keyword)) {
        // Multi-word keys are far more specific than single words.
        score += keyword.includes(" ") ? 3 : 2;
      }
    }
    // The declared subject is a weak signal — never enough on its own.
    if (
      topic.subject.toLowerCase() === input.subject.toLowerCase() &&
      score > 0
    ) {
      score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { topic, score };
    }
  }

  return best?.topic ?? null;
}

function topicLabel(input: TutorInput, topic: TutorTopic | null): string {
  if (input.topic?.trim()) return input.topic.trim();
  if (topic) return topic.id.replace(/-/g, " ");
  if (input.subject && input.subject !== "General") return input.subject;
  return "this topic";
}

/** Builds the tutor's reply without any network access. */
export function buildTutorReply(input: TutorInput): string {
  const assistantTurns = input.history.filter(
    (turn) => turn.role === "assistant"
  ).length;
  const lastUser =
    [...input.history].reverse().find((turn) => turn.role === "user")?.content ??
    "";
  const lower = lastUser.toLowerCase();

  const topic = matchTopic(input);
  const explanation = topic ? TOPIC_EXPLANATIONS[topic.id] : undefined;

  const ctx: TutorContext = {
    label: topicLabel(input, topic),
    checkpoints: topic?.checkpoints ?? GENERIC_CHECKPOINTS,
    hints: topic?.hints ?? GENERIC_HINTS,
    misconceptions: topic?.misconceptions ?? GENERIC_MISCONCEPTIONS,
    openers: topic?.openers ?? [],
    difficulty: normalizeDifficulty(input.difficulty),
    hintLevel: Math.max(0, assistantTurns - 1),
    probe: pick(PROBES, lastUser || "probe"),
  };

  // Refuse to do the work for the student, whichever turn it is.
  if (containsAny(lower, ANSWER_DEMANDS)) return guardrailReply(ctx);

  // A direct explanation is the right move when asked for one and we have it.
  if (explanation && containsAny(lower, EXPLAIN_SIGNALS)) {
    return explanationReply(ctx, explanation);
  }

  // Very first exchange: find out what they already know.
  if (assistantTurns === 0) return openerReply(ctx);

  // Stalled: escalate one hint rather than repeating the same question.
  if (containsAny(lower, STUCK_SIGNALS)) return hintReply(ctx);

  // Engaged with a recognised topic: push to the next checkpoint.
  if (topic) return progressReply(ctx, lastUser);

  // Unknown topic: keep teaching Socratically.
  return genericQuestionReply(ctx, lastUser);
}
