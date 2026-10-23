import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "./privacy";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Impulso" },
      { name: "description", content: "Termos de uso da plataforma Impulso." },
      { property: "og:title", content: "Termos de uso — Impulso" },
      { property: "og:description", content: "Termos de uso da plataforma Impulso." },
    ],
  }),
  component: () => (
    <Legal title="Termos de uso">
      <p>O Impulso é uma ferramenta de apoio à carreira. As pontuações de compatibilidade e de qualidade de currículo são estimativas explicadas e não representam probabilidade de contratação, entrevista ou aprovação em sistemas ATS.</p>
      <p>Você é responsável pela veracidade das informações do seu perfil e por revisar todo conteúdo sugerido pela IA antes de usá-lo.</p>
      <p>O status das vagas depende da fonte original; não garantimos que uma vaga esteja aberta.</p>
      <p>O uso de IA está sujeito a limites diários para controle de custos.</p>
    </Legal>
  ),
});
