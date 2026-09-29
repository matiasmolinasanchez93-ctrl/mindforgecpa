"use client";

import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Business } from "@/types";
import { currencySymbol } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


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
      toast.error("Introduce ingresos válidos y un número entero de clientes.");
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
        throw new Error(payload.error ?? "No se pudo guardar tu progreso.");
      }

      const payload = (await response.json()) as { business?: Business };
      if (payload.business) {
        onUpdated(payload.business);
      }
      setEditing(false);
      toast.success("Progreso actualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el progreso.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="h-3.5 w-3.5" />
        
        Actualizar progreso
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="revenue" className="text-xs font-medium text-zinc-600">
            
            Ingresos mensuales actuales
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
            
            Clientes
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
          
          Cancelar
        </Button>
        <Button size="sm" onClick={() => void handleSave()} loading={loading}>
          {loading ? null : <Check className="h-3.5 w-3.5" />}
          
          Guardar
        </Button>
      </div>
    </div>
  );
}
