# 💍 Álbum do Casamento com QR Code

Sistema de álbum colaborativo para casamentos: os noivos geram um QR code, os
convidados escaneiam e enviam fotos e vídeos durante a cerimônia — sem
instalar nada, sem criar conta. No fim, os noivos veem tudo, baixam em ZIP e
podem liberar a galeria completa para todos os convidados.

## Páginas

- `/` — **landing page de vendas** (planos, FAQ, CTAs) para campanhas de tráfego pago;
- `/app` — app dos noivos (login, criação e lista de álbuns);
- `/a/<slug>` — página do convidado (destino do QR code);
- `/admin/<slug>` — painel dos noivos.

Com `META_PIXEL_ID` definido, todas as páginas disparam `PageView` e o funil
registra `Lead` (clique no CTA da landing), `InitiateCheckout` (escolha de
plano) e `CompleteRegistration` (conta criada) no Meta Pixel.

## Como funciona

1. **Os noivos criam uma conta** (e-mail e senha) e, logados, **criam o álbum**
   (nomes, data e mensagem de boas-vindas). Eles recebem:
   - o **QR code** para imprimir nas mesas ou enviar aos convidados;
   - o **link do convidado** (`/a/<slug>`), o mesmo destino do QR code;
   - o **painel dos noivos** (`/admin/<slug>`), acessível sempre que estiverem
     logados; a lista "Meus álbuns" na página inicial leva até ele.
2. **Os convidados escaneiam o QR code** e caem direto na página de upload:
   informam o nome, uma legenda opcional e enviam fotos e vídeos do celular.
3. **Os noivos acompanham tudo pelo painel**: galeria completa com fotos e
   vídeos, exclusão de itens indesejados e download de tudo em um único ZIP.
4. **Compartilhar com todo mundo**: um botão no painel libera a galeria — a
   partir daí, qualquer convidado com o QR code também vê todas as fotos e
   vídeos.

## Rodando

```bash
npm install
npm start          # http://localhost:3000
```

Em produção, defina `BASE_URL` com o domínio público — é esse endereço que
vai dentro do QR code:

```bash
BASE_URL=https://album.exemplo.com PORT=3000 npm start
```

Variáveis de ambiente:

| Variável      | Padrão                  | Descrição                                  |
| ------------- | ----------------------- | ------------------------------------------ |
| `PORT`        | `3000`                  | Porta do servidor                          |
| `BASE_URL`    | `http://localhost:PORT` | URL pública usada no QR code e nos links   |
| `DATA_DIR`    | `./data`                | Onde ficam os metadados dos álbuns (JSON)  |
| `UPLOADS_DIR` | `./uploads`             | Onde ficam as fotos e vídeos enviados      |
| `META_PIXEL_ID` | *(vazio)*             | ID do Meta Pixel (Facebook Ads); vazio desliga o rastreamento |
| `FAL_KEY`     | *(vazio)*               | Chave da API do Fal AI (`id:segredo`); vazio desliga a geração de imagens |
| `FAL_MODEL`   | `fal-ai/flux/schnell`   | Modelo do Fal AI usado na geração de imagens |

As variáveis também podem ficar em um arquivo `.env` na raiz (ignorado pelo
git) — copie o `.env.example` e preencha. Variáveis já definidas no ambiente
têm prioridade sobre o arquivo.

## Testes

```bash
npm test
```

Sobe o servidor em uma porta isolada e exercita o fluxo completo: criação do
álbum, QR code, upload, bloqueio da galeria, compartilhamento, ZIP e exclusão.

## API

| Método   | Rota                                | Acesso            | Descrição                          |
| -------- | ----------------------------------- | ----------------- | ---------------------------------- |
| `POST`   | `/api/auth/register`                | público           | Cria a conta dos noivos            |
| `POST`   | `/api/auth/login`                   | público           | Login (cookie de sessão)           |
| `POST`   | `/api/auth/logout`                  | logado            | Encerra a sessão                   |
| `GET`    | `/api/auth/me`                      | logado            | Dados do casal logado              |
| `GET`    | `/api/my/albums`                    | logado            | Lista os álbuns do casal           |
| `POST`   | `/api/albums`                       | logado            | Cria o álbum                       |
| `GET`    | `/api/albums/:slug`                 | público           | Dados públicos do álbum            |
| `GET`    | `/api/albums/:slug/qr.png`          | público           | QR code (PNG) do link do convidado |
| `POST`   | `/api/albums/:slug/media`           | público           | Upload de fotos/vídeos             |
| `GET`    | `/api/albums/:slug/media`           | noivos ou liberado| Lista a galeria                    |
| `GET`    | `/media/:slug/:arquivo`             | noivos ou liberado| Serve a foto/vídeo                 |
| `POST`   | `/api/albums/:slug/share`           | só noivos         | Liga/desliga o compartilhamento    |
| `DELETE` | `/api/albums/:slug/media/:id`       | só noivos         | Exclui uma mídia                   |
| `GET`    | `/api/albums/:slug/download.zip`    | só noivos         | Baixa tudo em ZIP                  |
| `GET`    | `/api/albums/:slug/admin-check`     | só noivos         | Confirma acesso de dono            |
| `POST`   | `/api/ai/images`                    | logado            | Gera imagem com IA (Fal AI)        |

Os noivos são autenticados pela **sessão de login** (cookie `sid`, senha com
scrypt). Cada álbum também tem um **token reserva** (devolvido na criação como
`backupToken`), aceito no header `x-admin-token` ou no parâmetro `?token=` —
útil para emprestar o painel a um cerimonialista sem entregar a conta.
Convidados nunca precisam de login.

## Imagens com IA (Fal AI)

Com `FAL_KEY` definida, os noivos logados podem gerar imagens com IA — por
exemplo, uma arte para o convite ou a capa do álbum:

```bash
curl -X POST http://localhost:3000/api/ai/images \
  -H 'Content-Type: application/json' -b 'sid=<sessão>' \
  -d '{"prompt": "convite de casamento em aquarela com flores"}'
```

A resposta traz as URLs das imagens geradas (hospedadas pelo Fal). A chamada
usa o endpoint síncrono `https://fal.run/<modelo>` com o modelo definido em
`FAL_MODEL`. A chave é usada **somente no servidor** — nunca chega ao
navegador — e deve ficar no ambiente ou no `.env` (ignorado pelo git).

## Limites e observações

- Uploads: fotos e vídeos (`image/*` e `video/*`), até **500 MB por arquivo**
  e 20 arquivos por envio.
- Armazenamento local em disco (JSON + arquivos). Para eventos grandes ou
  hospedagem em múltiplas instâncias, troque `lib/store.js` por um banco e o
  diretório de uploads por um storage de objetos (S3, R2 etc.).
- O link do painel dos noivos carrega o token na URL (`#token`) — trate-o como
  senha e não o compartilhe com os convidados.
