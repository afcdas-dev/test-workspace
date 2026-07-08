import { askJson } from "./claude.js";

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    analises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criativo_id: { type: "string" },
          gancho: {
            type: "object",
            properties: {
              texto: { type: "string", description: "O gancho (hook) identificado no criativo" },
              tipo: {
                type: "string",
                enum: [
                  "pergunta",
                  "dado_chocante",
                  "dor",
                  "curiosidade",
                  "historia",
                  "prova_social",
                  "promessa_direta",
                  "polemica",
                  "comparacao",
                  "urgencia",
                ],
              },
              forca: { type: "string", enum: ["fraco", "medio", "forte"] },
            },
            required: ["texto", "tipo", "forca"],
            additionalProperties: false,
          },
          angulo: {
            type: "object",
            properties: {
              nome: { type: "string", description: "Nome curto do ângulo, ex: 'Transformação em 30 dias'" },
              descricao: { type: "string" },
            },
            required: ["nome", "descricao"],
            additionalProperties: false,
          },
          cta: {
            type: "object",
            properties: {
              texto: { type: "string" },
              tipo: {
                type: "string",
                enum: [
                  "compra_direta",
                  "cadastro",
                  "download",
                  "agendamento",
                  "mensagem",
                  "saiba_mais",
                  "teste_gratis",
                ],
              },
              posicao: { type: "string", enum: ["inicio", "meio", "fim", "multiplos"] },
            },
            required: ["texto", "tipo", "posicao"],
            additionalProperties: false,
          },
          gatilhos_mentais: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "escassez",
                "urgencia",
                "prova_social",
                "autoridade",
                "reciprocidade",
                "novidade",
                "exclusividade",
                "medo_de_perder",
                "pertencimento",
                "garantia",
              ],
            },
          },
          emocao_principal: { type: "string" },
          promessa: { type: "string", description: "A promessa central do anúncio" },
          oferta: { type: "string", description: "Oferta/mecanismo apresentado (desconto, bônus, garantia...)" },
          publico_implicito: { type: "string", description: "Para quem o anúncio claramente fala" },
          estrutura_copy: {
            type: "string",
            description: "Estrutura da copy, ex: AIDA, PAS, gancho-prova-oferta-CTA",
          },
          pontuacao: {
            type: "integer",
            description: "Nota de 1 a 10 para a força geral do criativo",
          },
          pontos_fortes: { type: "array", items: { type: "string" } },
          pontos_fracos: { type: "array", items: { type: "string" } },
          como_superar: {
            type: "string",
            description: "Sugestão prática de como criar um criativo melhor que este",
          },
        },
        required: [
          "criativo_id",
          "gancho",
          "angulo",
          "cta",
          "gatilhos_mentais",
          "emocao_principal",
          "promessa",
          "oferta",
          "publico_implicito",
          "estrutura_copy",
          "pontuacao",
          "pontos_fortes",
          "pontos_fracos",
          "como_superar",
        ],
        additionalProperties: false,
      },
    },
    insights_gerais: {
      type: "object",
      properties: {
        angulos_dominantes: { type: "array", items: { type: "string" } },
        ganchos_mais_usados: { type: "array", items: { type: "string" } },
        ctas_mais_usados: { type: "array", items: { type: "string" } },
        gatilhos_frequentes: { type: "array", items: { type: "string" } },
        lacunas_de_mercado: {
          type: "array",
          items: { type: "string" },
          description: "Ângulos/abordagens que NINGUÉM está usando — oportunidades",
        },
        recomendacoes: {
          type: "array",
          items: { type: "string" },
          description: "Recomendações práticas para criar criativos que superem os concorrentes",
        },
      },
      required: [
        "angulos_dominantes",
        "ganchos_mais_usados",
        "ctas_mais_usados",
        "gatilhos_frequentes",
        "lacunas_de_mercado",
        "recomendacoes",
      ],
      additionalProperties: false,
    },
  },
  required: ["analises", "insights_gerais"],
  additionalProperties: false,
};

/**
 * Analisa um lote de criativos em uma única chamada, detalhando gancho,
 * ângulo, CTA, gatilhos mentais, estrutura de copy e gerando insights agregados.
 */
export async function analyzeCreatives({ criativos, onboarding, strategy }) {
  const creativesText = criativos
    .map((c) =>
      [
        `### Criativo ${c.id}`,
        `Anunciante: ${c.anunciante}`,
        c.formato ? `Formato: ${c.formato}` : "",
        c.plataformas?.length ? `Plataformas: ${c.plataformas.join(", ")}` : "",
        c.titulo ? `Título: ${c.titulo}` : "",
        `Copy principal:\n${c.texto_principal}`,
        c.descricao_link ? `Descrição do link: ${c.descricao_link}` : "",
        c.cta_capturado ? `Botão/CTA capturado: ${c.cta_capturado}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");

  return askJson({
    system:
      "Você é um analista sênior de criativos de performance (direct response). " +
      "Você desmonta anúncios em seus componentes: gancho, ângulo, CTA, gatilhos mentais, " +
      "estrutura de copy, promessa e oferta. Suas análises são específicas e acionáveis, nunca genéricas. " +
      "Responda no idioma do usuário.",
    prompt: [
      `Contexto do usuário — nicho: ${onboarding.nicho}`,
      onboarding.descricao ? `Produto/serviço do usuário: ${onboarding.descricao}` : "",
      onboarding.publico ? `Público-alvo do usuário: ${onboarding.publico}` : "",
      strategy?.resumo_mercado ? `Mercado: ${strategy.resumo_mercado}` : "",
      "",
      "Analise CADA criativo de concorrente abaixo. Use exatamente o id de cada criativo no campo criativo_id.",
      "Depois, gere os insights gerais comparando todos os criativos — inclusive lacunas de mercado " +
        "(ângulos que ninguém está usando) e recomendações para o usuário superar esses concorrentes.",
      "",
      creativesText,
    ]
      .filter(Boolean)
      .join("\n"),
    schema: ANALYSIS_SCHEMA,
    maxTokens: 32000,
  });
}
