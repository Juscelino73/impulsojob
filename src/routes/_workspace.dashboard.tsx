import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Calendar, FileText, FileUp, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState, ListSkeleton, PageHeader, ScoreRing, SectionCard } from "@/components/common";
import { matchOf, useActivity, useApplications, useJobs, useProfile, useResumes } from "@/lib/data";
import { APP_STATUSES, profileCompletion } from "@/lib/types";

export const Route = createFileRoute("/_workspace/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Impulso" }, { name: "description", content: "Visão geral das suas vagas, matches e candidaturas." }, { property: "og:title", content: "Dashboard — Impulso" }, { property: "og:description", content: "Sua visão geral de carreira." }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useProfile();
  const jobs = useJobs();
  const resumes = useResumes();
  const apps = useApplications();
  const activity = useActivity();
  if (profile.isLoading || jobs.isLoading) return <ListSkeleton rows={4} />;

  const pct = profile.data ? profileCompletion(profile.data) : 0;
  const all = jobs.data ?? [];
  const recommended = all.filter((j) => matchOf(j) && j.status !== "descartada").sort((a, b) => matchOf(b)!.score - matchOf(a)!.score).slice(0, 3);
  const saved = all.filter((j) => j.status === "salva");
  const today = new Date().toISOString().slice(0, 10);
  const followUps = (apps.data ?? []).filter((a) => a.follow_up_at && a.follow_up_at >= today).sort((a, b) => a.follow_up_at!.localeCompare(b.follow_up_at!)).slice(0, 5);
  const isNew = pct === 0 && all.length === 0;

  return (
    <>
      <PageHeader title="Bem-vindo(a) ao Impulso" description="Seu painel de carreira, atualizado com seus próprios dados."
        actions={<><Button asChild variant="outline"><Link to="/profile"><FileUp /> Importar currículo</Link></Button><Button asChild variant="accent"><Link to="/jobs"><Search /> Adicionar vaga</Link></Button></>} />
      {isNew && (
        <div className="mb-6">
          <EmptyState icon={Sparkles} title="Comece em dois passos" description="Importe seu currículo e cole a descrição de uma vaga para ver sua compatibilidade explicada."
            action={<><Button asChild variant="accent"><Link to="/onboarding">Início rápido</Link></Button><Button asChild variant="outline"><Link to="/profile">Preencher perfil</Link></Button></>} />
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SectionCard><p className="text-xs text-muted-foreground">Perfil preenchido</p><p className="mt-1 text-3xl font-bold">{pct}%</p><Progress value={pct} className="mt-2 h-1.5" /></SectionCard>
        <SectionCard><p className="text-xs text-muted-foreground">Vagas analisadas</p><p className="mt-1 text-3xl font-bold">{all.length}</p><p className="text-xs text-muted-foreground">{saved.length} salvas</p></SectionCard>
        <SectionCard><p className="text-xs text-muted-foreground">Currículos criados</p><p className="mt-1 text-3xl font-bold">{resumes.data?.length ?? 0}</p></SectionCard>
        <SectionCard><p className="text-xs text-muted-foreground">Candidaturas</p><p className="mt-1 text-3xl font-bold">{apps.data?.length ?? 0}</p></SectionCard>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <SectionCard title="Vagas recomendadas" actions={<Button asChild size="sm" variant="ghost"><Link to="/matches">Ver todas</Link></Button>}>
            {recommended.length === 0 ? <p className="text-sm text-muted-foreground">Calcule a compatibilidade de uma vaga para vê-la aqui.</p> : (
              <div className="space-y-3">
                {recommended.map((j) => {
                  const m = matchOf(j)!;
                  return (
                    <div key={j.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
                      <ScoreRing score={m.score} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{j.title}</p>
                        <p className="text-xs text-muted-foreground">{[j.company, j.location].filter(Boolean).join(" · ")}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">{(m.breakdown?.confirmed ?? []).slice(0, 3).map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{m.breakdown?.summary}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline"><Link to="/jobs/$id" params={{ id: j.id }}>Analisar</Link></Button>
                        <Button asChild size="sm"><Link to="/jobs/$id" params={{ id: j.id }}><FileText /> Currículo</Link></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
          <SectionCard title="Vistas recentemente">
            {all.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma vaga ainda.</p> : (
              <ul className="divide-y">{all.slice(0, 5).map((j) => <li key={j.id} className="flex justify-between py-2 text-sm"><Link to="/jobs/$id" params={{ id: j.id }} className="hover:text-accent">{j.title}</Link><span className="text-muted-foreground">{j.company}</span></li>)}</ul>
            )}
          </SectionCard>
        </div>
        <div className="space-y-6">
          <SectionCard title="Candidaturas por status">
            <ul className="space-y-1.5 text-sm">{APP_STATUSES.map((s) => <li key={s.key} className="flex justify-between"><span>{s.label}</span><span className="tabular-nums text-muted-foreground">{(apps.data ?? []).filter((a) => a.status === s.key).length}</span></li>)}</ul>
          </SectionCard>
          <SectionCard title="Próximos acompanhamentos">
            {followUps.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma data agendada.</p> : (
              <ul className="space-y-2 text-sm">{followUps.map((a) => <li key={a.id} className="flex items-center gap-2"><Calendar className="size-4 text-accent" />{new Date(a.follow_up_at + "T00:00").toLocaleDateString("pt-BR")} — {a.role}</li>)}</ul>
            )}
          </SectionCard>
          <SectionCard title="Atividade recente">
            {!activity.data?.length ? <p className="text-sm text-muted-foreground">Sem atividade ainda.</p> : (
              <ul className="space-y-2 text-sm">{activity.data.map((a) => <li key={a.id} className="flex gap-2"><Activity className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /><span>{a.label}<span className="block text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("pt-BR")}</span></span></li>)}</ul>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
