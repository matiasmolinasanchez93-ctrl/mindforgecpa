/**
 * Linear-equation tutoring support.
 *
 * The tutor must not simply announce "x = 5". It has to work out the sequence of
 * legal operations that isolate x, ask the student to perform them one at a
 * time, and check each intermediate result. This module turns an equation into
 * exactly that plan.
 *
 * It parses only the algebra it fully understands. Anything else returns null so
 * the caller falls back to conceptual tutoring, rather than risking a
 * confidently wrong step.
 */

/** One side of an equation, already reduced to `coefficient·x + constant`. */
export interface LinearSide {
  coefficient: number;
  constant: number;
}

export interface LinearEquation {
  left: LinearSide;
  right: LinearSide;
  /** The equation as the student wrote it, trimmed. */
  source: string;
}

export interface LinearStep {
  /** The question the tutor asks the student. */
  prompt: string;
  /** The equation the student should arrive at by performing this step. */
  equation: string;
  /** Answers counted as correct, in normalised form. */
  accept: string[];
  /** Why the step is legal — shown when the student gets it wrong. */
  rule: string;
  /**
   * Progressive nudges toward this step, gentlest first. They never state the
   * final answer to the problem, only how to make this one move.
   */
  hints: string[];
}

export interface LinearStepPlan {
  equation: LinearEquation;
  steps: LinearStep[];
  /** The value of x. */
  solution: number;
}

/** Strips formatting differences so "2x = 10" and "2 x=10" compare equal. */
export function normalizeMathText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/[×✕✖]/g, "*")
    .replace(/÷/g, "/")
    .replace(/\s+/g, "")
    .replace(/[.,;:]+$/, "");
}

/** Renders a number without floating-point noise ("10", not "10.000000001"). */
function formatNumber(value: number): string {
  const rounded = Math.round(value * 1e6) / 1e6;
  return String(rounded);
}

/** Renders the x-term alone: 2 → "2x", 1 → "x", -1 → "-x". */
function formatXTerm(coefficient: number): string {
  if (coefficient === 1) return "x";
  if (coefficient === -1) return "-x";
  return `${formatNumber(coefficient)}x`;
}

/** Renders `a·x + b`, dropping the zero and simplifying the ± sign. */
function formatLinearSide(coefficient: number, constant: number): string {
  const xTerm = formatXTerm(coefficient);
  if (constant === 0) return xTerm;
  return constant > 0
    ? `${xTerm} + ${formatNumber(constant)}`
    : `${xTerm} - ${formatNumber(Math.abs(constant))}`;
}

/** "2" → 2, "" → 1, "-" → -1, "+" → 1, "1.5" → 1.5. */
function parseCoefficient(raw: string): number {
  if (raw === "" || raw === "+") return 1;
  if (raw === "-") return -1;
  const value = Number(raw);
  return Number.isFinite(value) ? value : Number.NaN;
}

/**
 * Parses one side of an equation into `coefficient·x + constant`.
 * Returns null on anything outside the supported subset.
 */
function parseSide(expression: string): LinearSide | null {
  const cleaned = expression.replace(/\s+/g, "").replace(/[−–—]/g, "-");
  if (!cleaned) return null;

  // Split on + / - while keeping the sign attached to each term.
  const terms = cleaned
    .replace(/-/g, "+-")
    .split("+")
    .filter((term) => term !== "");
  if (terms.length === 0) return null;

  let coefficient = 0;
  let constant = 0;

  for (const term of terms) {
    // A division by a number is well defined; anything else is not supported.
    if (term.includes("/")) {
      const division = term.match(/^([+-]?\d*\.?\d*)x\/(\d+\.?\d*)$/);
      if (!division) return null;
      const denominator = Number(division[2]);
      if (!Number.isFinite(denominator) || denominator === 0) return null;
      const numerator = parseCoefficient(division[1]);
      if (!Number.isFinite(numerator)) return null;
      coefficient += numerator / denominator;
      continue;
    }

    if (term.endsWith("x")) {
      const raw = term.slice(0, -1);
      const parsed = parseCoefficient(raw);
      if (!Number.isFinite(parsed)) return null;
      coefficient += parsed;
      continue;
    }

    const value = Number(term);
    if (!Number.isFinite(value)) return null;
    constant += value;
  }

  return { coefficient, constant };
}

/** Parses a full equation string. Returns null when it is not linear in x. */
export function parseLinearEquation(source: string): LinearEquation | null {
  const text = source.trim();
  const sides = text.split("=");
  if (sides.length !== 2) return null;

  const left = parseSide(sides[0]);
  const right = parseSide(sides[1]);
  if (!left || !right) return null;

  // x must survive on one side, otherwise there is nothing to solve.
  if (left.coefficient - right.coefficient === 0) return null;

  return { left, right, source: text };
}

/**
 * Finds the first linear equation inside a sentence, so a student can write
 * "how do I solve 2x + 5 = 15?" and still be tutored on the algebra.
 */
export function findLinearEquation(text: string): LinearEquation | null {
  const candidates = text.match(/[-\d.\s*/+xX]+=[-\d.\s*/+xX]+/g);
  if (!candidates) return null;

  for (const candidate of candidates) {
    if (!/x/i.test(candidate)) continue;
    const parsed = parseLinearEquation(candidate);
    if (parsed) return parsed;
  }
  return null;
}

/** "subtract 5 from both sides" / "add 3 to both sides". */
function describeConstantRemoval(constant: number): string {
  return constant > 0
    ? `subtract ${formatNumber(constant)} from both sides`
    : `add ${formatNumber(Math.abs(constant))} to both sides`;
}

function describeXRemoval(coefficient: number): string {
  return coefficient > 0
    ? `subtract ${formatNumber(coefficient)}x from both sides`
    : `add ${formatNumber(Math.abs(coefficient))}x to both sides`;
}

/**
 * Builds the ordered plan that isolates x, in the order a teacher would use:
 * gather the x-terms, move the constants, then divide.
 *
 * Returns null when the equation is already solved or has no single solution.
 */
export function buildLinearStepPlan(
  equation: LinearEquation
): LinearStepPlan | null {
  const aL = equation.left.coefficient;
  const bL = equation.left.constant;
  const aR = equation.right.coefficient;
  const bR = equation.right.constant;

  const coefficient = aL - aR;
  if (coefficient === 0) return null;

  const steps: LinearStep[] = [];

  // 1. Remove any x-term sitting on the right, so x is gathered on the left.
  if (aR !== 0) {
    const gathered = `${formatLinearSide(coefficient, bL)} = ${formatNumber(bR)}`;
    steps.push({
      prompt: `Both sides have an x, and that is what makes it confusing. What could we do to get x on one side only?`,
      equation: gathered,
      accept: [normalizeMathText(gathered)],
      rule: `Whatever you do to one side you must do to the other, so the move is to ${describeXRemoval(aR)}.`,
      hints: [
        "Start with where x appears. You want it in one place, not two — so something has to cancel on one side.",
        `To cancel ${formatXTerm(aR)}, do the opposite of adding it: ${describeXRemoval(aR)}.`,
      ],
    });
  }

  // 2. Remove the constant on the left, so the x-term stands alone.
  if (bL !== 0) {
    const isolated = `${formatXTerm(coefficient)} = ${formatNumber(bR - bL)}`;
    steps.push({
      prompt: `The x-term still has ${formatNumber(Math.abs(bL))} ${
        bL > 0 ? "added to" : "subtracted from"
      } it. What single operation clears that away?`,
      equation: isolated,
      accept: [normalizeMathText(isolated)],
      rule: `You undo the ${bL > 0 ? "+" : "−"}${formatNumber(
        Math.abs(bL)
      )} by doing the opposite to both sides: ${describeConstantRemoval(bL)}.`,
      hints: [
        "Look at what is attached to the x-term by a + or a −. That attachment is what stands between you and x on its own.",
        `The opposite of ${bL > 0 ? "adding" : "subtracting"} ${formatNumber(
          Math.abs(bL)
        )} is ${bL > 0 ? "subtracting" : "adding"} it — on both sides.`,
      ],
    });
  }

  // 3. Divide by the coefficient, if x is not already alone.
  const solution = (bR - bL) / coefficient;
  if (coefficient !== 1) {
    const solved = `x = ${formatNumber(solution)}`;
    steps.push({
      prompt: `x is being multiplied by ${formatNumber(
        Math.abs(coefficient)
      )}. Apply the opposite operation to both sides — what does the equation become?`,
      equation: solved,
      accept: [
        normalizeMathText(solved),
        normalizeMathText(formatNumber(solution)),
      ],
      rule: `Divide both sides by ${formatNumber(
        Math.abs(coefficient)
      )}. On the left it cancels, leaving x on its own.`,
      hints: [
        "x is trapped inside a multiplication. What is the opposite of multiplying?",
        `Divide both sides by ${formatNumber(
          Math.abs(coefficient)
        )} — on the left it cancels and x stands alone.`,
      ],
    });
  }

  if (steps.length === 0) return null;

  return { equation, steps, solution };
}

/** True when the student's text matches any accepted answer for the step. */
export function answerMatches(studentText: string, accept: string[]): boolean {
  const normalized = normalizeMathText(studentText);
  if (!normalized) return false;
  return accept.some((candidate) => normalized === candidate);
}
