/**
 * Fact checking.
 *
 * Asks a configured remote provider to analyse a passage; when none is
 * available, the local pattern engine extracts the claims and classifies what
 * needs verifying. Neither path asserts that a claim is true — both point at
 * what requires evidence, which is the skill being taught.
 */

import { generateStructured } from "./provider";
import { analyzeClaimsLocally } from "./local/factCheck";
import type { ClaimAssessment, ClaimStatus, FactCheckOutput } from "./local/contracts";

export type FactCheckResult = FactCheckOutput;

export class FactCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FactCheckError";
  }
}

const STATUSES: ClaimStatus[] = [
  "likely_accurate",
  "needs_verification",
  "likely_inaccurate",
  "uncertain",
];

const SYSTEM_PROMPT = `You are a critical-thinking educator who fact-checks AI-generated text.

PRINCIPLES:
- Never confirm a claim is true just because it sounds confident.
- Flag hallucinated statistics, logical leaps, outdated information and oversimplifications.
- Teach HOW to verify, rather than simply asserting an answer.
- Do not claim to have searched the web or checked live sources unless tool evidence is actually available. Mark time-sensitive claims as needing verification. Never invent citations.
- Keep each explanation concise and write user-facing text in Spanish.
- Distinguish three outcomes: likely accurate, needs verification, and likely inaccurate.

Return ONLY a JSON object with exactly this shape:
{
  "overallAssessment": string,
  "claims": [
    {
      "statement": string,
      "status": "likely_accurate" | "needs_verification" | "likely_inaccurate" | "uncertain",
      "explanation": string,
      "suggestedVerification": string
    }
  ],
  "keyWarnings": string[],
  "questionsToInvestigate": string[],
  "confidenceNote": string
}`;

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseClaim(value: unknown): ClaimAssessment | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const statement =
    typeof record.statement === "string" ? record.statement.trim() : "";
  const status = record.status as ClaimStatus;
  if (!statement || !STATUSES.includes(status)) return null;

  return {
    statement,
    status,
    explanation:
      typeof record.explanation === "string" ? record.explanation.trim() : "",
    suggestedVerification:
      typeof record.suggestedVerification === "string"
        ? record.suggestedVerification.trim()
        : "Verify this claim against a primary source.",
  };
}

/** Validates raw model output, returning null when it cannot be used. */
function parseFactCheck(raw: unknown): FactCheckOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const claims = Array.isArray(record.claims)
    ? record.claims
        .map(parseClaim)
        .filter((claim): claim is ClaimAssessment => claim !== null)
    : [];

  if (claims.length === 0) return null;

  return {
    overallAssessment:
      typeof record.overallAssessment === "string"
        ? record.overallAssessment.trim()
        : `Found ${claims.length} claims to examine.`,
    claims,
    keyWarnings: toStringArray(record.keyWarnings),
    questionsToInvestigate: toStringArray(record.questionsToInvestigate),
    confidenceNote:
      typeof record.confidenceNote === "string"
        ? record.confidenceNote.trim()
        : "Verify independently before relying on any of these claims.",
  };
}

export async function analyzeClaims(text: string): Promise<FactCheckResult> {
  const result = await generateStructured<FactCheckOutput>({
    request: {
      context: { feature: "fact_check" },
      system: SYSTEM_PROMPT,
      user: `Analyse the following AI-generated text for accuracy and reliability. Extract the claims and assess each one.\n\n"""\n${text}\n"""`,
      temperature: 0.3,
      maxTokens: 2000,
    },
    parse: parseFactCheck,
    local: () => analyzeClaimsLocally(text),
  });

  return result.data;
}
