import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, Briefcase, EyeOff, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, ListSkeleton, PageHeader, ScoreRing, SectionCard, errMsg } from "@/components/common";
import { JobAdd } from "@/components/job-add";
import { matchOf, useJobs, type JobRow } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_workspace/jobs/")({
  head: () => ({ meta: [{ title: "Encontrar vagas — Impulso" }, { name: "description", content: "Adicione, filtre e analise vagas." }, { property: "og:title", content: "Encontrar vagas — Impulso" }, { property: "og:description", content: "Adicione e analise vagas." }] }),
  component: JobsPage,
});

export const SOURCE_LABEL: Record<string, string> = { manual: "Manual", url: "Importada por URL", colado: "Descrição colada" };
export const MODE_LABEL: Record<string, string> = { remoto: "Remoto", hibrido: "Híbrido", presencial: "Presencial" };

function JobsPage() {
  const q = useJobs();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all");
  const [status, setStatus] = useState("visiveis");
  const [source, setSource] = useState("all");

  const list = useMemo(() => {
    const s = search.toLowerCase();
    return (q.data ?? []).filter((j) => {
      if (status === "visiveis" && j.status === "descartada") return false;
      if (status !== "visiveis" && status !== "all" && j.status !== status) return false;
      if (mode !== "all" && j.work_mode !== mode) return false;
      if (source !== "all" && j.source !== source) return false;
      if (!s) return true;
      const req = j.requirements as { required?: string[]; desired?: string[] };
      return [j.title, j.company, j.location, j.seniority, j.contract_type, ...(req.required ?? []), ...(req.desired ?? [])]
        .filter(Boolean).join(" ").toLowerCase().includes(s);
    });
  }, [q.data, search, mode, status, source]);

  async function setJobStatus(j: JobRow, st: string) {
    const { error } = await supabase.from("jobs").update({ status: st }).eq("id", j.id);
    if (error) return toast.error(errMsg(error));
    qc.invalidateQueries({ queryKey: ["jobs"] });
    toast.success(st === "salva" ? "Vaga salva." : st === "descartada" ? "Vaga descartada." : "Vaga restaurada.");
  }

  return (
    <>
      <PageHeader title="Encontrar vagas" description="Cole uma descrição, importe por URL ou cadastre manualmente." />
      <SectionCard title="Adicionar vaga" className="mb-6"><JobAdd /></SectionCard>
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <Input placeholder="Buscar cargo, empresa, competência…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={mode} onValueChange={setMode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os formatos</SelectItem><SelectItem value="remoto">Remoto</SelectItem><SelectItem value="hibrido">Híbrido</SelectItem><SelectItem value="presencial">Presencial</SelectItem></SelectContent></Select>
        <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="visiveis">Ativas e salvas</SelectItem><SelectItem value="salva">Somente salvas</SelectItem><SelectItem value="descartada">Descartadas</SelectItem><SelectItem value="all">Todas</SelectItem></SelectContent></Select>
        <Select value={source} onValueChange={setSource}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as origens</SelectItem><SelectItem value="colado">Descrição colada</SelectItem><SelectItem value="url">Por URL</SelectItem><SelectItem value="manual">Manual</SelectItem></SelectContent></Select>
      </div>
      {q.isLoading ? <ListSkeleton /> : q.isError ? <ErrorState message={errMsg(q.error)} onRetry={() => q.refetch()} /> : list.length === 0 ? (
        <EmptyState icon={Briefcase} title={q.data?.length ? "Nenhuma vaga com esses filtros" : "Nenhuma vaga ainda"} description="Cole a descrição de uma vaga acima para analisar os requisitos e calcular sua compatibilidade." />
      ) : (
        <div className="space-y-3">
          {list.map((j) => <JobCard key={j.id} job={j} onStatus={setJobStatus} />)}
        </div>
      )}
    </>
  );
}

function JobCard({ job: j, onStatus }: { job: JobRow; onStatus: (j: JobRow, s: string) => void }) {
  const m = matchOf(j);
  const req = j.requirements as { required?: string[] };
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
      {m ? <ScoreRing score={m.score} /> : <div className="flex size-14 items-center justify-center rounded-full border border-dashed text-[10px] text-muted-foreground">sem match</div>}
      <div className="min-w-0 flex-1">
        <Link to="/jobs/$id" params={{ id: j.id }} className="font-semibold hover:text-accent">{j.title}</Link>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          {j.company && <span>{j.company}</span>}
          {j.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{j.location}</span>}
          {j.work_mode && <span>· {MODE_LABEL[j.work_mode]}</span>}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline">{SOURCE_LABEL[j.source]}</Badge>
          {j.status === "salva" && <Badge>Salva</Badge>}
          {(req.required ?? []).slice(0, 3).map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Atualizada em {new Date(j.updated_at).toLocaleDateString("pt-BR")}</p>
      </div>
      <div className="flex gap-2">
        {j.status !== "salva" && <Button size="sm" variant="outline" onClick={() => onStatus(j, "salva")}><Bookmark /> Salvar</Button>}
        {j.status !== "descartada" ? <Button size="sm" variant="ghost" onClick={() => onStatus(j, "descartada")}><EyeOff /> Descartar</Button> : <Button size="sm" variant="ghost" onClick={() => onStatus(j, "ativa")}>Restaurar</Button>}
        <Button size="sm" asChild><Link to="/jobs/$id" params={{ id: j.id }}>Analisar</Link></Button>
      </div>
    </div>
  );
}
