import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Download, FileText, History, Loader2, RotateCcw, ShieldCheck, Undo2, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState, ListSkeleton, PageHeader, SectionCard, errMsg } from "@/components/common";
import { ProfileEditor } from "@/components/profile-editor";
import { supabase } from "@/integrations/supabase/client";
import { atsCheck } from "@/lib/ai.functions";
import { exportDocx, exportPdf } from "@/lib/export";
import { useSession } from "@/lib/session";
import { normalizeProfile, type ProfileData, type ResumeChange } from "@/lib/types";

export const Route = createFileRoute("/_workspace/resume/$id")({
  head: () => ({ meta: [{ title: "Editor de currículo — Impulso" }, { name: "description", content: "Revise sugestões, edite e exporte seu currículo." }, { property: "og:title", content: "Editor de currículo — Impulso" }, { property: "og:description", content: "Editor de currículo ATS-friendly." }] }),
  component: ResumeEditor,
});

type Version = { at: string; label: string; content: ProfileData };

function applyChange(c: ProfileData, ch: ResumeChange, value: string): ProfileData {
  if (ch.section === "title") return { ...c, title: value };
  if (ch.section === "summary") return { ...c, summary: value };
  if (ch.section === "skills") return { ...c, skills: value.split(",").map((s) => s.trim()).filter(Boolean) };
  const [, id, field] = ch.section.split(":");
  return { ...c, experiences: c.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)) };
}

function sectionLabel(s: string) {
  if (s === "title") return "Título profissional";
  if (s === "summary") return "Resumo profissional";
  if (s === "skills") return "Competências";
  return s.endsWith("achievements") ? "Experiência · conquistas" : "Experiência · responsabilidades";
}

function ResumeEditor() {
  const { id } = Route.useParams();
  const { userId } = useSession();
  const qc = useQueryClient();
  const check = useServerFn(atsCheck);
  const q = useQuery({
    queryKey: ["resume", id, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*, jobs(id, title, company)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [content, setContent] = useState<ProfileData | null>(null);
  const [changes, setChanges] = useState<ResumeChange[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [undo, setUndo] = useState<ProfileData[]>([]);
  const [status, setStatus] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [checking, setChecking] = useState(false);
  const [ats, setAts] = useState<any>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (q.data && !loaded.current) {
      loaded.current = true;
      setContent(normalizeProfile(q.data.content));
      setChanges((q.data.changes as ResumeChange[]) ?? []);
      setVersions((q.data.versions as Version[]) ?? []);
      setAts(q.data.ats);
    }
  }, [q.data]);

  // Autosave
  useEffect(() => {
    if (status !== "dirty" || !content) return;
    const t = setTimeout(async () => {
      setStatus("saving");
      const { error } = await supabase.from("resumes").update({ content: content as never, changes: changes as never }).eq("id", id);
      setStatus(error ? "error" : "saved");
      if (!error) qc.invalidateQueries({ queryKey: ["resumes"] });
    }, 900);
    return () => clearTimeout(t);
  }, [status, content, changes, id, qc]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (status === "dirty" || status === "saving") e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [status]);

  if (q.isLoading || (q.data && !content)) return <ListSkeleton rows={4} />;
  if (q.isError) return <ErrorState message={errMsg(q.error)} onRetry={() => q.refetch()} />;
  if (!q.data || !content) return <EmptyState icon={FileText} title="Currículo não encontrado" description="Ele pode ter sido excluído." action={<Button asChild><Link to="/resume">Voltar</Link></Button>} />;

  const edit = (next: ProfileData) => {
    setUndo((u) => [...u.slice(-29), content]);
    setContent(next);
    setStatus("dirty");
  };
  const decide = (ch: ResumeChange, accept: boolean) => {
    if (accept) edit(applyChange(content, ch, ch.suggested));
    else if (ch.status === "accepted") edit(applyChange(content, ch, ch.original));
    setChanges((cs) => cs.map((c) => (c.id === ch.id ? { ...c, status: accept ? "accepted" : "rejected" } : c)));
    setStatus("dirty");
  };
  const saveVersion = async () => {
    const v = [...versions, { at: new Date().toISOString(), label: `Versão ${versions.length + 1}`, content }];
    const { error } = await supabase.from("resumes").update({ versions: v as never, content: content as never }).eq("id", id);
    if (error) return toast.error(errMsg(error));
    setVersions(v);
    toast.success("Versão aprovada e salva no histórico.");
  };
  const doExport = async (kind: "pdf" | "docx") => {
    try { await (kind === "pdf" ? exportPdf(content) : exportDocx(content)); toast.success(`${kind.toUpperCase()} gerado.`); } catch (e) { toast.error(`Falha ao gerar o arquivo: ${errMsg(e)}`); }
  };
  const pending = changes.filter((c) => c.status === "pending").length;
  const statusText = { saved: "Salvo", dirty: "Alterações não salvas", saving: "Salvando…", error: "Erro ao salvar" }[status];

  return (
    <>
      <PageHeader
        title={q.data.title}
        description={`${statusText}${q.data.jobs ? ` · Vaga alvo: ${q.data.jobs.title}` : ""}`}
        actions={
          <>
            <Button variant="ghost" disabled={!undo.length} onClick={() => { const prev = undo[undo.length - 1]; setUndo(undo.slice(0, -1)); setContent(prev); setStatus("dirty"); }}><Undo2 /> Desfazer</Button>
            <Button variant="outline" onClick={saveVersion}><Check /> Aprovar versão</Button>
            <Button variant="outline" onClick={() => doExport("docx")}><Download /> DOCX</Button>
            <Button variant="accent" onClick={() => doExport("pdf")}><Download /> PDF</Button>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Tabs defaultValue="changes">
          <TabsList>
            <TabsTrigger value="changes">Sugestões {pending > 0 && <Badge className="ml-1.5 bg-accent text-accent-foreground">{pending}</Badge>}</TabsTrigger>
            <TabsTrigger value="edit">Editar</TabsTrigger>
            <TabsTrigger value="ats">Qualidade ATS</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="changes" className="space-y-3">
            {(ats?.questions ?? []).length > 0 && (
              <SectionCard title="Informações que podem fortalecer o currículo">
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">{ats.questions.map((x: string) => <li key={x}>{x}</li>)}</ul>
                <p className="mt-2 text-xs text-muted-foreground">Se tiver esses dados, adicione-os na aba Editar — a IA não os inventa.</p>
              </SectionCard>
            )}
            {changes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma sugestão.</p>}
            {changes.map((ch) => (
              <div key={ch.id} className="rounded-xl border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{sectionLabel(ch.section)}</span>
                  {ch.status !== "pending" && <Badge variant={ch.status === "accepted" ? "default" : "secondary"}>{ch.status === "accepted" ? "Aceita" : "Rejeitada"}</Badge>}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-secondary/60 p-3"><p className="mb-1 text-xs font-medium text-muted-foreground">Original</p><p className="whitespace-pre-wrap text-sm">{ch.original || "—"}</p></div>
                  <div className="rounded-lg border border-accent/40 p-3"><p className="mb-1 text-xs font-medium text-accent">Sugerido</p><p className="whitespace-pre-wrap text-sm">{ch.suggested}</p></div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground"><span className="font-medium">Por quê:</span> {ch.reason} · <span className="font-medium">Requisito:</span> {ch.requirement}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" disabled={ch.status === "accepted"} onClick={() => decide(ch, true)}><Check /> Aceitar</Button>
                  <Button size="sm" variant="outline" disabled={ch.status === "rejected"} onClick={() => decide(ch, false)}><X /> Rejeitar</Button>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="edit"><SectionCard><ProfileEditor value={content} onChange={edit} /></SectionCard></TabsContent>
          <TabsContent value="ats" className="space-y-4">
            <Button variant="accent" disabled={checking} onClick={async () => {
              setChecking(true);
              try { if (status !== "saved") await supabase.from("resumes").update({ content: content as never }).eq("id", id); setAts(await check({ data: { resumeId: id } })); } catch (e) { toast.error(errMsg(e)); } finally { setChecking(false); }
            }}>{checking ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Analisar qualidade</Button>
            {ats?.checks && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <SectionCard><p className="text-xs text-muted-foreground">Estrutura</p><p className="text-3xl font-bold">{ats.structural}</p></SectionCard>
                  <SectionCard><p className="text-xs text-muted-foreground">Cobertura de palavras-chave</p><p className="text-3xl font-bold">{ats.keywordCoverage}</p></SectionCard>
                </div>
                <SectionCard title="Verificações">
                  <ul className="space-y-2">{ats.checks.map((c: any) => <li key={c.label} className="flex gap-2 text-sm">{c.ok ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}<span><span className="font-medium">{c.label}</span>{!c.ok && <span className="text-muted-foreground"> — {c.note}</span>}</span></li>)}</ul>
                </SectionCard>
                {[["Palavras-chave cobertas", ats.coveredKeywords], ["Palavras-chave ausentes", ats.missingKeywords], ["Afirmações não encontradas no perfil mestre", ats.unsupportedClaims], ["Ambiguidades", ats.ambiguities], ["Sugestões", ats.suggestions]].map(([t, items]) => (items as string[])?.length ? (
                  <SectionCard key={t as string} title={t as string}><ul className="list-disc space-y-1 pl-4 text-sm">{(items as string[]).map((x) => <li key={x}>{x}</li>)}</ul></SectionCard>
                ) : null)}
                <p className="text-xs text-muted-foreground">A interpretação varia conforme o software ATS e o empregador. Estas notas não representam probabilidade de contratação.</p>
              </>
            )}
          </TabsContent>
          <TabsContent value="history" className="space-y-2">
            {versions.slice().reverse().map((v) => (
              <div key={v.at} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
                <span className="flex items-center gap-2"><History className="size-4 text-muted-foreground" />{v.label} · {new Date(v.at).toLocaleString("pt-BR")}</span>
                <Button size="sm" variant="ghost" onClick={() => { edit(normalizeProfile(v.content)); toast.success("Versão restaurada."); }}><RotateCcw /> Restaurar</Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        <div className="xl:sticky xl:top-20 xl:self-start">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Prévia (coluna única, ATS-friendly)</p>
          <ResumePreview c={content} />
        </div>
      </div>
    </>
  );
}

function ResumePreview({ c }: { c: ProfileData }) {
  const H = ({ children }: { children: string }) => <h3 className="mt-4 border-b pb-1 text-xs font-bold uppercase tracking-wider">{children}</h3>;
  const bullets = (s: string) => s.split(/\n+/).map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  return (
    <div className="max-h-[80vh] overflow-y-auto rounded-xl border bg-card p-8 text-[13px] leading-relaxed shadow-card">
      <h2 className="text-xl font-bold">{c.fullName || "Seu nome"}</h2>
      {c.title && <p>{c.title}</p>}
      <p className="text-xs text-muted-foreground">{[c.email, c.phone, c.location, ...c.links].filter(Boolean).join(" | ")}</p>
      {c.summary && <><H>Resumo profissional</H><p className="mt-1">{c.summary}</p></>}
      {c.experiences.length > 0 && <><H>Experiência profissional</H>{c.experiences.map((e) => (
        <div key={e.id} className="mt-2">
          <p className="font-semibold">{e.role} — {e.company}</p>
          <p className="text-xs text-muted-foreground">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
          <ul className="list-disc pl-4">{[...bullets(e.responsibilities), ...bullets(e.achievements)].map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
      ))}</>}
      {c.education.length > 0 && <><H>Formação acadêmica</H>{c.education.map((e) => <p key={e.id} className="mt-1">{e.degree} — {e.institution}</p>)}</>}
      {c.skills.length > 0 && <><H>Competências</H><p className="mt-1">{c.skills.join(", ")}</p></>}
      {c.certifications.length > 0 && <><H>Certificações</H>{c.certifications.map((x) => <p key={x.id}>{[x.name, x.issuer, x.year].filter(Boolean).join(" — ")}</p>)}</>}
      {c.languages.length > 0 && <><H>Idiomas</H><p>{c.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", ")}</p></>}
      {c.projects.length > 0 && <><H>Projetos</H>{c.projects.map((p) => <p key={p.id}><span className="font-semibold">{p.name}</span> {p.description}</p>)}</>}
    </div>
  );
}
