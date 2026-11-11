'use strict';
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

process.env.SESSION_SECRET = 'test-secret-test-secret-test-secret-1234';
process.env.APP_URL = 'https://hub.example';
const sent = [];
require('../lib/mail').sendLoginEmail = async (email, link) => sent.push({ email, link });
const auth = require('../lib/auth');
const handler = require('../api/index');

let base;
const server = http.createServer(handler);
test.before(() => new Promise((r) => server.listen(0, () => ((base = `http://localhost:${server.address().port}`), r()))));
test.after(() => server.close());

const get = (path, cookie) => fetch(base + path, { redirect: 'manual', headers: cookie ? { cookie } : {} });
const post = (path, body) =>
  fetch(base + path, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });

test('only @volteuropa.org addresses are accepted', () => {
  assert.equal(auth.normaliseEmail('  Jane.Doe@VoltEuropa.org '), 'jane.doe@volteuropa.org');
  for (const bad of ['a@gmail.com', 'a@volteuropa.org.evil.com', 'a@evilvolteuropa.org', 'a@sub.volteuropa.org',
    'a@b@volteuropa.org', 'a\n@volteuropa.org', '@volteuropa.org', 'a b@volteuropa.org', null, 42]) {
    assert.equal(auth.normaliseEmail(bad), null, String(bad));
  }
});

test('tokens: tampering, wrong kind and expiry are rejected', () => {
  const t = auth.createToken('login', 'a@volteuropa.org', 60);
  assert.equal(auth.verifyToken('login', t), 'a@volteuropa.org');
  assert.equal(auth.verifyToken('session', t), null);
  assert.equal(auth.verifyToken('login', t, Date.now() + 61_000), null);
  const forged = Buffer.from(JSON.stringify({ k: 'login', e: 'x@volteuropa.org', x: 9e9 })).toString('base64url');
  assert.equal(auth.verifyToken('login', `${forged}.${t.split('.')[1]}`), null);
  assert.equal(auth.verifyToken('login', forged), null);
});

test('dashboard is not served without a session', async () => {
  const res = await get('/');
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/login');
  assert.ok(!(await res.text()).includes('docs.google.com'));
  const forged = await get('/', `${auth.COOKIE}=abc.def`);
  assert.equal(forged.status, 303);
});

test('outside addresses get no email', async () => {
  const res = await post('/login', { email: 'someone@gmail.com' });
  assert.equal(res.status, 400);
  assert.equal(sent.length, 0);
});

test('full sign-in flow, then sign out', async () => {
  const res = await post('/login', { email: 'Jane.Doe@volteuropa.org' });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Check your inbox/);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].email, 'jane.doe@volteuropa.org');
  assert.ok(sent[0].link.startsWith('https://hub.example/auth?token='));

  await post('/login', { email: 'jane.doe@volteuropa.org' });
  assert.equal(sent.length, 1, 'second request within a minute is throttled');

  const cb = await get(sent[0].link.replace('https://hub.example', ''));
  assert.equal(cb.status, 303);
  const cookie = cb.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);

  const dash = await get('/', cookie.split(';')[0]);
  assert.equal(dash.status, 200);
  const html = await dash.text();
  assert.match(html, /jane\.doe@volteuropa\.org/);
  for (const needle of ['1FAIpQLScnOkQToJZAFIuOlcZ1M36R1uC4fhKI9TNSbEPOsx2i_n9mew', '10exjbq0D4FHgswb_Hcrehf5GG5CzCNvE',
    'YkceB6IzNms', 'mailto:help@volteuropa.org', 'mailto:humanresources@volteuropa.org', 'forms.gle/xpHpnL5VRBWPnnkz5',
    '1FAIpQLSfcAw2oqsbtIEezEXNIN5EiOCVaswLgiQXtWGz57zP1raTOGA', 'panel-staff', 'panel-volunteers']) {
    assert.ok(html.includes(needle), needle);
  }

  const out = await fetch(base + '/logout', { method: 'POST', redirect: 'manual' });
  assert.match(out.headers.get('set-cookie'), /Max-Age=0/);
});

test('bad sign-in link shows an error', async () => {
  const res = await get('/auth?token=nope');
  assert.equal(res.status, 400);
  assert.equal(res.headers.get('set-cookie'), null);
});
