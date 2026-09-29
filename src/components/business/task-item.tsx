"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BusinessTask } from "@/types";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: BusinessTask;
  businessId: string;
}

export function TaskItem({ task, businessId }: TaskItemProps) {
  const [completed, setCompleted] = useState(task.status === "done");
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    const next = !completed;
    setLoading(true);
    setCompleted(next); // optimistic

    try {
      const response = await fetch(
        `/api/tasks?taskId=${task.id}&businessId=${businessId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: next }),
        }
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "No se pudo actualizar la tarea.");
      }
    } catch (error) {
      setCompleted(!next); // rollback
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la tarea.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      aria-pressed={completed}
      aria-busy={loading}
      onClick={() => void toggle()}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
        completed
          ? "border-gold-200 bg-gold-50/40"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          completed ? "border-achievement bg-achievement text-foreground" : "border-zinc-300 bg-white"
        )}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : completed ? (
          <Check className="h-3 w-3" />
        ) : null}
      </span>
      <span className="flex-1 space-y-0.5">
        <span
          className={cn(
            "block text-sm font-medium",
            completed ? "text-zinc-400 line-through" : "text-zinc-900"
          )}
        >
          
          Día {task.day} — {task.title}
        </span>
        <span
          className={cn(
            "block text-xs leading-relaxed",
            completed ? "text-zinc-300" : "text-zinc-500"
          )}
        >
          {task.description}
        </span>
      </span>
    </button>
  );
}
