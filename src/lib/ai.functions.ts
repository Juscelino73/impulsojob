import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AiError, runStructured } from "./ai.server";
import { DAILY_AI_LIMIT, DEFAULT_WEIGHTS, weightedScore } from "./scoring";
import { normalizeProfile, type CriterionKey, type ProfileData } from "./types";

type Ctx = { supabase: any; userId: string };

async function guardUsage(ctx: Ctx, operation: string) {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await ctx.supabase
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if ((count ?? 0) >= DAILY_AI_LIMIT)
    throw new Error(`Limite diário de ${DAILY_AI_LIMIT} análises com IA atingido. Tente novamente amanhã.`);
  await ctx.supabase.from("ai_usage_events").insert({ user_id: ctx.userId, operation });
}

async function logActivity(ctx: Ctx, kind: string, label: string) {
  await ctx.supabase.from("activity_events").insert({ user_id: ctx.userId, kind, label });
}

function wrap<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((e) => {
    if (e instanceof AiError) throw new Error(e.message);
    throw e;
  });
}

async function loadProfile(ctx: Ctx): Promise<ProfileData> {
  const { data } = await ctx.supabase.from("profiles").select("data").maybeSingle();
  return normalizeProfile(data?.data);
}

const TRUTH_RULES =
  "Use SOMENTE informações presentes nos dados fornecidos. Nunca invente empresas, cargos, datas, diplomas, certificações, competências, projetos, conquistas, métricas, valores ou tamanhos de equipe. Responda em português do Brasil.";

/* ---------------- Resume parsing ---------------- */
const parsedResumeSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  title: z.string(),
  summary: z.string(),
  experiences: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      start: z.string(),
      end: z.string(),
      responsibilities: z.string(),
      achievements: z.string(),
    }),
  ),
  education: z.array(z.object({ institution: z.string(), degree: z.string(), start: z.string(), end: z.string() })),
  certifications: z.array(z.object({ name: z.string(), issuer: z.string(), year: z.string() })),
  skills: z.array(z.string()),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
  projects: z.array(z.object({ name: z.string(), description: z.string(), link: z.string() })),
  links: z.array(z.string()),
});

export const parseResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string }) => z.object({ text: z.string().min(50).max(40000) }).parse(d))
  .handler(({ data, context }) =>
    wrap(async () => {
      await guardUsage(context, "parse_resume");
      const out = await runStructured({
        instructions: `Você extrai dados estruturados de currículos. ${TRUTH_RULES} Copie o texto fielmente; use string vazia quando a informação não existir. Datas no formato MM/AAAA quando possível; use "Atual" para emprego atual.`,
        prompt: `Currículo:\n"""\n${data.text}\n"""`,
        schema: parsedResumeSchema,
      });
      return out;
    }),
  );

/* ---------------- Job analysis ---------------- */
const jobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  work_mode: z.enum(["remoto", "hibrido", "presencial", "desconhecido"]),
  seniority: z.string(),
  contract_type: z.string(),
  salary: z.string(),
  required: z.array(z.string()),
  desired: z.array(z.string()),
  responsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
});
export type AnalyzedJob = z.infer<typeof jobSchema>;

async function analyzeJobText(text: string) {
  return runStructured({
    instructions: `Você analisa descrições de vagas. Extraia somente o que está escrito. Separe requisitos obrigatórios de desejáveis (diferenciais). Competências curtas (1-4 palavras). Use string vazia quando ausente. ${TRUTH_RULES}`,
    prompt: `Descrição da vaga:\n"""\n${text}\n"""`,
    schema: jobSchema,
  });
}

export const analyzeJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string }) => z.object({ text: z.string().min(80).max(40000) }).parse(d))
  .handler(({ data, context }) =>
    wrap(async () => {
      await guardUsage(context, "analyze_job");
      return analyzeJobText(data.text);
    }),
  );

export const importJobFromUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { url: string }) => z.object({ url: z.string().url().max(2000) }).parse(d))
  .handler(({ data, context }) =>
    wrap(async () => {
      const u = new URL(data.url);
      if (!["http:", "https:"].includes(u.protocol)) throw new Error("URL inválida.");
      if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) throw new Error("URL não permitida.");
      let html = "";
      try {
        const res = await fetch(u.toString(), {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ImpulsoBot/1.0)", Accept: "text/html" },
          redirect: "follow",
        });
        if (!res.ok) throw new Error(String(res.status));
        html = (await res.text()).slice(0, 400000);
      } catch {
        throw new Error("Não foi possível acessar esta URL. Cole a descrição da vaga no campo de texto.");
      }
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 30000);
      if (text.length < 200)
        throw new Error("A página não trouxe texto suficiente (pode exigir login). Cole a descrição da vaga.");
      await guardUsage(context, "import_job_url");
      const job = await analyzeJobText(text);
      return { job, text };
    }),
  );

/* ---------------- Matching ---------------- */
const criterionKeys = Object.keys(DEFAULT_WEIGHTS) as [CriterionKey, ...CriterionKey[]];
const matchSchema = z.object({
  criteria: z.array(z.object({ key: z.enum(criterionKeys), score: z.number(), note: z.string() })),
  confirmed: z.array(z.string()),
  partial: z.array(z.string()),
  unknown: z.array(z.string()),
  mismatches: z.array(z.string()),
  reasons: z.array(z.string()),
  relevantExperience: z.array(z.string()),
  profileImprovements: z.array(z.string()),
  resumeChanges: z.array(z.string()),
  nextAction: z.string(),
  summary: z.string(),
});

export const computeMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobId: string }) => z.object({ jobId: z.string().uuid() }).parse(d))
  .handler(({ data, context }) =>
    wrap(async () => {
      const { data: job, error } = await context.supabase.from("jobs").select("*").eq("id", data.jobId).single();
      if (error || !job) throw new Error("Vaga não encontrada.");
      const profile = await loadProfile(context);
      if (!profile.title && profile.experiences.length === 0 && profile.skills.length === 0)
        throw new Error("Preencha ou importe seu perfil profissional antes de calcular a compatibilidade.");
      await guardUsage(context, "compute_match");
      const out = await runStructured({
        effort: "medium",
        instructions: `Você é um avaliador de compatibilidade entre candidato e vaga, objetivo e explicável. Avalie cada critério de 0 a 100: ${criterionKeys.join(", ")}. Regras: competências comprovadas no perfil = "confirmed"; parcialmente demonstradas = "partial"; requisitos não mencionados no perfil são "unknown" (desconhecidos, NÃO ausentes) — não penalize totalmente, use ~40 para critérios com informação desconhecida; "mismatches" só para incompatibilidades explícitas (ex.: formato de trabalho conflitante). Nunca considere idade, gênero, etnia, religião, estado civil, deficiência ou outras características protegidas. Nunca garanta contratação ou entrevista. Sugira mudanças de currículo apenas com base em fatos do perfil. ${TRUTH_RULES} Retorne exatamente um item por critério.`,
        prompt: `PERFIL DO CANDIDATO (JSON):\n${JSON.stringify(profile)}\n\nVAGA:\nCargo: ${job.title}\nEmpresa: ${job.company ?? ""}\nLocal: ${job.location ?? ""} | Formato: ${job.work_mode ?? "não informado"} | Senioridade: ${job.seniority ?? ""}\nRequisitos: ${JSON.stringify(job.requirements)}\nDescrição:\n${String(job.description).slice(0, 15000)}`,
        schema: matchSchema,
      });
      const seen = new Set<string>();
      const criteria = criterionKeys.map((k) => {
        const c = out.criteria.find((x) => x.key === k && !seen.has(k));
        seen.add(k);
        return { key: k, score: Math.max(0, Math.min(100, Math.round(c?.score ?? 40))), note: c?.note ?? "Informação insuficiente." };
      });
      const breakdown = { ...out, criteria };
      const score = weightedScore(criteria);
      const { error: upErr } = await context.supabase
        .from("job_matches")
        .upsert({ user_id: context.userId, job_id: job.id, score, breakdown }, { onConflict: "job_id" });
      if (upErr) throw new Error("Falha ao salvar o resultado do match.");
      await logActivity(context, "match", `Compatibilidade calculada: ${job.title} (${score})`);
      return { score, breakdown };
    }),
  );

/* ---------------- Resume tailoring ---------------- */
const tailorSchema = z.object({
  title: z.string(),
  summary: z.string(),
  skillsOrder: z.array(z.string()),
  experienceEdits: z.array(
    z.object({
      experienceId: z.string(),
      field: z.enum(["responsibilities", "achievements"]),
      suggested: z.string(),
      reason: z.string(),
      requirement: z.string(),
    }),
  ),
  summaryReason: z.string(),
  titleReason: z.string(),
  missingInfoQuestions: z.array(z.string()),
});

export const tailorResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobId: string }) => z.object({ jobId: z.string().uuid() }).parse(d))
  .handler(({ data, context }) =>
    wrap(async () => {
      const { data: job } = await context.supabase.from("jobs").select("*").eq("id", data.jobId).single();
      if (!job) throw new Error("Vaga não encontrada.");
      const profile = await loadProfile(context);
      if (profile.experiences.length === 0 && !profile.summary)
        throw new Error("Seu perfil precisa de ao menos um resumo ou uma experiência para gerar o currículo.");
      await guardUsage(context, "tailor_resume");
      const out = await runStructured({
        effort: "medium",
        instructions: `Você personaliza currículos ATS-friendly para uma vaga específica. Reescreva para clareza, relevância e impacto, priorizando o que é pertinente à vaga. Incorpore palavras-chave da vaga SOMENTE quando sustentadas pela experiência real. skillsOrder deve conter apenas competências que já existem no perfil, reordenadas por relevância. experienceEdits: use o experienceId exato do perfil; reescreva responsabilidades/conquistas como tópicos separados por quebra de linha, iniciados por verbo de ação, sem inventar métricas. Se uma métrica ajudaria mas não existe, adicione uma pergunta em missingInfoQuestions. ${TRUTH_RULES}`,
        prompt: `PERFIL MESTRE (JSON):\n${JSON.stringify(profile)}\n\nVAGA ALVO: ${job.title} — ${job.company ?? ""}\nRequisitos: ${JSON.stringify(job.requirements)}\nDescrição:\n${String(job.description).slice(0, 15000)}`,
        schema: tailorSchema,
      });

      const reqLabel = (r: string) => r || "Relevância para a vaga";
      const changes: unknown[] = [];
      if (out.title && out.title !== profile.title)
        changes.push({ id: crypto.randomUUID(), section: "title", original: profile.title, suggested: out.title, reason: out.titleReason, requirement: job.title, status: "pending" });
      if (out.summary && out.summary !== profile.summary)
        changes.push({ id: crypto.randomUUID(), section: "summary", original: profile.summary, suggested: out.summary, reason: out.summaryReason, requirement: "Resumo alinhado ao cargo", status: "pending" });
      const known = new Set(profile.skills.map((s) => s.toLowerCase()));
      const ordered = out.skillsOrder.filter((s) => known.has(s.toLowerCase()));
      const rest = profile.skills.filter((s) => !ordered.some((o) => o.toLowerCase() === s.toLowerCase()));
      const newSkills = [...ordered, ...rest];
      if (newSkills.join("|") !== profile.skills.join("|"))
        changes.push({ id: crypto.randomUUID(), section: "skills", original: profile.skills.join(", "), suggested: newSkills.join(", "), reason: "Competências reordenadas por relevância para a vaga (nenhuma adicionada).", requirement: "Palavras-chave da vaga", status: "pending" });
      for (const e of out.experienceEdits) {
        const exp = profile.experiences.find((x) => x.id === e.experienceId);
        if (!exp) continue;
        const original = exp[e.field];
        if (!e.suggested || e.suggested === original) continue;
        changes.push({ id: crypto.randomUUID(), section: `experience:${exp.id}:${e.field}`, original, suggested: e.suggested, reason: `${exp.role} @ ${exp.company}: ${e.reason}`, requirement: reqLabel(e.requirement), status: "pending" });
      }

      const { data: resume, error } = await context.supabase
        .from("resumes")
        .insert({
          user_id: context.userId,
          job_id: job.id,
          title: `${job.title}${job.company ? ` — ${job.company}` : ""}`,
          content: profile,
          changes,
          versions: [{ at: new Date().toISOString(), label: "Base (perfil mestre)", content: profile }],
          ats: { questions: out.missingInfoQuestions },
        })
        .select("id")
        .single();
      if (error) throw new Error("Falha ao salvar o currículo personalizado.");
      await logActivity(context, "resume", `Currículo personalizado criado: ${job.title}`);
      return { id: resume.id as string };
    }),
  );

/* ---------------- ATS check ---------------- */
const atsSchema = z.object({
  keywordCoverage: z.number(),
  coveredKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  unsupportedClaims: z.array(z.string()),
  ambiguities: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const atsCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { resumeId: string }) => z.object({ resumeId: z.string().uuid() }).parse(d))
  .handler(({ data, context }) =>
    wrap(async () => {
      const { data: resume } = await context.supabase.from("resumes").select("*, jobs(*)").eq("id", data.resumeId).single();
      if (!resume) throw new Error("Currículo não encontrado.");
      const content = normalizeProfile(resume.content);
      const master = await loadProfile(context);
      await guardUsage(context, "ats_check");
      const ai = await runStructured({
        instructions: `Você revisa currículos quanto à compatibilidade com ATS e fidelidade ao perfil mestre. keywordCoverage de 0 a 100 = cobertura das palavras-chave/requisitos da vaga sustentadas pelo currículo. unsupportedClaims = afirmações no currículo que NÃO aparecem no perfil mestre. Não trate a nota como probabilidade de contratação. ${TRUTH_RULES}`,
        prompt: `CURRÍCULO:\n${JSON.stringify(content)}\n\nPERFIL MESTRE:\n${JSON.stringify(master)}\n\nVAGA:\n${resume.jobs ? `${resume.jobs.title}\n${JSON.stringify(resume.jobs.requirements)}` : "Sem vaga vinculada"}`,
        schema: atsSchema,
      });
      const dateRe = /^(\d{2}\/\d{4}|\d{4}|Atual)$/i;
      const checks = [
        { label: "Títulos de seção padronizados", ok: true, note: "Exportação usa títulos convencionais em coluna única." },
        { label: "Datas consistentes", ok: content.experiences.every((e) => (!e.start || dateRe.test(e.start)) && (!e.end || dateRe.test(e.end))), note: "Use MM/AAAA ou 'Atual'." },
        { label: "Resumo profissional presente", ok: content.summary.length > 60, note: "Um resumo de 2–4 linhas ajuda a leitura." },
        { label: "Dados de contato", ok: !!content.email || !!content.phone, note: "Inclua ao menos e-mail ou telefone." },
        { label: "Experiências com descrição", ok: content.experiences.every((e) => e.responsibilities.length > 20), note: "Cada experiência deve ter tópicos descritivos." },
        { label: "Sem afirmações não comprovadas", ok: ai.unsupportedClaims.length === 0, note: "Revise itens não encontrados no perfil mestre." },
      ];
      const structural = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
      const ats = { ...ai, keywordCoverage: Math.max(0, Math.min(100, Math.round(ai.keywordCoverage))), checks, structural, checkedAt: new Date().toISOString(), questions: resume.ats?.questions ?? [] };
      await context.supabase.from("resumes").update({ ats }).eq("id", resume.id);
      return ats;
    }),
  );
