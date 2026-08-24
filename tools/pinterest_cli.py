#!/usr/bin/env python3
"""pinterest-cli — busca referências de vídeo/imagem no Pinterest.

Comandos:
  resolve  <url>            Resolve um link curto pin.it para a URL completa do pin
  info     <url>            Extrai metadados do pin (título, descrição, mídia)
  download <url> [-o DIR]   Baixa o vídeo (ou imagem) do pin
  board    <url> [--limit]  Lista os pins iniciais de um board
  batch    <arquivo> [-o]   Baixa todos os links de um arquivo (um por linha)

Exemplos:
  pinterest_cli.py resolve https://pin.it/5TU9t2743
  pinterest_cli.py download https://br.pinterest.com/pin/123456/ -o refs/
  pinterest_cli.py batch links.txt -o refs/

Notas:
- Usa apenas a biblioteca padrão do Python; se o yt-dlp estiver instalado,
  ele é preferido para download (lida com HLS). Sem ele, baixa o MP4 direto.
- Respeita HTTPS_PROXY/SSL_CERT_FILE do ambiente automaticamente.
- Uso destinado a coleta de referências para análise interna. Respeite os
  termos de uso do Pinterest e direitos autorais dos criadores.
"""

import argparse
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
import urllib.request
from html import unescape
from pathlib import Path

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

PIN_URL_RE = re.compile(r"https?://(?:[a-z]+\.)?pinterest\.[a-z.]+/pin/(\d+)")
SHORT_URL_RE = re.compile(r"https?://pin\.it/\w+")
VIDEO_MP4_RE = re.compile(r"https://v\.pinimg\.com/videos/[^\"'\\\s]+?\.mp4")
IMAGE_ORIG_RE = re.compile(r"https://i\.pinimg\.com/originals/[^\"'\\\s]+?\.(?:jpg|jpeg|png|gif|webp)")


def _ssl_context() -> ssl.SSLContext:
    cafile = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
    if cafile and Path(cafile).exists():
        return ssl.create_default_context(cafile=cafile)
    return ssl.create_default_context()


def fetch(url: str, *, binary: bool = False, timeout: int = 30):
    """GET com user-agent de navegador; segue redirects. Retorna (final_url, corpo)."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout, context=_ssl_context()) as resp:
        body = resp.read()
        final_url = resp.geturl()
    return final_url, (body if binary else body.decode("utf-8", errors="replace"))


def resolve_url(url: str) -> str:
    """Resolve pin.it (ou qualquer URL) até a URL final do pin."""
    if SHORT_URL_RE.match(url):
        final_url, _ = fetch(url)
        return final_url
    return url


def _jsonld_video(html: str):
    """Extrai VideoObject de blocos JSON-LD, se houver."""
    for m in re.finditer(
        r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S
    ):
        try:
            data = json.loads(unescape(m.group(1)))
        except json.JSONDecodeError:
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and item.get("@type") == "VideoObject":
                return item
    return None


def _meta(html: str, prop: str):
    m = re.search(
        rf'<meta[^>]+(?:property|name)="{re.escape(prop)}"[^>]+content="([^"]*)"', html
    ) or re.search(
        rf'<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="{re.escape(prop)}"', html
    )
    return unescape(m.group(1)) if m else None


def pin_info(url: str) -> dict:
    """Extrai metadados e URLs de mídia de uma página de pin."""
    final_url, html = fetch(resolve_url(url))
    info = {
        "pin_url": final_url,
        "pin_id": (PIN_URL_RE.search(final_url) or [None, None])[1]
        if PIN_URL_RE.search(final_url)
        else None,
        "title": _meta(html, "og:title"),
        "description": _meta(html, "og:description"),
        "video_urls": [],
        "image_urls": [],
    }
    ld = _jsonld_video(html)
    if ld and ld.get("contentUrl"):
        info["video_urls"].append(ld["contentUrl"])
    og_video = _meta(html, "og:video") or _meta(html, "og:video:url")
    if og_video:
        info["video_urls"].append(og_video)
    info["video_urls"] += VIDEO_MP4_RE.findall(html)
    og_image = _meta(html, "og:image")
    if og_image:
        info["image_urls"].append(og_image)
    info["image_urls"] += IMAGE_ORIG_RE.findall(html)
    # dedup preservando ordem; MP4s de maior resolução costumam vir primeiro no HTML
    info["video_urls"] = list(dict.fromkeys(info["video_urls"]))
    info["image_urls"] = list(dict.fromkeys(info["image_urls"]))
    return info


def download_pin(url: str, out_dir: Path) -> Path:
    """Baixa a mídia de um pin. Prefere yt-dlp; senão MP4/imagem direto."""
    out_dir.mkdir(parents=True, exist_ok=True)
    pin_url = resolve_url(url)
    pin_id_m = PIN_URL_RE.search(pin_url)
    stem = f"pin-{pin_id_m.group(1)}" if pin_id_m else "pin"

    if shutil.which("yt-dlp"):
        out_tpl = str(out_dir / f"{stem}.%(ext)s")
        r = subprocess.run(
            ["yt-dlp", "--no-playlist", "-o", out_tpl, pin_url],
            capture_output=True,
            text=True,
        )
        if r.returncode == 0:
            for p in sorted(out_dir.glob(f"{stem}.*"), key=lambda p: -p.stat().st_size):
                return p
        print(f"  yt-dlp falhou ({r.returncode}), tentando extração direta…", file=sys.stderr)

    info = pin_info(pin_url)
    candidates = [u for u in info["video_urls"] if u.endswith(".mp4")] or info["image_urls"]
    if not candidates:
        raise RuntimeError(f"Nenhuma mídia encontrada em {pin_url}")
    media_url = candidates[0]
    ext = Path(media_url.split("?")[0]).suffix or ".bin"
    dest = out_dir / f"{stem}{ext}"
    _, data = fetch(media_url, binary=True, timeout=120)
    dest.write_bytes(data)
    return dest


def board_pins(url: str, limit: int = 25) -> list:
    """Lista os pins presentes no HTML inicial de um board (sem paginação)."""
    _, html = fetch(resolve_url(url))
    ids = list(dict.fromkeys(re.findall(r'"/pin/(\d+)/?"', html)))[:limit]
    return [f"https://www.pinterest.com/pin/{i}/" for i in ids]


def main(argv=None):
    ap = argparse.ArgumentParser(prog="pinterest-cli", description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("resolve", help="resolve link curto pin.it")
    p.add_argument("url")

    p = sub.add_parser("info", help="metadados e URLs de mídia do pin")
    p.add_argument("url")

    p = sub.add_parser("download", help="baixa o vídeo/imagem do pin")
    p.add_argument("url")
    p.add_argument("-o", "--out", default="pinterest_refs", help="pasta de saída")

    p = sub.add_parser("board", help="lista pins iniciais de um board")
    p.add_argument("url")
    p.add_argument("--limit", type=int, default=25)

    p = sub.add_parser("batch", help="baixa todos os links de um arquivo")
    p.add_argument("file")
    p.add_argument("-o", "--out", default="pinterest_refs")

    args = ap.parse_args(argv)
    try:
        if args.cmd == "resolve":
            print(resolve_url(args.url))
        elif args.cmd == "info":
            print(json.dumps(pin_info(args.url), indent=2, ensure_ascii=False))
        elif args.cmd == "download":
            dest = download_pin(args.url, Path(args.out))
            print(f"OK {dest} ({dest.stat().st_size} bytes)")
        elif args.cmd == "board":
            for u in board_pins(args.url, args.limit):
                print(u)
        elif args.cmd == "batch":
            links = [
                ln.strip()
                for ln in Path(args.file).read_text().splitlines()
                if ln.strip() and not ln.startswith("#")
            ]
            ok = 0
            for i, link in enumerate(links, 1):
                print(f"[{i}/{len(links)}] {link}")
                try:
                    dest = download_pin(link, Path(args.out))
                    print(f"  OK {dest}")
                    ok += 1
                except Exception as e:  # noqa: BLE001 — batch segue nos demais links
                    print(f"  ERRO {e}", file=sys.stderr)
            print(f"Concluído: {ok}/{len(links)}")
            return 0 if ok == len(links) else 1
    except urllib.error.URLError as e:
        print(
            f"Erro de rede: {e.reason}\n"
            "Se estiver no Claude Code remoto, a política de rede do ambiente "
            "precisa permitir pin.it, pinterest.com e v.pinimg.com.",
            file=sys.stderr,
        )
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
