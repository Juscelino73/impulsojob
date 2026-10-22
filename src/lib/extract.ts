/** Extracts plain text from a PDF/DOCX/TXT file in the browser. */
export async function extractFileText(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024) throw new Error("Arquivo maior que 8 MB.");
  const name = file.name.toLowerCase();
  const buf = await file.arrayBuffer();
  if (name.endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    return String(text).trim();
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser");
    const res = await (mammoth as any).extractRawText({ arrayBuffer: buf });
    return String(res.value).trim();
  }
  if (name.endsWith(".txt") || name.endsWith(".md")) return new TextDecoder().decode(buf).trim();
  throw new Error("Formato não suportado. Use PDF, DOCX ou TXT.");
}
