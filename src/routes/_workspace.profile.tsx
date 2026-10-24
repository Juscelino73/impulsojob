import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ErrorState, ListSkeleton, PageHeader, SectionCard, errMsg } from "@/components/common";
import { ProfileEditor } from "@/components/profile-editor";
import { ResumeImport } from "@/components/resume-import";
import { useProfile, useSaveProfile } from "@/lib/data";
import { profileCompletion, type ProfileData } from "@/lib/types";

export const Route = createFileRoute("/_workspace/profile")({
  head: () => ({ meta: [{ title: "Perfil profissional — Impulso" }, { name: "description", content: "Seu currículo mestre: fonte de todas as versões." }, { property: "og:title", content: "Perfil profissional — Impulso" }, { property: "og:description", content: "Edite seu currículo mestre." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const q = useProfile();
  const save = useSaveProfile();
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (q.data && !dirty) setDraft(q.data); }, [q.data, dirty]);
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  if (q.isError) return <ErrorState message={errMsg(q.error)} onRetry={() => q.refetch()} />;
  if (!draft) return <ListSkeleton />;
  const pct = profileCompletion(draft);

  return (
    <>
      <PageHeader
        title="Perfil profissional"
        description="Currículo mestre. Versões personalizadas nunca alteram este perfil."
        actions={
          <Button disabled={!dirty || save.isPending} onClick={async () => {
            try { await save.mutateAsync(draft); setDirty(false); toast.success("Perfil salvo."); } catch (e) { toast.error(errMsg(e)); }
          }}>
            {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} {dirty ? "Salvar alterações" : "Salvo"}
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard>
          <ProfileEditor value={draft} showPrefs onChange={(p) => { setDraft(p); setDirty(true); }} />
        </SectionCard>
        <div className="space-y-6">
          <SectionCard title="Preenchimento">
            <p className="text-3xl font-bold">{pct}%</p>
            <Progress value={pct} className="mt-2" />
          </SectionCard>
          <SectionCard title="Importar currículo">
            <ResumeImport current={draft} onSave={async (p) => { await save.mutateAsync(p); setDraft(p); setDirty(false); }} />
          </SectionCard>
        </div>
      </div>
    </>
  );
}
