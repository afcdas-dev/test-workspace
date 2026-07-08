# 🔍 Spy de Criativos — Pesquisa de Concorrentes

Sistema que busca criativos (anúncios) de concorrentes a partir de um onboarding simples de nicho, e desmonta cada criativo em seus componentes: **ângulo, gancho, CTA, gatilhos mentais, promessa, oferta, estrutura de copy** e mais.

## Como funciona

```
Onboarding (nicho, público, país...)
        │
        ▼
1. ESTRATÉGIA  — a IA gera palavras-chave de busca, concorrentes prováveis
   e ângulos esperados para o nicho
        │
        ▼
2. BUSCA       — com META_AD_LIBRARY_TOKEN: anúncios reais e ativos da
   Meta Ad Library (Facebook/Instagram). Sem token: a IA reconstrói
   criativos simulados realistas com base nos padrões do nicho
        │
        ▼
3. ANÁLISE     — cada criativo é desmontado: gancho (texto, tipo, força),
   ângulo, CTA (texto, tipo, posição), gatilhos mentais, emoção, promessa,
   oferta, público implícito, estrutura da copy, nota 1–10, pontos
   fortes/fracos e como superar
        │
        ▼
4. INSIGHTS    — visão agregada do mercado: ângulos dominantes, ganchos e
   CTAs mais usados, lacunas de mercado (o que ninguém explora) e
   recomendações para vencer os concorrentes
```

## Rodando

```bash
npm install
cp .env.example .env   # preencha ANTHROPIC_API_KEY (obrigatória)
npm start              # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Chave da Claude API (estratégia + análise) |
| `META_AD_LIBRARY_TOKEN` | — | Token do Graph API para buscar anúncios reais na [Meta Ad Library](https://www.facebook.com/ads/library/api/). Sem ele, os criativos são simulados por IA (claramente sinalizados na interface) |
| `CLAUDE_MODEL` | — | Modelo (padrão `claude-opus-4-8`) |
| `PORT` | — | Porta do servidor (padrão `3000`) |

## Recursos da interface

- **Onboarding em 3 etapas**: nicho + descrição → público/país/idioma/concorrentes conhecidos → plataformas
- **Progresso em tempo real** (SSE) durante estratégia → busca → análise
- **Cards de criativos** com nota, badges de gancho/formato/plataforma e análise completa expansível
- **Filtro por tipo de gancho** e ordenação por nota ou anunciante
- **Exportação em JSON** de toda a pesquisa (estratégia, criativos, análises e insights)

## Estrutura

```
server.js           — Express + endpoint SSE /api/pesquisar
src/claude.js       — cliente Claude API com structured outputs (json_schema)
src/strategy.js     — onboarding → estratégia de busca
src/adLibrary.js    — Meta Ad Library (real) ou simulação por IA
src/analyzer.js     — análise em lote dos criativos + insights agregados
public/             — frontend (onboarding, progresso, dashboard)
```

## API

- `GET /api/status` — quais integrações estão configuradas
- `POST /api/pesquisar` — corpo `{ nicho, descricao, publico, pais, idioma, concorrentes, plataformas }`; resposta em Server-Sent Events com eventos `etapa`, `estrategia`, `criativos`, `analise`, `fim`, `erro`
