import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, FileUp, Search } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/common";
import { ResumeImport } from "@/components/resume-import";
import { JobAdd } from "@/components/job-add";
import { useProfile, useSaveProfile } from "@/lib/data";
import { emptyProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_workspace/onboarding")({
  head: () => ({ meta: [{ title: "Início rápido — Impulso" }, { name: "description", content: "Comece importando seu currículo ou colando uma vaga." }, { property: "og:title", content: "Início rápido — Impulso" }, { property: "og:description", content: "Comece em segundos, sem cadastro." }] }),
  component: Onboarding,
});

function Onboarding() {
  const [mode, setMode] = useState<"resume" | "job" | null>(null);
  const profile = useProfile();
  const save = useSaveProfile();
  const opts = [
    { k: "resume" as const, icon: FileUp, t: "Importar meu currículo", d: "Extraímos seus dados e você revisa." },
    { k: "job" as const, icon: Search, t: "Colar uma descrição de vaga", d: "Analise requisitos imediatamente." },
  ];
  return (
    <>
      <PageHeader title="Como você quer começar?" description="Opcional — você pode explorar o aplicativo a qualquer momento." />
      <div className="grid gap-4 md:grid-cols-3">
        {opts.map((o) => (
          <button key={o.k} onClick={() => setMode(o.k)} className={cn("rounded-xl border bg-card p-5 text-left transition hover:border-accent", mode === o.k && "border-accent ring-2 ring-accent/20")}>
            <o.icon className="mb-3 size-5 text-accent" />
            <p className="font-semibold">{o.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{o.d}</p>
          </button>
        ))}
        <Link to="/dashboard" className="rounded-xl border bg-card p-5 transition hover:border-accent">
          <Compass className="mb-3 size-5 text-accent" />
          <p className="font-semibold">Explorar o aplicativo</p>
          <p className="mt-1 text-sm text-muted-foreground">Ir direto para o dashboard.</p>
        </Link>
      </div>
      {mode === "resume" && (
        <SectionCard title="Importar currículo" className="mt-6">
          <ResumeImport current={profile.data ?? emptyProfile()} onSave={(p) => save.mutateAsync(p)} />
          <p className="mt-3 text-xs text-muted-foreground">Prefere preencher à mão? <Link to="/profile" className="text-accent">Abra o perfil profissional</Link>.</p>
        </SectionCard>
      )}
      {mode === "job" && (
        <SectionCard title="Adicionar vaga" className="mt-6">
          <JobAdd />
        </SectionCard>
      )}
    </>
  );
}
