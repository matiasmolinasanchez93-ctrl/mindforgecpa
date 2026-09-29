/**
 * Resolves which AI providers are configured, and in what priority order.
 *
 * The platform is designed to work with *zero* AI configuration. When no
 * remote provider is reachable, every feature falls back to the built-in
 * local engine in `src/services/ai/local`. As soon as any provider below is
 * configured, requests route through it instead.
 *
 * Supported providers (Make takes priority when configured):
 *   1. `AI_BASE_URL`        — any OpenAI-compatible endpoint (Groq, OpenRouter,
 *                             Together, Fireworks, Ollama, LM Studio, vLLM…)
 *   2. `OPENAI_API_KEY`     — OpenAI itself
 *   3. `MAKE_AI_WEBHOOK_URL` — a Make.com scenario returning `{ response }`
 *   4. (implicit) the local engine — always available
 */

export type RemoteProviderId = "compatible" | "openai" | "make";
export type ProviderId = RemoteProviderId | "local";

export interface RemoteProviderConfig {
  id: RemoteProviderId;
  /** Human-readable name for logs and diagnostics. */
  label: string;
  /** Base URL for OpenAI-compatible chat completions (no trailing slash). */
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  /** Make.com webhook URL, when this entry is a webhook provider. */
  webhookUrl?: string;
}

const DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_DEFAULT_BASE_URL = "https://api.openai.com/v1";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

/** Strips trailing slashes so `/chat/completions` can be appended safely. */
function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

/**
 * Returns the configured remote providers in the order they should be tried.
 * An empty array means "local engine only".
 */
export function resolveRemoteProviders(): RemoteProviderConfig[] {
  const providers: RemoteProviderConfig[] = [];

  const compatibleBaseUrl = readEnv("AI_BASE_URL");
  if (compatibleBaseUrl) {
    providers.push({
      id: "compatible",
      label: readEnv("AI_PROVIDER_NAME") ?? "custom AI provider",
      baseUrl: normalizeBaseUrl(compatibleBaseUrl),
      apiKey: readEnv("AI_API_KEY") ?? "local",
      model: readEnv("AI_MODEL") ?? DEFAULT_MODEL,
    });
  }

  const openAiKey = readEnv("OPENAI_API_KEY");
  if (openAiKey) {
    providers.push({
      id: "openai",
      label: "OpenAI",
      baseUrl: normalizeBaseUrl(
        readEnv("OPENAI_BASE_URL") ?? OPENAI_DEFAULT_BASE_URL
      ),
      apiKey: openAiKey,
      model: readEnv("OPENAI_MODEL") ?? DEFAULT_MODEL,
    });
  }

  const makeWebhookUrl = readEnv("MAKE_AI_WEBHOOK_URL");
  if (makeWebhookUrl) {
    providers.unshift({
      id: "make",
      label: "Make.com",
      webhookUrl: makeWebhookUrl,
    });
  }

  return providers;
}

export function hasRemoteProvider(): boolean {
  return resolveRemoteProviders().length > 0;
}

/** Diagnostic summary, safe to log (never includes API keys). */
export function describeProviders(): string {
  const providers = resolveRemoteProviders();
  if (providers.length === 0) return "local engine only";
  return providers.map((provider) => provider.label).join(" → ");
}
