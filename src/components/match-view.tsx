import { CheckCircle2, CircleDashed, CircleHelp, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CRITERION_LABELS, DEFAULT_WEIGHTS, contribution } from "@/lib/scoring";
import type { MatchBreakdown } from "@/lib/types";
import { ScoreRing, SectionCard } from "./common";

function List({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: typeof CheckCircle2; tone: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-1.5">
        {items.map((x) => (
          <li key={x} className="flex gap-2 text-sm"><Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} />{x}</li>
        ))}
      </ul>
    </div>
  );
}

export function MatchView({ score, b }: { score: number; b: MatchBreakdown }) {
  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex items-start gap-5">
          <ScoreRing score={score} size={84} />
          <div>
            <p className="text-sm text-muted-foreground">Compatibilidade estimada</p>
            <p className="mt-1">{b.summary}</p>
            <p className="mt-2 text-xs text-muted-foreground">Estimativa baseada nos requisitos descritos. Não representa garantia de entrevista ou contratação.</p>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Como a pontuação foi calculada">
        <div className="space-y-4">
          {b.criteria.map((c) => (
            <div key={c.key}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{CRITERION_LABELS[c.key]} <span className="text-xs font-normal text-muted-foreground">· peso {DEFAULT_WEIGHTS[c.key]}%</span></span>
                <span className="tabular-nums">{c.score}/100 <span className="text-xs text-muted-foreground">(+{contribution(c.score, c.key)} pts)</span></span>
              </div>
              <Progress value={c.score} className="mt-1.5 h-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Competências">
          <div className="space-y-4">
            <List title="Confirmadas" items={b.confirmed} icon={CheckCircle2} tone="text-success" />
            <List title="Parcialmente demonstradas" items={b.partial} icon={CircleDashed} tone="text-warning" />
            <List title="Não verificadas no perfil" items={b.unknown} icon={CircleHelp} tone="text-muted-foreground" />
            <List title="Possíveis incompatibilidades" items={b.mismatches} icon={XCircle} tone="text-destructive" />
          </div>
        </SectionCard>
        <SectionCard title="Análise">
          <div className="space-y-4">
            <List title="Principais motivos" items={b.reasons} icon={CheckCircle2} tone="text-accent" />
            <List title="Experiências relevantes" items={b.relevantExperience} icon={CheckCircle2} tone="text-primary" />
          </div>
        </SectionCard>
        <SectionCard title="Melhorias no perfil">
          <List title="Sugestões" items={b.profileImprovements} icon={CircleDashed} tone="text-accent" />
        </SectionCard>
        <SectionCard title="Alterações recomendadas no currículo">
          <List title="Sugestões" items={b.resumeChanges} icon={CircleDashed} tone="text-accent" />
        </SectionCard>
      </div>
      {b.nextAction && (
        <div className="rounded-xl border-l-4 border-accent bg-secondary/60 p-4 text-sm"><span className="font-semibold">Próxima ação sugerida: </span>{b.nextAction}</div>
      )}
    </div>
  );
}
