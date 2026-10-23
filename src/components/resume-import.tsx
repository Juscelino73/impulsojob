import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseResume } from "@/lib/ai.functions";
import { extractFileText } from "@/lib/extract";
import { uid, type ProfileData } from "@/lib/types";
import { errMsg } from "./common";
import { ProfileEditor } from "./profile-editor";

/** Import a resume (file or text) → AI extraction → mandatory review → save. */
export function ResumeImport({ current, onSave }: { current: ProfileData; onSave: (p: ProfileData) => Promise<void> }) {
  const parse = useServerFn(parseResume);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);

  async function onFile(f: File | undefined) {
    if (!f) return;
    try {
      const t = await extractFileText(f);
      if (t.length < 50) throw new Error("Não encontramos texto no arquivo (pode ser uma imagem escaneada). Cole o texto abaixo.");
      setText(t);
      toast.success("Texto extraído. Clique em Analisar para continuar.");
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  async function analyze() {
    setBusy(true);
    try {
      const r = await parse({ data: { text } });
      setReview({
        ...current,
        ...r,
        experiences: r.experiences.map((e) => ({ ...e, id: uid() })),
        education: r.education.map((e) => ({ ...e, id: uid() })),
        certifications: r.certifications.map((e) => ({ ...e, id: uid() })),
        languages: r.languages.map((e) => ({ ...e, id: uid() })),
        projects: r.projects.map((e) => ({ ...e, id: uid() })),
        preferences: current.preferences,
      });
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-sm text-muted-foreground hover:bg-secondary/60">
        <FileUp className="size-4 text-accent" /> Selecionar PDF, DOCX ou TXT (até 8 MB)
        <input type="file" accept=".pdf,.docx,.txt,.md" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      <Textarea rows={6} placeholder="…ou cole aqui o texto do seu currículo" value={text} onChange={(e) => setText(e.target.value)} />
      <Button variant="accent" disabled={busy || text.trim().length < 50} onClick={analyze}>
        {busy ? <Loader2 className="animate-spin" /> : null} {busy ? "Analisando…" : "Analisar currículo"}
      </Button>

      <Dialog open={!!review} onOpenChange={(o) => !o && setReview(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revise os dados extraídos</DialogTitle>
            <DialogDescription>A leitura automática pode conter erros. Corrija o que for necessário antes de salvar. Isso substituirá seu perfil atual.</DialogDescription>
          </DialogHeader>
          {review && <ProfileEditor value={review} onChange={setReview} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReview(null)}>Cancelar</Button>
            <Button
              disabled={saving}
              onClick={async () => {
                if (!review) return;
                setSaving(true);
                try {
                  await onSave(review);
                  toast.success("Perfil salvo.");
                  setReview(null);
                  setText("");
                } catch (e) {
                  toast.error(errMsg(e));
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving && <Loader2 className="animate-spin" />} Confirmar e salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
