"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { OnboardingInput } from "@/lib/schemas";
import {
  BUSINESS_PREFERENCES,
  CURRENCIES,
  EXPERIENCE_LEVELS,
  QUICK_BUDGET_PRESETS,
  QUICK_GOAL_PRESETS,
  SKILLS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectionGrid } from "@/components/onboarding/selection-grid";
import { cn } from "@/lib/utils";
import type { Skill, BusinessPreference, Currency, ExperienceLevel } from "@/types";

type StepKey = "goal" | "resources" | "skills" | "preferences" | "experience" | "location";

const STEPS: { key: StepKey; title: string; subtitle: string }[] = [
  {
    key: "goal",
    title: "Set your goal",
    subtitle: "How much do you want to make per month? Be honest — we’ll design around it.",
  },
  {
    key: "resources",
    title: "What do you have to start with?",
    subtitle: "Your starting budget and available time shape the business we recommend.",
  },
  {
    key: "skills",
    title: "What are you good at?",
    subtitle: "Select everything you can realistically use. You can add more later.",
  },
  {
    key: "preferences",
    title: "What kind of business?",
    subtitle: "Pick the types you’d actually enjoy building.",
  },
  {
    key: "experience",
    title: "Your experience level",
    subtitle: "We’ll match the plan’s difficulty to where you are now.",
  },
  {
    key: "location",
    title: "Where are you?",
    subtitle: "We’ll include local context: prices, platforms and channels.",
  },
];

const INITIAL_DATA: OnboardingInput = {
  monthlyGoal: 300,
  currency: "USD",
  startingBudget: 0,
  hoursPerDay: 2,
  skills: [],
  preferences: [],
  experience: "Beginner",
  country: "",
  city: "",
};

export function OnboardingForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingInput>(INITIAL_DATA);
  const [generating, setGenerating] = useState(false);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const canContinue = useMemo(() => {
    switch (step.key) {
      case "goal":
        return data.monthlyGoal > 0;
      case "resources":
        return data.startingBudget >= 0 && data.hoursPerDay > 0;
      case "skills":
        return data.skills.length > 0;
      case "preferences":
        return data.preferences.length > 0;
      case "experience":
        return true;
      case "location":
        return data.country.trim().length > 0 && data.city.trim().length > 0;
      default:
        return false;
    }
  }, [step.key, data]);

  function update<K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  async function buildBusiness() {
    if (!canContinue) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/generate-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = (await response.json()) as { businessId?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong. Try again.");
      }

      router.push(`/business/${payload.businessId}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t build your business.");
      setGenerating(false);
    }
  }

  function handleNext() {
    if (isLastStep) {
      void buildBusiness();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
          <span>
            Step {stepIndex + 1} of {STEPS.length}
          </span>
          <span>{Math.round(((stepIndex + 1) / STEPS.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div key={step.key} className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{step.title}</h1>
        <p className="mt-2 text-muted-foreground">{step.subtitle}</p>

        <div className="mt-8">
          {step.key === "goal" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {QUICK_GOAL_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      update("monthlyGoal", preset);
                      update("currency", "USD");
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      data.monthlyGoal === preset
                        ? "border-primary bg-violet-50 text-primary"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                    )}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Monthly income goal
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min={1}
                      inputMode="decimal"
                      value={data.monthlyGoal || ""}
                      onChange={(e) => update("monthlyGoal", Number(e.target.value))}
                      placeholder="300"
                      className="pl-8"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      $
                    </span>
                  </div>
                  <select
                    value={data.currency}
                    onChange={(e) => update("currency", e.target.value as Currency)}
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label.split("—")[0].trim()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step.key === "resources" && (
            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Starting budget
                </label>
                <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {QUICK_BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => update("startingBudget", preset)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-sm font-medium transition-colors",
                        data.startingBudget === preset
                          ? "border-primary bg-violet-50 text-primary"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                      )}
                    >
                      {preset === 0 ? "$0" : `$${preset}`}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={data.startingBudget || 0}
                    onChange={(e) => update("startingBudget", Number(e.target.value))}
                    placeholder="0"
                    className="pl-8"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    $
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Hours available per day
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0.5}
                    max={24}
                    step={0.5}
                    inputMode="decimal"
                    value={data.hoursPerDay}
                    onChange={(e) => update("hoursPerDay", Number(e.target.value))}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    hrs/day
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Realistically, how many hours can you dedicate each day? We plan around
                  this.
                </p>
              </div>
            </div>
          )}

          {step.key === "skills" && (
            <SelectionGrid<Skill>
              options={SKILLS}
              selected={data.skills}
              onToggle={(skill) =>
                update(
                  "skills",
                  data.skills.includes(skill)
                    ? data.skills.filter((s) => s !== skill)
                    : ([...data.skills, skill] as Skill[])
                )
              }
              columns={3}
            />
          )}

          {step.key === "preferences" && (
            <SelectionGrid<BusinessPreference>
              options={BUSINESS_PREFERENCES}
              selected={data.preferences}
              onToggle={(preference) =>
                update(
                  "preferences",
                  data.preferences.includes(preference)
                    ? data.preferences.filter((p) => p !== preference)
                    : [...data.preferences, preference]
                )
              }
              columns={2}
            />
          )}

          {step.key === "experience" && (
            <div className="grid gap-2.5 sm:grid-cols-3">
              {EXPERIENCE_LEVELS.map((level) => {
                const description =
                  level === "Beginner"
                    ? "I’m new to this"
                    : level === "Intermediate"
                      ? "I’ve done a little before"
                      : "I know this world well";
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => update("experience", level)}
                    aria-pressed={data.experience === level}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      data.experience === level
                        ? "border-primary bg-violet-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    )}
                  >
                    <p className="text-sm font-semibold text-zinc-900">{level}</p>
                    <p className="mt-1 text-xs text-zinc-500">{description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {step.key === "location" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="country" className="text-sm font-medium text-zinc-700">
                  Country
                </label>
                <Input
                  id="country"
                  value={data.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="e.g. Guatemala"
                  autoComplete="country-name"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-sm font-medium text-zinc-700">
                  City
                </label>
                <Input
                  id="city"
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g. Guatemala City"
                  autoComplete="address-level2"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0 || generating}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canContinue} loading={generating} size="lg">
          {isLastStep ? (
            <>
              <Sparkles className="h-4 w-4" />
              Build my business
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
