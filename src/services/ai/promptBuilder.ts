/**
 * Prompt optimisation.
 *
 * Asks a configured remote provider to restructure a rough idea; when none is
 * available, the local optimiser produces the same structure — role, task,
 * context, constraints, output format — and explains what is still missing.
 */

import { generateStructured } from "./provider";
import { buildOptimizedPromptLocally } from "./local/promptOptimizer";
import type { PromptBuildInput, PromptBuildOutput } from "./local/contracts";

export type PromptBuildResult = PromptBuildOutput;

export class PromptBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptBuilderError";
  }
}

const SYSTEM_PROMPT = `You are a prompt-engineering educator.

Take the student's rough idea and transform it into an optimized AI prompt.

For every prompt you build you must:
1. Explain what makes it effective
2. Show how each part (goal, context, constraints, output format) contributes
3. Give tips for improving prompts further
4. Teach WHY the optimized version works better

Return ONLY a JSON object with exactly this shape:
{
  "optimizedPrompt": string,
  "explanation": string,
  "whyGood": string[],
  "tips": string[]
}`;

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Validates raw model output, returning null when it cannot be used. */
function parsePromptBuild(raw: unknown): PromptBuildOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const optimizedPrompt =
    typeof record.optimizedPrompt === "string"
      ? record.optimizedPrompt.trim()
      : "";
  const explanation =
    typeof record.explanation === "string" ? record.explanation.trim() : "";

  if (!optimizedPrompt || !explanation) return null;

  return {
    optimizedPrompt,
    explanation,
    whyGood: toStringArray(record.whyGood),
    tips: toStringArray(record.tips),
  };
}

export async function buildOptimizedPrompt(
  input: PromptBuildInput
): Promise<PromptBuildResult> {
  const result = await generateStructured<PromptBuildOutput>({
    request: {
      context: { feature: "prompt_builder" },
      system: SYSTEM_PROMPT,
      user: `Transform this rough idea into an optimized AI prompt:

GOAL: ${input.goal}
CONTEXT: ${input.context || "No specific context provided"}
CONSTRAINTS: ${input.constraints || "No specific constraints"}
OUTPUT FORMAT: ${input.outputFormat || "No specific format requested"}`,
      temperature: 0.7,
      maxTokens: 1500,
    },
    parse: parsePromptBuild,
    local: () => buildOptimizedPromptLocally(input),
  });

  return result.data;
}
