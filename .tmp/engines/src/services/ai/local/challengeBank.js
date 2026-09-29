"use strict";
/**
 * Gradeable challenge content.
 *
 * One template per activity type and difficulty. Each carries several content
 * variants so the "Next Challenge" button produces a genuinely different
 * problem, and each has a specific correct answer, three progressive hints and
 * an explanation of the skill being practised.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHALLENGE_BANK = void 0;
exports.CHALLENGE_BANK = {
    "ai_detective:easy": {
        title: "AI Detective: Spot the Wrong Fact",
        description: "Read the passage and find the statement that is factually wrong.",
        hints: [
            "Check each numbered statement on its own — being right about one thing does not mean being right about the next.",
            "One statement uses a number that is off. Re-read the figures carefully.",
            "You are looking for a claim that contradicts a basic, well-established fact.",
        ],
        explanation: "AI writes confidently whether it is right or wrong. The skill is to verify each claim separately instead of trusting the passage as a whole.",
        variants: [
            {
                content: "Here are three facts about the human body:\n\n1. The adult human body has 206 bones.\n2. The heart pumps blood around the body.\n3. Humans have four lungs.\n\nAll three statements above are correct.",
                correctAnswer: "Statement 3 is wrong. Humans have two lungs, not four. Statements 1 and 2 are accurate — and that is exactly what makes the error easy to miss.",
            },
            {
                content: "Three facts about water:\n\n1. Water boils at 100°C at sea level.\n2. Water is made of hydrogen and oxygen.\n3. Water freezes at 10°C.\n\nAll of these are correct.",
                correctAnswer: "Statement 3 is wrong. Water freezes at 0°C, not 10°C. Statements 1 and 2 are accurate.",
            },
        ],
    },
    "ai_detective:medium": {
        title: "AI Detective: Mixed Accuracy",
        description: "Two statements in this passage are wrong. Find both.",
        hints: [
            "Assume the writer is confident but not necessarily correct. Verify each numbered claim.",
            "The two errors are not next to each other, and the accurate statements around them are there to lower your guard.",
            "One error is about what something is; the other uses an absolute word like 'only' or 'always'.",
        ],
        explanation: "Absolute words such as 'only', 'always' and 'never' are where AI errors cluster, because they overstate. Treat them as claims that need checking.",
        variants: [
            {
                content: "About the Solar System:\n\n1. Jupiter is the largest planet in the Solar System.\n2. The Sun is a planet at the centre of the Solar System.\n3. Mars is known as the Red Planet.\n4. Light from the Sun reaches Earth in about 8 minutes.\n5. Saturn is the only planet with rings.\n\nEverything above is accurate.",
                correctAnswer: "Statements 2 and 5 are wrong. The Sun is a star, not a planet, and Saturn is not the only planet with rings — Jupiter, Uranus and Neptune have rings too. Statements 1, 3 and 4 are correct.",
            },
            {
                content: "About writing:\n\n1. A verb describes an action or a state.\n2. A noun names a person, place, thing or idea.\n3. An adverb always ends in -ly.\n4. A sentence needs a subject and a verb to be complete.\n5. 'Quick' is an adverb.\n\nAll five statements are correct.",
                correctAnswer: "Statements 3 and 5 are wrong. Adverbs do not always end in -ly (consider 'fast' or 'well'), and 'quick' is an adjective — 'quickly' is the adverb. Statements 1, 2 and 4 are correct.",
            },
        ],
    },
    "ai_detective:hard": {
        title: "AI Detective: Subtle Errors",
        description: "This passage contains errors that are partly factual and partly logical. Find them and explain why each is wrong.",
        hints: [
            "Some errors are about facts, others are about reasoning. Look for both kinds.",
            "Words like 'always', 'proves' and 'only' are worth a second look in every statement.",
            "For each claim, ask whether a counterexample could exist. If one could, the claim is too strong.",
        ],
        explanation: "Hard fact-checking means testing the reasoning, not just the facts. Claims using 'always' or 'proves' usually fall to a single counterexample.",
        variants: [
            {
                content: "On statistics and reasoning:\n\n1. Correlation always proves causation.\n2. A study of 12 people is strong evidence for the whole population.\n3. The mean can be distorted by extreme values, unlike the median.\n4. If a coin lands heads five times in a row, tails is now more likely.\n5. A larger sample generally gives a more reliable estimate.\n\nEach statement reflects sound statistical reasoning.",
                correctAnswer: "Statements 1, 2 and 4 are wrong. Correlation does not prove causation; a sample of 12 is far too small to generalise; and past coin flips do not change future probability (the gambler's fallacy). Statements 3 and 5 are correct, which is what makes the passage feel authoritative.",
            },
            {
                content: "On chemistry and physics:\n\n1. Mass is conserved in a chemical reaction in a closed system.\n2. An atom is mostly empty space.\n3. Energy can be created by burning fuel.\n4. Electrons are heavier than protons.\n5. Isotopes of an element have the same number of protons.\n\nAll of the above are scientifically correct.",
                correctAnswer: "Statements 3 and 4 are wrong. Burning releases stored chemical energy — it does not create it; and protons are roughly 1,800 times heavier than electrons. Statements 1, 2 and 5 are correct.",
            },
        ],
    },
    "prompt_battle:easy": {
        title: "Prompt Battle: Tonight's Dinner",
        description: "Write a prompt that gets the AI to produce a recipe you could actually cook tonight.",
        hints: [
            "Tell the AI what you have and what you cannot use.",
            "Include the time limit — it changes which recipes are even valid.",
            "Ask for a specific output format: ingredients first, then steps.",
        ],
        explanation: "Specific constraints are what turn a generic answer into a usable one. For practical requests, the three that matter most are ingredients, time limits and output format.",
        variants: [
            {
                content: "Your goal: get a recipe you can genuinely cook tonight.\n\nYou have 25 minutes, an oven, and only these ingredients: eggs, rice, spinach, onions and basic spices. You dislike spicy food.\n\nWrite the prompt you would send to an AI.",
                correctAnswer: "A strong prompt states the role, the constraints and the format — for example: 'Act as a practical home cook. Give me one dinner recipe using only eggs, rice, spinach and onions, ready in under 25 minutes, and not spicy. List ingredients with quantities first, then numbered steps. Keep it under 200 words.' Vague prompts like 'give me a recipe' produce generic results that ignore your ingredients and your time limit.",
            },
            {
                content: "Your goal: get a short, useful summary of a topic you are revising.\n\nYou have 10 minutes, and you need to remember the causes of the First World War for a test tomorrow. You learn best from short lists.\n\nWrite the prompt.",
                correctAnswer: "A strong prompt specifies the scope, the constraint and the format — for example: 'Act as a history tutor. List the main causes of the First World War as six short bullet points, each under 15 words, ordered from long-term to immediate. No long paragraphs.' Without the format and length constraints, the answer comes back as an essay you cannot revise from in 10 minutes.",
            },
        ],
    },
    "prompt_battle:medium": {
        title: "Prompt Battle: Three-Day Revision Plan",
        description: "Build a prompt that produces a study plan you would actually follow.",
        hints: [
            "Name the exact topics, not just the subject.",
            "Tell it how you actually learn — that changes which activities it suggests.",
            "Ask for a table or schedule rather than paragraphs.",
        ],
        explanation: "Naming your own constraints is what makes a plan usable. A plan built for someone else's learning style is a plan you abandon on day one.",
        variants: [
            {
                content: "Your goal: prepare for a Biology exam on cell structure and photosynthesis in three days.\n\nYou have about 90 minutes a day. You learn best from diagrams and by explaining things out loud. You forget anything you only read.\n\nWrite the prompt.",
                correctAnswer: "A strong prompt specifies scope, constraint, learning style and output shape — for example: 'Act as a biology tutor. Build a 3-day revision plan covering cell structure and photosynthesis. I have 90 minutes a day. I learn from diagrams and by explaining out loud, so include one diagram task and one teach-it-back task each day. Return a table with day, focus, activity and minutes.' Without the learning style, the AI defaults to reading lists — exactly what does not work for you.",
            },
            {
                content: "Your goal: learn enough Spanish to hold a five-minute conversation about your family in four weeks.\n\nYou can practise 20 minutes a day, mostly on a commute, with no internet connection. You already know basic greetings.\n\nWrite the prompt.",
                correctAnswer: "A strong prompt states the target, the constraints and the format — for example: 'Act as a Spanish tutor. Build a 4-week plan to hold a 5-minute conversation about my family. I have 20 minutes a day, mostly offline on a commute, and I already know greetings. Give each day one listening-free activity and one speaking activity, and end each week with a self-test I can do from memory.' The offline constraint is the detail that changes everything about the plan.",
            },
        ],
    },
    "prompt_battle:hard": {
        title: "Prompt Battle: Honest Critique",
        description: "Write a prompt that gets genuinely critical feedback instead of encouragement.",
        hints: [
            "Assign a role that has a professional reason to be sceptical.",
            "Explicitly forbid praise — otherwise the AI defaults to encouragement.",
            "Ask what evidence would change its mind. That forces testable claims.",
        ],
        explanation: "Models are trained to be agreeable. Naming a sceptical role, forbidding praise and demanding falsifiable tests is how you get criticism worth reading.",
        variants: [
            {
                content: "Your goal: get an honest critique of a business idea.\n\nThe idea: a subscription service delivering pre-portioned ingredients to university students in your city, priced at roughly double a supermarket shop.\n\nYou need the weaknesses, not compliments — and you want to know what evidence would change the critic's mind.\n\nWrite the prompt.",
                correctAnswer: "A strong prompt assigns a critical role, supplies the real numbers, forbids politeness and demands evidence — for example: 'Act as a sceptical investor who has watched this model fail. Here is my idea and pricing. Do not praise it. List the three assumptions most likely to be wrong, how I could test each cheaply this month, and what evidence would change your mind. Be specific and blunt.' Asking for strengths invites flattery; asking for falsifiable assumptions produces something you can act on.",
            },
            {
                content: "Your goal: get your personal statement for a university application torn apart.\n\nYou have written 600 words about wanting to study engineering. You suspect it sounds generic, but you cannot see how.\n\nYou want specific, line-level criticism rather than a rewrite.\n\nWrite the prompt.",
                correctAnswer: "A strong prompt defines the role, the standard and the acceptable output — for example: 'Act as an admissions tutor who reads 200 statements a week. Below is my statement. Do not rewrite it. Identify every sentence that could have been written by any applicant, quote it, and explain why it is generic. Then list the three strongest sentences and say why they work.' Asking for a rewrite hides the problem; asking for quoted specifics teaches you to fix it yourself.",
            },
        ],
    },
    "solve_it:easy": {
        title: "Solve It: Percentage Discount",
        description: "Work out the final price step by step. Show your reasoning, not just the number.",
        hints: [
            "Convert the percentage into a decimal first.",
            "Find the amount of the change, then add or subtract it from the original.",
            "Check by multiplying the original by the right factor — a 25% reduction is × 0.75.",
        ],
        explanation: "Percentage problems are safest done with a multiplier: a 25% reduction is × 0.75, a 15% reduction is × 0.85, a 20% increase is × 1.20. That avoids the most common slip of adding or subtracting the percentage itself.",
        variants: [
            {
                content: "A jacket costs $80. It is reduced by 25%.\n\nWhat is the sale price, and how much money was taken off?",
                correctAnswer: "25% of $80 = 0.25 × 80 = $20 off. Sale price = 80 − 20 = $60. The jacket costs $60 and you save $20.",
            },
            {
                content: "A phone costs $200 and is discounted by 15%.\n\nWhat is the new price?",
                correctAnswer: "15% of $200 = 0.15 × 200 = $30 off. New price = 200 − 30 = $170.",
            },
            {
                content: "A ticket costs $50 and the price rises by 20%.\n\nWhat is the new price?",
                correctAnswer: "20% of $50 = $10. New price = 50 + 10 = $60.",
            },
        ],
    },
    "solve_it:medium": {
        title: "Solve It: Two-Speed Journey",
        description: "Handle each stage of the journey separately, then combine. Watch what counts toward average speed.",
        hints: [
            "Handle each leg separately before combining anything.",
            "Convert all times to hours — 45 minutes is 0.75 hours.",
            "Average speed is total distance divided by total time, including any rest periods.",
        ],
        explanation: "The trap is averaging the two speeds directly. Average speed is always total distance over total time, and idle time still counts toward the total time.",
        variants: [
            {
                content: "A cyclist rides at 18 km/h for 1.5 hours, rests for 20 minutes, then rides at 24 km/h for 45 minutes.\n\nWhat is the total distance, and what is the average speed for the whole trip including the rest?",
                correctAnswer: "Distance = (18 × 1.5) + (24 × 0.75) = 27 + 18 = 45 km. Total time = 1.5 + 0.333 + 0.75 = 2.583 hours. Average speed = 45 ÷ 2.583 ≈ 17.4 km/h. The rest adds no distance but does add time.",
            },
            {
                content: "A delivery van drives 120 km at 60 km/h, waits 30 minutes, then drives 90 km at 45 km/h.\n\nHow long does the whole trip take, and what is the average speed?",
                correctAnswer: "Time = 120/60 = 2 h, plus a 0.5 h wait, plus 90/45 = 2 h → 4.5 h total. Total distance = 210 km. Average speed = 210 ÷ 4.5 ≈ 46.7 km/h.",
            },
        ],
    },
    "solve_it:hard": {
        title: "Solve It: Break-Even Analysis",
        description: "Separate variable costs from fixed costs, then work out break-even and profit.",
        hints: [
            "Separate the variable cost per unit from the fixed monthly cost.",
            "Contribution per unit is price minus variable cost. That is what pays down the fixed costs.",
            "Break-even is fixed costs divided by contribution per unit. For a profit target, add the target to the fixed costs before dividing.",
        ],
        explanation: "Break-even analysis reduces to one idea: every sale contributes price minus variable cost toward the fixed costs. Once you know the contribution per unit, break-even and profit targets are the same division.",
        variants: [
            {
                content: "A small bakery sells cakes for $12 each. Ingredients cost $4.50 per cake, and fixed monthly costs (rent, utilities, insurance) are $1,800.\n\nHow many cakes must it sell each month to break even? If it currently sells 300 cakes a month, what is the monthly profit?",
                correctAnswer: "Contribution per cake = 12 − 4.50 = $7.50. Break-even = 1800 ÷ 7.50 = 240 cakes. At 300 cakes: profit = (300 × 7.50) − 1800 = 2250 − 1800 = $450 per month.",
            },
            {
                content: "A tutoring business charges $40 per session with a variable cost of $10 per session, and fixed costs of $1,500 a month.\n\nHow many sessions break even, and how many are needed for a $2,000 monthly profit?",
                correctAnswer: "Contribution per session = 40 − 10 = $30. Break-even = 1500 ÷ 30 = 50 sessions. For $2,000 profit: (1500 + 2000) ÷ 30 = 116.67, so 117 sessions.",
            },
        ],
    },
    "explain_it:easy": {
        title: "Explain It: Nouns",
        description: "Explain the idea in your own words, as if teaching someone younger. Short and concrete beats long and formal.",
        hints: [
            "Start with what it does, not with a formal definition.",
            "Use examples from everyday life rather than abstract terms.",
            "Cover all the categories — person, place, thing, idea — even if only one example each.",
        ],
        explanation: "Explaining something to a much younger student forces you to drop jargon. If you need a technical term to explain the concept, you probably do not understand it yet.",
        variants: [
            {
                content: "Explain what a 'noun' is to a 10-year-old, in your own words, in fewer than 80 words. Then give three examples.",
                correctAnswer: "A strong answer stays concrete and uses the child's world: 'A noun is a naming word. It is the word you use for a person, a place, a thing or an idea — like teacher, park, bicycle or happiness. If you can name it, the word is probably a noun.' Then three examples, ideally inside one sentence, e.g. 'The dog ran through the park to find its ball.'",
            },
            {
                content: "Explain the water cycle to a 9-year-old in fewer than 80 words, in your own words.",
                correctAnswer: "A strong answer uses evaporation, condensation and precipitation without the technical vocabulary, in the right order: 'The sun heats water in the sea and it rises into the air as invisible vapour. Up high it gets cold and turns back into tiny drops, which gather into clouds. When the drops get heavy, they fall as rain or snow, and the whole thing starts again.'",
            },
        ],
    },
    "explain_it:medium": {
        title: "Explain It: Photosynthesis",
        description: "Explain a process so that someone who missed the lesson understands it. Cover the inputs, the energy source and the outputs.",
        hints: [
            "Cover inputs, energy source and outputs — all three, in that order.",
            "Name the organelle and the pigment; that is what makes it an explanation of *how*.",
            "Finish by saying what the plant does with the glucose it makes.",
        ],
        explanation: "Explaining a process means tracking inputs, the transformation and the outputs. If you cannot say where the energy enters the system, the explanation is incomplete.",
        variants: [
            {
                content: "Explain how photosynthesis works to a classmate who missed the lesson and has not read the textbook. Under 150 words. You must include the word equation and state where the energy comes from.",
                correctAnswer: "A strong answer names the inputs (carbon dioxide and water), the energy source (light, absorbed by chlorophyll inside chloroplasts), the outputs (glucose and oxygen), and what happens to the glucose afterwards. It states the equation: carbon dioxide + water → glucose + oxygen. It stays under 150 words and does not simply recite the textbook.",
            },
            {
                content: "Explain how a bill becomes law in a democracy, to someone who has never studied politics. Under 150 words, and you must say where the process can fail.",
                correctAnswer: "A strong answer gives the stages in order — proposal, debate, amendment, vote, approval, enactment — and then names the failure points: committee stage where it can be buried, amendment stage where it can be gutted, veto stage, and the courts where it can be struck down. Naming where it can fail is what separates understanding from recitation.",
            },
        ],
    },
    "explain_it:hard": {
        title: "Explain It: Elasticity and Revenue",
        description: "Explain a counter-intuitive economic result. You must use the underlying mechanism, not just state the conclusion.",
        hints: [
            "Revenue is price multiplied by quantity — both change, so reasoning about price alone is not enough.",
            "Introduce elasticity and say what happens on each side of 1.",
            "Give one example where demand is clearly elastic, and explain why.",
        ],
        explanation: "The key insight is that revenue has two moving parts. Reasoning about price alone ignores the quantity response, which is exactly what elasticity measures.",
        variants: [
            {
                content: "Explain why raising a price by 20% can sometimes reduce a business's total revenue. Use supply and demand reasoning and refer to price elasticity. Under 200 words.",
                correctAnswer: "A strong answer explains that total revenue is price × quantity, so a price rise only helps if the fall in quantity is proportionally smaller. It introduces price elasticity: if demand is elastic (greater than 1), a 20% price rise causes a larger percentage fall in quantity, so revenue falls. If demand is inelastic, revenue rises. It then explains what makes demand elastic — close substitutes, a large share of income, non-essential goods — with a concrete example.",
            },
            {
                content: "Explain why a vaccine that is only 60% effective can still end an epidemic, while a 100% effective vaccine given to only 60% of people may not. Under 200 words.",
                correctAnswer: "A strong answer distinguishes individual protection from population-level transmission. A partially effective vaccine still reduces how many people each infected person passes the virus to; if that number drops below 1, the epidemic shrinks even though individuals can still get infected. Conversely, an excellent vaccine given to too few people leaves enough susceptible individuals for transmission to continue. The mechanism is the reproduction number, not the individual efficacy.",
            },
        ],
    },
    "fact_check:easy": {
        title: "Fact Check: Everyday Health Claims",
        description: "Decide which statements need verifying and which are safe generalities.",
        hints: [
            "Absolute words — 'exactly', 'every', 'always' — are the first thing to question.",
            "Ask whether one rule could really apply to every person identically.",
            "One of these claims is a well-known myth.",
        ],
        explanation: "Health claims that supposedly apply to everyone are almost always oversimplified. Absolute language and universal rules are reliable signals that a claim needs checking.",
        variants: [
            {
                content: "Consider these statements about health:\n\n1. Drinking water is important for staying hydrated.\n2. You must drink exactly 8 glasses of water every single day.\n3. Vitamin C prevents the common cold.\n\nWhich statements should be verified, and why?",
                correctAnswer: "Statements 2 and 3 need verification. Statement 2 uses 'exactly' and 'every single day' — a one-size-fits-all rule that ignores body size, activity and climate. Statement 3 is a persistent myth: vitamin C does not prevent colds. Statement 1 is a safe generality that needs no checking.",
            },
            {
                content: "Consider these statements about study habits:\n\n1. Sleep affects learning and memory.\n2. We only use 10% of our brain.\n3. Rereading notes is the single most effective way to revise.\n\nWhich statements should be verified, and why?",
                correctAnswer: "Statements 2 and 3 need verification. The 10% figure has no basis — brain imaging shows activity throughout. Statement 3 uses 'single most effective', which is a strong comparative claim; the evidence actually favours retrieval practice and spaced testing over rereading. Statement 1 is well established and needs no checking.",
            },
        ],
    },
    "fact_check:medium": {
        title: "Fact Check: Supported, Myth, or Contested",
        description: "Sort the claims into three piles: well supported, myth, and genuinely contested. The third pile is the one most people forget.",
        hints: [
            "Sort into three groups, not two: supported, myth, and genuinely debated.",
            "One of these is a famous myth built on a misunderstanding of the evidence.",
            "One claim has real support but a debated effect size — that is different from being false.",
        ],
        explanation: "Real fact-checking has three outcomes, not two. Treating every contested claim as either proven or false is itself a reasoning error.",
        variants: [
            {
                content: "A blog post claims:\n\n1. Exercise improves mental health.\n2. Humans only use 10% of their brain.\n3. Learning a second language delays cognitive decline.\n4. Sugar causes hyperactivity in children.\n5. Sleep deprivation impairs memory.\n\nWhich claims are well supported, which are myths, and which are genuinely contested?",
                correctAnswer: "Well supported: 1 and 5, both with strong replicated evidence. Myths: 2 (the 10% figure has no basis) and 4 (controlled studies find no consistent link between sugar and hyperactivity). Genuinely contested: 3 — the cognitive benefits are real but the size of the effect and the direction of causation are still argued.",
            },
            {
                content: "A video claims:\n\n1. Smoking increases the risk of lung cancer.\n2. Crushed garlic cures infections better than antibiotics.\n3. Humans and chimpanzees share a recent common ancestor.\n4. Drinking coffee stunts your growth.\n5. Intermittent fasting improves metabolic health.\n\nWhich are supported, which are myths, and which are genuinely contested?",
                correctAnswer: "Supported: 1 and 3. Myths: 2 (no evidence that garlic outperforms antibiotics for real infections, and relying on it is dangerous) and 4 (the growth-stunting claim traces back to a marketing campaign, not research). Contested: 5 — there is real evidence for metabolic benefits, but studies disagree on effect size, adherence and long-term outcomes.",
            },
        ],
    },
    "fact_check:hard": {
        title: "Fact Check: Name the Fallacy",
        description: "Each statement commits a specific reasoning error. Name it, and say what change would make the claim valid.",
        hints: [
            "Name the specific error in each statement — they are all different.",
            "Ask what the sample size, a third variable, and the response rate each do to the conclusion.",
            "For the salary claim, ask which measure of centre actually answers the question.",
        ],
        explanation: "Statistical claims usually fail through sampling, confounding, bias or the wrong measure of centre — not through arithmetic. Naming which one applies is the whole skill.",
        variants: [
            {
                content: "A news article reports:\n\n1. 'A study of 40 participants found coffee improves focus, so coffee improves focus for everyone.'\n2. 'Ice cream sales and drowning incidents rise together, so ice cream causes drowning.'\n3. 'Our survey had a 12% response rate, so it represents the whole city.'\n4. 'The average salary rose 5%, so most workers are better off.'\n\nIdentify the reasoning error in each and say what would make it valid.",
                correctAnswer: "1. Overgeneralisation from a small, likely unrepresentative sample — randomise, use a larger sample, and state the population. 2. Correlation mistaken for causation — a confounder (summer heat) drives both; controlling for temperature would remove the link. 3. Non-response bias — 12% of respondents tells you almost nothing about everyone else; compare responders to the population. 4. Misusing the mean — a few very high salaries lift the average; the median would show whether typical workers gained.",
            },
            {
                content: "A report claims:\n\n1. 'Countries that eat more chocolate win more Nobel prizes, so chocolate makes people smarter.'\n2. 'Three of the five people I asked preferred our product, so 60% of customers prefer it.'\n3. 'The treatment worked, because everyone who recovered had received it.'\n4. 'Crime fell after the new policy, so the policy caused the fall.'\n\nIdentify the reasoning error in each and say what would make it valid.",
                correctAnswer: "1. Correlation with a confounder — wealth explains both chocolate consumption and research output. 2. Tiny, non-random sample presented as a population statistic — you would need a properly sampled group of the right size. 3. Reverse reasoning / ignoring the comparison group — you need to know how many people recovered *without* the treatment. 4. Post hoc fallacy — other factors changed at the same time; you need a control group or a comparison region.",
            },
        ],
    },
};
