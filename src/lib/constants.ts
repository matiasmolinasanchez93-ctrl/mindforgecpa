import type {
  BusinessPreference,
  Currency,
  ExperienceLevel,
  Skill,
  Subject,
  ActivityType,
  SkillKey,
} from "@/types";

export const APP_NAME = "MindForge";
export const APP_TAGLINE = "No delegues tu cerebro. Mejóralo.";

// ─── Education Platform Constants ────────────────────────────

export const SUBJECTS: Subject[] = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Economics",
  "English",
  "General",
];

export const SUBJECTS_WITH_ICONS: { value: Subject; label: string; icon: string }[] = [
  { value: "Mathematics", label: "Matemáticas", icon: "🔢" },
  { value: "Physics", label: "Física", icon: "⚛️" },
  { value: "Chemistry", label: "Química", icon: "🧪" },
  { value: "Biology", label: "Biología", icon: "🧬" },
  { value: "History", label: "Historia", icon: "📜" },
  { value: "Economics", label: "Economía", icon: "📊" },
  { value: "English", label: "Inglés", icon: "📝" },
  { value: "General", label: "General", icon: "💡" },
];

export const DIFFICULTY_LEVELS = [
  { value: "easy" as const, label: "Fácil", description: "Construyendo bases" },
  { value: "medium" as const, label: "Medio", description: "Aplicando conceptos" },
  { value: "hard" as const, label: "Difícil", description: "Dominando desafíos" },
];

export const ACTIVITIES: {
  type: ActivityType;
  label: string;
  description: string;
  icon: string;
  xpBase: number;
}[] = [
  {
    type: "ai_detective",
    label: "Detective de IA",
    description: "Encuentra errores en contenido generado por IA",
    icon: "🔍",
    xpBase: 25,
  },
  {
    type: "prompt_battle",
    label: "Batalla de Prompts",
    description: "Construye el mejor prompt para un objetivo",
    icon: "⚔️",
    xpBase: 30,
  },
  {
    type: "solve_it",
    label: "Resuélvelo",
    description: "Resuelve problemas usando pistas",
    icon: "🧩",
    xpBase: 35,
  },
  {
    type: "explain_it",
    label: "Explícalo",
    description: "Explica conceptos con tus propias palabras",
    icon: "🎤",
    xpBase: 20,
  },
  {
    type: "fact_check",
    label: "Verificación de datos",
    description: "Determina qué necesita verificación",
    icon: "✅",
    xpBase: 25,
  },
];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ai_detective: "Detective de IA",
  prompt_battle: "Batalla de Prompts",
  solve_it: "Resuélvelo",
  explain_it: "Explícalo",
  fact_check: "Verificación de datos",
};

export const SKILL_KEYS: SkillKey[] = [
  "ai_literacy",
  "critical_thinking",
  "problem_solving",
  "research",
  "verification",
  "ai_independence",
];

export const ACTIVITY_SKILL_WEIGHTS: Record<ActivityType, Partial<Record<SkillKey, number>>> = {
  ai_detective: { critical_thinking: 0.4, verification: 0.3, ai_literacy: 0.3 },
  prompt_battle: { ai_literacy: 0.5, research: 0.3, problem_solving: 0.2 },
  solve_it: { problem_solving: 0.5, critical_thinking: 0.3, ai_independence: 0.2 },
  explain_it: { critical_thinking: 0.4, research: 0.3, ai_literacy: 0.3 },
  fact_check: { verification: 0.5, research: 0.3, critical_thinking: 0.2 },
};

// ─── Legacy constants (kept for backward compatibility) ──────

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "USD — Dólar estadounidense", symbol: "$" },
  { value: "GTQ", label: "GTQ — Quetzal guatemalteco", symbol: "Q" },
  { value: "EUR", label: "EUR — Euro", symbol: "€" },
  { value: "MXN", label: "MXN — Peso mexicano", symbol: "$" },
  { value: "COP", label: "COP — Peso colombiano", symbol: "$" },
  { value: "PEN", label: "PEN — Sol peruano", symbol: "S/" },
  { value: "ARS", label: "ARS — Peso argentino", symbol: "$" },
  { value: "Other", label: "Otra", symbol: "$" },
];

export const SKILLS: Skill[] = [
  "Sales",
  "Marketing",
  "Programming",
  "Design",
  "Video editing",
  "Social media",
  "Writing",
  "Finance",
  "Communication",
  "Other",
];

/** Spanish labels for the stored (English) skill values. */
export const SKILL_LABELS: Record<Skill, string> = {
  Sales: "Ventas",
  Marketing: "Marketing",
  Programming: "Programación",
  Design: "Diseño",
  "Video editing": "Edición de video",
  "Social media": "Redes sociales",
  Writing: "Redacción",
  Finance: "Finanzas",
  Communication: "Comunicación",
  Other: "Otro",
};

export const SKILL_OPTIONS: { value: Skill; label: string }[] = SKILLS.map((skill) => ({
  value: skill,
  label: SKILL_LABELS[skill],
}));

export const BUSINESS_PREFERENCES: BusinessPreference[] = [
  "Online business",
  "Local business",
  "Service business",
  "Product business",
  "Digital product",
  "Doesn't matter",
];

/** Spanish labels for the stored (English) preference values. */
export const BUSINESS_PREFERENCE_LABELS: Record<BusinessPreference, string> = {
  "Online business": "Negocio en línea",
  "Local business": "Negocio local",
  "Service business": "Negocio de servicios",
  "Product business": "Negocio de productos",
  "Digital product": "Producto digital",
  "Doesn't matter": "No importa",
};

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

/** Spanish labels for the stored (English) experience values. */
export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  Beginner: "Principiante",
  Intermediate: "Intermedio",
  Advanced: "Avanzado",
};

export const ROADMAP_DAYS = 30;

export const DEFAULT_HOURS_PER_DAY = 2;

export const QUICK_GOAL_PRESETS = [100, 300, 500, 1000, 2000, 5000];

export const QUICK_BUDGET_PRESETS = [0, 100, 250, 500, 1000];

export const COACH_EXAMPLES = [
  "Nadie responde a mis mensajes. ¿Qué debería cambiar?",
  "Ya tengo mi primer cliente. ¿Qué debería hacer ahora?",
  "¿Debería bajar mi precio?",
  "¿Cómo consigo mis primeros 5 clientes esta semana?",
];

export const MARKETING_CHANNEL_ICONS: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  linkedin: "💼",
  facebook: "👥",
  whatsapp: "💬",
  email: "✉️",
  cold: "🤝",
  seo: "🔍",
  referrals: "🙋",
  local: "📍",
};

export const BUSINESS_STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
  completed: "Completado",
};
