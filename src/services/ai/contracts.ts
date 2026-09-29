/**
 * Shared vocabulary for the AI layer.
 *
 * Every provider — remote or local — speaks in terms of these types, so the
 * features above them (tutor, coach, challenges, …) never need to know which
 * provider actually produced a reply.
 */

import type { ProviderId } from "./config";

/** A single prior turn in a conversation. */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  /** Instruction that sets the model's role and constraints. */
  system: string;
  /** The current user message or task instruction. */
  user: string;
  /** Prior turns, oldest first, for multi-turn conversations. */
  history?: ChatTurn[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  /** Ask the provider to constrain output to a JSON object, when supported. */
  jsonMode?: boolean;
  /** Stable identifier forwarded to webhook providers for conversation tracking. */
  conversationId?: string;
  /** Extra structured context forwarded to webhook providers. */
  context?: Record<string, unknown>;
}

export interface ChatResult {
  text: string;
  /** Which provider produced `text`. */
  provider: ProviderId;
  /** True when the reply came from the built-in local engine. */
  usedFallback: boolean;
}

export type TransportFailureKind =
  | "config"
  | "auth"
  | "quota"
  | "rate_limit"
  | "server"
  | "timeout"
  | "network"
  | "bad_response";

/** Raised when a remote provider cannot fulfil a request. */
export class TransportError extends Error {
  constructor(
    message: string,
    public readonly kind: TransportFailureKind,
    public readonly status?: number
  ) {
    super(message);
    this.name = "TransportError";
  }
}

/** Failure kinds that will not fix themselves quickly — back off for a while. */
export const PERSISTENT_FAILURE_KINDS: readonly TransportFailureKind[] = [
  "auth",
  "quota",
  "config",
];

/** Collapses a response body into a short, log-safe single line. */
export async function readErrorDetail(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.replace(/\s+/g, " ").slice(0, 300);
  } catch {
    return "";
  }
}
