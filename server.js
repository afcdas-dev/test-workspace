import express from 'express';
import multer from 'multer';
import QRCode from 'qrcode';
import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as store from './lib/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
// BASE_URL define o endereço que vai dentro do QR code (em produção, o domínio público).
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB por arquivo (vídeos de celular)

store.init();
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Upload (multer) ----------
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(UPLOADS_DIR, req.params.slug);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 20 },
  fileFilter(req, file, cb) {
    if (/^(image|video)\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Apenas fotos e vídeos são permitidos.'));
  },
});

// ---------- Helpers ----------
function findAlbumOr404(req, res) {
  const album = store.getAlbum(req.params.slug);
  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado.' });
    return null;
  }
  return album;
}

function isAdmin(req, album) {
  const token = req.get('x-admin-token') || req.query.token;
  return Boolean(
    token &&
      token.length === album.adminToken.length &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(album.adminToken))
  );
}

function publicMedia(album) {
  return album.media.map((m) => ({
    id: m.id,
    type: m.type,
    guestName: m.guestName,
    caption: m.caption,
    uploadedAt: m.uploadedAt,
    url: `/media/${album.slug}/${m.filename}`,
  }));
}

function guestUrl(album) {
  return `${BASE_URL}/a/${album.slug}`;
}

// ---------- Páginas ----------
app.get('/a/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'album.html'));
});

app.get('/admin/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ---------- API ----------

// Cria um novo álbum (usado pelos noivos).
app.post('/api/albums', (req, res) => {
  const { coupleNames, weddingDate, welcomeMessage } = req.body || {};
  if (!coupleNames || !coupleNames.trim()) {
    return res.status(400).json({ error: 'Informe os nomes dos noivos.' });
  }
  const album = store.createAlbum({
    coupleNames: coupleNames.trim().slice(0, 120),
    weddingDate,
    welcomeMessage: welcomeMessage ? String(welcomeMessage).slice(0, 300) : null,
  });
  res.status(201).json({
    slug: album.slug,
    adminToken: album.adminToken,
    guestUrl: guestUrl(album),
    adminUrl: `${BASE_URL}/admin/${album.slug}#${album.adminToken}`,
    qrUrl: `${BASE_URL}/api/albums/${album.slug}/qr.png`,
  });
});

// Informações públicas do álbum (o que o convidado vê).
app.get('/api/albums/:slug', (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  res.json({
    slug: album.slug,
    coupleNames: album.coupleNames,
    weddingDate: album.weddingDate,
    welcomeMessage: album.welcomeMessage,
    shared: album.shared,
    mediaCount: album.media.length,
  });
});

// QR code em PNG apontando para a página do convidado.
app.get('/api/albums/:slug/qr.png', async (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  const png = await QRCode.toBuffer(guestUrl(album), {
    type: 'png',
    width: 640,
    margin: 2,
    color: { dark: '#3d2c29', light: '#fffaf5' },
  });
  res.type('png').send(png);
});

// Upload de fotos/vídeos pelo convidado.
app.post('/api/albums/:slug/media', (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Arquivo muito grande (limite de 500 MB).'
          : err.message || 'Falha no upload.';
      return res.status(400).json({ error: msg });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const guestName = (req.body.guestName || 'Convidado(a)').trim().slice(0, 60);
    const caption = (req.body.caption || '').trim().slice(0, 200) || null;
    const saved = req.files.map((f) =>
      store.addMedia(album.slug, {
        filename: f.filename,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
        type: f.mimetype.startsWith('video/') ? 'video' : 'photo',
        guestName,
        caption,
      })
    );
    res.status(201).json({ uploaded: saved.length });
  });
});

// Lista as mídias: liberado para os noivos (token) ou para todos se o álbum foi compartilhado.
app.get('/api/albums/:slug/media', (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  if (!album.shared && !isAdmin(req, album)) {
    return res.status(403).json({
      error: 'A galeria ainda não foi liberada pelos noivos.',
    });
  }
  res.json({ media: publicMedia(album) });
});

// Liga/desliga o compartilhamento da galeria com os convidados (só noivos).
app.post('/api/albums/:slug/share', (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  if (!isAdmin(req, album)) {
    return res.status(403).json({ error: 'Acesso restrito aos noivos.' });
  }
  const updated = store.setShared(album.slug, req.body?.shared);
  res.json({ shared: updated.shared });
});

// Remove uma mídia (só noivos).
app.delete('/api/albums/:slug/media/:mediaId', (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  if (!isAdmin(req, album)) {
    return res.status(403).json({ error: 'Acesso restrito aos noivos.' });
  }
  const removed = store.deleteMedia(album.slug, req.params.mediaId);
  if (!removed) return res.status(404).json({ error: 'Mídia não encontrada.' });
  fs.rm(path.join(UPLOADS_DIR, album.slug, removed.filename), () => {});
  res.json({ deleted: true });
});

// Baixa todas as mídias em um ZIP (só noivos).
app.get('/api/albums/:slug/download.zip', (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  if (!isAdmin(req, album)) {
    return res.status(403).json({ error: 'Acesso restrito aos noivos.' });
  }
  res.attachment(`album-${album.slug}.zip`);
  const archive = archiver('zip', { zlib: { level: 1 } });
  archive.on('error', () => res.destroy());
  archive.pipe(res);
  for (const m of album.media) {
    const file = path.join(UPLOADS_DIR, album.slug, m.filename);
    if (fs.existsSync(file)) {
      const ext = path.extname(m.filename);
      const safeGuest = m.guestName.replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'convidado';
      archive.file(file, { name: `${safeGuest}-${m.id}${ext}` });
    }
  }
  archive.finalize();
});

// Serve o arquivo de mídia: noivos sempre podem; convidados só depois do compartilhamento.
app.get('/media/:slug/:filename', (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  if (!album.shared && !isAdmin(req, album)) {
    return res.status(403).json({ error: 'A galeria ainda não foi liberada.' });
  }
  const media = album.media.find((m) => m.filename === req.params.filename);
  if (!media) return res.status(404).json({ error: 'Arquivo não encontrado.' });
  res.sendFile(path.join(UPLOADS_DIR, album.slug, media.filename), {
    headers: { 'Content-Type': media.mimeType },
  });
});

app.listen(PORT, () => {
  console.log(`Álbum de casamento rodando em ${BASE_URL}`);
});

export default app;
