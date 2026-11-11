'use strict';
const crypto = require('node:crypto');
const { normaliseEmail, ALLOWED_DOMAIN } = require('./auth');

const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
let cache = { keys: [], until: 0 };

/** Google's public signing keys (JWKS), cached for an hour. */
async function fetchKeys() {
  if (Date.now() < cache.until) return cache.keys;
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!res.ok) throw new Error(`Google certs responded ${res.status}`);
  cache = { keys: (await res.json()).keys || [], until: Date.now() + 60 * 60 * 1000 };
  return cache.keys;
}

function authUrl({ clientId, redirectUri, nonce }) {
  return (
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      response_mode: 'form_post',
      scope: 'openid email',
      nonce,
      hd: ALLOWED_DOMAIN,
    })
  );
}

/**
 * Verifies a Google ID token. Returns { email } for a verified @volteuropa.org
 * Workspace account, { error: 'domain' } for any other Google account, and
 * { error: 'invalid' } when the token cannot be trusted.
 */
async function verifyIdToken(idToken, { clientId, nonce, now = Date.now() }) {
  const invalid = { error: 'invalid' };
  if (typeof idToken !== 'string' || idToken.length > 8192) return invalid;
  const parts = idToken.split('.');
  if (parts.length !== 3) return invalid;
  let header, claims;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return invalid;
  }
  if (header.alg !== 'RS256') return invalid;
  const jwk = (await module.exports.fetchKeys()).find((k) => k.kid === header.kid);
  if (!jwk) return invalid;
  const ok = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${parts[0]}.${parts[1]}`),
    crypto.createPublicKey({ key: jwk, format: 'jwk' }),
    Buffer.from(parts[2], 'base64url')
  );
  if (!ok) return invalid;
  if (!ISSUERS.includes(claims.iss) || claims.aud !== clientId) return invalid;
  if (typeof claims.exp !== 'number' || claims.exp * 1000 < now) return invalid;
  if (!nonce || claims.nonce !== nonce) return invalid;
  const email = normaliseEmail(claims.email);
  if (!email || claims.email_verified !== true || claims.hd !== ALLOWED_DOMAIN) return { error: 'domain' };
  return { email };
}

module.exports = { fetchKeys, authUrl, verifyIdToken };
