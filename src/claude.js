import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

let client = null;

export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

/**
 * Chama a Claude API com structured output (json_schema) e retorna o objeto parseado.
 */
export async function askJson({ system, prompt, schema, maxTokens = 16000 }) {
  const anthropic = getClient();
  if (!anthropic) {
    const err = new Error(
      "ANTHROPIC_API_KEY não configurada. Defina a variável de ambiente (veja .env.example)."
    );
    err.status = 400;
    throw err;
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    output_config: {
      format: { type: "json_schema", schema },
    },
    messages: [{ role: "user", content: prompt }],
  });

  if (response.stop_reason === "refusal") {
    const err = new Error("A solicitação foi recusada pelo modelo.");
    err.status = 422;
    throw err;
  }

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) {
    const err = new Error("Resposta vazia do modelo.");
    err.status = 502;
    throw err;
  }
  return JSON.parse(text);
}
