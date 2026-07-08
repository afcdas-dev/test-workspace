import { askJson } from "./claude.js";

const STRATEGY_SCHEMA = {
  type: "object",
  properties: {
    nicho_normalizado: { type: "string" },
    resumo_mercado: {
      type: "string",
      description: "Resumo curto do mercado/nicho e do momento competitivo",
    },
    palavras_chave: {
      type: "array",
      items: { type: "string" },
      description:
        "Termos de busca para encontrar anúncios de concorrentes na Meta Ad Library",
    },
    concorrentes_provaveis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          motivo: { type: "string" },
        },
        required: ["nome", "motivo"],
        additionalProperties: false,
      },
    },
    angulos_esperados: {
      type: "array",
      items: { type: "string" },
      description: "Ângulos de marketing que costumam performar neste nicho",
    },
    dores_do_publico: { type: "array", items: { type: "string" } },
  },
  required: [
    "nicho_normalizado",
    "resumo_mercado",
    "palavras_chave",
    "concorrentes_provaveis",
    "angulos_esperados",
    "dores_do_publico",
  ],
  additionalProperties: false,
};

/**
 * A partir das respostas do onboarding, gera a estratégia de busca:
 * palavras-chave, concorrentes prováveis e ângulos esperados no nicho.
 */
export async function buildStrategy(onboarding) {
  const {
    nicho,
    descricao,
    publico,
    pais = "BR",
    idioma = "português",
    concorrentes = "",
    plataformas = [],
  } = onboarding;

  return askJson({
    system:
      "Você é um estrategista sênior de tráfego pago e pesquisa de concorrência. " +
      "Você conhece profundamente bibliotecas de anúncios (Meta Ad Library, TikTok Creative Center, Google Ads Transparency) " +
      "e os padrões de criativos vencedores por nicho. Responda sempre no idioma do usuário.",
    prompt: [
      "Monte uma estratégia de busca de criativos de concorrentes com base neste onboarding:",
      "",
      `Nicho: ${nicho}`,
      descricao ? `Descrição do produto/serviço: ${descricao}` : "",
      publico ? `Público-alvo: ${publico}` : "",
      `País: ${pais} | Idioma dos anúncios: ${idioma}`,
      concorrentes ? `Concorrentes já conhecidos: ${concorrentes}` : "",
      plataformas.length ? `Plataformas de interesse: ${plataformas.join(", ")}` : "",
      "",
      "Gere de 8 a 12 palavras-chave de busca (termos que apareceriam no texto dos anúncios ou nomes de páginas), " +
        "de 5 a 8 concorrentes prováveis com o motivo, os ângulos de marketing que costumam dominar esse nicho " +
        "e as principais dores do público.",
    ]
      .filter(Boolean)
      .join("\n"),
    schema: STRATEGY_SCHEMA,
  });
}
