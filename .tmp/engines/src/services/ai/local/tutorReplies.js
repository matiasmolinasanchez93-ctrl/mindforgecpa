"use strict";
/**
 * Reply composers for the Socratic tutor.
 *
 * Each composer produces one teaching move: open the session, refuse to hand
 * over an answer, explain a concept, escalate a hint, or push the student to the
 * next checkpoint. Keeping them separate makes the pedagogy auditable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardrailReply = guardrailReply;
exports.openerReply = openerReply;
exports.explanationReply = explanationReply;
exports.hintReply = hintReply;
exports.progressReply = progressReply;
exports.genericQuestionReply = genericQuestionReply;
function tone(difficulty) {
    if (difficulty === "easy") {
        return "We will build this up slowly, one step at a time.";
    }
    if (difficulty === "hard") {
        return "I will push you for precision here — vague answers will not survive this session.";
    }
    return "I will give you a nudge when you need one, but the thinking stays with you.";
}
function firstCheckpoint(ctx) {
    return ctx.checkpoints[0] ?? "We start with what you already know.";
}
function openingQuestion(ctx) {
    return (ctx.openers[0] ??
        `What do you already know about ${ctx.label}? Even a rough idea is useful.`);
}
/** Used when the student asks to be given the answer outright. */
function guardrailReply(ctx) {
    return `I can help you understand this, but I will not just hand over the answer — working it out is the part that actually builds the skill.

Here is how we will do it: I ask questions, you do the thinking, and I give you a hint the moment you are genuinely stuck.

To get started: ${openingQuestion(ctx)}

What is your first instinct, even if you think it is wrong?`;
}
/** First message of a session. */
function openerReply(ctx) {
    return `Let's work through ${ctx.label} together. ${tone(ctx.difficulty)}

${openingQuestion(ctx)}

Before we go further — what do you already know about ${ctx.label}? Tell me where your understanding stops and we will start exactly there.`;
}
/** Explained directly, then checked. */
function explanationReply(ctx, explanation) {
    return `${explanation}

Now let us make sure that landed. ${firstCheckpoint(ctx)}

Can you say that back to me in your own words — not mine?`;
}
/** Student is stuck; escalate one hint. */
function hintReply(ctx) {
    const hint = ctx.hints[Math.min(ctx.hintLevel, Math.max(0, ctx.hints.length - 1))] ??
        "Break the problem into what you know and what you need to find out.";
    const closing = ctx.hintLevel + 1 >= ctx.hints.length
        ? "If that still does not unlock it, tell me exactly which step loses you and we will rebuild from there."
        : "Try that one step, then tell me what you get — even if you think it is wrong.";
    return `Being stuck is where the learning actually happens. Let's shrink the problem.

Hint: ${hint}

${closing}`;
}
/** Student has engaged; acknowledge, then advance a checkpoint. */
function progressReply(ctx, studentText) {
    const checkpoint = firstCheckpoint(ctx);
    const echoed = studentText.trim().split(/\s+/).slice(0, 12).join(" ");
    return `You're engaging with it properly — that already puts you ahead of guessing.

Let's go one level deeper. ${checkpoint}

${ctx.probe}${echoed
        ? `\n\nYou wrote: "${echoed}${studentText.trim().split(/\s+/).length > 12 ? "…" : ""}". Push that a little further — what makes it true?`
        : ""}`;
}
/** No recognised topic; still teach Socratically. */
function genericQuestionReply(ctx, studentQuestion) {
    return `Good question — and I'm going to make you answer part of it, because that is how it sticks.

Start with what you already know: ${openingQuestion(ctx)}

${ctx.probe}${studentQuestion
        ? `\n\nYour question was: "${studentQuestion.trim()}". Answer that first part and I will build on it.`
        : ""}`;
}
