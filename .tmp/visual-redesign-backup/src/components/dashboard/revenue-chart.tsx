"use client";

import { useMemo } from "react";
import type { ProgressEntry } from "@/types";
import { currencySymbol } from "@/lib/utils";

interface RevenueChartProps {
  entries: ProgressEntry[];
  currency: string;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
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
          Update your revenue to see your progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex h-40 items-end gap-2 sm:gap-3">
      {bars.map((bar) => (
        <div
          key={bar.month}
          className="group flex flex-1 flex-col items-center gap-1.5"
        >
          <span className="text-[10px] font-medium text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
            {symbol}
            {Math.round(Number(bar.revenue))}
          </span>
          <div
            className="w-full max-w-10 rounded-t-lg bg-primary/80 transition-colors group-hover:bg-primary"
            style={{ height: `${bar.heightPercent}%` }}
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
