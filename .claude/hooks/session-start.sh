#!/bin/bash
# Prepara a sessão: deps do app (Node) e do MCP pinterest (Python).
# Idempotente e não-interativo. Só roda em sessões remotas (Claude Code na web).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# --- app (Node) ---
if [ -f package.json ]; then
  npm install --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund
fi

# --- MCP pinterest + CLI (Python) ---
# --ignore-installed PyJWT: o PyJWT do sistema (Debian) não tem RECORD e
# quebra a resolução do pip ao instalar mcp.
need=()
python3 -c 'import mcp.server.mcpserver' 2>/dev/null || need+=("mcp")
python3 -c 'import playwright' 2>/dev/null || need+=("playwright")
command -v yt-dlp >/dev/null 2>&1 || need+=("yt-dlp")

if [ ${#need[@]} -gt 0 ]; then
  pip install -q --ignore-installed PyJWT "${need[@]}" || {
    echo "aviso: falha ao instalar ${need[*]} — o MCP pinterest pode não subir" >&2
  }
fi

# Chromium já vem no ambiente; nunca rodar "playwright install".
if [ -x /opt/pw-browsers/chromium ]; then
  echo 'export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers' >> "${CLAUDE_ENV_FILE:-/dev/null}"
fi

# ffmpeg: usado pelo pipeline de frames da skill video-to-seedance.
command -v ffmpeg >/dev/null 2>&1 || {
  (apt-get install -y ffmpeg >/dev/null 2>&1) || echo "aviso: ffmpeg indisponível" >&2
}

exit 0
