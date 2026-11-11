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

**Sign in with Google (one click, no code).** Shown when `GOOGLE_CLIENT_ID` is set. The visitor picks their Google account and is let in only if Google confirms it is a verified `@volteuropa.org` Workspace account. Personal Gmail and other organisations are refused.

**Email link (fallback).** Shown when `RESEND_API_KEY` is set. The visitor enters their `@volteuropa.org` address and gets a link valid for 15 minutes.

Either way the result is a signed, HTTP-only session cookie that lasts 30 days. There is no database: links and sessions are HMAC-signed with `SESSION_SECRET`. Changing that secret signs everyone out.

### Setting up Google sign-in

1. In the [Google Cloud console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** of type **Web application**.
2. Add `https://volt.ermalasllani.eu/auth/google/callback` under **Authorised redirect URIs**.
3. On the OAuth consent screen, choose **Internal** if the project belongs to the volteuropa.org Workspace; otherwise **External** and publish it (only the basic `openid` and `email` scopes are used, so no Google review is needed).
4. Put the client ID in Vercel as `GOOGLE_CLIENT_ID` and redeploy. No client secret is needed.

## Configuration (Vercel environment variables)

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Random string, 32+ characters. Signs links and sessions. |
| `GOOGLE_CLIENT_ID` | Enables Sign in with Google. |
| `RESEND_API_KEY` | Enables the email-link fallback. Must be allowed to send from the `MAIL_FROM` domain. |
| `MAIL_FROM` | Optional. Defaults to `Volt HR Hub <login@ermalasllani.eu>`. |
| `MAIL_REPLY_TO` | Optional reply-to address for sign-in emails. |
| `APP_URL` | Optional. Defaults to `https://volt.ermalasllani.eu`. |

## Local development

```bash
npm run dev
```

Opens on http://localhost:3000. Without `RESEND_API_KEY` the sign-in link is printed in the terminal instead of emailed.

```bash
npm test
```
