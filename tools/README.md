# tools/

Utilitários de coleta de referências para o pipeline de prompts UGC
(ver `.claude/skills/video-to-seedance/`).

## pinterest_cli.py

CLI para trazer vídeos de referência do Pinterest.

```bash
python3 tools/pinterest_cli.py resolve  https://pin.it/XXXX      # link curto -> URL do pin
python3 tools/pinterest_cli.py info     https://pin.it/XXXX      # metadados + URLs de mídia
python3 tools/pinterest_cli.py download https://pin.it/XXXX -o refs/
python3 tools/pinterest_cli.py search   "principia skincare" --limit 20 > links.txt
python3 tools/pinterest_cli.py board    <url-do-board> --render --limit 40
python3 tools/pinterest_cli.py batch    links.txt -o refs/
```

Dependências: só a stdlib para `resolve`/`info`/`download`/`batch`.
`search` e `board --render` precisam de `pip install playwright` (o Chromium
já vem no ambiente do Claude Code; a CLI acha o binário sozinha).
`pip install yt-dlp` é opcional e melhora o download (lida com HLS).

## pinterest_mcp.py

Expõe a CLI como servidor MCP, para o Claude chamar as ferramentas direto.

```bash
pip install mcp playwright
claude mcp add pinterest -- python3 "$PWD/tools/pinterest_mcp.py"
```

Ou, por projeto, em `.mcp.json`:

```json
{"mcpServers": {"pinterest": {"command": "python3", "args": ["tools/pinterest_mcp.py"]}}}
```

Ferramentas: `get_pin_info`, `download_pin`, `download_many`, `search_pins`,
`list_board_pins`. Os downloads vão para `PINTEREST_MCP_DIR`
(padrão `./pinterest_refs`) e as ferramentas devolvem os caminhos locais.

## Rede

O Pinterest precisa estar liberado na política de rede do ambiente:
`pin.it`, `pinterest.com`, `br.pinterest.com`, `v.pinimg.com`, `i.pinimg.com`.
A política é aplicada quando o contêiner é criado — depois de alterá-la,
**abra uma sessão nova**; a sessão em andamento continua com a política antiga.
