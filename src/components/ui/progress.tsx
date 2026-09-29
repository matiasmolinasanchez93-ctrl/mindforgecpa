import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0..100
  label?: string;
  className?: string;
  indicatorClassName?: string;
}

/**
 * A simple accessible progress bar. The value is clamped to 0..100.
 */
export function ProgressBar({
  value,
  label = "Progreso",
  className,
  indicatorClassName,
}: ProgressProps) {
  const clamped = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-zinc-100", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-500 ease-out",
          indicatorClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
