import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildStrategy } from "./src/strategy.js";
import { searchCreatives } from "./src/adLibrary.js";
import { analyzeCreatives } from "./src/analyzer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (_req, res) => {
  res.json({
    anthropic_configurada: Boolean(process.env.ANTHROPIC_API_KEY),
    meta_ad_library_configurada: Boolean(process.env.META_AD_LIBRARY_TOKEN),
  });
});

/**
 * Pipeline completo com progresso via SSE:
 * onboarding -> estratégia -> busca de criativos -> análise detalhada.
 */
app.post("/api/pesquisar", async (req, res) => {
  const onboarding = req.body || {};
  if (!onboarding.nicho || !onboarding.nicho.trim()) {
    return res.status(400).json({ erro: "Informe o nicho no onboarding." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send("etapa", { etapa: "estrategia", mensagem: "Montando estratégia de busca para o nicho..." });
    const strategy = await buildStrategy(onboarding);
    send("estrategia", strategy);

    send("etapa", { etapa: "busca", mensagem: "Buscando criativos de concorrentes..." });
    const { criativos, fonte } = await searchCreatives({ strategy, onboarding });
    send("criativos", { criativos, fonte });

    send("etapa", {
      etapa: "analise",
      mensagem: `Analisando ${criativos.length} criativos (ângulos, ganchos, CTAs, gatilhos)...`,
    });
    const analysis = await analyzeCreatives({ criativos, onboarding, strategy });
    send("analise", analysis);

    send("fim", { ok: true });
  } catch (err) {
    console.error(err);
    send("erro", { mensagem: err.message || "Erro inesperado." });
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Sistema de busca de criativos rodando em http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠ ANTHROPIC_API_KEY não configurada — a análise não vai funcionar. Veja .env.example");
  }
  if (!process.env.META_AD_LIBRARY_TOKEN) {
    console.warn("ℹ META_AD_LIBRARY_TOKEN não configurado — os criativos serão simulados pela IA.");
  }
});
