#!/usr/bin/env python3
"""Servidor MCP que expõe a pinterest-cli como ferramentas para o Claude.

Registrar no Claude Code (stdio, roda local):
    claude mcp add pinterest -- python3 /caminho/para/tools/pinterest_mcp.py

Ou em .mcp.json do projeto:
    {"mcpServers": {"pinterest": {"command": "python3",
     "args": ["tools/pinterest_mcp.py"]}}}

Requisitos: pip install mcp   (playwright opcional, para search/board renderizado)

As ferramentas baixam para PINTEREST_MCP_DIR (padrão: ./pinterest_refs) e
retornam os caminhos locais, de onde o pipeline de frames segue normalmente.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pinterest_cli as pc  # noqa: E402
from mcp.server.mcpserver import MCPServer  # noqa: E402

DOWNLOAD_DIR = Path(os.environ.get("PINTEREST_MCP_DIR", "pinterest_refs")).expanduser()

mcp = MCPServer(
    name="pinterest",
    version="0.1.0",
    instructions=(
        "Coleta referências de vídeo/imagem do Pinterest para análise de estilo UGC. "
        "Use search_pins ou list_board_pins para descobrir pins, depois "
        "download_pin (ou download_many) para trazer os arquivos ao disco. "
        "Os caminhos retornados podem ser analisados com ffmpeg/ffprobe."
    ),
)


def _err(exc: Exception) -> str:
    reason = getattr(exc, "reason", exc)
    msg = f"Erro: {reason}"
    if any(s in str(reason) for s in ("403", "ERR_TUNNEL", "ERR_PROXY", "Tunnel")):
        msg += (
            "\nParece bloqueio de rede: o ambiente precisa permitir pin.it, "
            "pinterest.com, br.pinterest.com, v.pinimg.com e i.pinimg.com."
        )
    return msg


@mcp.tool(
    description=(
        "Resolve um link curto pin.it e devolve metadados do pin: título, "
        "descrição e URLs de vídeo/imagem disponíveis."
    )
)
def get_pin_info(url: str) -> dict:
    try:
        return pc.pin_info(url)
    except Exception as e:  # noqa: BLE001 — ferramenta MCP devolve erro como texto
        return {"error": _err(e)}


@mcp.tool(
    description=(
        "Baixa o vídeo (ou imagem) de um pin para o disco e devolve o caminho "
        "local e o tamanho em bytes."
    )
)
def download_pin(url: str) -> dict:
    try:
        dest = pc.download_pin(url, DOWNLOAD_DIR)
        return {"path": str(dest), "bytes": dest.stat().st_size}
    except Exception as e:  # noqa: BLE001
        return {"error": _err(e)}


@mcp.tool(
    description=(
        "Baixa vários pins de uma vez. Recebe uma lista de URLs e devolve os "
        "caminhos baixados e os erros por URL."
    )
)
def download_many(urls: list[str]) -> dict:
    ok, failed = [], {}
    for u in urls:
        try:
            dest = pc.download_pin(u, DOWNLOAD_DIR)
            ok.append(str(dest))
        except Exception as e:  # noqa: BLE001
            failed[u] = _err(e)
    return {"downloaded": ok, "errors": failed}


@mcp.tool(
    description=(
        "Busca pins por termo (ex.: 'principia skincare ugc') e devolve as URLs "
        "encontradas. Renderiza a página no Chromium, pois a busca do Pinterest "
        "é montada no cliente."
    )
)
def search_pins(query: str, limit: int = 25, scrolls: int = 3) -> dict:
    try:
        return {"pins": pc.search_pins(query, limit, scrolls)}
    except Exception as e:  # noqa: BLE001
        return {"error": _err(e)}


@mcp.tool(
    description=(
        "Lista os pins de um board. Com render=True usa o Chromium e rola a "
        "página para pegar mais pins."
    )
)
def list_board_pins(url: str, limit: int = 25, render: bool = False) -> dict:
    try:
        return {"pins": pc.board_pins(url, limit, render=render)}
    except Exception as e:  # noqa: BLE001
        return {"error": _err(e)}


if __name__ == "__main__":
    mcp.run()
