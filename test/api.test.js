// Testes de ponta a ponta da API: sobe o servidor em uma porta própria
// com diretórios de dados isolados e exercita o fluxo completo.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PORT = 3777;
const BASE = `http://localhost:${PORT}`;
let server;
let tmpDir;

before(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'album-test-'));
  server = spawn('node', ['server.js'], {
    env: {
      ...process.env,
      PORT: String(PORT),
      DATA_DIR: path.join(tmpDir, 'data'),
      UPLOADS_DIR: path.join(tmpDir, 'uploads'),
    },
    stdio: 'ignore',
  });
  // Aguarda o servidor responder.
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(BASE + '/');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error('Servidor não subiu a tempo.');
});

after(() => {
  server.kill();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

let album;

test('cria um álbum e devolve QR, link de convidado e token dos noivos', async () => {
  const res = await fetch(`${BASE}/api/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupleNames: 'Bia & Léo', weddingDate: '2026-10-10' }),
  });
  assert.equal(res.status, 201);
  album = await res.json();
  assert.equal(album.slug, 'bia-leo');
  assert.ok(album.adminToken.length >= 32);
  assert.ok(album.guestUrl.endsWith('/a/bia-leo'));
});

test('recusa criação sem nomes dos noivos', async () => {
  const res = await fetch(`${BASE}/api/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
});

test('gera o QR code em PNG', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/qr.png`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'image/png');
  const buf = Buffer.from(await res.arrayBuffer());
  assert.deepEqual([...buf.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]); // assinatura PNG
});

function uploadForm() {
  const fd = new FormData();
  fd.append('guestName', 'Primo Zé');
  fd.append('caption', 'Valsa dos noivos');
  fd.append('files', new File([Buffer.from('foto-fake')], 'foto.jpg', { type: 'image/jpeg' }));
  fd.append('files', new File([Buffer.from('video-fake')], 'video.mp4', { type: 'video/mp4' }));
  return fd;
}

test('convidado envia foto e vídeo', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`, {
    method: 'POST',
    body: uploadForm(),
  });
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { uploaded: 2 });
});

test('recusa arquivo que não é foto nem vídeo', async () => {
  const fd = new FormData();
  fd.append('files', new File([Buffer.from('x')], 'x.exe', { type: 'application/octet-stream' }));
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`, {
    method: 'POST',
    body: fd,
  });
  assert.equal(res.status, 400);
});

test('galeria fica bloqueada para convidados antes do compartilhamento', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`);
  assert.equal(res.status, 403);
});

test('noivos veem a galeria com o token', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`, {
    headers: { 'x-admin-token': album.adminToken },
  });
  assert.equal(res.status, 200);
  const { media } = await res.json();
  assert.equal(media.length, 2);
  assert.equal(media[0].guestName, 'Primo Zé');
  assert.deepEqual(new Set(media.map((m) => m.type)), new Set(['photo', 'video']));
});

test('token errado não controla o compartilhamento', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/share`, {
    method: 'POST',
    headers: { 'x-admin-token': 'token-invalido', 'Content-Type': 'application/json' },
    body: JSON.stringify({ shared: true }),
  });
  assert.equal(res.status, 403);
});

test('noivos liberam a galeria e os convidados passam a ver tudo', async () => {
  const share = await fetch(`${BASE}/api/albums/${album.slug}/share`, {
    method: 'POST',
    headers: { 'x-admin-token': album.adminToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shared: true }),
  });
  assert.deepEqual(await share.json(), { shared: true });

  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`);
  assert.equal(res.status, 200);
  const { media } = await res.json();
  assert.equal(media.length, 2);

  // O arquivo em si também fica acessível.
  const file = await fetch(`${BASE}${media[0].url}`);
  assert.equal(file.status, 200);
});

test('noivos baixam tudo em um ZIP', async () => {
  const res = await fetch(
    `${BASE}/api/albums/${album.slug}/download.zip?token=${album.adminToken}`
  );
  assert.equal(res.status, 200);
  const buf = Buffer.from(await res.arrayBuffer());
  assert.deepEqual([...buf.subarray(0, 2)], [0x50, 0x4b]); // assinatura ZIP "PK"
});

test('noivos excluem uma mídia', async () => {
  const list = await fetch(`${BASE}/api/albums/${album.slug}/media`).then((r) => r.json());
  const target = list.media[0];
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media/${target.id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': album.adminToken },
  });
  assert.equal(res.status, 200);
  const after = await fetch(`${BASE}/api/albums/${album.slug}/media`).then((r) => r.json());
  assert.equal(after.media.length, 1);
});

test('álbum inexistente devolve 404', async () => {
  const res = await fetch(`${BASE}/api/albums/nao-existe`);
  assert.equal(res.status, 404);
});
