"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  Layers,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { Business, BusinessTask } from "@/types";
import { computeProgress } from "@/services/businessService";
import { currencySymbol, formatCurrency, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/business/task-item";
import { ProgressUpdater } from "@/components/business/progress-updater";

interface BusinessViewProps {
  business: Business;
  tasks: BusinessTask[];
}

export function BusinessView({ business: initialBusiness, tasks }: BusinessViewProps) {
  const [business, setBusiness] = useState(initialBusiness);

  const progress = useMemo(
    () => computeProgress(business, tasks),
    [business, tasks]
  );

  const symbol = currencySymbol(business.starting_budget_currency);
  const currency = business.starting_budget_currency;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="success" className="mb-3">Active</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{business.name}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{business.idea}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/coach?business=${business.id}`}>
            <Button variant="outline">
              <Sparkles className="h-4 w-4 text-primary" />
              Ask AI Coach
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Income goal */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Income goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-semibold tracking-tight">
              {formatCurrency(business.current_monthly_revenue, currency)}
              <span className="text-lg font-normal text-zinc-400">/month</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Goal: {formatCurrency(business.goal_monthly_revenue, currency)}/month
            </p>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{formatCurrency(0, currency)}</span>
              <span className="font-medium text-primary">
                {progress.progressPercent}%
              </span>
              <span>{formatCurrency(business.goal_monthly_revenue, currency)}/month</span>
            </div>
            <ProgressBar value={progress.progressPercent} className="mt-1 h-3" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="mt-1 text-sm font-semibold">
                {formatCurrency(business.goal_monthly_revenue, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current revenue</p>
              <p className="mt-1 text-sm font-semibold">
                {formatCurrency(business.current_monthly_revenue, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {progress.progressPercent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="mt-1 text-sm font-semibold">
                {formatCurrency(progress.remaining, currency)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-400">
              Updating revenue and customers recalculates your progress automatically.
            </p>
            <ProgressUpdater business={business} onUpdated={setBusiness} />
          </div>
        </CardContent>
      </Card>

      {/* Business model */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Building2 className="h-5 w-5 text-primary" />
          Business model
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Target customer</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 text-sm leading-relaxed text-muted-foreground">
              {business.target_customer}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Problem solved</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 text-sm leading-relaxed text-muted-foreground">
              {business.problem_solved}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your offer</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 text-sm leading-relaxed text-muted-foreground">
              {business.offer}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="flex flex-wrap gap-2">
                {business.pricing?.setup !== undefined && (
                  <Badge>
                    Setup {formatCurrency(business.pricing.setup, business.pricing.currency)}
                  </Badge>
                )}
                {business.pricing?.monthly !== undefined && (
                  <Badge variant="default">
                    {formatCurrency(business.pricing.monthly, business.pricing.currency)}
                    /month
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {business.revenue_model}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Startup budget */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <PiggyBank className="h-5 w-5 text-primary" />
          Startup budget
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100">
              {business.startup_costs.map((cost) => (
                <div
                  key={cost.item}
                  className="flex items-center justify-between px-5 py-3.5 text-sm"
                >
                  <span className="text-zinc-700">{cost.item}</span>
                  <span className="font-medium">{formatCurrency(cost.estimatedCost, currency)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-zinc-200 bg-zinc-50 px-5 py-3.5 text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-primary" />
                Remaining budget
              </span>
              <span>{formatCurrency(business.remaining_budget, currency)}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 30-day roadmap */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <CalendarCheck className="h-5 w-5 text-primary" />
            30-Day roadmap
          </h2>
          <Badge variant="outline">
            {progress.completedTasks} / {progress.totalTasks} done
          </Badge>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} businessId={business.id} />
          ))}
        </div>
      </section>

      {/* Marketing */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <TrendingUp className="h-5 w-5 text-primary" />
          Marketing strategy
        </h2>
        <Card>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Channels
              </p>
              <div className="flex flex-wrap gap-2">
                {business.marketing_strategy?.channels?.map((channel) => (
                  <Badge key={channel} variant="outline">{channel}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Content ideas
              </p>
              <ul className="space-y-1.5 text-sm text-zinc-600">
                {business.marketing_strategy?.contentIdeas?.map((idea) => (
                  <li key={idea} className="flex gap-2">
                    <span className="text-primary">•</span>
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Outreach
              </p>
              <p className="text-sm leading-relaxed text-zinc-600">
                {business.marketing_strategy?.outreachStrategy}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Risks */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Risks to watch
        </h2>
        <Card>
          <CardContent>
            <ul className="space-y-2 text-sm text-zinc-600">
              {business.risks.map((risk) => (
                <li key={risk} className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  {risk}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
              These projections are estimates, not guarantees of results.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
