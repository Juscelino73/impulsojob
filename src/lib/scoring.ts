import type { CriterionKey } from "./types";

/** Central, configurable weights for the match score (must sum to 100). */
export const DEFAULT_WEIGHTS: Record<CriterionKey, number> = {
  required_skills: 30,
  desired_skills: 10,
  experience: 20,
  seniority: 15,
  achievements: 10,
  education: 5,
  preferences: 10,
};

export const CRITERION_LABELS: Record<CriterionKey, string> = {
  required_skills: "Competências obrigatórias",
  desired_skills: "Competências desejáveis",
  experience: "Experiência relevante",
  seniority: "Cargo e senioridade",
  achievements: "Conquistas relevantes",
  education: "Formação e certificações",
  preferences: "Localização e formato",
};

export function weightedScore(
  criteria: { key: CriterionKey; score: number }[],
  weights: Record<CriterionKey, number> = DEFAULT_WEIGHTS,
): number {
  let total = 0;
  let weightSum = 0;
  for (const c of criteria) {
    const w = weights[c.key] ?? 0;
    const s = Math.max(0, Math.min(100, Number.isFinite(c.score) ? c.score : 0));
    total += s * w;
    weightSum += w;
  }
  if (weightSum === 0) return 0;
  return Math.round(total / weightSum);
}

export function contribution(score: number, key: CriterionKey, weights = DEFAULT_WEIGHTS) {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  return Math.round((Math.max(0, Math.min(100, score)) * weights[key]) / sum);
}

export const DAILY_AI_LIMIT = 60;
