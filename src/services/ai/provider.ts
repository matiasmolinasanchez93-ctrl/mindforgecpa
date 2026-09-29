/**
 * Provider orchestration.
 *
 * Feature code never talks to a specific AI vendor. It calls `generateText`
 * (free-form replies) or `generateStructured` (validated JSON) and passes a
 * `local` generator. Remote providers are tried first, in priority order; when
 * none is configured — or every one is unavailable — the local engine answers.
 *
 * The practical effect: the product is never broken by a missing key, an
 * exhausted balance, or a disabled webhook.
 */

import {
  resolveRemoteProviders,
  type ProviderId,
  type RemoteProviderConfig,
} from "./config";
import {
  TransportError,
  type ChatRequest,
  type ChatResult,
} from "./contracts";
import { isCoolingDown, recordFailure, recordSuccess } from "./cooldown";
import { extractJsonObject } from "./json";
import { callOpenAiCompatible } from "./transportOpenAi";
import { callMakeWebhook } from "./transportMake";

export interface JsonResult<T> {
  data: T;
  provider: ProviderId;
  usedFallback: boolean;
}

/** Produces a reply with no network access. */
export type LocalGenerator<T> = () => T;

function callProvider(
  provider: RemoteProviderConfig,
  request: ChatRequest
): Promise<string> {
  return provider.id === "make"
    ? callMakeWebhook(provider, request)
    : callOpenAiCompatible(provider, request);
}

/**
 * Tries each configured remote provider in priority order.
 * Returns null when every provider is unavailable, so callers can fall back.
 */
async function attemptRemote(request: ChatRequest): Promise<ChatResult | null> {
  for (const provider of resolveRemoteProviders()) {
    // Skip providers inside their backoff window without touching the network.
    if (isCoolingDown(provider.id)) continue;

    try {
      const text = await callProvider(provider, request);
      recordSuccess(provider.id);
      return { text, provider: provider.id, usedFallback: false };
    } catch (error) {
      if (error instanceof TransportError) {
        recordFailure(provider.id, error.kind);
        console.warn(`[ai] ${error.message}`);
      } else {
        recordFailure(provider.id, "network");
        console.error("[ai] unexpected provider failure", error);
      }
    }
  }
  return null;
}

/**
 * Generates free-form text, falling back to `local` when no remote provider
 * succeeds. Callers therefore always receive a usable reply.
 */
export async function generateText(
  request: ChatRequest,
  local: LocalGenerator<string>
): Promise<ChatResult> {
  const remote = await attemptRemote(request);
  if (remote) return remote;

  console.info("[ai] responding from the local engine");
  return { text: local(), provider: "local", usedFallback: true };
}

export interface StructuredRequest<T> {
  request: ChatRequest;
  /** Validates model output. Return null to reject it and use the local engine. */
  parse: (raw: unknown) => T | null;
  /** Deterministic fallback used when no provider succeeds. */
  local: LocalGenerator<T>;
}

/**
 * Generates structured (JSON) output.
 *
 * Model output is used only when it parses *and* passes `parse`, so a malformed
 * reply degrades to the local engine instead of surfacing an error to the user.
 */
export async function generateStructured<T>(
  options: StructuredRequest<T>
): Promise<JsonResult<T>> {
  const remote = await attemptRemote({ ...options.request, jsonMode: true });

  if (remote) {
    const raw = extractJsonObject(remote.text);
    const parsed = raw === null ? null : options.parse(raw);
    if (parsed !== null) {
      return { data: parsed, provider: remote.provider, usedFallback: false };
    }
    console.warn("[ai] provider returned unusable JSON; using the local engine");
  }

  return { data: options.local(), provider: "local", usedFallback: true };
}
