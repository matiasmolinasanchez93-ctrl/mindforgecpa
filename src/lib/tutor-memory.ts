import type { ChatTurn } from "@/services/ai/contracts";
export const MEMORY_TURNS = 20;
export function boundHistory(messages: ChatTurn[]): ChatTurn[] {
  let remaining = 24000;
  const result: ChatTurn[] = [];
  for (const message of messages.slice(-MEMORY_TURNS).reverse()) {
    const content = message.content.trim().slice(0, 6000);
    if (!content || remaining < content.length) break;
    result.unshift({ role: message.role, content });
    remaining -= content.length;
  }
  return result;
}

// Backfill only the unsaved suffix of the visible conversation, without duplicating stored turns.
export function unsavedHistory(visible: ChatTurn[], stored: ChatTurn[]): ChatTurn[] {
  if (!stored.length) return visible;
  const last = stored[stored.length - 1];
  for (let i = visible.length - 1; i >= 0; i--) {
    if (visible[i].role === last.role && visible[i].content === last.content) return visible.slice(i + 1);
  }
  return [];
}
