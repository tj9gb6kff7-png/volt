'use strict';
const crypto = require('node:crypto');

const ALLOWED_DOMAIN = 'volteuropa.org';
const EMAIL_RE = /^[a-z0-9][a-z0-9._%+-]{0,63}@volteuropa\.org$/;
const SESSION_TTL_S = 30 * 24 * 60 * 60;
const COOKIE = 'volt_session';

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET is missing or too short');
  return s;
}

/** Returns the normalised address if it is an @volteuropa.org email, else null. */
function normaliseEmail(input) {
  if (typeof input !== 'string') return null;
  const email = input.trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : null;
}

function sign(data) {
  return crypto.createHmac('sha256', secret()).update(data).digest('base64url');
}

function createToken(kind, email, ttlSeconds, now = Date.now()) {
  const body = Buffer.from(
    JSON.stringify({ k: kind, e: email, x: Math.floor(now / 1000) + ttlSeconds })
  ).toString('base64url');
  return `${body}.${sign(body)}`;
}

/** Returns the email if the token is authentic, unexpired and of the right kind. */
function verifyToken(kind, token, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 1024) return null;
  const [body, sig, extra] = token.split('.');
  if (!body || !sig || extra !== undefined) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (payload.k !== kind || typeof payload.x !== 'number' || payload.x * 1000 < now) return null;
  return normaliseEmail(payload.e);
}

function parseCookies(header) {
  const out = {};
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

function sessionCookie(value, maxAge) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

module.exports = {
  ALLOWED_DOMAIN,
  SESSION_TTL_S,
  COOKIE,
  normaliseEmail,
  createToken,
  verifyToken,
  parseCookies,
  sessionCookie,
};
