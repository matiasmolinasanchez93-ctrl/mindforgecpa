/**
 * The tutor's voice.
 *
 * Every reply the engine can make is composed here, so the pedagogy is
 * reviewable in one place and the phrasing stays consistent. Each composer is
 * deliberately return-only and side-effect free: the engine decides *which*
 * move to make, these functions decide how it sounds.
 */

import { truncate } from "@/services/ai/local/helpers";
import { MARKERS } from "./state";
import type { TutorDifficulty } from "./contracts";

interface Base {
  /** Human-readable name for what is being taught. */
  label: string;
  difficulty: TutorDifficulty;
  /** The student's first name, when known. */
  studentName: string;
}

/** Addresses the student by name when we have one, without sounding robotic. */
function address(name: string): string {
  return name && name !== "Estudiante" ? `${name}, ` : "";
}

function tone(difficulty: TutorDifficulty): string {
  if (difficulty === "easy") {
    return "We will take this one small step at a time.";
  }
  if (difficulty === "hard") {
    return "I will be strict about the reasoning here — a guess will not survive.";
  }
  return "I will nudge when you need it, but the thinking stays yours.";
}

/** The concrete question that opens a topic. */
function opening(ctx: Base, opener: string | null): string {
  return (
    opener ??
    `What do you already know about ${ctx.label}? Even a rough idea is useful.`
  );
}

/** First contact in a conversation: find out what is already understood. */
export function openerReply(
  ctx: Base,
  opener: string | null,
  resumeNote?: string
): string {
  return `${address(ctx.studentName)}let's work on ${ctx.label}. ${tone(
    ctx.difficulty
  )}
${resumeNote ? `\n${resumeNote}\n` : ""}
${opening(ctx, opener)}

Tell me where your understanding stops and we will start exactly there.`;
}

/** The student asked to be handed the answer. Redirect to the thinking. */
export function guardrailReply(ctx: Base, opener: string | null): string {
  return `I can get you there, but I am not going to hand you the answer — working it out is the part that actually sticks.

Here is how we will do it: I ask, you think, and the moment you are genuinely stuck I give you a hint.

${opening(ctx, opener)}

What is your first instinct, even if you think it is wrong?`;
}

/** A direct explanation, always followed by a check for understanding. */
export function explainReply(
  ctx: Base,
  explanation: string,
  check: string
): string {
  return `${MARKERS.explanation}

${explanation}

${MARKERS.check} ${check}`;
}

/** An escalating hint. Numbered so progress is visible to the student. */
export function hintReply(
  ctx: Base,
  hintNumber: number,
  hint: string,
  isLastHint: boolean
): string {
  const closing = isLastHint
    ? "If that still does not unlock it, tell me the exact step that loses you and we will rebuild from there."
    : "Try just that one step and tell me what you get — even if you think it is wrong.";

  return `${address(ctx.studentName)}being stuck is where the learning actually happens. Let's shrink the problem.

${MARKERS.hint}${hintNumber}** ${hint}

${closing}`;
}

/** Poses one step of a multi-step problem, without revealing its answer. */
export function stepReply(options: {
  ctx: Base;
  /** The equation being solved, announced so the student always sees it. */
  problem: string;
  stepNumber: number;
  totalSteps: number;
  prompt: string;
  /** Shown when the student has earned a nudge on this step. */
  hint?: string | null;
}): string {
  const { problem, stepNumber, totalSteps, prompt, hint } = options;
  const lead =
    stepNumber === 1
      ? `Let's solve this the way a mathematician would — one operation at a time.`
      : `Good. Next move.`;

  return `${lead}

${MARKERS.problem} ${problem}

${MARKERS.step}${stepNumber} of ${totalSteps}**

${prompt}${hint ? `\n\n${MARKERS.hint}${hint}** ${hintPreamble(stepNumber)} ${hint}` : ""}`;
}

function hintPreamble(stepNumber: number): string {
  return stepNumber === 1
    ? "Since this is the first move, here is a starting hint:"
    : "Here is a hint if you need it:";
}

/** Confirms a correct step and, unless it was the last, asks the next one. */
export function stepCorrectReply(options: {
  ctx: Base;
  stepNumber: number;
  totalSteps: number;
  result: string;
  nextPrompt: string | null;
  isFinalStep: boolean;
}): string {
  const { stepNumber, totalSteps, result, nextPrompt, isFinalStep } = options;

  if (isFinalStep) {
    return `That is it. ${result} — and you got there yourself, which is the part that counts.

${MARKERS.step}${stepNumber} of ${totalSteps}**

${MARKERS.solved} Substituting it back into the original equation makes both sides equal, so the answer is confirmed.

${MARKERS.check} In one sentence, why was that the right move?`;
  }

  return `Exactly right — ${result}.

${MARKERS.step}${stepNumber + 1} of ${totalSteps}**

${nextPrompt ?? "What is the next operation?"}`;
}

/** The student's step was wrong: name the error, explain, ask again. */
export function stepWrongReply(options: {
  ctx: Base;
  stepNumber: number;
  rule: string;
  expected: string;
  said: string;
  hint: string | null;
}): string {
  const { stepNumber, rule, expected, said, hint } = options;

  return `Not quite — and the reason is worth pinning down.

You had: ${truncate(said, 80)}

${rule}

So that step gives ${expected}.${hint ? `\n\n${MARKERS.hint}** ${hint}` : ""}

${MARKERS.step}${stepNumber}** Try that step again — what do you get?`;
}

/** The step has resisted several attempts; give that step's result and move on. */
export function stepRevealedReply(options: {
  ctx: Base;
  stepNumber: number;
  totalSteps: number;
  result: string;
  rule: string;
  nextPrompt: string | null;
}): string {
  const { stepNumber, totalSteps, result, rule, nextPrompt } = options;

  return `This step has earned an answer, so here it is — but the rest is still yours.

${rule}

That gives ${result}.

${MARKERS.step}${stepNumber} of ${totalSteps}**

${nextPrompt ?? "Now finish it off — what is x?"}`;
}

/**
 * The full worked solution. Given only when the student has been guided and
 * still cannot proceed, and always followed by a comprehension check.
 */
export function workedSolutionReply(options: {
  ctx: Base;
  equation: string;
  solution: string;
  steps: string[];
}): string {
  const { equation, solution, steps } = options;
  const walkthrough = steps.map((line, i) => `${i + 1}. ${line}`).join("\n");

  return `You have done real work here, so let me show you the whole path — then you tell me which step was the sticking point.

${MARKERS.solved}

${MARKERS.solution}

Starting from ${equation}:
${walkthrough}

So ${solution}.

${MARKERS.check} Which of those steps was the one you could not see? Naming it is how we fix it.`;
}

/** Acknowledges a substantive attempt on an open concept and pushes deeper. */
export function probeReply(
  ctx: Base,
  studentText: string,
  probe: string,
  checkpoint: string
): string {
  return `You're engaging with this properly — that already puts you ahead of guessing.

Working toward: ${checkpoint}

${probe}

You wrote: "${truncate(studentText, 140)}" — what makes that true, rather than just plausible?`;
}

/** The student is discouraged. Lower the barrier instead of pushing harder. */
export function frustrationReply(ctx: Base, smallestStep: string): string {
  return `${address(ctx.studentName)}that reaction is fair — this is genuinely hard, and hard is not the same as impossible.

Let's make it much smaller. Forget the whole problem for a second.

${smallestStep}

Just that. Nothing else yet.`;
}

/** A greeting that still moves the session forward. */
export function greetingReply(ctx: Base, opener: string | null): string {
  return `${address(ctx.studentName)}hello. Let's use the time well.

${opening(ctx, opener)}`;
}

/** A short, non-committal student reply — ask for more substance. */
export function clarifyReply(ctx: Base, studentText: string, probe: string): string {
  return `Say a little more — "${truncate(studentText, 60)}" could mean a few different things.

${probe}

${ctx.label ? `Keep ${ctx.label} in mind as you answer.` : ""}`.trim();
}

/** Closes a concept with a comprehension check. */
export function checkUnderstandingReply(ctx: Base, check: string): string {
  return `${MARKERS.check} ${check}`;
}

/** After a completed problem, offer the next one without stalling. */
export function completedReply(ctx: Base, summary: string): string {
  return `${MARKERS.solved}

${summary}

${MARKERS.check} Could you do the next one of these without me? Tell me the first step you would take.`;
}
