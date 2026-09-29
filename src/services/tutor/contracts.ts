/**
 * Vocabulary for the tutor engine.
 *
 * The tutor is a pure function of the conversation: given the transcript, the
 * subject and the student's level, it decides the next pedagogical move. Keeping
 * that decision separate from the wording makes the teaching auditable and lets
 * the same engine serve both the local fallback and the remote model's context.
 */

import type { Difficulty, Subject } from "@/types";

export type TutorDifficulty = Difficulty;

/** One turn of the conversation, oldest first. */
export interface TutorTurn {
  role: "user" | "assistant";
  content: string;
}

/** What the tutor knows about the student, beyond the conversation itself. */
export interface TutorStudent {
  name: string;
  /** Free-text grade, e.g. "9th grade". Empty when the student never set it. */
  grade: string;
}

export interface TutorRequest {
  /**
   * The full conversation including the student's newest message as the last
   * entry. The engine never re-reads the database, so replays are deterministic.
   */
  history: TutorTurn[];
  subject: Subject;
  topic: string;
  difficulty: TutorDifficulty;
  student: TutorStudent;
}

/**
 * The teaching move the engine chose. Surfaced in the API response so the UI
 * can label a reply ("Hint", "Your turn") and so the behaviour is testable.
 */
export type TeachingMove =
  | "opener"
  | "guardrail"
  | "explain"
  | "hint"
  | "step"
  | "correct"
  | "confirm"
  | "probe"
  | "worked-solution";

export interface TutorResult {
  reply: string;
  move: TeachingMove;
  /** For step-wise problems: which step this reply covers, 1-based. */
  step?: number;
  /** For step-wise problems: how many steps the problem has in total. */
  totalSteps?: number;
}
