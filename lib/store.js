// Armazenamento simples em JSON com escrita atômica.
// Guarda usuários (noivos), sessões de login e álbuns com suas mídias.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'albums.json');
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

let db = { albums: {}, users: {}, sessions: {} };

export function init() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    const loaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    db = { albums: {}, users: {}, sessions: {}, ...loaded };
  } else {
    persist();
  }
}

function persist() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// ---------- Usuários (noivos) ----------

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function createUser({ email, password, name }) {
  const normalized = email.trim().toLowerCase();
  if (getUserByEmail(normalized)) return { error: 'Já existe uma conta com este e-mail.' };
  const salt = crypto.randomBytes(16).toString('hex');
  const user = {
    id: crypto.randomBytes(12).toString('hex'),
    email: normalized,
    name: name || null,
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
  db.users[user.id] = user;
  persist();
  return { user };
}

export function getUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return Object.values(db.users).find((u) => u.email === normalized) || null;
}

export function getUserById(id) {
  return db.users[id] || null;
}

export function verifyPassword(user, password) {
  const candidate = Buffer.from(hashPassword(password, user.passwordSalt), 'hex');
  const stored = Buffer.from(user.passwordHash, 'hex');
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}

// ---------- Sessões ----------

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  pruneSessions();
  persist();
  return token;
}

export function getSession(token) {
  const session = token && db.sessions[token];
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    delete db.sessions[token];
    persist();
    return null;
  }
  return session;
}

export function deleteSession(token) {
  if (db.sessions[token]) {
    delete db.sessions[token];
    persist();
  }
}

function pruneSessions() {
  const now = Date.now();
  for (const [token, s] of Object.entries(db.sessions)) {
    if (s.expiresAt < now) delete db.sessions[token];
  }
}

// ---------- Álbuns ----------

export function createAlbum({ ownerId, coupleNames, weddingDate, welcomeMessage }) {
  const base = slugify(coupleNames) || 'casamento';
  let slug = base;
  while (db.albums[slug]) {
    slug = `${base}-${crypto.randomBytes(2).toString('hex')}`;
  }
  const album = {
    slug,
    ownerId,
    coupleNames,
    weddingDate: weddingDate || null,
    welcomeMessage: welcomeMessage || null,
    adminToken: crypto.randomBytes(24).toString('hex'),
    shared: false,
    createdAt: new Date().toISOString(),
    media: [],
  };
  db.albums[slug] = album;
  persist();
  return album;
}

export function getAlbum(slug) {
  return db.albums[slug] || null;
}

export function listAlbumsByOwner(ownerId) {
  return Object.values(db.albums)
    .filter((a) => a.ownerId === ownerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addMedia(slug, media) {
  const album = db.albums[slug];
  if (!album) return null;
  const entry = {
    id: crypto.randomBytes(8).toString('hex'),
    uploadedAt: new Date().toISOString(),
    ...media,
  };
  album.media.push(entry);
  persist();
  return entry;
}

export function setShared(slug, shared) {
  const album = db.albums[slug];
  if (!album) return null;
  album.shared = Boolean(shared);
  persist();
  return album;
}

export function deleteMedia(slug, mediaId) {
  const album = db.albums[slug];
  if (!album) return null;
  const idx = album.media.findIndex((m) => m.id === mediaId);
  if (idx === -1) return null;
  const [removed] = album.media.splice(idx, 1);
  persist();
  return removed;
}
