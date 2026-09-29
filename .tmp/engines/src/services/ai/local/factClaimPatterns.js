"use strict";
/**
 * Pattern tables for the local fact checker.
 *
 * These decide what counts as a claim worth verifying and how to classify it.
 * The guiding principle: the checker should never *assert* that something is
 * true because a model said so. Its job is to point at what needs evidence.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NON_CLAIM_STARTS = exports.BENIGN_MARKERS = exports.HEDGE_WORDS = exports.SUPERLATIVE_WORDS = exports.ABSOLUTE_WORDS = exports.VERIFIABLE_PATTERNS = exports.MYTH_PATTERNS = void 0;
/** Widely repeated claims that the evidence contradicts. */
exports.MYTH_PATTERNS = [
    {
        test: /10%|ten percent/i,
        explanation: "The claim that humans use only 10% of their brain is a myth. Brain imaging shows activity across the whole brain, even during sleep.",
        verification: "Check any introductory neuroscience source or a brain-imaging study — every region has a function.",
    },
    {
        test: /vitamin c[\s\S]{0,40}(cure|prevent|treat)[\s\S]{0,20}cold/i,
        explanation: "Vitamin C does not prevent or cure the common cold. Supplement trials show at most a very small reduction in duration in specific groups.",
        verification: "Look for the Cochrane review on vitamin C and the common cold.",
    },
    {
        test: /sugar[\s\S]{0,60}hyperactiv/i,
        explanation: "Controlled studies find no consistent link between sugar and hyperactivity. The effect appears to come from expectation, not the sugar.",
        verification: "Search for blinded trials on sugar and children's behaviour — parents rate behaviour differently when they believe sugar was given.",
    },
    {
        test: /goldfish[\s\S]{0,30}memory|memory[\s\S]{0,30}goldfish/i,
        explanation: "Goldfish have memories lasting months, not three seconds. The three-second claim has no experimental basis.",
        verification: "Look for studies on goldfish learning and memory retention.",
    },
    {
        test: /detox|toxins/i,
        explanation: "'Detox' products claim to remove unspecified toxins, but they rarely name the substance being removed, and the body already clears these through the liver and kidneys.",
        verification: "Ask which specific toxin is being removed and by what mechanism — a named, measurable claim.",
    },
    {
        test: /(shav|shav)[\w]*[\s\S]{0,40}(thicker|faster|darker)/i,
        explanation: "Shaving does not make hair grow back thicker or faster — it blunts the tip, which feels coarser only until the hair grows out.",
        verification: "Look for controlled studies comparing shaved and unshaved hair regrowth.",
    },
    {
        test: /knuckle|knuckles/i,
        explanation: "Cracking knuckles does not cause arthritis. The noise comes from gas bubbles collapsing in the joint fluid.",
        verification: "Search for long-term studies comparing habitual knuckle-crackers with non-crackers.",
    },
    {
        test: /(left|right)[\s-]*brained|left brain|right brain/i,
        explanation: "The 'left-brained/right-brained' personality idea is not supported. Both hemispheres are used for almost every task, connected by the corpus callosum.",
        verification: "Check neuroscience sources on hemispheric lateralisation — the functions are more specific than personalities.",
    },
    {
        test: /(8|eight) glasses[\s\S]{0,40}(water|day)/i,
        explanation: "The 'eight glasses a day for everyone' rule is a rule of thumb, not a researched recommendation. Fluid needs vary with body size, activity and climate.",
        verification: "Check public health guidance on fluid intake — most sources deliberately avoid a single universal number.",
    },
];
/** Language that marks a claim as measurable, and therefore checkable. */
exports.VERIFIABLE_PATTERNS = [
    /\d+(\.\d+)?\s?%/,
    /\b\d{4}\b/,
    /\b\d+(\.\d+)?\s?(km|kg|mg|ml|cm|mm|m|g|litres?|liters?|miles?|hours?|minutes?|years?|seconds?)\b/i,
    /\b\d[\d,]{2,}\b/,
    /\b(per cent|percent|percentage)\b/i,
    /\b(average|median|mean|rate|ratio|correlat|study|research|survey|sample)\w*/i,
    /\b(statistics?|data|evidence|results?)\b/i,
    /\b(tripled|doubled|halved|increased by|decreased by|fell by|rose by)\b/i,
];
/** Absolute language — the single strongest predictor of an overclaim. */
exports.ABSOLUTE_WORDS = [
    "always",
    "never",
    "all ",
    "every ",
    "only ",
    "none",
    "proves",
    "proof that",
    "guarantees",
    "guaranteed",
    "completely",
    "100%",
    "impossible",
    "no one",
    "nobody",
    "everyone knows",
];
/** Comparative and superlative claims need a comparison to be meaningful. */
exports.SUPERLATIVE_WORDS = [
    "best",
    "worst",
    "most effective",
    "fastest",
    "largest",
    "smallest",
    "highest",
    "lowest",
    "better than",
    "worse than",
    "more effective",
    "single most",
];
/** Hedged language — the claim itself is not yet definite. */
exports.HEDGE_WORDS = [
    "may ",
    "might",
    "could ",
    "possibly",
    "some studies",
    "suggests",
    "appears to",
    "seems to",
    "is thought to",
    "is believed to",
    "tends to",
];
/** General health-and-wellbeing statements that are not contested. */
exports.BENIGN_MARKERS = [
    "is important for",
    "can help",
    "contributes to",
    "is a factor in",
    "is associated with",
    "is generally",
];
/** Openers that indicate a question or instruction, not a claim. */
exports.NON_CLAIM_STARTS = [
    "what",
    "why",
    "how",
    "when",
    "where",
    "who",
    "which",
    "write",
    "explain",
    "list",
    "give",
    "describe",
    "summarise",
    "summarize",
    "please",
];
