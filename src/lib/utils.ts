import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with its currency. Falls back to ISO symbol map. */
export function formatCurrency(amount: number, currency = "USD", locale?: string) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    if (currency === "Other") {
      return `${currencySymbol("USD")}${safeAmount.toLocaleString(locale ?? "es-GT")}`;
    }
    return new Intl.NumberFormat(locale ?? "es-GT", {
      style: "currency",
      currency,
      maximumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    }).format(safeAmount);
  } catch {
    return `${currencySymbol("USD")}${safeAmount.toLocaleString(locale ?? "es-GT")}`;
  }
}

export function currencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    GTQ: "Q",
    EUR: "€",
    MXN: "$",
    COP: "$",
    PEN: "S/",
    ARS: "$",
    Other: "$",
  };
  return symbols[currency] ?? currency;
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("es-GT", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-GT", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: string | Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-GT", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
