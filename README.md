# Volt Europa HR Hub

Quick-links dashboard for Volt Europa HR processes, with a **Staff** view and a **Volunteers** view you can slide between. Only people with an `@volteuropa.org` email can sign in.

Live at https://volt.ermalasllani.eu

## Adding or changing links

Edit `content/links.json`. Each link looks like this:

```json
{
  "title": "Request a new vacancy",
  "description": "Ask HR to publish a volunteer or paid staff vacancy on the website.",
  "url": "https://…",
  "icon": "megaphone",
  "audience": ["staff", "volunteers"]
}
```

- `audience` decides where the link shows: `["staff"]`, `["volunteers"]`, or both.
- `icon` is one of `megaphone`, `mail`, `group`, `play`, `lifebuoy`, `handover`, `calendar`, `link`.
- A section with no links for a view is hidden in that view.

Pushing to the production branch redeploys the site.

## How sign-in works

1. The visitor enters their email. Anything that is not `@volteuropa.org` is refused.
2. They get an email (sent through Resend) with a sign-in link valid for 15 minutes.
3. Opening the link sets a signed, HTTP-only session cookie that lasts 30 days.

No database: links and sessions are HMAC-signed with `SESSION_SECRET`. Changing that secret signs everyone out.

## Configuration (Vercel environment variables)

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Random string, 32+ characters. Signs links and sessions. |
| `RESEND_API_KEY` | Resend key allowed to send from the `MAIL_FROM` domain. |
| `MAIL_FROM` | Optional. Defaults to `Volt HR Hub <login@ermalasllani.eu>`. |
| `APP_URL` | Optional. Defaults to `https://volt.ermalasllani.eu`. |

## Local development

```bash
npm run dev
```

Opens on http://localhost:3000. Without `RESEND_API_KEY` the sign-in link is printed in the terminal instead of emailed.

```bash
npm test
```
