import { askJson } from "./claude.js";

const META_API_VERSION = "v21.0";
const MAX_ADS_PER_KEYWORD = 6;

/**
 * Busca anúncios reais na Meta Ad Library (Facebook/Instagram).
 * Requer META_AD_LIBRARY_TOKEN (token de acesso do Graph API com permissão ads_read).
 */
async function searchMetaAdLibrary({ keywords, country }) {
  const token = process.env.META_AD_LIBRARY_TOKEN;
  const results = [];
  const seen = new Set();

  for (const keyword of keywords.slice(0, 4)) {
    const params = new URLSearchParams({
      search_terms: keyword,
      ad_type: "ALL",
      ad_active_status: "ACTIVE",
      ad_reached_countries: JSON.stringify([country]),
      limit: String(MAX_ADS_PER_KEYWORD),
      fields: [
        "id",
        "page_name",
        "ad_creative_bodies",
        "ad_creative_link_titles",
        "ad_creative_link_descriptions",
        "ad_creative_link_captions",
        "ad_delivery_start_time",
        "publisher_platforms",
        "ad_snapshot_url",
      ].join(","),
      access_token: token,
    });

    const url = `https://graph.facebook.com/${META_API_VERSION}/ads_archive?${params}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      const err = new Error(`Meta Ad Library: ${data.error.message}`);
      err.status = 502;
      throw err;
    }

    for (const ad of data.data || []) {
      if (seen.has(ad.id)) continue;
      seen.add(ad.id);
      results.push({
        id: ad.id,
        origem: "meta_ad_library",
        anunciante: ad.page_name || "Desconhecido",
        texto_principal: (ad.ad_creative_bodies || []).join("\n---\n"),
        titulo: (ad.ad_creative_link_titles || []).join(" | "),
        descricao_link: (ad.ad_creative_link_descriptions || []).join(" | "),
        cta_capturado: (ad.ad_creative_link_captions || []).join(" | "),
        plataformas: ad.publisher_platforms || [],
        ativo_desde: ad.ad_delivery_start_time || null,
        url_anuncio: ad.ad_snapshot_url || null,
        palavra_chave: keyword,
      });
    }
  }

  return results;
}

const SIMULATED_SCHEMA = {
  type: "object",
  properties: {
    criativos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          anunciante: { type: "string" },
          texto_principal: {
            type: "string",
            description:
              "Copy completa do anúncio, com quebras de linha e emojis quando fizer sentido",
          },
          titulo: { type: "string" },
          descricao_link: { type: "string" },
          cta_capturado: { type: "string", description: "Texto do botão de CTA" },
          plataformas: { type: "array", items: { type: "string" } },
          formato: {
            type: "string",
            enum: ["video", "imagem", "carrossel", "reels", "stories"],
          },
          palavra_chave: { type: "string" },
        },
        required: [
          "anunciante",
          "texto_principal",
          "titulo",
          "descricao_link",
          "cta_capturado",
          "plataformas",
          "formato",
          "palavra_chave",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["criativos"],
  additionalProperties: false,
};

/**
 * Sem token da Meta: gera criativos simulados realistas para o nicho,
 * baseados nos padrões reais de anúncios do mercado. Marcados como "simulado".
 */
async function generateSimulatedCreatives({ strategy, onboarding }) {
  const data = await askJson({
    system:
      "Você é um pesquisador de criativos que conhece profundamente os anúncios que rodam na Meta Ad Library " +
      "em cada nicho. Sua tarefa é reconstruir, de forma realista e fiel aos padrões do mercado, " +
      "os criativos típicos que os concorrentes deste nicho estão veiculando. " +
      "Use nomes de anunciantes fictícios mas plausíveis. Escreva as copies no idioma pedido.",
    prompt: [
      `Nicho: ${strategy.nicho_normalizado}`,
      `Resumo do mercado: ${strategy.resumo_mercado}`,
      `Ângulos dominantes: ${strategy.angulos_esperados.join("; ")}`,
      `Dores do público: ${strategy.dores_do_publico.join("; ")}`,
      `Idioma dos anúncios: ${onboarding.idioma || "português"}`,
      `País: ${onboarding.pais || "BR"}`,
      "",
      "Gere 8 criativos de anúncio distintos, cada um explorando um ângulo/gancho diferente " +
        "(prova social, urgência, dor, transformação, autoridade, curiosidade, oferta, comparação). " +
        "Copies completas e realistas, como apareceriam de verdade na biblioteca de anúncios.",
    ].join("\n"),
    schema: SIMULATED_SCHEMA,
    maxTokens: 16000,
  });

  return data.criativos.map((c, i) => ({
    id: `sim-${Date.now()}-${i}`,
    origem: "simulado",
    ativo_desde: null,
    url_anuncio: null,
    ...c,
  }));
}

/**
 * Busca criativos: usa a Meta Ad Library quando há token, senão gera simulados.
 */
export async function searchCreatives({ strategy, onboarding }) {
  if (process.env.META_AD_LIBRARY_TOKEN) {
    const ads = await searchMetaAdLibrary({
      keywords: strategy.palavras_chave,
      country: onboarding.pais || "BR",
    });
    if (ads.length > 0) return { criativos: ads, fonte: "meta_ad_library" };
    // Sem resultados reais: cai para simulação para não devolver tela vazia
  }
  const simulated = await generateSimulatedCreatives({ strategy, onboarding });
  return { criativos: simulated, fonte: "simulado" };
}
