import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, KanbanSquare, List, ListChecks, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton, PageHeader, errMsg } from "@/components/common";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, useApplications, useResumes } from "@/lib/data";
import { useSession } from "@/lib/session";
import { APP_STATUSES, type AppStatus } from "@/lib/types";

export const Route = createFileRoute("/_workspace/applications")({
  head: () => ({ meta: [{ title: "Minhas candidaturas — Impulso" }, { name: "description", content: "Pipeline de candidaturas com datas e notas." }, { property: "og:title", content: "Minhas candidaturas — Impulso" }, { property: "og:description", content: "Acompanhe suas candidaturas." }] }),
  component: Applications,
});

const label = (s: string) => APP_STATUSES.find((x) => x.key === s)?.label ?? s;
type App = NonNullable<ReturnType<typeof useApplications>["data"]>[number];

function Applications() {
  const q = useApplications();
  const { userId } = useSession();
  const qc = useQueryClient();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<App | "new" | null>(null);

  const list = useMemo(() => (q.data ?? []).filter((a) => (filter === "all" || a.status === filter) && `${a.company} ${a.role}`.toLowerCase().includes(search.toLowerCase())), [q.data, search, filter]);

  async function setStatus(a: App, status: AppStatus) {
    const history = [...((a.history as any[]) ?? []), { at: new Date().toISOString(), status }];
    const patch: Record<string, unknown> = { status, history };
    if (status === "candidatado" && !a.applied_at) patch.applied_at = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("applications").update(patch).eq("id", a.id);
    if (error) return toast.error(errMsg(error));
    await logActivity(userId, "application", `${a.role}: ${label(status)}`);
    qc.invalidateQueries({ queryKey: ["applications"] });
    qc.invalidateQueries({ queryKey: ["activity"] });
  }

  return (
    <>
      <PageHeader title="Minhas candidaturas" description="Acompanhe cada etapa. Datas de acompanhamento são lembretes visuais — nenhuma notificação é enviada."
        actions={<>
          <Button variant={view === "kanban" ? "default" : "outline"} size="icon" aria-label="Kanban" onClick={() => setView("kanban")}><KanbanSquare /></Button>
          <Button variant={view === "table" ? "default" : "outline"} size="icon" aria-label="Tabela" onClick={() => setView("table")}><List /></Button>
          <Button variant="accent" onClick={() => setEditing("new")}><Plus /> Nova candidatura</Button>
        </>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_220px]">
        <Input placeholder="Buscar empresa ou cargo" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={filter} onValueChange={setFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem>{APP_STATUSES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent></Select>
      </div>
      {q.isLoading ? <ListSkeleton /> : q.isError ? <ErrorState message={errMsg(q.error)} /> : !q.data?.length ? (
        <EmptyState icon={ListChecks} title="Nenhuma candidatura" description="Crie a partir de uma vaga analisada ou adicione manualmente." action={<><Button variant="accent" onClick={() => setEditing("new")}>Adicionar</Button><Button asChild variant="outline"><Link to="/jobs">Ver vagas</Link></Button></>} />
      ) : view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {APP_STATUSES.map((s) => {
            const items = list.filter((a) => a.status === s.key);
            return (
              <div key={s.key} className="w-64 shrink-0 rounded-xl bg-secondary/60 p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { const a = list.find((x) => x.id === e.dataTransfer.getData("id")); if (a && a.status !== s.key) setStatus(a, s.key); }}>
                <p className="mb-3 flex items-center justify-between text-sm font-semibold">{s.label}<span className="text-xs text-muted-foreground">{items.length}</span></p>
                <div className="space-y-2">
                  {items.map((a) => (
                    <button key={a.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", a.id)} onClick={() => setEditing(a)} className="w-full rounded-lg border bg-card p-3 text-left text-sm hover:border-accent">
                      <p className="font-medium">{a.role}</p>
                      <p className="text-xs text-muted-foreground">{a.company}</p>
                      {a.follow_up_at && <p className="mt-1 text-xs text-accent">Acompanhar: {new Date(a.follow_up_at + "T00:00").toLocaleDateString("pt-BR")}</p>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Cargo</TableHead><TableHead>Empresa</TableHead><TableHead>Status</TableHead><TableHead>Candidatura</TableHead><TableHead>Acompanhamento</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {list.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.role}</TableCell>
                  <TableCell>{a.company}</TableCell>
                  <TableCell>
                    <Select value={a.status} onValueChange={(v) => setStatus(a, v as AppStatus)}><SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger><SelectContent>{APP_STATUSES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent></Select>
                  </TableCell>
                  <TableCell>{a.applied_at ? new Date(a.applied_at + "T00:00").toLocaleDateString("pt-BR") : "—"}</TableCell>
                  <TableCell>{a.follow_up_at ? new Date(a.follow_up_at + "T00:00").toLocaleDateString("pt-BR") : "—"}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => setEditing(a)}>Detalhes</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <AppSheet app={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function AppSheet({ app, onClose }: { app: App | "new" | null; onClose: () => void }) {
  const { userId } = useSession();
  const qc = useQueryClient();
  const resumes = useResumes();
  const isNew = app === "new";
  const a = app && app !== "new" ? app : null;
  const [f, setF] = useState<Record<string, string>>({});
  const key = isNew ? "new" : a?.id;
  const [lastKey, setLastKey] = useState<string | undefined>();
  if (key !== lastKey) {
    setLastKey(key);
    setF({ company: a?.company ?? "", role: a?.role ?? "", url: a?.url ?? "", status: a?.status ?? "salva", applied_at: a?.applied_at ?? "", interview_at: a?.interview_at ?? "", follow_up_at: a?.follow_up_at ?? "", notes: a?.notes ?? "", resume_id: a?.resume_id ?? "none" });
  }
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    if (!f.company.trim() || !f.role.trim()) return toast.error("Informe empresa e cargo.");
    const row = { company: f.company, role: f.role, url: f.url || null, status: f.status as AppStatus, applied_at: f.applied_at || null, interview_at: f.interview_at || null, follow_up_at: f.follow_up_at || null, notes: f.notes || null, resume_id: f.resume_id === "none" ? null : f.resume_id };
    const hist = [...((a?.history as any[]) ?? [])];
    if (!a || a.status !== f.status) hist.push({ at: new Date().toISOString(), status: f.status });
    const { error } = a
      ? await supabase.from("applications").update({ ...row, history: hist }).eq("id", a.id)
      : await supabase.from("applications").insert({ ...row, user_id: userId!, history: hist });
    if (error) return toast.error(errMsg(error));
    if (!a) await logActivity(userId, "application", `Candidatura criada: ${f.role}`);
    qc.invalidateQueries({ queryKey: ["applications"] });
    toast.success("Candidatura salva.");
    onClose();
  }

  return (
    <Sheet open={!!app} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader><SheetTitle>{isNew ? "Nova candidatura" : "Candidatura"}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-3">
          {[["role", "Cargo *"], ["company", "Empresa *"], ["url", "URL da vaga"]].map(([k, l]) => <div key={k} className="space-y-1.5"><Label className="text-xs text-muted-foreground">{l}</Label><Input value={f[k] ?? ""} onChange={up(k)} /></div>)}
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{APP_STATUSES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-3 gap-2">
            {[["applied_at", "Candidatura"], ["interview_at", "Entrevista"], ["follow_up_at", "Acompanhar"]].map(([k, l]) => <div key={k} className="space-y-1.5"><Label className="text-xs text-muted-foreground">{l}</Label><Input type="date" value={f[k] ?? ""} onChange={up(k)} /></div>)}
          </div>
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Currículo utilizado</Label>
            <Select value={f.resume_id} onValueChange={(v) => setF({ ...f, resume_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Nenhum</SelectItem>{(resumes.data ?? []).map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Notas</Label><Textarea rows={4} value={f.notes ?? ""} onChange={up("notes")} /></div>
          {a?.url && <a href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-accent">Abrir vaga <ExternalLink className="size-3" /></a>}
          {a && ((a.history as any[]) ?? []).length > 0 && (
            <div><p className="mb-1 text-xs font-medium text-muted-foreground">Histórico</p>
              <ul className="space-y-1 text-xs">{(a.history as any[]).slice().reverse().map((h, i) => <li key={i}><Badge variant="secondary">{label(h.status)}</Badge> {new Date(h.at).toLocaleString("pt-BR")}</li>)}</ul></div>
          )}
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Salvar</Button>
            {a && <Button variant="ghost" className="text-destructive" onClick={async () => { await supabase.from("applications").delete().eq("id", a.id); qc.invalidateQueries({ queryKey: ["applications"] }); toast.success("Excluída."); onClose(); }}>Excluir</Button>}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
