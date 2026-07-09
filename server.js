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
// ID do Meta Pixel (Gerenciador de Anúncios). Vazio = rastreamento desligado.
const META_PIXEL_ID = process.env.META_PIXEL_ID || '';
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB por arquivo (vídeos de celular)

store.init();
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Sessão (cookie) ----------
const SESSION_COOKIE = 'sid';

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

app.use((req, res, next) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  const session = store.getSession(token);
  req.user = session ? store.getUserById(session.userId) : null;
  req.sessionToken = session ? token : null;
  next();
});

function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
  );
}

function requireLogin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Faça login para continuar.' });
  next();
}

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

// Os noivos são reconhecidos pela sessão de login (dono do álbum) ou,
// como reserva, pelo token secreto gerado na criação do álbum.
function isAdmin(req, album) {
  if (req.user && album.ownerId && req.user.id === album.ownerId) return true;
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

// App dos noivos (login, criação e lista de álbuns). A raiz "/" é a landing page.
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// Script do Meta Pixel. Com META_PIXEL_ID vazio, vira um no-op — as páginas
// podem chamar window.fbTrack(...) sem se preocupar se o pixel existe.
app.get('/pixel.js', (req, res) => {
  res.type('application/javascript');
  if (!META_PIXEL_ID) {
    return res.send('window.fbTrack = function () {};');
  }
  res.send(`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
window.fbTrack = function (event, params) { fbq('track', event, params || {}); };`);
});

app.get('/a/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'album.html'));
});

app.get('/admin/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ---------- API: autenticação dos noivos ----------

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 8 caracteres.' });
  }
  const result = store.createUser({
    email,
    password,
    name: name ? String(name).trim().slice(0, 80) : null,
  });
  if (result.error) return res.status(409).json({ error: result.error });
  setSessionCookie(res, store.createSession(result.user.id));
  res.status(201).json({ email: result.user.email, name: result.user.name });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = email && password ? store.getUserByEmail(email) : null;
  if (!user || !store.verifyPassword(user, password)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }
  setSessionCookie(res, store.createSession(user.id));
  res.json({ email: user.email, name: user.name });
});

app.post('/api/auth/logout', (req, res) => {
  if (req.sessionToken) store.deleteSession(req.sessionToken);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
  res.json({ email: req.user.email, name: req.user.name });
});

// Álbuns do casal logado.
app.get('/api/my/albums', requireLogin, (req, res) => {
  const albums = store.listAlbumsByOwner(req.user.id).map((a) => ({
    slug: a.slug,
    coupleNames: a.coupleNames,
    weddingDate: a.weddingDate,
    shared: a.shared,
    mediaCount: a.media.length,
    guestUrl: guestUrl(a),
    adminUrl: `${BASE_URL}/admin/${a.slug}`,
    createdAt: a.createdAt,
  }));
  res.json({ albums });
});

// ---------- API: álbuns ----------

// Cria um novo álbum (exige login dos noivos).
app.post('/api/albums', requireLogin, (req, res) => {
  const { coupleNames, weddingDate, welcomeMessage } = req.body || {};
  if (!coupleNames || !coupleNames.trim()) {
    return res.status(400).json({ error: 'Informe os nomes dos noivos.' });
  }
  const album = store.createAlbum({
    ownerId: req.user.id,
    coupleNames: coupleNames.trim().slice(0, 120),
    weddingDate,
    welcomeMessage: welcomeMessage ? String(welcomeMessage).slice(0, 300) : null,
  });
  res.status(201).json({
    slug: album.slug,
    // Token reserva: dá acesso ao painel mesmo sem login (ex.: emprestar ao cerimonialista).
    backupToken: album.adminToken,
    guestUrl: guestUrl(album),
    adminUrl: `${BASE_URL}/admin/${album.slug}`,
    qrUrl: `${BASE_URL}/api/albums/${album.slug}/qr.png`,
  });
});

// Confirma se quem chama é o casal dono do álbum (sessão ou token reserva).
app.get('/api/albums/:slug/admin-check', (req, res) => {
  const album = findAlbumOr404(req, res);
  if (!album) return;
  if (!isAdmin(req, album)) {
    return res.status(403).json({ error: 'Acesso restrito aos noivos.' });
  }
  res.json({ ok: true });
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
