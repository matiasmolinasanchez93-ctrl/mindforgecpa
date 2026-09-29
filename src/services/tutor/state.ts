/**
 * Reads the teaching state out of the transcript.
 *
 * The engine is a pure function of the conversation, so progress must be
 * recoverable from the messages themselves — there is no hidden session object,
 * and a page reload or a second device has to resume on exactly the same step.
 *
 * The markers below are both the student-facing labels and the encoding of
 * state. They are defined once, here, and only reply composers may emit them.
 */

import { analyseStudentTurn, looksLikeAttempt } from "./analysis";
import { findLinearEquation, type LinearEquation } from "./math/linear";
import type { TutorTurn } from "./contracts";

export const MARKERS = {
  /** Announces the problem being worked on. The equation follows on the line. */
  problem: "**Problem:**",
  /** Followed by "N of M", e.g. "**Step 2 of 3**". */
  step: "**Step ",
  /** Followed by a number, e.g. "**Hint 1**". */
  hint: "**Hint ",
  /** A direct conceptual explanation. */
  explanation: "**The idea, in plain terms:**",
  /** The complete worked answer. */
  solution: "**Full worked solution**",
  /** Confirms a problem is finished, so the next question starts fresh. */
  solved: "**Problem solved**",
  /** The comprehension check that closes a teaching sequence. */
  check: "Quick check:",
} as const;

const STEP_PATTERN = /\*\*Step (\d+) of (\d+)\*\*/;
const HINT_PATTERN = /\*\*Hint (\d+)\*\*/g;

export interface ActiveProblem {
  /** The equation as the student first wrote it. */
  equation: LinearEquation;
  /** Highest step number the tutor has posed; 0 before the first step. */
  lastStepPosed: number;
  totalSteps: number;
  /** How many times the current step has been posed, re-asks included. */
  asksForLastStep: number;
  /** A genuine attempt at the current step, when the student made one. */
  lastAttempt: string | null;
  /** True once the tutor has confirmed the problem solved. */
  completed: boolean;
}

export interface ConversationState {
  assistantTurns: number;
  /** Highest hint number given so far; 0 means no hints yet. */
  hintLevel: number;
  hasExplained: boolean;
  hasGivenSolution: boolean;
  activeProblem: ActiveProblem | null;
}

/** The equation announced by the most recent problem marker. */
function readProblemEquation(history: TutorTurn[]): {
  equation: LinearEquation;
  index: number;
} | null {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const turn = history[index];
    if (turn.role !== "assistant") continue;

    const marker = turn.content.indexOf(MARKERS.problem);
    if (marker === -1) continue;

    // The equation sits on the same line as the marker.
    const line = turn.content.slice(marker + MARKERS.problem.length).split("\n")[0];
    const equation = findLinearEquation(line);
    if (equation) return { equation, index };
  }
  return null;
}

/**
 * Reconstructs the problem in progress.
 *
 * Anchoring on the marker rather than on the student's latest message matters:
 * a correct intermediate answer ("2x = 10") is itself parseable as an equation,
 * and mistaking it for a new problem would restart the lesson mid-solution.
 */
function readActiveProblem(history: TutorTurn[]): ActiveProblem | null {
  const found = readProblemEquation(history);
  if (!found) return null;
  const { equation, index: problemIndex } = found;

  const completed = history
    .slice(problemIndex + 1)
    .some(
      (turn) => turn.role === "assistant" && turn.content.includes(MARKERS.solved)
    );

  let lastStepPosed = 0;
  let totalSteps = 0;
  let lastStepIndex = -1;
  for (let index = history.length - 1; index > problemIndex; index -= 1) {
    const turn = history[index];
    if (turn.role !== "assistant") continue;

    const match = turn.content.match(STEP_PATTERN);
    if (!match) continue;
    lastStepPosed = Number(match[1]);
    totalSteps = Number(match[2]);
    lastStepIndex = index;
    break;
  }

  let lastAttempt: string | null = null;
  if (lastStepIndex !== -1) {
    const reply = history[lastStepIndex + 1];
    if (
      reply &&
      reply.role === "user" &&
      looksLikeAttempt(analyseStudentTurn(reply.content))
    ) {
      lastAttempt = reply.content;
    }
  }

  // Counts the initial ask plus every re-ask, which is how the engine knows a
  // step has resisted long enough to warrant revealing it.
  let asksForLastStep = 0;
  if (lastStepPosed > 0) {
    const pattern = new RegExp(`\\*\\*Step ${lastStepPosed}(?: of|\\*\\*)`);
    for (let index = problemIndex + 1; index < history.length; index += 1) {
      const turn = history[index];
      if (turn.role === "assistant" && pattern.test(turn.content)) {
        asksForLastStep += 1;
      }
    }
  }

  return {
    equation,
    lastStepPosed,
    totalSteps,
    asksForLastStep,
    lastAttempt,
    completed,
  };
}

/** Derives everything the engine needs to choose its next teaching move. */
export function readConversationState(history: TutorTurn[]): ConversationState {
  const assistantMessages = history
    .filter((turn) => turn.role === "assistant")
    .map((turn) => turn.content);

  let hintLevel = 0;
  for (const content of assistantMessages) {
    for (const match of content.matchAll(HINT_PATTERN)) {
      hintLevel = Math.max(hintLevel, Number(match[1]));
    }
  }

  return {
    assistantTurns: assistantMessages.length,
    hintLevel,
    hasExplained: assistantMessages.some((content) =>
      content.includes(MARKERS.explanation)
    ),
    hasGivenSolution: assistantMessages.some((content) =>
      content.includes(MARKERS.solution)
    ),
    activeProblem: readActiveProblem(history),
  };
}

/** The most recent thing the tutor said, or null on a fresh conversation. */
export function lastAssistantMessage(history: TutorTurn[]): string | null {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].role === "assistant") return history[index].content;
  }
  return null;
}

/** Everything the student has written, for topic matching. */
export function studentMessages(history: TutorTurn[]): string[] {
  return history.filter((turn) => turn.role === "user").map((turn) => turn.content);
}

/** The student's newest message. */
export function lastUserMessage(history: TutorTurn[]): string {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].role === "user") return history[index].content;
  }
  return "";
}

/** True when the tutor's previous message posed a step. */
export function awaitingStepAnswer(history: TutorTurn[]): boolean {
  const previous = lastAssistantMessage(history);
  return previous !== null && previous.includes(MARKERS.step);
}
