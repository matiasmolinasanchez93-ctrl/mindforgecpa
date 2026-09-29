/**
 * Topic resolution for the tutor.
 *
 * Wraps the concept knowledge base so the engine can ask one question — "what
 * is this student talking about?" — and get back the checkpoints, progressive
 * hints, misconceptions and plain-language explanation for it. When nothing
 * matches, the caller gets null and teaches generically rather than inventing
 * content it cannot back up.
 */

import {
  TUTOR_TOPICS,
  type TutorTopic,
} from "@/services/ai/local/tutorTopics";
import { TOPIC_EXPLANATIONS } from "@/services/ai/local/tutorExplanations";

export interface ResolvedTopic {
  topic: TutorTopic;
  /** Plain-language explanation, when one exists for this topic. */
  explanation: string | null;
}

/**
 * Scores every known topic against the declared topic, the subject and
 * everything the student has written.
 *
 * Single keywords are weak evidence and multi-word ones are strong, so a
 * phrase match outweighs a bare word. The declared subject only ever breaks
 * ties — it never creates a match on its own.
 */
export function resolveTopic(input: {
  subject: string;
  topic: string;
  studentMessages: string[];
}): ResolvedTopic | null {
  const haystack = [input.topic, input.subject, ...input.studentMessages]
    .join(" ")
    .toLowerCase();
  if (!haystack.trim()) return null;

  let best: { topic: TutorTopic; score: number } | null = null;

  for (const topic of TUTOR_TOPICS) {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (!haystack.includes(keyword)) continue;
      score += keyword.includes(" ") ? 3 : 2;
    }
    if (score === 0) continue;

    if (topic.subject.toLowerCase() === input.subject.toLowerCase()) score += 1;

    if (!best || score > best.score) best = { topic, score };
  }

  if (!best) return null;
  return {
    topic: best.topic,
    explanation: TOPIC_EXPLANATIONS[best.topic.id] ?? null,
  };
}

/** Human-readable name for the conversation's subject. */
export function describeSubject(subject: string, topic: string): string {
  if (topic.trim()) return topic.trim();
  if (subject && subject !== "General") return subject;
  return "this topic";
}
