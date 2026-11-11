'use strict';
// Local preview: `GOOGLE_CLIENT_ID=... npm run dev`, then open http://localhost:3000
// (add http://localhost:3000/auth/google/callback as a redirect URI on the OAuth client).
process.env.SESSION_SECRET ||= require('node:crypto').randomBytes(32).toString('hex');
const port = process.env.PORT || 3000;
process.env.APP_URL ||= `http://localhost:${port}`;
const handler = require('./api/index');
require('node:http').createServer(handler).listen(port, () => console.log(`HR Hub on http://localhost:${port}`));
