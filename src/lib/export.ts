import type { ResumeContent } from "./types";

const lines = (s: string) =>
  s
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

const range = (a: string, b: string) => [a, b].filter(Boolean).join(" – ");

function fileName(c: ResumeContent, ext: string) {
  const base = (c.fullName || "curriculo").normalize("NFD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  return `${base || "curriculo"}.${ext}`;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Single-column, selectable-text PDF with conventional headings. */
export async function exportPdf(c: ResumeContent) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const M = 50;
  const W = doc.internal.pageSize.getWidth() - M * 2;
  const H = doc.internal.pageSize.getHeight();
  let y = M;
  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const text = (t: string, size = 10, style: "normal" | "bold" = "normal", gap = 4) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const wrapped = doc.splitTextToSize(t, W) as string[];
    for (const w of wrapped) {
      ensure(size + gap);
      doc.text(w, M, y);
      y += size + gap;
    }
  };
  const heading = (t: string) => {
    y += 8;
    ensure(24);
    text(t.toUpperCase(), 11, "bold", 2);
    doc.setLineWidth(0.5);
    doc.line(M, y, M + W, y);
    y += 10;
  };

  text(c.fullName || "Seu nome", 18, "bold", 6);
  if (c.title) text(c.title, 12, "normal", 4);
  const contact = [c.email, c.phone, c.location, ...c.links].filter(Boolean).join(" | ");
  if (contact) text(contact, 9);
  if (c.summary) {
    heading("Resumo profissional");
    text(c.summary);
  }
  if (c.experiences.length) {
    heading("Experiência profissional");
    for (const e of c.experiences) {
      text(`${e.role} — ${e.company}`, 10.5, "bold", 3);
      const r = range(e.start, e.end);
      if (r) text(r, 9);
      for (const l of [...lines(e.responsibilities), ...lines(e.achievements)]) text(`• ${l}`);
      y += 4;
    }
  }
  if (c.education.length) {
    heading("Formação acadêmica");
    for (const e of c.education) text(`${e.degree} — ${e.institution}${range(e.start, e.end) ? ` (${range(e.start, e.end)})` : ""}`);
  }
  if (c.skills.length) {
    heading("Competências");
    text(c.skills.join(", "));
  }
  if (c.certifications.length) {
    heading("Certificações");
    for (const x of c.certifications) text([x.name, x.issuer, x.year].filter(Boolean).join(" — "));
  }
  if (c.languages.length) {
    heading("Idiomas");
    text(c.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", "));
  }
  if (c.projects.length) {
    heading("Projetos");
    for (const p of c.projects) {
      text(p.name, 10, "bold", 3);
      if (p.description) text(p.description);
      if (p.link) text(p.link, 9);
    }
  }
  const blob = doc.output("blob");
  if (!blob || blob.size < 500) throw new Error("O PDF gerado está vazio.");
  download(blob, fileName(c, "pdf"));
}

/** Real Word document generated with the docx library. */
export async function exportDocx(c: ResumeContent) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } = await import("docx");
  const children: InstanceType<typeof Paragraph>[] = [];
  const h = (t: string) =>
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999", space: 2 } },
        children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 22, font: "Calibri" })],
      }),
    );
  const p = (t: string, opts: { bold?: boolean; size?: number; bullet?: boolean } = {}) =>
    children.push(
      new Paragraph({
        bullet: opts.bullet ? { level: 0 } : undefined,
        children: [new TextRun({ text: t, bold: opts.bold, size: opts.size ?? 21, font: "Calibri" })],
      }),
    );

  p(c.fullName || "Seu nome", { bold: true, size: 32 });
  if (c.title) p(c.title, { size: 24 });
  const contact = [c.email, c.phone, c.location, ...c.links].filter(Boolean).join(" | ");
  if (contact) p(contact, { size: 18 });
  if (c.summary) {
    h("Resumo profissional");
    p(c.summary);
  }
  if (c.experiences.length) {
    h("Experiência profissional");
    for (const e of c.experiences) {
      p(`${e.role} — ${e.company}`, { bold: true });
      if (range(e.start, e.end)) p(range(e.start, e.end), { size: 18 });
      for (const l of [...lines(e.responsibilities), ...lines(e.achievements)]) p(l, { bullet: true });
    }
  }
  if (c.education.length) {
    h("Formação acadêmica");
    for (const e of c.education) p(`${e.degree} — ${e.institution}${range(e.start, e.end) ? ` (${range(e.start, e.end)})` : ""}`);
  }
  if (c.skills.length) {
    h("Competências");
    p(c.skills.join(", "));
  }
  if (c.certifications.length) {
    h("Certificações");
    for (const x of c.certifications) p([x.name, x.issuer, x.year].filter(Boolean).join(" — "));
  }
  if (c.languages.length) {
    h("Idiomas");
    p(c.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", "));
  }
  if (c.projects.length) {
    h("Projetos");
    for (const x of c.projects) {
      p(x.name, { bold: true });
      if (x.description) p(x.description);
      if (x.link) p(x.link, { size: 18 });
    }
  }
  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] !== 0x50 || head[1] !== 0x4b) throw new Error("O arquivo DOCX gerado é inválido.");
  download(blob, fileName(c, "docx"));
}
