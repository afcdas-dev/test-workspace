// Armazenamento simples em JSON com escrita atômica.
// Cada álbum guarda seus metadados e a lista de mídias enviadas.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'albums.json');

let db = { albums: {} };

export function init() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
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

export function createAlbum({ coupleNames, weddingDate, welcomeMessage }) {
  const base = slugify(coupleNames) || 'casamento';
  let slug = base;
  while (db.albums[slug]) {
    slug = `${base}-${crypto.randomBytes(2).toString('hex')}`;
  }
  const album = {
    slug,
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
