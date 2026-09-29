/**
 * Plain-language explanations for the tutor's known topics.
 *
 * The tutor's default stance is Socratic, but there are moments where a direct
 * explanation is the right teaching move (a student asks for one, or is stuck
 * after several hints). These are written to be accurate, short, and pitched at
 * secondary-school level — and each one is followed by a question that checks
 * whether it actually landed.
 */

export const TOPIC_EXPLANATIONS: Record<string, string> = {
  quadratics:
    "A quadratic is any equation where the highest power of x is 2 — the general form is ax² + bx + c = 0, and its graph is a U-shaped curve called a parabola. Because the highest power is 2, there are usually two solutions, called roots: the x-values where the curve crosses the x-axis. You can find them by factorising (reversing the bracket expansion), by completing the square, or by the quadratic formula. The formula works for every quadratic, so it is the reliable fallback when factorising gets messy.",

  percentages:
    "A percentage is just a fraction with 100 on the bottom, so 25% means 25/100, which is 0.25 as a decimal. That is why 'increase by 20%' is not 'add 20' — it means multiply by 1.20. The single most useful habit is to convert the percentage to a multiplier before calculating: increases use 1 + the rate, decreases use 1 − the rate. It also explains why a 20% rise followed by a 20% fall does not return to the start — the second percentage is applied to a bigger number.",

  fractions:
    "A fraction shows how many equal parts you have out of how many there are. The denominator (bottom) says how big the parts are; the numerator (top) says how many you have. You can only add or subtract fractions when the parts are the same size, which is why you need a common denominator first. Multiplying works differently — you multiply across, because you are taking a fraction of a fraction. Simplifying at the end rewrites the same value using smaller numbers.",

  "linear-equations":
    "A linear equation is one where the unknown appears to the first power only, so its graph is a straight line. Solving one means isolating the unknown by undoing whatever was done to it, in reverse order. The key rule is balance: whatever you do to one side, you do to the other. Always substitute your answer back into the original equation — that one habit catches almost every arithmetic slip.",

  "newton-laws":
    "Newton's three laws describe how forces change motion. The first: an object keeps doing what it was doing unless a resultant force acts on it, which is why things in space keep moving without an engine. The second: force equals mass times acceleration (F = ma), so the same force accelerates a lighter object more. The third: every action has an equal and opposite reaction, which is why a rocket pushes gas downwards to move upwards. The practical skill is always the same — list the forces acting on one object, then decide whether they balance.",

  energy:
    "Energy is stored in different ways — kinetic when something moves, gravitational when something is raised, thermal when it is hot, elastic when it is stretched — and it is never used up, only transferred between stores. That is conservation of energy: the total at the start equals the total at the end, unless energy escapes to the surroundings as heat or sound. To solve a problem, name the store at the start, name the store at the end, then set those two quantities equal. Efficiency is simply how much of the output is useful rather than wasted.",

  "atomic-structure":
    "An atom has a small, dense nucleus containing protons (positive) and neutrons (neutral), surrounded by electrons (negative) arranged in shells. The number of protons is the atomic number, and it defines which element the atom is — change the protons and you have a different element entirely. The mass number is protons plus neutrons. Isotopes are atoms of the same element with different numbers of neutrons, so they behave the same chemically but weigh slightly differently. Ions form when the number of electrons changes, giving the atom a charge.",

  "acids-bases":
    "An acid releases hydrogen ions (H⁺) when dissolved in water; a base accepts them, and an alkali is simply a base that dissolves in water. The pH scale runs from 0 to 14: below 7 is acidic, 7 is neutral, above 7 is alkaline. Because the scale is logarithmic, pH 3 is ten times more acidic than pH 4 — not slightly more. When an acid reacts with a base it neutralises, producing a salt and water, which is why mild bases calm excess stomach acid.",

  photosynthesis:
    "Photosynthesis is how plants make their own food. They take in carbon dioxide through the leaves and water through the roots, and use light energy absorbed by chlorophyll — the green pigment inside chloroplasts — to convert them into glucose and oxygen. The word equation is: carbon dioxide + water → glucose + oxygen, using light energy. The glucose is used for growth, converted to starch for storage, or turned into cellulose for cell walls. Most of a plant's mass comes from carbon dioxide in the air, not from the soil.",

  cells:
    "Cells are the smallest living unit. Most contain a nucleus holding DNA, cytoplasm where reactions happen, a cell membrane controlling what enters and leaves, and mitochondria that release energy from glucose. Plant cells have three extra structures that animal cells lack: a rigid cell wall for support, chloroplasts for photosynthesis, and a large permanent vacuole holding cell sap. Specialised cells change shape to suit their job — a nerve cell is long to carry signals, a root hair cell is thin to absorb water. The shape always follows the function.",

  "world-war-2":
    "The Second World War ran from 1939 to 1945, and it did not start from a single event. The underlying causes built through the 1930s: the harsh terms of the Treaty of Versailles, the global depression, the rise of expansionist regimes, and the failure of the League of Nations to stop them. The immediate trigger was the invasion of Poland in September 1939, which led Britain and France to declare war. Keep the distinction sharp between causes (why conditions made war likely) and triggers (the final spark) — that chain of links, not a list of dates, is what earns marks.",

  "supply-demand":
    "A demand curve shows how much buyers want at each price, and it slopes downwards because a higher price puts people off. A supply curve slopes upwards because a higher price makes it worth producing more. Where they cross is the equilibrium price — the point where the quantity buyers want equals the quantity sellers offer. The distinction that trips most people up is movement versus shift: a change in price moves you along the curve, while a change in anything else — income, tastes, production costs — shifts the whole curve.",
};
