import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
const state = globalThis as typeof globalThis & { challengeSigningKey?: string };
// Configure CHALLENGE_SIGNING_SECRET consistently for multi-instance deployments.
const key = process.env.CHALLENGE_SIGNING_SECRET ?? (state.challengeSigningKey ??= randomBytes(32).toString("hex"));
const schema = z.object({
  userId: z.string(), expires: z.number(),
  type: z.enum(["ai_detective", "prompt_battle", "solve_it", "explain_it", "fact_check"]),
  subject: z.string(),
  challenge: z.object({
    title: z.string(), description: z.string(), content: z.string(), correctAnswer: z.string(),
    hints: z.array(z.string()), explanation: z.string(), xpBase: z.number(), options: z.array(z.string()).optional(),
  }),
});
type Ticket = z.infer<typeof schema>;
export function signChallenge(data: Omit<Ticket, "expires">): string {
  const payload = Buffer.from(JSON.stringify({ ...data, expires: Date.now() + 7200000 })).toString("base64url");
  return payload + "." + createHmac("sha256", key).update(payload).digest("base64url");
}
export function readChallenge(token: string, userId: string): Ticket | null {
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return null;
    const expected = createHmac("sha256", key).update(payload).digest();
    const supplied = Buffer.from(signature, "base64url");
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    const parsed = schema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    return parsed.success && parsed.data.userId === userId && parsed.data.expires > Date.now() ? parsed.data : null;
  } catch { return null; }
}
