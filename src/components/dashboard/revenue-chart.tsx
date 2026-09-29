"use client";

import { useMemo } from "react";
import type { ProgressEntry } from "@/types";
import { currencySymbol } from "@/lib/utils";

interface RevenueChartProps {
  entries: ProgressEntry[];
  currency: string;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "ene", "02": "feb", "03": "mar", "04": "abr",
  "05": "may", "06": "jun", "07": "jul", "08": "ago",
  "09": "sep", "10": "oct", "11": "nov", "12": "dic",
};

export function RevenueChart({ entries, currency }: RevenueChartProps) {
  const symbol = currencySymbol(currency);

  const bars = useMemo(() => {
    const max = Math.max(1, ...entries.map((entry) => Number(entry.revenue)));
    return entries.map((entry) => {
      const month = entry.month.split("-")[1] ?? "";
      const year = entry.month.split("-")[0] ?? "";
      return {
        ...entry,
        label: MONTH_LABELS[month] ?? month,
        year,
        heightPercent: Math.max(4, (Number(entry.revenue) / max) * 100),
      };
    });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
        <p className="text-sm text-zinc-400">
          
          Actualiza tus ingresos para ver tu progreso aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex h-40 items-end gap-2 sm:gap-3">
      {bars.map((bar) => (
        <div
          key={bar.month}
          className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
        >
          <span className="text-[10px] font-medium text-zinc-400 ">
            {symbol}
            {Math.round(Number(bar.revenue))}
          </span>
          <div
            className="w-full max-w-10 rounded-t-lg bg-primary/80 transition-colors group-hover:bg-primary"
            style={{ height: `${bar.heightPercent * 1.1}px` }}
          />
          <span className="text-[10px] text-zinc-400">
            {bar.label}
            {bar.year !== String(new Date().getFullYear()) ? ` ’${bar.year.slice(2)}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
