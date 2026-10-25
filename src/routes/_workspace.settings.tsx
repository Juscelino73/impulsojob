import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageHeader, SectionCard } from "@/components/common";
import { supabase } from "@/integrations/supabase/client";
import { CRITERION_LABELS, DAILY_AI_LIMIT, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { useSession } from "@/lib/session";
import { useTheme } from "./_workspace";

export const Route = createFileRoute("/_workspace/settings")({
  head: () => ({ meta: [{ title: "Configurações — Impulso" }, { name: "description", content: "Preferências e privacidade do workspace." }, { property: "og:title", content: "Configurações — Impulso" }, { property: "og:description", content: "Preferências do workspace." }] }),
  component: Settings,
});

function Settings() {
  const { userId } = useSession();
  const { dark, toggle } = useTheme();
  const nav = useNavigate();
  const usage = useQuery({
    queryKey: ["usage", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count } = await supabase.from("ai_usage_events").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 864e5).toISOString());
      return count ?? 0;
    },
  });

  async function wipe() {
    for (const t of ["applications", "resumes", "job_matches", "jobs", "profiles", "activity_events"] as const) {
      const { error } = await supabase.from(t).delete().eq("user_id", userId!);
      if (error) return toast.error(`Falha ao excluir dados: ${error.message}`);
    }
    await supabase.auth.signOut();
    localStorage.removeItem("impulso-theme");
    toast.success("Todos os dados do workspace foram excluídos.");
    nav({ to: "/" });
  }

  return (
    <>
      <PageHeader title="Configurações" description="Preferências locais e dados do workspace." />
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Aparência">
          <label className="flex items-center justify-between text-sm">Tema escuro <Switch checked={dark} onCheckedChange={toggle} /></label>
          <p className="mt-3 text-xs text-muted-foreground">Idioma: Português (Brasil). Inglês em breve.</p>
        </SectionCard>
        <SectionCard title="Uso de IA">
          <p className="text-3xl font-bold">{usage.data ?? "–"}<span className="text-base font-normal text-muted-foreground"> / {DAILY_AI_LIMIT}</span></p>
          <p className="text-xs text-muted-foreground">Análises nas últimas 24 horas (limite diário de controle de custos).</p>
        </SectionCard>
        <SectionCard title="Pesos do cálculo de compatibilidade">
          <ul className="space-y-1.5 text-sm">{Object.entries(DEFAULT_WEIGHTS).map(([k, w]) => <li key={k} className="flex justify-between"><span>{CRITERION_LABELS[k as keyof typeof DEFAULT_WEIGHTS]}</span><span className="tabular-nums text-muted-foreground">{w}%</span></li>)}</ul>
        </SectionCard>
        <SectionCard title="Workspace e privacidade">
          <p className="text-sm text-muted-foreground">Seu workspace é anônimo e está vinculado a este navegador. Se você limpar os dados do navegador ou trocar de dispositivo, perderá o acesso a ele. O acesso aos dados é restrito no servidor a este workspace.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" className="mt-4"><Trash2 /> Excluir workspace</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Excluir todos os dados?</AlertDialogTitle><AlertDialogDescription>Perfil, vagas, matches, currículos e candidaturas serão removidos permanentemente.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={wipe}>Excluir tudo</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SectionCard>
      </div>
    </>
  );
}
