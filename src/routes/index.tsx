import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, ListChecks, Lock, Search, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand";
import { ScoreRing } from "@/components/common";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Impulso — Sua próxima oportunidade começa com o match certo" },
      { name: "description", content: "Matchmaking de vagas e currículos ATS personalizados com IA, sem cadastro." },
      { property: "og:title", content: "Impulso — Matchmaking de vagas com IA" },
      { property: "og:description", content: "Encontre as vagas certas. Personalize seu currículo. Candidate-se com confiança." },
    ],
  }),
  component: Landing,
});

const FAQ = [
  ["Preciso criar uma conta?", "Não. Você começa imediatamente em um workspace anônimo e privado, vinculado a este navegador."],
  ["A IA inventa informações no meu currículo?", "Não. O Impulso só usa o que você informou. Sugestões são mostradas lado a lado e você aceita ou rejeita cada uma."],
  ["A pontuação garante entrevista?", "Não. A pontuação mostra o quanto seu perfil atende aos requisitos descritos, com explicação por critério. Ela não é uma probabilidade de contratação."],
  ["O currículo passa em qualquer ATS?", "Geramos documentos de coluna única, com texto selecionável e títulos convencionais. A interpretação varia conforme o software e o empregador."],
  ["Como apago meus dados?", "Em Configurações, use 'Excluir workspace' para remover permanentemente todos os dados."],
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#como-funciona" className="hover:text-foreground">Como funciona</a>
            <a href="#recursos" className="hover:text-foreground">Recursos</a>
            <a href="#precos" className="hover:text-foreground">Preços</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <Button asChild variant="accent">
            <Link to="/onboarding">Começar agora</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" /> Matchmaking e currículos ATS com IA
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] md:text-5xl">
            Sua próxima oportunidade começa com o <span className="text-accent">match certo</span>.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            O Impulso compara seu perfil com os requisitos reais de cada vaga, explica a compatibilidade e cria um
            currículo personalizado — usando apenas informações verdadeiras suas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg">
              <Link to="/onboarding">Começar agora <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Sem cadastro, sem e-mail, sem senha.</p>
        </div>
        <DashboardPreview />
      </section>

      <section id="como-funciona" className="border-y bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-semibold">Como funciona</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { icon: Upload, t: "Importe seu currículo", d: "PDF, DOCX ou texto. Você revisa tudo antes de salvar." },
              { icon: Search, t: "Descubra vagas compatíveis", d: "Cole uma descrição ou URL e veja a pontuação explicada." },
              { icon: FileText, t: "Personalize para cada vaga", d: "Gere uma versão ATS-friendly e aprove cada alteração." },
            ].map((s, i) => (
              <div key={s.t} className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <s.icon className="size-4" />
                  </span>
                  <span className="text-sm font-semibold text-accent">Etapa {i + 1}</span>
                </div>
                <h3 className="font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Sparkles, t: "Matchmaking explicável", d: "Pontuação de 0 a 100 com peso por critério, competências confirmadas, parciais e desconhecidas." },
            { icon: FileText, t: "Otimização de currículo", d: "Reescrita focada na vaga, comparação lado a lado e exportação real em PDF e DOCX." },
            { icon: ListChecks, t: "Acompanhamento de candidaturas", d: "Pipeline Kanban, datas de entrevista e acompanhamento, notas e histórico." },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border p-6">
              <f.icon className="mb-3 size-5 text-accent" />
              <h3 className="font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Baseado em fatos", d: "Nunca inventamos empresas, cargos, métricas ou competências." },
            { icon: Lock, t: "Privado por padrão", d: "Cada workspace é isolado no servidor. Ninguém acessa seus dados trocando um ID." },
            { icon: CheckCircle2, t: "Transparente", d: "Cada nota mostra como foi calculada. Sem promessas de contratação." },
          ].map((f) => (
            <div key={f.t}>
              <f.icon className="mb-3 size-5 text-accent" />
              <h3 className="font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm opacity-80">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="precos" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">Preços</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border-2 border-accent p-6">
            <h3 className="font-semibold">Gratuito</h3>
            <p className="mt-1 text-3xl font-bold">R$ 0</p>
            <p className="mt-2 text-sm text-muted-foreground">Acesso completo nesta versão, com limite diário de análises com IA.</p>
            <Button asChild variant="accent" className="mt-6">
              <Link to="/onboarding">Começar agora</Link>
            </Button>
          </div>
          <div className="rounded-xl border p-6 opacity-80">
            <h3 className="font-semibold">Pro</h3>
            <p className="mt-1 text-3xl font-bold text-muted-foreground">Em breve</p>
            <p className="mt-2 text-sm text-muted-foreground">Mais análises, sincronização entre dispositivos e contas.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="mb-6 text-2xl font-semibold">Perguntas frequentes</h2>
        <Accordion type="single" collapsible>
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger>{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground">
          <Logo />
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground">Privacidade</Link>
            <Link to="/terms" className="hover:text-foreground">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div aria-label="Prévia ilustrativa da interface" className="rounded-2xl border bg-card p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Prévia ilustrativa</span>
        <span className="h-2 w-16 rounded bg-secondary" />
      </div>
      <div className="space-y-3">
        {[
          { t: "Desenvolvedor(a) Front-end Pleno", s: 82, k: ["React", "TypeScript", "Testes"] },
          { t: "Analista de Produto", s: 64, k: ["Discovery", "SQL"] },
        ].map((j) => (
          <div key={j.t} className="flex items-center gap-4 rounded-xl border p-4">
            <ScoreRing score={j.s} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{j.t}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {j.k.map((x) => (
                  <span key={x} className="rounded-md bg-secondary px-2 py-0.5 text-xs">{x}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-xl border p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Sugestão de currículo</p>
          <p className="text-sm line-through opacity-60">Responsável pelo front-end do produto.</p>
          <p className="text-sm">Desenvolvi interfaces em React e TypeScript para o produto principal…</p>
        </div>
      </div>
    </div>
  );
}
