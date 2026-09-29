// Temporary diagnostic: which configured AI providers actually respond?
import { readFileSync } from "node:fs";

function loadEnv(path) {
  const out = {};
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].trim();
  }
  return out;
}

const env = { ...loadEnv(".env.local"), ...process.env };

async function probe(label, url, headers, body) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    const text = await response.text();
    const ms = Date.now() - started;
    console.log(
      `${label}: status=${response.status} ms=${ms} body=${text.replace(/\s+/g, " ").slice(0, 220)}`
    );
  } catch (error) {
    console.log(`${label}: FAILED ${error.message}`);
  }
}

const chat = {
  model: env.OPENAI_MODEL || "gpt-4o-mini",
  messages: [{ role: "user", content: "Say OK" }],
  max_tokens: 10,
};

if (env.OPENAI_API_KEY) {
  await probe(
    "openai",
    `${(env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "")}/chat/completions`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    chat
  );
} else {
  console.log("openai: no key configured");
}

if (env.AI_BASE_URL) {
  await probe(
    "compatible",
    `${env.AI_BASE_URL.replace(/\/+$/, "")}/chat/completions`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.AI_API_KEY || "local"}`,
    },
    { ...chat, model: env.AI_MODEL || "gpt-4o-mini" }
  );
} else {
  console.log("compatible: no AI_BASE_URL configured");
}

if (env.MAKE_AI_WEBHOOK_URL) {
  await probe(
    "make",
    env.MAKE_AI_WEBHOOK_URL,
    { "Content-Type": "application/json" },
    { message: "Say OK", conversation_id: "probe", student_id: "probe" }
  );
} else {
  console.log("make: no webhook configured");
}
