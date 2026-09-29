"use client";

import { useState } from "react";
import { Check, Pencil, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import type { Business } from "@/types";
import { currencySymbol } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProgressUpdaterProps {
  business: Business;
  onUpdated: (business: Business) => void;
}

export function ProgressUpdater({ business, onUpdated }: ProgressUpdaterProps) {
  const [editing, setEditing] = useState(false);
  const [revenue, setRevenue] = useState(String(business.current_monthly_revenue));
  const [customers, setCustomers] = useState(String(business.customers));
  const [loading, setLoading] = useState(false);

  const symbol = currencySymbol(business.starting_budget_currency);

  async function handleSave() {
    const parsedRevenue = Number(revenue);
    const parsedCustomers = Number(customers);

    if (
      !Number.isFinite(parsedRevenue) ||
      parsedRevenue < 0 ||
      !Number.isInteger(parsedCustomers) ||
      parsedCustomers < 0
    ) {
      toast.error("Enter valid numbers — revenue and whole customers.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/progress?businessId=${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revenue: parsedRevenue,
          customers: parsedCustomers,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Couldn’t save your progress.");
      }

      const payload = (await response.json()) as { business?: Business };
      if (payload.business) {
        onUpdated(payload.business);
      }
      setEditing(false);
      toast.success("Progress updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t save progress.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="h-3.5 w-3.5" />
        Update progress
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="revenue" className="text-xs font-medium text-zinc-600">
            Current monthly revenue
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
              {symbol}
            </span>
            <Input
              id="revenue"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="customers" className="text-xs font-medium text-zinc-600">
            Customers
          </label>
          <Input
            id="customers"
            type="number"
            min={0}
            inputMode="numeric"
            value={customers}
            onChange={(e) => setCustomers(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => void handleSave()} loading={loading}>
          {loading ? null : <Check className="h-3.5 w-3.5" />}
          Save
        </Button>
      </div>
    </div>
  );
}
