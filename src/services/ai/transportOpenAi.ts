import type { RemoteProviderConfig } from "./config";
import {
  TransportError,
  readErrorDetail,
  type ChatRequest,
  type TransportFailureKind,
} from "./contracts";

const DEFAULT_TIMEOUT_MS = 45_000;

/** Maps an HTTP status onto a failure kind the provider chain can reason about. */
function classifyStatus(status: number): TransportFailureKind {
  if (status === 401 || status === 403) return "auth";
  if (status === 402) return "quota";
  if (status === 404) return "config";
  if (status === 408 || status === 504) return "timeout";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  return "bad_response";
}

function statusMessage(status: number, label: string): string {
  if (status === 401 || status === 403) return `${label} rejected the API key.`;
  if (status === 402) return `${label} has no remaining credits.`;
  if (status === 404) {
    return `${label} does not expose the configured model or endpoint.`;
  }
  if (status === 429) return `${label} is rate limited or out of quota.`;
  if (status >= 500) return `${label} returned a server error (${status}).`;
  return `${label} rejected the request (${status}).`;
}

/**
 * Detects an exhausted balance hiding behind a 429. OpenAI reports "out of
 * credits" as 429 `insufficient_quota`, which must back off far longer than a
 * routine rate limit.
 */
function isQuotaExhausted(detail: string): boolean {
  return /quota|credit|billing|insufficient|balance/i.test(detail);
}

/**
 * Calls an OpenAI-compatible `/chat/completions` endpoint.
 * Always throws {@link TransportError} on failure.
 */
export async function callOpenAiCompatible(
  provider: RemoteProviderConfig,
  request: ChatRequest
): Promise<string> {
  if (!provider.baseUrl) {
    throw new TransportError(
      `${provider.label} has no base URL configured.`,
      "config"
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    request.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  const messages = [
    { role: "system" as const, content: request.system },
    ...(request.history ?? []).map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    { role: "user" as const, content: request.user },
  ];

  const body: Record<string, unknown> = {
    model: provider.model,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 1500,
    messages,
  };
  if (request.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey ?? ""}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await readErrorDetail(response);
      const kind =
        response.status === 429 && isQuotaExhausted(detail)
          ? "quota"
          : classifyStatus(response.status);
      throw new TransportError(
        `${statusMessage(response.status, provider.label)} ${detail}`.trim(),
        kind,
        response.status
      );
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new TransportError(
        `${provider.label} returned an empty response.`,
        "bad_response"
      );
    }
    return content.trim();
  } catch (error) {
    if (error instanceof TransportError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new TransportError(`${provider.label} timed out.`, "timeout");
    }
    throw new TransportError(
      `${provider.label} could not be reached: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
      "network"
    );
  } finally {
    clearTimeout(timeout);
  }
}
