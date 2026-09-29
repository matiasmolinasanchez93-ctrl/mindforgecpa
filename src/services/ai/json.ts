/**
 * Tolerant JSON extraction for model output.
 *
 * Models wrap JSON in markdown fences, prefix it with prose, or append trailing
 * commentary. The previous regex-based approach broke on nested objects and on
 * braces inside string values; this scans for the first *balanced* object.
 */

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

/** Removes a surrounding ```json … ``` fence, when present. */
function stripFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? text;
}

/**
 * Extracts the first complete JSON object from `text`.
 * Returns `null` when no parseable object is present.
 */
export function extractJsonObject(text: string): unknown | null {
  const candidate = stripFences(text).trim();
  if (!candidate) return null;

  const direct = tryParse(candidate);
  if (direct !== undefined) return direct;

  const start = candidate.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < candidate.length; index += 1) {
    const char = candidate[index];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        const parsed = tryParse(candidate.slice(start, index + 1));
        return parsed === undefined ? null : parsed;
      }
    }
  }

  return null;
}
