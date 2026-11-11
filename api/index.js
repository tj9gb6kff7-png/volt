'use strict';
const crypto = require('node:crypto');
const auth = require('../lib/auth');
const google = require('../lib/google');
const { loginPage, dashboardPage } = require('../lib/views');
const content = require('../content/links.json');

const APP_URL = (process.env.APP_URL || 'https://volt.ermalasllani.eu').replace(/\/$/, '');
const GOOGLE_CALLBACK = '/auth/google/callback';
const NONCE_COOKIE = 'volt_nonce';
// SameSite=None because Google returns to us with a cross-site POST.
const nonceCookie = (value, maxAge) =>
  `${NONCE_COOKIE}=${value}; Path=/auth/google; HttpOnly; Secure; SameSite=None; Max-Age=${maxAge}`;

function send(res, status, html, nonce, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy':
      `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; ` +
      `form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
    ...headers,
  });
  res.end(html);
}

function redirect(res, location, headers = {}) {
  res.writeHead(303, { Location: location, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', ...headers });
  res.end();
}

async function readForm(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let raw = typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  if (!raw && req.readable) {
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 16384) break;
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

module.exports = async function handler(req, res) {
  const nonce = crypto.randomBytes(16).toString('base64');
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const cookies = auth.parseCookies(req.headers.cookie);
    const user = auth.verifyToken('session', cookies[auth.COOKIE]);
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    const login = (opts) => loginPage({ nonce, ...opts });

    if (path === '/' && (req.method === 'GET' || req.method === 'HEAD')) {
      if (!user) return redirect(res, '/login');
      return send(res, 200, dashboardPage({ nonce, email: user, sections: content.sections }), nonce);
    }

    if (path === '/login' && (req.method === 'GET' || req.method === 'HEAD')) {
      if (user) return redirect(res, '/');
      return send(res, 200, login({}), nonce);
    }

    if (path === '/auth/google' && req.method === 'GET') {
      if (!googleClientId) {
        return send(res, 503, login({ error: 'Google sign-in is not set up yet. Please contact the HR team.' }), nonce);
      }
      const n = crypto.randomBytes(24).toString('base64url');
      return redirect(res, google.authUrl({ clientId: googleClientId, redirectUri: APP_URL + GOOGLE_CALLBACK, nonce: n }), {
        'Set-Cookie': nonceCookie(n, 600),
      });
    }

    if (path === GOOGLE_CALLBACK && req.method === 'POST' && googleClientId) {
      const form = await readForm(req);
      const result = await google.verifyIdToken(form.id_token, { clientId: googleClientId, nonce: cookies[NONCE_COOKIE] });
      if (!result.email) {
        const error =
          result.error === 'domain'
            ? 'That Google account is not an @volteuropa.org account. Please sign in with your Volt account.'
            : 'Google sign-in did not complete. Please try again.';
        return send(res, 403, login({ error }), nonce, { 'Set-Cookie': nonceCookie('', 0) });
      }
      const session = auth.createToken('session', result.email, auth.SESSION_TTL_S);
      return redirect(res, '/', { 'Set-Cookie': [auth.sessionCookie(session, auth.SESSION_TTL_S), nonceCookie('', 0)] });
    }

    if (path === '/logout' && req.method === 'POST') {
      return redirect(res, '/login', { 'Set-Cookie': auth.sessionCookie('', 0) });
    }

    return redirect(res, user ? '/' : '/login');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Something went wrong. Please try again later.');
  }
};
