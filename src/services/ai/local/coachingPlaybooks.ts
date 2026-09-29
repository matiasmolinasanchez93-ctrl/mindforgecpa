/**
 * Coach responses for each intent.
 *
 * Every playbook is written to do what a good business coach does: name the
 * likely cause, then give two to four actions the founder can run *today*
 * using their own numbers — not generic startup advice.
 */

import type { CoachContext } from "./contracts";

export type CoachIntent =
  | "no_replies"
  | "pricing"
  | "first_customers"
  | "scaling"
  | "time"
  | "marketing"
  | "retention"
  | "metrics"
  | "roadmap"
  | "budget"
  | "confidence"
  | "general";

export interface CoachFacts {
  context: CoachContext;
  /** Formats an amount in the founder's currency. */
  money: (amount: number) => string;
  /** How much revenue is still missing to hit the goal. */
  remaining: number;
  /** Price of one unit, already formatted. */
  priceLabel: string;
  /** Units needed to close the gap at the current price. */
  customersNeeded: number;
  /** The next unfinished roadmap task, when there is one. */
  nextTask: string | null;
  /** Percentage of the 30-day plan completed. */
  completionPercent: number;
}

function actions(lines: string[]): string {
  return lines.map((line, index) => `${index + 1}. ${line}`).join("\n");
}

function goalLine(facts: CoachFacts): string {
  const { context } = facts;
  return `You are at ${facts.money(context.currentMonthlyRevenue)} of your ${facts.money(
    context.goalMonthlyRevenue
  )} monthly goal, with ${context.customers} customer${
    context.customers === 1 ? "" : "s"
  }.`;
}

export const PLAYBOOKS: Record<CoachIntent, (facts: CoachFacts) => string> = {
  no_replies: (facts) => {
    const { context } = facts;
    return `Silence usually means the message, not the market. ${goalLine(facts)}

Change these before sending anything else:

${actions([
  "Rewrite the first line so it is about them, not you. Name the exact problem they have, in their words.",
  "Shrink the ask. Replace \u201cwould you buy this?\u201d with one small question like \u201chow are you handling this today?\u201d",
  "Change the channel, not just the wording. If direct messages are silent, try referrals, communities, or paid local reach in " +
    (context.city || "your area") +
    ".",
  "Send 20 more with the new opener and count the replies. Fewer than 1 in 20 means your target customer is wrong.",
])}

You have completed ${context.completedTasks} of ${context.totalTasks} tasks. Measure replies, not messages sent — that is the number that tells you whether the fix worked.`;
  },

  pricing: (facts) => {
    const { context } = facts;
    return `Price is a positioning decision, not a number. Your current price works out to ${facts.priceLabel}.

${actions([
  `Reaching your ${facts.money(context.goalMonthlyRevenue)} goal at that price needs about ${facts.customersNeeded} customers. If that feels like too many, the price is too low — not the effort.`,
  "Anchor on the outcome they get, not the hours you spend. Quote the cost of the problem, then your price.",
  "Never discount the first offer. Add something small instead: faster delivery, an extra revision, a follow-up session.",
  "Test a 20% higher price on the next three enquiries. If nobody flinches, your price was the problem all along.",
])}

If you drop your price to win this one deal, you reset the value of everything you sell afterwards.`;
  },

  first_customers: (facts) => {
    const { context } = facts;
    return `Getting the first customer is a volume problem before it is a quality problem. ${goalLine(facts)}

${actions([
  `Work out your number: at ${facts.priceLabel} you need about ${facts.customersNeeded} customers to reach your goal. Write that number where you can see it.`,
  "Contact 20 people today. Not 5 — 20. Warm contacts first: past colleagues, communities, and anyone who has asked you for advice.",
  "Offer one paid pilot at a reduced scope (not a reduced price) so saying yes is low risk for them.",
  "Make payment easy: one link, one amount, no back-and-forth.",
])}

The first sale is the hardest. After that you are repeating a process instead of inventing one.`;
  },

  scaling: (facts) => {
    const { context } = facts;
    return `At ${facts.money(context.currentMonthlyRevenue)} a month with ${context.customers} customers, growth comes from price and leverage before it comes from more hours.

${actions([
  "Raise your price for new customers first. Existing ones keep their rate, so you risk nothing.",
  "Turn your most repeatable piece of work into a package with a fixed scope and a fixed price.",
  `You are working about ${context.hoursPerDay} hours a day. List everything you did last week and delete the lowest-value 20%.`,
  context.remainingBudget > 0
    ? `You still have ${facts.money(context.remainingBudget)} of budget. Spend it only on something that removes a bottleneck you have already hit.`
    : "You have no remaining budget, so grow using the channels that already produced a customer.",
])}

Do not add a second product or channel until the first one reliably produces customers.`;
  },

  time: (facts) => {
    const { context } = facts;
    return `You have about ${context.hoursPerDay} hours a day, so the plan has to fit inside them — not the other way around.

${actions([
  "Pick the one activity that produces customers and schedule it first, before anything else.",
  "Batch everything else into one block a week. Invoicing, admin, content: one sitting.",
  `You have ${context.totalTasks - context.completedTasks} roadmap tasks left. Choose three for this week and ignore the rest.`,
  "Protect the customer-facing block. If something must move, it is never that one.",
])}

A plan you cannot sustain for 30 days is not a plan. Cut the scope, keep the consistency.`;
  },

  marketing: (facts) => {
    const { context } = facts;
    return `Marketing only counts when it produces a conversation. Right now you have ${context.customers} customer${
      context.customers === 1 ? "" : "s"
    } to show for it.

${actions([
  "Choose one channel and stay on it for 30 days. Switching weekly guarantees you learn nothing.",
  "Post proof, not opinions: a result, a before-and-after, or a specific thing you fixed.",
  `Follow every post with 10 direct messages. In ${context.city || "your area"}, personal outreach beats reach almost every time.`,
  "Track one number per channel: replies. Drop any channel that produces none after 50 attempts.",
])}
`;
  },

  retention: (facts) => {
    const { context } = facts;
    return `Keeping a customer is cheaper than finding one — and you already have ${context.customers}.

${actions([
  "Contact every past customer this week and ask one question: what has changed for you since we last spoke?",
  "Offer a recurring version of what they already bought. Recurring revenue is what makes the goal predictable.",
  "Fix the first 48 hours after purchase. Most churn is decided before the customer has seen value.",
  "Ask for a referral at the moment they are happiest, not weeks later.",
])}

At your current price, every customer you keep is one you do not have to replace next month.`;
  },

  metrics: (facts) => {
    const { context } = facts;
    const monthly =
      context.recentMonths.length > 0
        ? context.recentMonths
            .slice(0, 3)
            .map(
              (month) =>
                `${month.month}: ${facts.money(month.revenue)} from ${month.customers} customers`
            )
            .join("\n- ")
        : "no monthly entries recorded yet";

    return `Here is where you actually stand:

- Goal: ${facts.money(context.goalMonthlyRevenue)} a month
- Current: ${facts.money(context.currentMonthlyRevenue)} a month
- Gap: ${facts.money(facts.remaining)}
- Customers: ${context.customers}
- Roadmap: ${context.completedTasks} of ${context.totalTasks} tasks done (${facts.completionPercent}%)
- Recent months:
- ${monthly}

${actions([
  "Update your revenue and customer count every week. Numbers you do not record do not improve.",
  `At ${facts.priceLabel}, closing the gap needs about ${facts.customersNeeded} customers. That is the only target that matters this month.`,
  "Ignore every other metric until that one is moving.",
])}
`;
  },

  roadmap: (facts) => {
    const { context } = facts;
    const next = facts.nextTask
      ? `Your next task is: ${facts.nextTask}`
      : "You have completed every task on the 30-day plan.";

    return `${next}

You are ${facts.completionPercent}% through the plan with ${context.completedTasks} of ${context.totalTasks} tasks done.

${actions([
  "Do the next task today. Not this week — today.",
  "Do not skip ahead. Each phase assumes the previous one produced information you need.",
  "If a task does not fit your situation, replace it with the closest action that still talks to a potential customer.",
])}

Progress comes from finishing tasks in order, not from planning better ones.`;
  },

  budget: (facts) => {
    const { context } = facts;
    return `You started with ${facts.money(context.startingBudget)} and have ${facts.money(
      context.remainingBudget
    )} left.

${actions([
  "Spend only on something that removes a bottleneck you have already hit. Never on preparation.",
  "Before paying for anything, try the free version for one week. Most tools are not the constraint.",
  context.remainingBudget > 0
    ? "Keep at least a third of what is left for the moment something is clearly working — that is when money compounds."
    : "With nothing left, your only growth lever is outreach volume and referrals.",
])}

For your goal of ${facts.money(context.goalMonthlyRevenue)} a month, the cheapest path is almost always more conversations, not more software.`;
  },

  confidence: (facts) => {
    const { context } = facts;
    return `This is the hard part of every business, and it is normal that it feels slow. ${goalLine(facts)}

${actions([
  `You have already completed ${context.completedTasks} tasks. That is real progress, even when revenue has not caught up.`,
  "Shrink today to one action you can definitely finish. Finishing rebuilds momentum faster than planning.",
])}

One finished task today is worth more than a perfect plan you start on Monday.`;
  },

  general: (facts) => {
    const { context } = facts;
    const next = facts.nextTask
      ? `The next step on your plan is: ${facts.nextTask}`
      : "Your 30-day plan is complete.";

    return `Here is your situation: ${facts.money(context.currentMonthlyRevenue)} a month against a ${facts.money(
      context.goalMonthlyRevenue
    )} goal, ${context.customers} customer${context.customers === 1 ? "" : "s"}, and ${facts.money(
      facts.remaining
    )} still to find.

${next}

The most reliable moves from here:

${actions([
  `Talk to more of the people your offer is for (${context.targetCustomer}). Twenty conversations beat twenty days of building.`,
  `At ${facts.priceLabel} you need about ${facts.customersNeeded} customers to hit the goal. Keep that number visible.`,
  "Ask what specifically is blocking you — the offer, the price, the audience, or the follow-up — and we will fix that one thing.",
])}
`;
  },
};
