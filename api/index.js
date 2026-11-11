'use strict';
const crypto = require('node:crypto');
const auth = require('../lib/auth');
const { sendLoginEmail } = require('../lib/mail');
const { loginPage, dashboardPage } = require('../lib/views');
const content = require('../content/links.json');

const APP_URL = (process.env.APP_URL || 'https://volt.ermalasllani.eu').replace(/\/$/, '');

// Best-effort throttle: one email per address per minute per warm instance.
const lastSent = new Map();
const THROTTLE_MS = 60 * 1000;

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
      if (raw.length > 4096) break;
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

module.exports = async function handler(req, res) {
  const nonce = crypto.randomBytes(16).toString('base64');
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const user = auth.verifyToken('session', auth.parseCookies(req.headers.cookie)[auth.COOKIE]);

    if (path === '/' && (req.method === 'GET' || req.method === 'HEAD')) {
      if (!user) return redirect(res, '/login');
      return send(res, 200, dashboardPage({ nonce, email: user, sections: content.sections }), nonce);
    }

    if (path === '/login' && (req.method === 'GET' || req.method === 'HEAD')) {
      if (user) return redirect(res, '/');
      return send(res, 200, loginPage({ nonce }), nonce);
    }

    if (path === '/login' && req.method === 'POST') {
      const form = await readForm(req);
      const email = auth.normaliseEmail(form.email);
      if (!email) {
        return send(
          res,
          400,
          loginPage({ nonce, email: String(form.email || '').slice(0, 120), error: 'Please use your @volteuropa.org email address.' }),
          nonce
        );
      }
      const now = Date.now();
      if (now - (lastSent.get(email) || 0) > THROTTLE_MS) {
        lastSent.set(email, now);
        if (lastSent.size > 5000) lastSent.clear();
        const token = auth.createToken('login', email, auth.LOGIN_TTL_S);
        try {
          await sendLoginEmail(email, `${APP_URL}/auth?token=${encodeURIComponent(token)}`);
        } catch (err) {
          lastSent.delete(email);
          console.error('Sign-in email failed:', err);
          return send(
            res,
            502,
            loginPage({ nonce, email, error: 'We could not send the email just now. Please try again in a moment.' }),
            nonce
          );
        }
      }
      return send(res, 200, loginPage({ nonce, sentTo: email }), nonce);
    }

    if (path === '/auth' && req.method === 'GET') {
      const email = auth.verifyToken('login', url.searchParams.get('token'));
      if (!email) {
        return send(
          res,
          400,
          loginPage({ nonce, error: 'That sign-in link is invalid or has expired. Request a new one below.' }),
          nonce
        );
      }
      const session = auth.createToken('session', email, auth.SESSION_TTL_S);
      return redirect(res, '/', { 'Set-Cookie': auth.sessionCookie(session, auth.SESSION_TTL_S) });
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
