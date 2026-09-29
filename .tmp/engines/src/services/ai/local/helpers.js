"use strict";
/** Small pure helpers shared by the local engines. No external imports. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.roundTo = roundTo;
exports.niceAmount = niceAmount;
exports.hashString = hashString;
exports.stableIndex = stableIndex;
exports.pick = pick;
exports.unique = unique;
exports.splitSentences = splitSentences;
exports.containsAny = containsAny;
exports.moneySymbol = moneySymbol;
exports.formatMoney = formatMoney;
exports.truncate = truncate;
function clamp(value, min, max) {
    if (!Number.isFinite(value))
        return min;
    return Math.min(Math.max(value, min), max);
}
/** Rounds to the nearest `step` so generated prices look intentional. */
function roundTo(value, step) {
    if (step <= 0)
        return Math.round(value);
    return Math.round(value / step) * step;
}
/** Rounds to a human-friendly increment that scales with the amount. */
function niceAmount(value) {
    const magnitude = Math.abs(value);
    if (magnitude < 50)
        return roundTo(value, 5);
    if (magnitude < 500)
        return roundTo(value, 10);
    if (magnitude < 5_000)
        return roundTo(value, 25);
    if (magnitude < 50_000)
        return roundTo(value, 100);
    return roundTo(value, 1_000);
}
/** Deterministic 32-bit hash, so the same input always yields the same pick. */
function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function stableIndex(seed, length) {
    if (length <= 0)
        return 0;
    return hashString(seed) % length;
}
function pick(items, seed) {
    return items[stableIndex(seed, items.length)];
}
function unique(values) {
    return Array.from(new Set(values));
}
/**
 * Splits prose into sentences.
 *
 * Written as an explicit scan rather than a regex lookbehind so it behaves
 * identically on every runtime, and so decimals ("3.5") and initials ("J. K.")
 * are not mistaken for sentence ends.
 */
function splitSentences(text) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized)
        return [];
    const sentences = [];
    let start = 0;
    for (let index = 0; index < normalized.length; index += 1) {
        const char = normalized[index];
        if (char !== "." && char !== "!" && char !== "?")
            continue;
        const next = normalized[index + 1];
        const afterNext = normalized[index + 2];
        const isDecimal = char === "." &&
            /\d/.test(normalized[index - 1] ?? "") &&
            /\d/.test(next ?? "");
        const isInitial = char === "." &&
            /(^|\s)[A-Z]$/.test(normalized.slice(Math.max(0, index - 1), index));
        const endsSentence = next === undefined ||
            (next === " " && afterNext !== undefined && /[A-Z0-9"'([]/.test(afterNext));
        if (!isDecimal && !isInitial && endsSentence) {
            sentences.push(normalized.slice(start, index + 1).trim());
            start = index + 1;
        }
    }
    const tail = normalized.slice(start).trim();
    if (tail)
        sentences.push(tail);
    return sentences.filter((sentence) => sentence.length > 0);
}
function containsAny(haystack, needles) {
    const lower = haystack.toLowerCase();
    return needles.some((needle) => lower.includes(needle.toLowerCase()));
}
const CURRENCY_SYMBOLS = {
    USD: "$",
    GTQ: "Q",
    EUR: "€",
    MXN: "$",
    COP: "$",
    PEN: "S/",
    ARS: "$",
};
function moneySymbol(currency) {
    return CURRENCY_SYMBOLS[currency] ?? currency;
}
function formatMoney(amount, currency) {
    return `${moneySymbol(currency)}${Math.round(amount).toLocaleString("en-US")}`;
}
/** Truncates at a word boundary — used when echoing user text back. */
function truncate(text, maxLength) {
    const clean = text.trim();
    if (clean.length <= maxLength)
        return clean;
    const cut = clean.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    const body = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
    return `${body.trim()}…`;
}
