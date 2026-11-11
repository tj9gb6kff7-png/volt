'use strict';
// Local preview: `npm run dev`, then open http://localhost:3000
// Set GOOGLE_CLIENT_ID to try sign-in (add http://localhost:3000/auth/google/callback
// as a redirect URI on the OAuth client).
const fs = require('node:fs');
const path = require('node:path');
process.env.SESSION_SECRET ||= require('node:crypto').randomBytes(32).toString('hex');
const port = process.env.PORT || 3000;
process.env.APP_URL ||= `http://localhost:${port}`;
const handler = require('./api/index');
require('node:http')
  .createServer((req, res) => {
    // On Vercel, files in public/ are served before the function runs.
    const font = /^\/fonts\/([\w.-]+\.woff2)$/.exec(req.url);
    if (font) {
      const file = path.join(__dirname, 'public', 'fonts', font[1]);
      if (fs.existsSync(file)) {
        res.writeHead(200, { 'Content-Type': 'font/woff2' });
        return fs.createReadStream(file).pipe(res);
      }
    }
    return handler(req, res);
  })
  .listen(port, () => console.log(`HR Hub on http://localhost:${port}`));
