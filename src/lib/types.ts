export type Experience = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  responsibilities: string;
  achievements: string;
};
export type Education = { id: string; institution: string; degree: string; start: string; end: string };
export type Certification = { id: string; name: string; issuer: string; year: string };
export type Project = { id: string; name: string; description: string; link: string };
export type LanguageItem = { id: string; name: string; level: string };

export type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  skills: string[];
  languages: LanguageItem[];
  projects: Project[];
  links: string[];
  preferences: { workModes: string[]; locations: string; seniority: string };
};

export const emptyProfile = (): ProfileData => ({
  fullName: "",
  email: "",
  phone: "",
  location: "",
  title: "",
  summary: "",
  experiences: [],
  education: [],
  certifications: [],
  skills: [],
  languages: [],
  projects: [],
  links: [],
  preferences: { workModes: [], locations: "", seniority: "" },
});

export function normalizeProfile(raw: unknown): ProfileData {
  const base = emptyProfile();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<ProfileData>;
  return {
    ...base,
    ...r,
    experiences: Array.isArray(r.experiences) ? r.experiences : [],
    education: Array.isArray(r.education) ? r.education : [],
    certifications: Array.isArray(r.certifications) ? r.certifications : [],
    skills: Array.isArray(r.skills) ? r.skills : [],
    languages: Array.isArray(r.languages) ? r.languages : [],
    projects: Array.isArray(r.projects) ? r.projects : [],
    links: Array.isArray(r.links) ? r.links : [],
    preferences: { ...base.preferences, ...(r.preferences ?? {}) },
  };
}

export function profileCompletion(p: ProfileData): number {
  const checks = [
    !!p.title,
    !!p.summary,
    p.experiences.length > 0,
    p.education.length > 0,
    p.skills.length >= 3,
    p.languages.length > 0,
    !!p.fullName,
    p.preferences.workModes.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export const uid = () => crypto.randomUUID();

export type JobRequirements = {
  required: string[];
  desired: string[];
  responsibilities: string[];
  keywords: string[];
};

export type MatchBreakdown = {
  criteria: { key: CriterionKey; score: number; note: string }[];
  confirmed: string[];
  partial: string[];
  unknown: string[];
  mismatches: string[];
  reasons: string[];
  relevantExperience: string[];
  profileImprovements: string[];
  resumeChanges: string[];
  nextAction: string;
  summary: string;
};

export type CriterionKey =
  | "required_skills"
  | "desired_skills"
  | "experience"
  | "seniority"
  | "achievements"
  | "education"
  | "preferences";

export type ResumeContent = ProfileData;

export type ResumeChange = {
  id: string;
  section: string;
  original: string;
  suggested: string;
  reason: string;
  requirement: string;
  status: "pending" | "accepted" | "rejected";
};

export const APP_STATUSES = [
  { key: "salva", label: "Salva" },
  { key: "preparacao", label: "Em preparação" },
  { key: "candidatado", label: "Candidatado" },
  { key: "entrevista", label: "Em entrevista" },
  { key: "oferta", label: "Oferta" },
  { key: "rejeitado", label: "Rejeitado" },
  { key: "desistencia", label: "Desistência" },
] as const;
export type AppStatus = (typeof APP_STATUSES)[number]["key"];
