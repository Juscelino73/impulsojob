import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, ListSkeleton, PageHeader, ScoreRing, errMsg } from "@/components/common";
import { matchOf, useJobs } from "@/lib/data";

export const Route = createFileRoute("/_workspace/matches")({
  head: () => ({ meta: [{ title: "Meus matches — Impulso" }, { name: "description", content: "Vagas ordenadas por compatibilidade com seu perfil." }, { property: "og:title", content: "Meus matches — Impulso" }, { property: "og:description", content: "Compatibilidade explicada." }] }),
  component: Matches,
});

function Matches() {
  const q = useJobs();
  const list = (q.data ?? []).map((j) => ({ j, m: matchOf(j) })).filter((x) => x.m && x.j.status !== "descartada").sort((a, b) => b.m!.score - a.m!.score);
  return (
    <>
      <PageHeader title="Meus matches" description="Vagas com compatibilidade calculada, da maior para a menor." />
      {q.isLoading ? <ListSkeleton /> : q.isError ? <ErrorState message={errMsg(q.error)} /> : list.length === 0 ? (
        <EmptyState icon={Sparkles} title="Nenhum match calculado" description="Abra uma vaga e clique em Calcular compatibilidade." action={<Button asChild variant="accent"><Link to="/jobs">Ir para vagas</Link></Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map(({ j, m }) => (
            <div key={j.id} className="rounded-xl border bg-card p-5">
              <div className="flex gap-4">
                <ScoreRing score={m!.score} />
                <div className="min-w-0">
                  <p className="font-semibold">{j.title}</p>
                  <p className="text-sm text-muted-foreground">{[j.company, j.location].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">{(m!.breakdown?.confirmed ?? []).slice(0, 3).map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{m!.breakdown?.summary}</p>
              <Button asChild size="sm" className="mt-4"><Link to="/jobs/$id" params={{ id: j.id }}>Ver análise</Link></Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
