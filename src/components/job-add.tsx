import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, Loader2, PenLine, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { analyzeJob, importJobFromUrl, type AnalyzedJob } from "@/lib/ai.functions";
import { logActivity } from "@/lib/data";
import { useSession } from "@/lib/session";
import { errMsg } from "./common";

export function JobAdd() {
  const { userId } = useSession();
  const analyze = useServerFn(analyzeJob);
  const fromUrl = useServerFn(importJobFromUrl);
  const qc = useQueryClient();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState({ title: "", company: "", location: "", salary: "", contract_type: "", work_mode: "", description: "" });

  async function save(job: Partial<AnalyzedJob> & { title: string }, description: string, source: "colado" | "url" | "manual", jobUrl?: string) {
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        user_id: userId!,
        title: job.title || "Vaga sem título",
        company: job.company || null,
        location: job.location || null,
        work_mode: job.work_mode && job.work_mode !== "desconhecido" ? (job.work_mode as never) : null,
        seniority: job.seniority || null,
        contract_type: job.contract_type || null,
        salary: job.salary || null,
        url: jobUrl ?? null,
        source,
        description,
        requirements: {
          required: job.required ?? [],
          desired: job.desired ?? [],
          responsibilities: job.responsibilities ?? [],
          keywords: job.keywords ?? [],
        },
      })
      .select("id")
      .single();
    if (error) throw error;
    await logActivity(userId, "job", `Vaga adicionada: ${job.title}`);
    qc.invalidateQueries({ queryKey: ["jobs"] });
    qc.invalidateQueries({ queryKey: ["activity"] });
    toast.success("Vaga salva e analisada.");
    nav({ to: "/jobs/$id", params: { id: data.id } });
  }

  const run = (fn: () => Promise<void>) => async () => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const spinner = busy ? <Loader2 className="animate-spin" /> : <Sparkles />;

  return (
    <Tabs defaultValue="paste">
      <TabsList>
        <TabsTrigger value="paste"><Sparkles className="size-3.5" /> Colar descrição</TabsTrigger>
        <TabsTrigger value="url"><Link2 className="size-3.5" /> Por URL</TabsTrigger>
        <TabsTrigger value="manual"><PenLine className="size-3.5" /> Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="paste" className="space-y-3 pt-2">
        <Textarea rows={8} placeholder="Cole a descrição completa da vaga (cargo, requisitos, responsabilidades…)" value={text} onChange={(e) => setText(e.target.value)} />
        <Button variant="accent" disabled={busy || text.trim().length < 80} onClick={run(async () => {
          const job = await analyze({ data: { text } });
          await save(job, text, "colado");
        })}>
          {spinner} Analisar e salvar vaga
        </Button>
        {text.length > 0 && text.trim().length < 80 && <p className="text-xs text-muted-foreground">A descrição precisa ter ao menos 80 caracteres.</p>}
      </TabsContent>
      <TabsContent value="url" className="space-y-3 pt-2">
        <Input type="url" placeholder="https://empresa.com/vagas/123" value={url} onChange={(e) => setUrl(e.target.value)} />
        <p className="text-xs text-muted-foreground">Algumas páginas exigem login ou bloqueiam acesso automatizado. Nesses casos, cole a descrição.</p>
        <Button variant="accent" disabled={busy || !/^https?:\/\//.test(url)} onClick={run(async () => {
          const r = await fromUrl({ data: { url } });
          await save(r.job, r.text, "url", url);
        })}>
          {spinner} Importar vaga
        </Button>
      </TabsContent>
      <TabsContent value="manual" className="pt-2">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); run(() => save({ ...manual, work_mode: (manual.work_mode || "desconhecido") as never }, manual.description, "manual"))(); }}>
          {([["title", "Cargo *"], ["company", "Empresa"], ["location", "Localização"], ["salary", "Salário"], ["contract_type", "Tipo de contratação"]] as const).map(([k, l]) => (
            <div key={k} className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{l}</Label>
              <Input required={k === "title"} value={manual[k]} onChange={(e) => setManual({ ...manual, [k]: e.target.value })} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Formato</Label>
            <Select value={manual.work_mode} onValueChange={(v) => setManual({ ...manual, work_mode: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="remoto">Remoto</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Descrição / requisitos</Label>
            <Textarea rows={4} value={manual.description} onChange={(e) => setManual({ ...manual, description: e.target.value })} />
          </div>
          <div><Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Salvar vaga</Button></div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
