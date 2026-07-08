// Estado global da pesquisa
const state = {
  estrategia: null,
  criativos: [],
  fonte: null,
  analises: {},
  insights: null,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ---------- Onboarding wizard ---------- */

function showStep(n) {
  $$(".step").forEach((s) => s.classList.toggle("active", s.dataset.step === String(n)));
  $$(".step-dot").forEach((d) => d.classList.toggle("active", Number(d.dataset.step) <= n));
}

document.addEventListener("click", (e) => {
  if (e.target.dataset.next) {
    if (e.target.dataset.next === "2" && !$("input[name=nicho]").value.trim()) {
      $("input[name=nicho]").reportValidity();
      return;
    }
    showStep(Number(e.target.dataset.next));
  }
  if (e.target.dataset.prev) showStep(Number(e.target.dataset.prev));
});

// Aviso sobre a fonte dos dados (real vs simulada)
fetch("/api/status")
  .then((r) => r.json())
  .then((s) => {
    $("#fonte-hint").textContent = s.meta_ad_library_configurada
      ? "Busca conectada à Meta Ad Library — os anúncios retornados são reais e ativos."
      : "Sem token da Meta Ad Library configurado: os criativos serão reconstruções realistas geradas por IA com base nos padrões do nicho.";
  })
  .catch(() => {});

/* ---------- Pipeline (SSE via fetch) ---------- */

$("#onboarding-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const onboarding = {
    nicho: form.get("nicho"),
    descricao: form.get("descricao"),
    publico: form.get("publico"),
    pais: form.get("pais"),
    idioma: form.get("idioma"),
    concorrentes: form.get("concorrentes"),
    plataformas: form.getAll("plataformas"),
  };

  $("#onboarding").classList.add("hidden");
  $("#resultados").classList.add("hidden");
  $("#progresso").classList.remove("hidden");
  $("#progresso-log").innerHTML = "";
  $("#progresso-msg").textContent = "Iniciando pesquisa...";

  try {
    const res = await fetch("/api/pesquisar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(onboarding),
    });
    if (!res.ok && !res.headers.get("content-type")?.includes("event-stream")) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.erro || `Erro ${res.status}`);
    }
    await consumeSSE(res.body);
  } catch (err) {
    $("#progresso-msg").textContent = `❌ ${err.message}`;
    $("#progresso").querySelector(".spinner").style.display = "none";
    appendRestartButton();
  }
});

async function consumeSSE(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const eventMatch = raw.match(/^event: (.+)$/m);
      const dataMatch = raw.match(/^data: (.+)$/m);
      if (!eventMatch || !dataMatch) continue;
      handleEvent(eventMatch[1], JSON.parse(dataMatch[1]));
    }
  }
}

function handleEvent(event, data) {
  switch (event) {
    case "etapa":
      logStep();
      $("#progresso-msg").textContent = data.mensagem;
      break;
    case "estrategia":
      state.estrategia = data;
      break;
    case "criativos":
      state.criativos = data.criativos;
      state.fonte = data.fonte;
      break;
    case "analise":
      state.insights = data.insights_gerais;
      state.analises = Object.fromEntries(data.analises.map((a) => [a.criativo_id, a]));
      break;
    case "fim":
      logStep();
      renderResults();
      break;
    case "erro":
      $("#progresso-msg").textContent = `❌ ${data.mensagem}`;
      $("#progresso").querySelector(".spinner").style.display = "none";
      appendRestartButton();
      break;
  }
}

function logStep() {
  const current = $("#progresso-msg").textContent;
  if (current && !current.startsWith("Iniciando") && !current.startsWith("❌")) {
    const li = document.createElement("li");
    li.textContent = current;
    $("#progresso-log").appendChild(li);
  }
}

function appendRestartButton() {
  const btn = document.createElement("button");
  btn.className = "btn ghost";
  btn.textContent = "← Voltar ao onboarding";
  btn.style.marginTop = "16px";
  btn.onclick = resetToOnboarding;
  $("#progresso").appendChild(btn);
}

function resetToOnboarding() {
  $("#progresso").classList.add("hidden");
  $("#resultados").classList.add("hidden");
  $("#onboarding").classList.remove("hidden");
  $("#progresso").querySelector(".spinner").style.display = "";
  $$("#progresso .btn").forEach((b) => b.remove());
  showStep(1);
}

/* ---------- Render ---------- */

function esc(s) {
  const div = document.createElement("div");
  div.textContent = s ?? "";
  return div.innerHTML;
}

function renderResults() {
  $("#progresso").classList.add("hidden");
  $("#resultados").classList.remove("hidden");
  renderStrategy();
  renderInsights();
  populateFilters();
  renderCreatives();
}

function renderStrategy() {
  const s = state.estrategia;
  if (!s) return;
  $("#painel-estrategia").innerHTML = `
    <h2>🎯 Estratégia — ${esc(s.nicho_normalizado)}</h2>
    <p style="color:var(--muted)">${esc(s.resumo_mercado)}</p>
    <p class="panel-label">Palavras-chave usadas na busca</p>
    <div class="pill-list">${s.palavras_chave.map((k) => `<span class="pill">${esc(k)}</span>`).join("")}</div>
    <p class="panel-label">Concorrentes prováveis</p>
    <div class="pill-list">${s.concorrentes_provaveis.map((c) => `<span class="pill" title="${esc(c.motivo)}">${esc(c.nome)}</span>`).join("")}</div>
    <p class="panel-label">Dores do público</p>
    <div class="pill-list">${s.dores_do_publico.map((d) => `<span class="pill">${esc(d)}</span>`).join("")}</div>
  `;
}

function renderInsights() {
  const i = state.insights;
  if (!i) return;
  const aviso =
    state.fonte === "simulado"
      ? `<div class="aviso-simulado">⚠ Criativos simulados por IA (sem token da Meta Ad Library). São reconstruções realistas dos padrões do nicho — configure META_AD_LIBRARY_TOKEN para anúncios reais.</div>`
      : "";
  $("#painel-insights").innerHTML = `
    ${aviso}
    <h2>📊 Insights do mercado</h2>
    <div class="insight-cols">
      <div>
        <p class="panel-label">Ângulos dominantes</p>
        <div class="pill-list">${i.angulos_dominantes.map((a) => `<span class="pill hot">${esc(a)}</span>`).join("")}</div>
        <p class="panel-label">Ganchos mais usados</p>
        <div class="pill-list">${i.ganchos_mais_usados.map((g) => `<span class="pill">${esc(g)}</span>`).join("")}</div>
      </div>
      <div>
        <p class="panel-label">CTAs mais usados</p>
        <div class="pill-list">${i.ctas_mais_usados.map((c) => `<span class="pill">${esc(c)}</span>`).join("")}</div>
        <p class="panel-label">Gatilhos frequentes</p>
        <div class="pill-list">${i.gatilhos_frequentes.map((g) => `<span class="pill">${esc(g)}</span>`).join("")}</div>
      </div>
      <div>
        <p class="panel-label">💡 Lacunas de mercado (ninguém usa)</p>
        <ul class="reco-list">${i.lacunas_de_mercado.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
      </div>
    </div>
    <p class="panel-label">✅ Recomendações para superar os concorrentes</p>
    <ul class="reco-list">${i.recomendacoes.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
  `;
}

function populateFilters() {
  const tipos = [...new Set(Object.values(state.analises).map((a) => a.gancho.tipo))];
  $("#filtro-gancho").innerHTML =
    `<option value="">Todos os ganchos</option>` +
    tipos.map((t) => `<option value="${esc(t)}">${esc(t.replace(/_/g, " "))}</option>`).join("");
}

function scoreClass(n) {
  return n >= 8 ? "alta" : n >= 5 ? "media" : "baixa";
}

function renderCreatives() {
  const filtroGancho = $("#filtro-gancho").value;
  const ordenar = $("#ordenar").value;

  let list = state.criativos.map((c) => ({ criativo: c, analise: state.analises[c.id] }));
  if (filtroGancho) list = list.filter((x) => x.analise?.gancho.tipo === filtroGancho);

  list.sort((a, b) => {
    if (ordenar === "anunciante") return a.criativo.anunciante.localeCompare(b.criativo.anunciante);
    return (b.analise?.pontuacao ?? 0) - (a.analise?.pontuacao ?? 0);
  });

  $("#lista-criativos").innerHTML = list.map(({ criativo: c, analise: a }) => `
    <article class="creative-card">
      <div class="top">
        <h3>${esc(c.anunciante)}</h3>
        ${a ? `<span class="score ${scoreClass(a.pontuacao)}">${a.pontuacao}/10</span>` : ""}
      </div>
      <div class="badges">
        ${a ? `<span class="badge gancho">gancho: ${esc(a.gancho.tipo.replace(/_/g, " "))}</span>` : ""}
        ${c.formato ? `<span class="badge">${esc(c.formato)}</span>` : ""}
        ${(c.plataformas || []).map((p) => `<span class="badge">${esc(p)}</span>`).join("")}
        <span class="badge origem">${c.origem === "simulado" ? "🤖 simulado" : "📡 ad library"}</span>
      </div>
      ${c.titulo ? `<strong>${esc(c.titulo)}</strong>` : ""}
      <div class="copy-preview">${esc(c.texto_principal)}</div>
      ${a ? renderAnalysis(a) : ""}
      <button class="toggle-analysis" data-id="${esc(c.id)}">Ver análise completa ▾</button>
      ${c.url_anuncio ? `<a href="${esc(c.url_anuncio)}" target="_blank" rel="noopener" style="color:var(--accent);font-size:0.85rem">Ver anúncio original ↗</a>` : ""}
    </article>
  `).join("");
}

function renderAnalysis(a) {
  return `
    <dl class="analysis" data-id="${esc(a.criativo_id)}">
      <dt>🪝 Gancho (${esc(a.gancho.forca)})</dt><dd>${esc(a.gancho.texto)}</dd>
      <dt>📐 Ângulo</dt><dd><strong>${esc(a.angulo.nome)}</strong> — ${esc(a.angulo.descricao)}</dd>
      <dt>👆 CTA</dt><dd>"${esc(a.cta.texto)}" · tipo: ${esc(a.cta.tipo.replace(/_/g, " "))} · posição: ${esc(a.cta.posicao)}</dd>
      <dt>🧠 Gatilhos mentais</dt><dd>${a.gatilhos_mentais.map((g) => esc(g.replace(/_/g, " "))).join(", ") || "—"}</dd>
      <dt>❤️ Emoção principal</dt><dd>${esc(a.emocao_principal)}</dd>
      <dt>🎁 Promessa & oferta</dt><dd>${esc(a.promessa)}${a.oferta ? ` · Oferta: ${esc(a.oferta)}` : ""}</dd>
      <dt>👥 Público implícito</dt><dd>${esc(a.publico_implicito)}</dd>
      <dt>🏗 Estrutura da copy</dt><dd>${esc(a.estrutura_copy)}</dd>
      <dt>✅ Pontos fortes</dt><dd><ul>${a.pontos_fortes.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></dd>
      <dt>⚠️ Pontos fracos</dt><dd><ul>${a.pontos_fracos.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></dd>
      <dt>🚀 Como superar</dt><dd>${esc(a.como_superar)}</dd>
    </dl>
  `;
}

/* ---------- Interações nos resultados ---------- */

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("toggle-analysis")) {
    const card = e.target.closest(".creative-card");
    const dl = card.querySelector(".analysis");
    const preview = card.querySelector(".copy-preview");
    const open = dl?.classList.toggle("open");
    preview?.classList.toggle("open", open);
    e.target.textContent = open ? "Esconder análise ▴" : "Ver análise completa ▾";
  }
});

$("#filtro-gancho").addEventListener("change", renderCreatives);
$("#ordenar").addEventListener("change", renderCreatives);
$("#nova-busca").addEventListener("click", resetToOnboarding);

$("#exportar").addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify({ estrategia: state.estrategia, fonte: state.fonte, criativos: state.criativos, analises: state.analises, insights: state.insights }, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pesquisa-criativos.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
