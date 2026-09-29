"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SelectionGridProps<T extends string> {
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  columns?: 2 | 3;
}

export function SelectionGrid<T extends string>({
  options,
  selected,
  onToggle,
  columns = 2,
}: SelectionGridProps<T>) {
  return (
    <div
      className={cn(
        "grid gap-2.5",
        columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
      )}
    >
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={isSelected}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all",
              isSelected
                ? "border-primary bg-violet-50 text-primary"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
            )}
          >
            <span className="text-left">{option}</span>
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
