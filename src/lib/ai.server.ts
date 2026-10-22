import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import type { z } from "zod";

const MODEL = "openai/gpt-6-astra";

export class AiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Streams a structured Responses call and returns the validated object. */
export async function runStructured<T>(opts: {
  instructions: string;
  prompt: string;
  schema: z.ZodType<T>;
  effort?: "low" | "medium";
}): Promise<T> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new AiError("A chave de IA não está configurada no servidor.", 401);

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      if (!res.ok) {
        const body = await res.clone().text().catch(() => "");
        let msg = "";
        try {
          msg = JSON.parse(body)?.error?.message ?? JSON.parse(body)?.message ?? "";
        } catch {
          /* ignore */
        }
        if (res.status === 429) throw new AiError("Muitas requisições à IA. Aguarde um instante e tente novamente.", 429);
        if (res.status === 402) throw new AiError(msg || "Créditos de IA esgotados no workspace.", 402);
        if (res.status === 403) throw new AiError(msg || "Acesso à IA bloqueado para este workspace.", 403);
        if (res.status >= 500) throw new AiError("O provedor de IA está indisponível. Tente novamente em instantes.", 503);
        throw new AiError(msg || `Falha na requisição de IA (${res.status}).`, res.status);
      }
      return res;
    },
  });

  let streamError: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    instructions: opts.instructions,
    prompt: opts.prompt,
    output: Output.object({ schema: opts.schema }),
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: opts.effort ?? "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
    onError: ({ error }) => {
      streamError = error;
    },
  });

  try {
    for await (const _ of result.textStream) {
      /* drain */
    }
    if (streamError) throw streamError;
    return (await result.output) as T;
  } catch (e) {
    const err = (e as { cause?: unknown })?.cause instanceof AiError ? (e as { cause: AiError }).cause : e;
    if (err instanceof AiError) throw err;
    if (streamError instanceof AiError) throw streamError;
    if (NoObjectGeneratedError.isInstance(e)) throw new AiError("A IA retornou uma resposta inválida. Tente novamente.", 502);
    console.error("AI call failed", (e as Error)?.message);
    throw new AiError("Não foi possível concluir a análise com IA.", 500);
  }
}
