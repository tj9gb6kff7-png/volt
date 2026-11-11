'use strict';
// Local preview: `SESSION_SECRET=... npm run dev`, then open http://localhost:3000
// Without RESEND_API_KEY the sign-in link is printed here instead of being emailed.
process.env.SESSION_SECRET ||= require('node:crypto').randomBytes(32).toString('hex');
const port = process.env.PORT || 3000;
process.env.APP_URL ||= `http://localhost:${port}`;
if (!process.env.RESEND_API_KEY) {
  require('./lib/mail').sendLoginEmail = async (email, link) => console.log(`Sign-in link for ${email}:\n${link}`);
}
const handler = require('./api/index');
require('node:http').createServer(handler).listen(port, () => console.log(`HR Hub on http://localhost:${port}`));
