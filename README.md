# 💍 Álbum do Casamento com QR Code

Sistema de álbum colaborativo para casamentos: os noivos geram um QR code, os
convidados escaneiam e enviam fotos e vídeos durante a cerimônia — sem
instalar nada, sem criar conta. No fim, os noivos veem tudo, baixam em ZIP e
podem liberar a galeria completa para todos os convidados.

## Como funciona

1. **Os noivos criam o álbum** na página inicial (nomes, data e mensagem de
   boas-vindas) e recebem:
   - o **QR code** para imprimir nas mesas ou enviar aos convidados;
   - o **link do convidado** (`/a/<slug>`), o mesmo destino do QR code;
   - o **link secreto do painel dos noivos** (`/admin/<slug>#<token>`).
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

## Testes

```bash
npm test
```

Sobe o servidor em uma porta isolada e exercita o fluxo completo: criação do
álbum, QR code, upload, bloqueio da galeria, compartilhamento, ZIP e exclusão.

## API

| Método   | Rota                                | Acesso            | Descrição                          |
| -------- | ----------------------------------- | ----------------- | ---------------------------------- |
| `POST`   | `/api/albums`                       | público           | Cria o álbum                       |
| `GET`    | `/api/albums/:slug`                 | público           | Dados públicos do álbum            |
| `GET`    | `/api/albums/:slug/qr.png`          | público           | QR code (PNG) do link do convidado |
| `POST`   | `/api/albums/:slug/media`           | público           | Upload de fotos/vídeos             |
| `GET`    | `/api/albums/:slug/media`           | noivos ou liberado| Lista a galeria                    |
| `GET`    | `/media/:slug/:arquivo`             | noivos ou liberado| Serve a foto/vídeo                 |
| `POST`   | `/api/albums/:slug/share`           | só noivos         | Liga/desliga o compartilhamento    |
| `DELETE` | `/api/albums/:slug/media/:id`       | só noivos         | Exclui uma mídia                   |
| `GET`    | `/api/albums/:slug/download.zip`    | só noivos         | Baixa tudo em ZIP                  |

A autenticação dos noivos é feita pelo token gerado na criação do álbum,
enviado no header `x-admin-token` ou no parâmetro `?token=`.

## Limites e observações

- Uploads: fotos e vídeos (`image/*` e `video/*`), até **500 MB por arquivo**
  e 20 arquivos por envio.
- Armazenamento local em disco (JSON + arquivos). Para eventos grandes ou
  hospedagem em múltiplas instâncias, troque `lib/store.js` por um banco e o
  diretório de uploads por um storage de objetos (S3, R2 etc.).
- O link do painel dos noivos carrega o token na URL (`#token`) — trate-o como
  senha e não o compartilhe com os convidados.
