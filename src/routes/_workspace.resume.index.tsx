import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, ListSkeleton, PageHeader, errMsg } from "@/components/common";
import { useResumes } from "@/lib/data";

export const Route = createFileRoute("/_workspace/resume/")({
  head: () => ({ meta: [{ title: "Resume Studio — Impulso" }, { name: "description", content: "Versões de currículo personalizadas por vaga." }, { property: "og:title", content: "Resume Studio — Impulso" }, { property: "og:description", content: "Seus currículos personalizados." }] }),
  component: ResumeList,
});

function ResumeList() {
  const q = useResumes();
  return (
    <>
      <PageHeader title="Resume Studio" description="Cada versão é independente e vinculada a uma vaga. Seu perfil mestre não é alterado." actions={<Button asChild variant="outline"><Link to="/profile">Editar perfil mestre</Link></Button>} />
      {q.isLoading ? <ListSkeleton /> : q.isError ? <ErrorState message={errMsg(q.error)} /> : !q.data?.length ? (
        <EmptyState icon={FileText} title="Nenhum currículo personalizado" description="Abra uma vaga e clique em Personalizar meu currículo." action={<Button asChild variant="accent"><Link to="/jobs">Escolher vaga</Link></Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {q.data.map((r) => {
            const ats = r.ats as { structural?: number; keywordCoverage?: number } | null;
            return (
              <Link key={r.id} to="/resume/$id" params={{ id: r.id }} className="rounded-xl border bg-card p-5 transition hover:border-accent">
                <FileText className="mb-2 size-5 text-accent" />
                <p className="font-semibold">{r.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">Atualizado em {new Date(r.updated_at).toLocaleString("pt-BR")}</p>
                {ats?.structural != null && <p className="mt-2 text-xs">Estrutura ATS {ats.structural}/100 · Palavras-chave {ats.keywordCoverage}/100</p>}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
