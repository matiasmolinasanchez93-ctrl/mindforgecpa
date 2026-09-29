/**
 * In-memory circuit breaker for remote AI providers.
 *
 * Without this, every request would spend seconds retrying a provider that is
 * known to be down (an exhausted OpenAI balance, a deleted Make scenario).
 * After a failure we skip that provider for a cooldown window, so the app
 * degrades to the local engine immediately and cheaply.
 *
 * State is per server instance — good enough, and it never leaks between users
 * because it stores no user data.
 */

import {
  PERSISTENT_FAILURE_KINDS,
  type TransportFailureKind,
} from "./contracts";
import type { ProviderId } from "./config";

/** Auth / quota / configuration problems won't fix themselves quickly. */
const PERSISTENT_COOLDOWN_MS = 10 * 60_000;
/** Timeouts, 5xx and transient network errors — retry fairly soon. */
const TRANSIENT_COOLDOWN_MS = 30_000;

const resumeAt = new Map<ProviderId, number>();

export function isCoolingDown(providerId: ProviderId): boolean {
  const until = resumeAt.get(providerId);
  if (until === undefined) return false;
  if (Date.now() >= until) {
    resumeAt.delete(providerId);
    return false;
  }
  return true;
}

export function recordFailure(
  providerId: ProviderId,
  kind: TransportFailureKind
): void {
  const duration = PERSISTENT_FAILURE_KINDS.includes(kind)
    ? PERSISTENT_COOLDOWN_MS
    : TRANSIENT_COOLDOWN_MS;
  resumeAt.set(providerId, Date.now() + duration);
}

export function recordSuccess(providerId: ProviderId): void {
  resumeAt.delete(providerId);
}

/** Diagnostics: which providers are currently being skipped. */
export function activeCooldowns(): { providerId: string; resumeInMs: number }[] {
  const now = Date.now();
  const entries: { providerId: string; resumeInMs: number }[] = [];
  for (const [providerId, until] of resumeAt) {
    if (until > now) entries.push({ providerId, resumeInMs: until - now });
  }
  return entries;
}

/** Exposed for tests. */
export function resetCooldowns(): void {
  resumeAt.clear();
}
