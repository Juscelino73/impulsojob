import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ExternalLink, FileText, ListPlus, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EmptyState, ErrorState, ListSkeleton, PageHeader, SectionCard, errMsg } from "@/components/common";
import { MatchView } from "@/components/match-view";
import { supabase } from "@/integrations/supabase/client";
import { computeMatch, tailorResume } from "@/lib/ai.functions";
import { logActivity, matchOf } from "@/lib/data";
import { useSession } from "@/lib/session";
import { MODE_LABEL, SOURCE_LABEL } from "./_workspace.jobs.index";

export const Route = createFileRoute("/_workspace/jobs/$id")({
  head: () => ({ meta: [{ title: "Detalhes da vaga — Impulso" }, { name: "description", content: "Requisitos, compatibilidade e currículo personalizado." }, { property: "og:title", content: "Detalhes da vaga — Impulso" }, { property: "og:description", content: "Análise da vaga." }] }),
  component: JobDetail,
});

function JobDetail() {
  const { id } = Route.useParams();
  const { userId } = useSession();
  const qc = useQueryClient();
  const nav = useNavigate();
  const match = useServerFn(computeMatch);
  const tailor = useServerFn(tailorResume);
  const [busy, setBusy] = useState<"match" | "tailor" | "app" | null>(null);
  const q = useQuery({
    queryKey: ["job", id, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*, job_matches(score, breakdown)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (q.isLoading) return <ListSkeleton />;
  if (q.isError) return <ErrorState message={errMsg(q.error)} onRetry={() => q.refetch()} />;
  const j = q.data;
  if (!j) return <EmptyState icon={FileText} title="Vaga não encontrada" description="Ela pode ter sido excluída." action={<Button asChild><Link to="/jobs">Ver vagas</Link></Button>} />;
  const m = matchOf(j);
  const req = j.requirements as { required?: string[]; desired?: string[]; responsibilities?: string[]; keywords?: string[] };

  const act = async (k: "match" | "tailor" | "app", fn: () => Promise<void>) => {
    setBusy(k);
    try { await fn(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(null); }
  };

  return (
    <>
      <PageHeader
        title={j.title}
        description={[j.company, j.location, j.work_mode && MODE_LABEL[j.work_mode], j.seniority, j.contract_type, j.salary].filter(Boolean).join(" · ")}
        actions={
          <>
            <Button variant="accent" disabled={!!busy} onClick={() => act("match", async () => {
              await match({ data: { jobId: id } });
              qc.invalidateQueries({ queryKey: ["job", id] }); qc.invalidateQueries({ queryKey: ["jobs"] });
              toast.success("Compatibilidade calculada.");
            })}>
              {busy === "match" ? <Loader2 className="animate-spin" /> : <Sparkles />} {m ? "Recalcular match" : "Calcular compatibilidade"}
            </Button>
            <Button disabled={!!busy} onClick={() => act("tailor", async () => {
              const r = await tailor({ data: { jobId: id } });
              qc.invalidateQueries({ queryKey: ["resumes"] });
              toast.success("Currículo personalizado gerado. Revise as sugestões.");
              nav({ to: "/resume/$id", params: { id: r.id } });
            })}>
              {busy === "tailor" ? <Loader2 className="animate-spin" /> : <FileText />} Personalizar meu currículo
            </Button>
            <Button variant="outline" disabled={!!busy} onClick={() => act("app", async () => {
              const { error } = await supabase.from("applications").insert({ user_id: userId!, job_id: j.id, company: j.company || "—", role: j.title, url: j.url, status: "salva", history: [{ at: new Date().toISOString(), status: "salva" }] });
              if (error) throw error;
              await logActivity(userId, "application", `Candidatura criada: ${j.title}`);
              qc.invalidateQueries({ queryKey: ["applications"] });
              toast.success("Adicionada às candidaturas.", { action: { label: "Abrir", onClick: () => nav({ to: "/applications" }) } });
            })}>
              <ListPlus /> Acompanhar
            </Button>
          </>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{SOURCE_LABEL[j.source]}</Badge>
        <span>Atualizada em {new Date(j.updated_at).toLocaleString("pt-BR")}</span>
        <span>· Status de abertura não confirmado pela fonte</span>
        {j.url && <a href={j.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent">Ver original <ExternalLink className="size-3" /></a>}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          {busy === "match" ? <ListSkeleton rows={4} /> : m ? <MatchView score={m.score} b={m.breakdown} /> : (
            <EmptyState icon={Sparkles} title="Compatibilidade ainda não calculada" description="Compare esta vaga com seu perfil profissional para ver a pontuação explicada." />
          )}
        </div>
        <div className="space-y-6">
          <SectionCard title="Requisitos obrigatórios">
            <div className="flex flex-wrap gap-1.5">{(req.required ?? []).length ? req.required!.map((r) => <Badge key={r}>{r}</Badge>) : <p className="text-sm text-muted-foreground">Não identificados.</p>}</div>
          </SectionCard>
          <SectionCard title="Desejáveis">
            <div className="flex flex-wrap gap-1.5">{(req.desired ?? []).length ? req.desired!.map((r) => <Badge key={r} variant="secondary">{r}</Badge>) : <p className="text-sm text-muted-foreground">Não identificados.</p>}</div>
          </SectionCard>
          {(req.responsibilities ?? []).length > 0 && (
            <SectionCard title="Responsabilidades">
              <ul className="list-disc space-y-1 pl-4 text-sm">{req.responsibilities!.map((r) => <li key={r}>{r}</li>)}</ul>
            </SectionCard>
          )}
          {j.description && (
            <SectionCard title="Descrição original">
              <p className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">{j.description}</p>
            </SectionCard>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" className="text-destructive"><Trash2 /> Excluir vaga</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Excluir esta vaga?</AlertDialogTitle><AlertDialogDescription>O resultado do match também será removido.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={async () => { await supabase.from("jobs").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Vaga excluída."); nav({ to: "/jobs" }); }}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
