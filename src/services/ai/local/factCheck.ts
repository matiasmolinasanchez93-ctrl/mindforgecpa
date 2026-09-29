/**
 * Local fact checker.
 *
 * Extracts the claims in a passage, classifies each one by what makes it
 * checkable (a statistic, an absolute word, a superlative, a known myth), and
 * tells the student how to verify it.
 *
 * It deliberately never asserts that a claim is true. Its output is a list of
 * things that need evidence, which is the actual skill the product teaches.
 */

import type { ClaimAssessment, ClaimStatus, FactCheckOutput } from "./contracts";
import {
  ABSOLUTE_WORDS,
  BENIGN_MARKERS,
  HEDGE_WORDS,
  MYTH_PATTERNS,
  NON_CLAIM_STARTS,
  SUPERLATIVE_WORDS,
  VERIFIABLE_PATTERNS,
} from "./factClaimPatterns";
import { containsAny, splitSentences, truncate, unique } from "./helpers";

const MAX_CLAIMS = 8;
const MIN_CLAIM_LENGTH = 15;
const MIN_CLAIM_WORDS = 3;
const HEALTH_TOPIC =
  /health|diet|vitamin|supplement|exercise|sleep|disease|calorie|weight|medical|doctor|brain|body|immune/i;

interface ScoredSentence {
  sentence: string;
  score: number;
}

/** Scores how much a sentence looks like a claim worth verifying. */
function scoreSentence(sentence: string): number {
  const lower = sentence.toLowerCase();
  let score = 0;

  if (MYTH_PATTERNS.some((pattern) => pattern.test.test(sentence))) score += 6;

  const verifiableHits = VERIFIABLE_PATTERNS.filter((pattern) =>
    pattern.test(sentence)
  ).length;
  score += Math.min(verifiableHits, 3) * 3;

  if (containsAny(lower, ABSOLUTE_WORDS)) score += 2;
  if (containsAny(lower, SUPERLATIVE_WORDS)) score += 1;
  if (containsAny(lower, HEDGE_WORDS)) score -= 1;
  if (containsAny(lower, BENIGN_MARKERS)) score -= 1;

  if (sentence.trim().length < MIN_CLAIM_LENGTH) score -= 3;
  if (NON_CLAIM_STARTS.includes(lower.split(/\s+/)[0] ?? "")) score -= 4;
  if (sentence.trim().endsWith("?")) score -= 4;

  return score;
}

function verificationAdvice(sentence: string): string {
  if (VERIFIABLE_PATTERNS[0].test(sentence) || /\b\d{4}\b/.test(sentence)) {
    return "Find the original study or dataset. Check the sample size, who funded it, and whether the effect is as large as stated.";
  }
  if (HEALTH_TOPIC.test(sentence)) {
    return "Check a public health body such as the WHO, NHS or CDC rather than a blog or a social post.";
  }
  if (containsAny(sentence.toLowerCase(), ABSOLUTE_WORDS)) {
    return "Look for a single counterexample. Absolute claims only need one to be wrong.";
  }
  if (containsAny(sentence.toLowerCase(), SUPERLATIVE_WORDS)) {
    return "Ask 'compared with what?'. A 'best' or 'most effective' claim is meaningless without the comparison set.";
  }
  return "Search for this claim in two independent, reputable sources and see whether they agree.";
}

function assess(sentence: string): ClaimAssessment {
  const statement = truncate(sentence, 300);
  const myth = MYTH_PATTERNS.find((pattern) => pattern.test.test(sentence));

  if (myth) {
    return {
      statement,
      status: "likely_inaccurate" satisfies ClaimStatus,
      explanation: myth.explanation,
      suggestedVerification: myth.verification,
    };
  }

  const hasFigures = VERIFIABLE_PATTERNS.some((pattern) => pattern.test(sentence));
  const hasAbsolutes = containsAny(sentence.toLowerCase(), ABSOLUTE_WORDS);
  const hasSuperlatives = containsAny(sentence.toLowerCase(), SUPERLATIVE_WORDS);
  const isHedged = containsAny(sentence.toLowerCase(), HEDGE_WORDS);
  const isBenign = containsAny(sentence.toLowerCase(), BENIGN_MARKERS);

  if (hasFigures) {
    return {
      statement,
      status: "needs_verification",
      explanation:
        "This includes a specific figure, date or statistic. That is exactly the kind of detail that AI reproduces confidently while inventing or misremembering it.",
      suggestedVerification: verificationAdvice(sentence),
    };
  }

  if (hasAbsolutes) {
    return {
      statement,
      status: "needs_verification",
      explanation:
        "This uses absolute language ('always', 'never', 'only', 'proves'). Overstatement is where most errors hide, because a single exception falsifies the claim.",
      suggestedVerification: verificationAdvice(sentence),
    };
  }

  if (hasSuperlatives) {
    return {
      statement,
      status: "needs_verification",
      explanation:
        "This is a comparative or superlative claim, which can only be judged against a specific comparison set that is not stated here.",
      suggestedVerification: verificationAdvice(sentence),
    };
  }

  if (isHedged) {
    return {
      statement,
      status: "uncertain",
      explanation:
        "This is phrased as a possibility rather than a fact, so it is not yet a claim you can confirm or refute outright.",
      suggestedVerification:
        "Ask which study is being referenced and how strong the association actually is.",
    };
  }

  if (isBenign && !hasFigures) {
    return {
      statement,
      status: "likely_accurate" satisfies ClaimStatus,
      explanation:
        "This is a broad, uncontested statement with no figures or absolutes. It is unlikely to be wrong, but it is also not precise enough to be useful on its own.",
      suggestedVerification:
        "No urgent verification needed — but be careful that vague statements are not being used to smuggle in specific claims.",
    };
  }

  return {
    statement,
    status: "uncertain",
    explanation:
      "There is not enough detail here to judge this either way. It may be accurate, but nothing in the text supports it.",
    suggestedVerification: verificationAdvice(sentence),
  };
}

/** Analyses a passage and returns what needs verifying. No network access. */
export function analyzeClaimsLocally(text: string): FactCheckOutput {
  const sentences = splitSentences(text);

  const ranked: ScoredSentence[] = sentences
    .map((sentence) => ({ sentence, score: scoreSentence(sentence) }))
    .filter((entry) => {
      const words = entry.sentence.trim().split(/\s+/).length;
      return (
        entry.sentence.trim().length >= MIN_CLAIM_LENGTH &&
        words >= MIN_CLAIM_WORDS
      );
    })
    .sort((a, b) => b.score - a.score);

  // Only sentences long enough to hold a real claim are considered. Text with
  // none should honestly report zero claims rather than invent one.
  const selected = ranked.slice(0, MAX_CLAIMS);

  const claims = selected.map((entry) => assess(entry.sentence));

  const inaccurate = claims.filter(
    (claim) => claim.status === "likely_inaccurate"
  ).length;
  const needsChecking = claims.filter(
    (claim) => claim.status === "needs_verification"
  ).length;

  const overallAssessment =
    claims.length === 0
      ? "No checkable claims were found in this text. It may be too short, or too general to contain anything specific enough to verify."
      : `Found ${claims.length} claim${
          claims.length === 1 ? "" : "s"
        } to examine: ${needsChecking} that should be verified before you repeat ${
          needsChecking === 1 ? "it" : "them"
        }${inaccurate > 0 ? `, and ${inaccurate} that contradict established evidence` : ""}. Confidence in the writing is not evidence of accuracy.`;

  const keyWarnings: string[] = [
    "AI-generated text can be confident and wrong at the same time. Fluency is not evidence.",
  ];
  if (inaccurate > 0) {
    keyWarnings.push(
      "At least one claim here contradicts well-established evidence, which suggests the passage was not checked against sources."
    );
  }
  if (claims.some((claim) => claim.explanation.includes("figure"))) {
    keyWarnings.push(
      "Precise-looking numbers are the easiest detail to fabricate, because they read as authoritative."
    );
  }
  if (
    claims.some((claim) => claim.explanation.includes("absolute language"))
  ) {
    keyWarnings.push(
      "Absolute words were used. Treat 'always', 'never' and 'only' as claims to test rather than descriptions of reality."
    );
  }

  const questionsToInvestigate = unique([
    "Which source originally reported the numbers in this text?",
    "How old is this information, and has it been superseded?",
    "Who funded or conducted the research being referenced?",
    ...(inaccurate > 0
      ? [
          "What does the current scientific consensus say about the claim that was flagged as inaccurate?",
        ]
      : []),
    ...(needsChecking > 0
      ? ["Could this claim be true only in a narrower situation than stated?"]
      : []),
  ]);

  return {
    overallAssessment,
    claims,
    keyWarnings,
    questionsToInvestigate,
    confidenceNote:
      "This analysis is pattern-based and offline: it flags what needs checking rather than confirming what is true. Treat every item marked 'needs verification' as unconfirmed until you check it yourself.",
  };
}
