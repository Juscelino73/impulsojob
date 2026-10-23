import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { uid, type ProfileData } from "@/lib/types";

type ListKey = "experiences" | "education" | "certifications" | "languages" | "projects";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

const TEMPLATES: Record<ListKey, () => any> = {
  experiences: () => ({ id: uid(), company: "", role: "", start: "", end: "", responsibilities: "", achievements: "" }),
  education: () => ({ id: uid(), institution: "", degree: "", start: "", end: "" }),
  certifications: () => ({ id: uid(), name: "", issuer: "", year: "" }),
  languages: () => ({ id: uid(), name: "", level: "" }),
  projects: () => ({ id: uid(), name: "", description: "", link: "" }),
};

export function ProfileEditor({ value: v, onChange, showContact = true, showPrefs = false }: {
  value: ProfileData;
  onChange: (p: ProfileData) => void;
  showContact?: boolean;
  showPrefs?: boolean;
}) {
  const set = <K extends keyof ProfileData>(k: K, val: ProfileData[K]) => onChange({ ...v, [k]: val });
  const list = (k: ListKey) => v[k] as any[];
  const updateItem = (k: ListKey, id: string, patch: Record<string, string>) =>
    set(k, list(k).map((x) => (x.id === id ? { ...x, ...patch } : x)) as never);
  const remove = (k: ListKey, id: string) => set(k, list(k).filter((x) => x.id !== id) as never);
  const move = (k: ListKey, i: number, d: -1 | 1) => {
    const arr = [...list(k)];
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set(k, arr as never);
  };
  const [skill, setSkill] = useState("");
  const [link, setLink] = useState("");

  const Section = ({ k, title, render }: { k: ListKey; title: string; render: (x: any) => React.ReactNode }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" size="sm" variant="outline" onClick={() => set(k, [...list(k), TEMPLATES[k]()] as never)}>
          <Plus /> Adicionar
        </Button>
      </div>
      {list(k).length === 0 && <p className="text-sm text-muted-foreground">Nenhum item.</p>}
      {list(k).map((x, i) => (
        <div key={x.id} className="rounded-lg border p-3">
          <div className="mb-2 flex justify-end gap-1">
            <Button type="button" size="icon" variant="ghost" className="size-7" aria-label="Mover para cima" onClick={() => move(k, i, -1)}><ArrowUp /></Button>
            <Button type="button" size="icon" variant="ghost" className="size-7" aria-label="Mover para baixo" onClick={() => move(k, i, 1)}><ArrowDown /></Button>
            <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" aria-label="Excluir" onClick={() => remove(k, x.id)}><Trash2 /></Button>
          </div>
          {render(x)}
        </div>
      ))}
    </div>
  );

  const inp = (k: ListKey, x: any, f: string, label: string) => (
    <Field label={label}>
      <Input value={x[f] ?? ""} onChange={(e) => updateItem(k, x.id, { [f]: e.target.value })} />
    </Field>
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {showContact && (
          <>
            <Field label="Nome (opcional, usado no currículo)"><Input value={v.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
            <Field label="E-mail de contato (opcional)"><Input value={v.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Telefone (opcional)"><Input value={v.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Localização"><Input value={v.location} onChange={(e) => set("location", e.target.value)} /></Field>
          </>
        )}
        <div className="sm:col-span-2">
          <Field label="Título profissional"><Input value={v.title} onChange={(e) => set("title", e.target.value)} /></Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Resumo profissional"><Textarea rows={4} value={v.summary} onChange={(e) => set("summary", e.target.value)} /></Field>
        </div>
      </div>

      <Section k="experiences" title="Experiências" render={(x) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {inp("experiences", x, "role", "Cargo")}
          {inp("experiences", x, "company", "Empresa")}
          {inp("experiences", x, "start", "Início (MM/AAAA)")}
          {inp("experiences", x, "end", "Término (MM/AAAA ou Atual)")}
          <div className="sm:col-span-2"><Field label="Responsabilidades (uma por linha)"><Textarea rows={3} value={x.responsibilities} onChange={(e) => updateItem("experiences", x.id, { responsibilities: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Conquistas (uma por linha)"><Textarea rows={2} value={x.achievements} onChange={(e) => updateItem("experiences", x.id, { achievements: e.target.value })} /></Field></div>
        </div>
      )} />

      <Section k="education" title="Formação acadêmica" render={(x) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {inp("education", x, "degree", "Curso / grau")}
          {inp("education", x, "institution", "Instituição")}
          {inp("education", x, "start", "Início")}
          {inp("education", x, "end", "Conclusão")}
        </div>
      )} />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Competências</h3>
        <div className="flex flex-wrap gap-1.5">
          {v.skills.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">
              {s}
              <button type="button" aria-label={`Remover ${s}`} onClick={() => set("skills", v.skills.filter((x) => x !== s))}><X className="size-3" /></button>
            </span>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const s = skill.trim();
            if (s && !v.skills.includes(s)) set("skills", [...v.skills, s]);
            setSkill("");
          }}
        >
          <Input placeholder="Ex.: React, SQL, Gestão de projetos" value={skill} onChange={(e) => setSkill(e.target.value)} />
          <Button type="submit" variant="outline">Adicionar</Button>
        </form>
      </div>

      <Section k="certifications" title="Certificações" render={(x) => (
        <div className="grid gap-3 sm:grid-cols-3">
          {inp("certifications", x, "name", "Nome")}
          {inp("certifications", x, "issuer", "Emissor")}
          {inp("certifications", x, "year", "Ano")}
        </div>
      )} />

      <Section k="languages" title="Idiomas" render={(x) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {inp("languages", x, "name", "Idioma")}
          {inp("languages", x, "level", "Nível")}
        </div>
      )} />

      <Section k="projects" title="Projetos" render={(x) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {inp("projects", x, "name", "Nome")}
          {inp("projects", x, "link", "Link")}
          <div className="sm:col-span-2"><Field label="Descrição"><Textarea rows={2} value={x.description} onChange={(e) => updateItem("projects", x.id, { description: e.target.value })} /></Field></div>
        </div>
      )} />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Links profissionais e portfólio</h3>
        {v.links.map((l) => (
          <div key={l} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span className="truncate">{l}</span>
            <Button type="button" size="icon" variant="ghost" className="size-7" aria-label="Remover link" onClick={() => set("links", v.links.filter((x) => x !== l))}><X /></Button>
          </div>
        ))}
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const s = link.trim(); if (s) set("links", [...v.links, s]); setLink(""); }}>
          <Input placeholder="https://linkedin.com/in/…" value={link} onChange={(e) => setLink(e.target.value)} />
          <Button type="submit" variant="outline">Adicionar</Button>
        </form>
      </div>

      {showPrefs && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Preferências de carreira</h3>
          <div className="flex flex-wrap gap-4">
            {[["remoto", "Remoto"], ["hibrido", "Híbrido"], ["presencial", "Presencial"]].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={v.preferences.workModes.includes(k)}
                  onCheckedChange={(c) =>
                    set("preferences", { ...v.preferences, workModes: c ? [...v.preferences.workModes, k] : v.preferences.workModes.filter((x) => x !== k) })
                  }
                />
                {l}
              </label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Localizações de interesse"><Input value={v.preferences.locations} onChange={(e) => set("preferences", { ...v.preferences, locations: e.target.value })} /></Field>
            <Field label="Senioridade desejada"><Input value={v.preferences.seniority} onChange={(e) => set("preferences", { ...v.preferences, seniority: e.target.value })} /></Field>
          </div>
        </div>
      )}
    </div>
  );
}
