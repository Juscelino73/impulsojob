import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacidade — Impulso" },
      { name: "description", content: "Como o Impulso trata seus dados profissionais." },
      { property: "og:title", content: "Privacidade — Impulso" },
      { property: "og:description", content: "Como o Impulso trata seus dados profissionais." },
    ],
  }),
  component: () => (
    <Legal title="Política de privacidade">
      <p>O Impulso funciona sem cadastro. Ao abrir o aplicativo, criamos um workspace anônimo vinculado a este navegador. Nenhum nome, e-mail ou senha é exigido.</p>
      <p>Os dados que você informa (perfil, vagas, currículos e candidaturas) são armazenados no servidor e isolados por workspace: regras de acesso no banco impedem que outra pessoa os leia, mesmo conhecendo identificadores.</p>
      <p>Arquivos de currículo importados são lidos no seu navegador para extrair o texto; o arquivo original não é armazenado.</p>
      <p>Para recursos de IA, o texto necessário é enviado a um provedor de modelos de linguagem apenas para processar a solicitação.</p>
      <p>Se você limpar os dados do navegador, perderá o acesso ao workspace. Você pode excluir todos os dados a qualquer momento em Configurações.</p>
    </Legal>
  ),
});

export function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Logo />
      <h1 className="mt-10 text-3xl font-bold">{title}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">{children}</div>
      <Link to="/" className="mt-10 inline-block text-sm text-accent">← Voltar</Link>
    </div>
  );
}
