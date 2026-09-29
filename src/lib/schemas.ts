import { z } from "zod";
import {
  BUSINESS_PREFERENCES,
  CURRENCIES,
  EXPERIENCE_LEVELS,
  SKILLS,
} from "@/lib/constants";
import type {
  BusinessPreference,
  Currency,
  ExperienceLevel,
  Skill,
} from "@/types";

const currencyValues = CURRENCIES.map((c) => c.value) as [
  Currency,
  ...Currency[]
];
const skillValues = SKILLS as [Skill, ...Skill[]];
const preferenceValues = BUSINESS_PREFERENCES as [
  BusinessPreference,
  ...BusinessPreference[]
];
const experienceValues = EXPERIENCE_LEVELS as [
  ExperienceLevel,
  ...ExperienceLevel[]
];

export const onboardingSchema = z.object({
  monthlyGoal: z
    .number({ message: "Enter a monthly goal" })
    .min(1, "Monthly goal must be at least 1")
    .max(100_000_000, "Monthly goal is too large"),
  currency: z.enum(currencyValues),
  startingBudget: z
    .number({ message: "Enter a starting budget" })
    .min(0, "Starting budget can’t be negative")
    .max(10_000_000, "Starting budget is too large"),
  hoursPerDay: z
    .number({ message: "Enter hours per day" })
    .min(0.5, "You need at least half an hour per day")
    .max(24, "There are only 24 hours in a day"),
  skills: z
    .array(z.enum(skillValues))
    .min(1, "Select at least one skill"),
  preferences: z
    .array(z.enum(preferenceValues))
    .min(1, "Select at least one preference"),
  experience: z.enum(experienceValues),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country name is too long"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City name is too long"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

const coachContextSchema = z.object({
  businessName: z.string(),
  goalMonthlyRevenue: z.number(),
  currentMonthlyRevenue: z.number(),
  startingBudget: z.number(),
  remainingBudget: z.number(),
  customers: z.number(),
  currency: z.string(),
  hoursPerDay: z.number(),
  skills: z.array(z.string()),
  preferences: z.array(z.string()),
  experience: z.string(),
  country: z.string(),
  city: z.string(),
  businessIdea: z.string(),
  targetCustomer: z.string(),
  offer: z.string(),
  pricing: z.string(),
  revenueModel: z.string(),
  first30Days: z.array(
    z.object({ day: z.number(), task: z.string(), reason: z.string() })
  ),
  completedTasks: z.number(),
  totalTasks: z.number(),
  recentMonths: z.array(
    z.object({ month: z.string(), revenue: z.number(), customers: z.number() })
  ),
});

export const coachSchema = z.object({
  message: z.string().trim().min(1, "Message can’t be empty").max(2000),
  context: coachContextSchema,
});

export type CoachInput = z.infer<typeof coachSchema>;

export const updateProgressSchema = z.object({
  revenue: z
    .number({ message: "Revenue must be a number" })
    .min(0, "Revenue can’t be negative")
    .max(100_000_000),
  customers: z
    .number({ message: "Customers must be a number" })
    .int("Customers must be a whole number")
    .min(0, "Customers can’t be negative")
    .max(1_000_000),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

export const updateTaskSchema = z.object({
  completed: z.boolean(),
});
