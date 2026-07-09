// Testes de ponta a ponta da API: sobe o servidor em uma porta própria
// com diretórios de dados isolados e exercita o fluxo completo,
// incluindo o login dos noivos.
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
      META_PIXEL_ID: '1234567890',
    },
    stdio: 'ignore',
  });
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

let cookie; // sessão dos noivos
let album;

function authed(extra = {}) {
  return { ...extra, cookie };
}

test('criar álbum sem login é recusado', async () => {
  const res = await fetch(`${BASE}/api/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupleNames: 'Bia & Léo' }),
  });
  assert.equal(res.status, 401);
});

test('noivos criam conta e recebem sessão', async () => {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bia', email: 'bia@example.com', password: 'segredo123' }),
  });
  assert.equal(res.status, 201);
  cookie = res.headers.get('set-cookie').split(';')[0];
  assert.match(cookie, /^sid=/);
});

test('cadastro recusa senha curta e e-mail repetido', async () => {
  const curta = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'x@example.com', password: '123' }),
  });
  assert.equal(curta.status, 400);

  const repetido = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bia@example.com', password: 'outrasenha1' }),
  });
  assert.equal(repetido.status, 409);
});

test('login com senha errada falha; com a certa funciona', async () => {
  const errada = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bia@example.com', password: 'senha-errada' }),
  });
  assert.equal(errada.status, 401);

  const certa = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bia@example.com', password: 'segredo123' }),
  });
  assert.equal(certa.status, 200);
  assert.equal((await certa.json()).email, 'bia@example.com');
});

test('sessão identifica o casal em /api/auth/me', async () => {
  const res = await fetch(`${BASE}/api/auth/me`, { headers: authed() });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).name, 'Bia');
});

test('logados, os noivos criam o álbum', async () => {
  const res = await fetch(`${BASE}/api/albums`, {
    method: 'POST',
    headers: authed({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ coupleNames: 'Bia & Léo', weddingDate: '2026-10-10' }),
  });
  assert.equal(res.status, 201);
  album = await res.json();
  assert.equal(album.slug, 'bia-leo');
  assert.ok(album.guestUrl.endsWith('/a/bia-leo'));
  assert.ok(album.backupToken.length >= 32);
});

test('o álbum aparece em "Meus álbuns"', async () => {
  const res = await fetch(`${BASE}/api/my/albums`, { headers: authed() });
  assert.equal(res.status, 200);
  const { albums } = await res.json();
  assert.equal(albums.length, 1);
  assert.equal(albums[0].slug, 'bia-leo');
});

test('gera o QR code em PNG', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/qr.png`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'image/png');
  const buf = Buffer.from(await res.arrayBuffer());
  assert.deepEqual([...buf.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test('convidado envia foto e vídeo sem precisar de login', async () => {
  const fd = new FormData();
  fd.append('guestName', 'Primo Zé');
  fd.append('caption', 'Valsa dos noivos');
  fd.append('files', new File([Buffer.from('foto-fake')], 'foto.jpg', { type: 'image/jpeg' }));
  fd.append('files', new File([Buffer.from('video-fake')], 'video.mp4', { type: 'video/mp4' }));
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`, { method: 'POST', body: fd });
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { uploaded: 2 });
});

test('recusa arquivo que não é foto nem vídeo', async () => {
  const fd = new FormData();
  fd.append('files', new File([Buffer.from('x')], 'x.exe', { type: 'application/octet-stream' }));
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`, { method: 'POST', body: fd });
  assert.equal(res.status, 400);
});

test('galeria fica bloqueada para convidados antes do compartilhamento', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`);
  assert.equal(res.status, 403);
});

test('noivos logados veem a galeria', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`, { headers: authed() });
  assert.equal(res.status, 200);
  const { media } = await res.json();
  assert.equal(media.length, 2);
  assert.equal(media[0].guestName, 'Primo Zé');
});

test('o token reserva também dá acesso (sem sessão)', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`, {
    headers: { 'x-admin-token': album.backupToken },
  });
  assert.equal(res.status, 200);
});

test('outra conta logada não é admin do álbum alheio', async () => {
  const reg = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'intruso@example.com', password: 'senha-forte-1' }),
  });
  const otherCookie = reg.headers.get('set-cookie').split(';')[0];
  const res = await fetch(`${BASE}/api/albums/${album.slug}/admin-check`, {
    headers: { cookie: otherCookie },
  });
  assert.equal(res.status, 403);
});

test('noivos liberam a galeria e os convidados passam a ver tudo', async () => {
  const share = await fetch(`${BASE}/api/albums/${album.slug}/share`, {
    method: 'POST',
    headers: authed({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ shared: true }),
  });
  assert.deepEqual(await share.json(), { shared: true });

  const res = await fetch(`${BASE}/api/albums/${album.slug}/media`);
  assert.equal(res.status, 200);
  const { media } = await res.json();
  assert.equal(media.length, 2);

  const file = await fetch(`${BASE}${media[0].url}`);
  assert.equal(file.status, 200);
});

test('mesmo com a galeria liberada, o admin-check continua restrito', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/admin-check`);
  assert.equal(res.status, 403);
});

test('noivos baixam tudo em um ZIP', async () => {
  const res = await fetch(`${BASE}/api/albums/${album.slug}/download.zip`, {
    headers: authed(),
  });
  assert.equal(res.status, 200);
  const buf = Buffer.from(await res.arrayBuffer());
  assert.deepEqual([...buf.subarray(0, 2)], [0x50, 0x4b]);
});

test('noivos excluem uma mídia', async () => {
  const list = await fetch(`${BASE}/api/albums/${album.slug}/media`).then((r) => r.json());
  const target = list.media[0];
  const res = await fetch(`${BASE}/api/albums/${album.slug}/media/${target.id}`, {
    method: 'DELETE',
    headers: authed(),
  });
  assert.equal(res.status, 200);
  const after = await fetch(`${BASE}/api/albums/${album.slug}/media`).then((r) => r.json());
  assert.equal(after.media.length, 1);
});

test('logout encerra a sessão', async () => {
  await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: authed() });
  const res = await fetch(`${BASE}/api/auth/me`, { headers: authed() });
  assert.equal(res.status, 401);
});

test('álbum inexistente devolve 404', async () => {
  const res = await fetch(`${BASE}/api/albums/nao-existe`);
  assert.equal(res.status, 404);
});

test('a raiz serve a landing page de vendas', async () => {
  const res = await fetch(`${BASE}/`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Criar meu álbum grátis/);
  assert.match(html, /pixel\.js/);
});

test('/app serve o app dos noivos (login)', async () => {
  const res = await fetch(`${BASE}/app`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Criar conta/);
});

test('pixel.js carrega o Meta Pixel com o ID configurado', async () => {
  const res = await fetch(`${BASE}/pixel.js`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /javascript/);
  const js = await res.text();
  assert.match(js, /1234567890/);
  assert.match(js, /CompleteRegistration|fbTrack/);
});
