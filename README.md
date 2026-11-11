# Volt Europa HR Hub

Quick-links dashboard for Volt Europa HR processes, with a **Staff** view and a **Volunteers** view you can slide between. Once Google sign-in is configured, only people with an `@volteuropa.org` account can open it.

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

Visitors click **Sign in with Google** and pick their account. They are let in only if Google confirms it is a verified `@volteuropa.org` Workspace account; personal Gmail and other organisations are refused. No codes or emails are involved.

**Sign-in is only enforced when `GOOGLE_CLIENT_ID` is set.** Without it the dashboard is open to anyone who has the link.

A successful sign-in sets a signed, HTTP-only session cookie that lasts 30 days. There is no database: sessions are HMAC-signed with `SESSION_SECRET`. Changing that secret signs everyone out.

### Setting up Google sign-in

1. In the [Google Cloud console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** of type **Web application**.
2. Add `https://volt.ermalasllani.eu/auth/google/callback` under **Authorised redirect URIs**.
3. On the OAuth consent screen, choose **Internal** if the project belongs to the volteuropa.org Workspace; otherwise **External** and publish it (only the basic `openid` and `email` scopes are used, so no Google review is needed).
4. Put the client ID in Vercel as `GOOGLE_CLIENT_ID` and redeploy. No client secret is needed.

## Configuration (Vercel environment variables)

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Random string, 32+ characters. Signs sessions. |
| `GOOGLE_CLIENT_ID` | OAuth client ID for Sign in with Google. When unset, the dashboard is public. |
| `APP_URL` | Optional. Defaults to `https://volt.ermalasllani.eu`. |

## Local development

```bash
GOOGLE_CLIENT_ID=your-client-id npm run dev
```

Opens on http://localhost:3000. Add `http://localhost:3000/auth/google/callback` as a redirect URI on the OAuth client to sign in locally.

```bash
npm test
```
