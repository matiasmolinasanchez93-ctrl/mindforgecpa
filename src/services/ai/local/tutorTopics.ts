/**
 * Concept knowledge for the Socratic tutor.
 *
 * Each topic lists the checkpoints a student must reach, the questions that
 * lead there, progressive hints, and the misconceptions that most often block
 * them. When a topic is not recognised the tutor falls back to a generic
 * Socratic framework that still refuses to hand over answers.
 */

export interface TutorTopic {
  id: string;
  subject: string;
  /** Lower-case fragments that identify this topic in free text. */
  keywords: string[];
  /** What the student should be able to do by the end. */
  checkpoints: string[];
  /** Questions that start the student moving toward checkpoint one. */
  openers: string[];
  /** Progressive hints, from gentle to nearly explicit. */
  hints: string[];
  /** Errors that most commonly block progress here. */
  misconceptions: string[];
}

export const TUTOR_TOPICS: TutorTopic[] = [
  {
    id: "quadratics",
    subject: "Mathematics",
    keywords: ["quadratic", "parabola", "x squared", "ax2", "ax^2"],
    checkpoints: [
      "Write the equation as ax² + bx + c = 0 and name a, b and c",
      "Decide whether it factorises, completes the square, or needs the formula",
      "Check both solutions back in the original equation",
    ],
    openers: [
      "Before we solve anything: what shape does a quadratic draw, and how is that different from a line?",
      "If you already have it in the form ax² + bx + c = 0, what are your a, b and c?",
    ],
    hints: [
      "Rewrite it so everything is on one side and zero is on the other. What are a, b and c now?",
      "Look for two numbers that multiply to a×c and add to b. Does one pair jump out?",
      "If it will not factorise, the quadratic formula always works. What goes inside the square root?",
    ],
    misconceptions: [
      "Assuming every quadratic has two different solutions — some have one repeated root",
      "Forgetting that the number under the square root decides whether real roots exist",
    ],
  },
  {
    id: "percentages",
    subject: "Mathematics",
    keywords: ["percent", "percentage", "discount", "increase by", "decrease by"],
    checkpoints: [
      "Recognise that a percentage is a fraction of 100",
      "Convert between percentage, decimal and fraction",
      "Decide whether the change is applied to the original or the new value",
    ],
    openers: [
      "What does 25% actually mean as a fraction? Say it out loud first.",
      "If a price goes up 20% and then down 20%, does it end up where it started? What do you think?",
    ],
    hints: [
      "Percent means 'per hundred'. So 25% is 25 divided by 100. What is that as a decimal?",
      "When something increases by 20%, you keep the whole and add 20%. What single number could multiply the original?",
      "Careful: a 20% rise then a 20% fall is applied to two different starting amounts. Which comes first?",
    ],
    misconceptions: [
      "Adding and subtracting percentages instead of multiplying by factors",
      "Applying the percentage to the already-changed value without noticing",
    ],
  },
  {
    id: "fractions",
    subject: "Mathematics",
    keywords: ["fraction", "numerator", "denominator", "common denominator"],
    checkpoints: [
      "Explain what the numerator and denominator each represent",
      "Find a common denominator before adding or subtracting",
      "Simplify the result to its lowest terms",
    ],
    openers: [
      "What does the bottom number of a fraction tell you — how many parts there are, or how many you have?",
      "Why can't you just add the tops and the bottoms together?",
    ],
    hints: [
      "You can only add parts of the same size. What size are the parts in each fraction right now?",
      "Find a number both denominators divide into. What is the smallest one?",
      "Once the denominators match, add only the numerators. Then ask: can this be simplified?",
    ],
    misconceptions: [
      "Adding numerators and denominators separately",
      "Thinking a larger denominator means a larger fraction",
    ],
  },
  {
    id: "linear-equations",
    subject: "Mathematics",
    keywords: ["linear equation", "solve for x", "gradient", "slope", "y = mx"],
    checkpoints: [
      "Identify the unknown you are solving for",
      "Apply the same operation to both sides",
      "Substitute the answer back to verify it",
    ],
    openers: [
      "Which value are you trying to isolate, and what is currently attached to it?",
      "If the two sides are equal, what happens if you do the same thing to both?",
    ],
    hints: [
      "Undo the operations in reverse order. What was done to x last?",
      "Whatever you do to one side, do to the other. Have you kept them balanced?",
      "Put your answer back into the original equation. Do both sides come out equal?",
    ],
    misconceptions: [
      "Moving terms across the equals sign without changing their sign",
      "Dividing only part of one side by a number",
    ],
  },
  {
    id: "newton-laws",
    subject: "Physics",
    keywords: ["newton", "force", "acceleration", "f = ma", "inertia"],
    checkpoints: [
      "State which of Newton's three laws applies to the situation",
      "Draw or describe the forces acting, including direction",
      "Apply F = ma to relate force, mass and acceleration",
    ],
    openers: [
      "What forces are acting on the object right now, and in which directions?",
      "If the object is not accelerating, what must be true about the forces on it?",
    ],
    hints: [
      "List every force and its direction before doing any maths.",
      "Balance means the forces cancel. Unbalanced means there is a resultant force. Which is it here?",
      "F = ma links the resultant force to mass and acceleration. What is the resultant force?",
    ],
    misconceptions: [
      "Thinking a moving object must have a force pushing it along",
      "Confusing mass (kg) with weight (newtons)",
    ],
  },
  {
    id: "energy",
    subject: "Physics",
    keywords: ["energy", "kinetic", "potential", "joule", "conservation of energy"],
    checkpoints: [
      "Name the energy stores involved at the start and end",
      "Describe the transfers between them",
      "Apply conservation of energy to set up the equation",
    ],
    openers: [
      "Where is the energy stored at the start, and where has it moved to by the end?",
      "If no energy leaves the system, what can you say about the totals before and after?",
    ],
    hints: [
      "Name the stores: kinetic, gravitational, thermal, elastic. Which are involved?",
      "Energy is not used up — it is transferred. What is it transferred into here?",
      "Set the initial store equal to the final store and solve for the unknown.",
    ],
    misconceptions: [
      "Saying energy is 'used up' rather than transferred",
      "Assuming energy is always conserved as motion rather than heat and sound",
    ],
  },
  {
    id: "atomic-structure",
    subject: "Chemistry",
    keywords: ["atom", "proton", "neutron", "electron", "atomic number", "isotope"],
    checkpoints: [
      "Name the three subatomic particles and their charges",
      "Relate atomic number and mass number to particle counts",
      "Explain what makes two atoms isotopes of each other",
    ],
    openers: [
      "What is in the nucleus, and what is outside it?",
      "Which particle decides what element an atom is?",
    ],
    hints: [
      "Protons are positive, electrons are negative, neutrons are neutral. Which are in the nucleus?",
      "The atomic number is the number of protons. Where do you find it on the periodic table?",
      "Isotopes have the same protons but different neutrons. What changes — mass, charge, or both?",
    ],
    misconceptions: [
      "Thinking electrons orbit in fixed rings like planets",
      "Confusing mass number with atomic number",
    ],
  },
  {
    id: "acids-bases",
    subject: "Chemistry",
    keywords: ["acid", "base", "alkali", "ph", "neutralis", "indicator"],
    checkpoints: [
      "Describe what acids and bases release in solution",
      "Interpret the pH scale from 0 to 14",
      "Predict the products of an acid–base neutralisation",
    ],
    openers: [
      "What do acids release when they dissolve in water?",
      "Where on the pH scale would you expect a strong base to sit?",
    ],
    hints: [
      "Acids release hydrogen ions (H⁺). What do bases release?",
      "pH 7 is neutral. Which side is acidic and which is alkaline?",
      "Acid + base gives a salt plus water. What are the two products in your case?",
    ],
    misconceptions: [
      "Believing a lower pH means a weaker acid",
      "Thinking all bases are alkalis — alkalis are the soluble ones",
    ],
  },
  {
    id: "photosynthesis",
    subject: "Biology",
    keywords: ["photosynthesis", "chlorophyll", "chloroplast", "glucose", "stomata"],
    checkpoints: [
      "Write the word equation for photosynthesis",
      "Name where it happens and what absorbs the light",
      "Explain what the plant does with the glucose produced",
    ],
    openers: [
      "What does a plant take in, and what does it give out, during photosynthesis?",
      "Where in the plant cell does this actually happen?",
    ],
    hints: [
      "The inputs are carbon dioxide and water. What supplies the energy?",
      "Which pigment absorbs light, and which organelle contains it?",
      "Glucose is the product. Is it used immediately, stored, or converted into something else?",
    ],
    misconceptions: [
      "Thinking plants respire instead of photosynthesising rather than doing both",
      "Believing plants get their mass mainly from the soil",
    ],
  },
  {
    id: "cells",
    subject: "Biology",
    keywords: ["cell", "nucleus", "mitochondria", "organelle", "cell membrane"],
    checkpoints: [
      "Name the main organelles and their functions",
      "Distinguish plant from animal cells",
      "Explain why a specialised cell has its particular shape",
    ],
    openers: [
      "Which parts do you already remember inside a cell, and what does each do?",
      "What would happen to the cell if the membrane stopped working?",
    ],
    hints: [
      "The nucleus holds the DNA. Which organelle releases energy, and which controls what enters and leaves?",
      "Plant cells have three things animal cells lack. Can you name one?",
      "A specialised cell's shape usually follows its job. What is this cell's job?",
    ],
    misconceptions: [
      "Thinking bacteria are the same kind of cell as animal cells",
      "Believing all cells in an organism are identical",
    ],
  },
  {
    id: "world-war-2",
    subject: "History",
    keywords: ["world war two", "world war 2", "wwii", "ww2", "hitler", "1939"],
    checkpoints: [
      "Place the main events in chronological order",
      "Distinguish long-term causes from the immediate trigger",
      "Explain how one event led to the next",
    ],
    openers: [
      "Which single event do you think started the war, and why that one?",
      "What was happening in Europe during the 1930s that made conflict more likely?",
    ],
    hints: [
      "Separate causes from triggers. Which is the underlying condition and which is the spark?",
      "Think about the treaty that ended the previous war. How might its terms have created resentment?",
      "Reason in links: A led to B, and B made C possible. Where is the gap in your chain?",
    ],
    misconceptions: [
      "Treating one event as the single cause of a complex conflict",
      "Confusing causes (why it happened) with consequences (what it led to)",
    ],
  },
  {
    id: "supply-demand",
    subject: "Economics",
    keywords: ["supply and demand", "equilibrium", "demand curve", "price mechanism"],
    checkpoints: [
      "Explain what the demand and supply curves each represent",
      "Identify what shifts a curve versus what moves along it",
      "Predict the effect of a shift on equilibrium price and quantity",
    ],
    openers: [
      "If the price of something rises, what happens to the quantity people want to buy?",
      "What is the difference between the price changing and the whole demand curve moving?",
    ],
    hints: [
      "Demand slopes down: higher price, lower quantity demanded. Why does that happen?",
      "A shift happens because of something other than price — income, tastes, substitutes. Has one of those changed?",
      "If demand shifts right, what happens to price and quantity at the new equilibrium?",
    ],
    misconceptions: [
      "Confusing a movement along a curve with a shift of the curve",
      "Assuming price always settles instantly at equilibrium",
    ],
  },
];
