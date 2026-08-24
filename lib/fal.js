// Cliente mínimo da API do Fal AI (https://fal.ai), usando o endpoint síncrono.
// A chave vem da variável de ambiente FAL_KEY (formato "id:segredo") e nunca
// deve aparecer no código nem ser commitada.
const FAL_RUN_URL = 'https://fal.run';

export function isConfigured() {
  return Boolean(process.env.FAL_KEY);
}

// Executa um modelo (ex.: "fal-ai/flux/schnell") e devolve o JSON do resultado.
export async function run(model, input, { timeoutMs = 120_000 } = {}) {
  if (!isConfigured()) throw new Error('FAL_KEY não configurada.');
  const res = await fetch(`${FAL_RUN_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${process.env.FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Fal AI respondeu ${res.status}: ${body.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
