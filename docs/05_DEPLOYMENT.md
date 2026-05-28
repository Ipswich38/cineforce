# Deployment

**Project:** CineVerse  
**Version:** 0.19.0-beta.1  
**Last updated:** 2026-05-29

---

## Production URL

**https://cineverseph.vercel.app**

Hosted on Vercel. Production alias is `cineverseph.vercel.app`, pointing to the latest production deployment of the `setready` Vercel project.

---

## Prerequisites

Before deploying for the first time (or on a fresh machine):

1. **Node.js** ≥ 20 (Vercel uses Node 24)
2. **pnpm** — `npm i -g pnpm`
3. **Vercel CLI** — `npm i -g vercel@latest`
4. **Supabase project** — `fhlkrenefobhshouuopc`
5. **Google Cloud project** — OAuth client configured for CineVerse

---

## Environment Variables

Set in Vercel project settings → Environment Variables (Production + Preview).  
Also in `.env.local` for local development (never commit this file).

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fhlkrenefobhshouuopc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never expose to client) |

> `NEXT_PUBLIC_` prefix means the variable is bundled into the client JS. Anon key is safe to expose. Service role key must NEVER be `NEXT_PUBLIC_`.

---

## Supabase Setup

1. Create a new Supabase project (or reuse existing).
2. Run `supabase/schema.sql` in the SQL editor (Database → SQL Editor → New query).
3. Enable Google Auth provider: Authentication → Providers → Google → paste Client ID and Client Secret from Google Cloud.
4. Set Site URL: Authentication -> URL Configuration -> Site URL = `https://cineverseph.vercel.app`.
5. Add Redirect URLs: `https://cineverseph.vercel.app/auth/callback`.

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create OAuth 2.0 Client ID (Web application).
3. **Authorized Redirect URIs**: `https://<supabase-project-id>.supabase.co/auth/v1/callback`
4. **Authorized JavaScript Origins**: `https://cineverseph.vercel.app`
5. Paste Client ID and Secret into Supabase Auth → Google provider.

---

## Local Development

```bash
# Install dependencies
pnpm install

# Create .env.local with Supabase credentials
cp .env.example .env.local   # (if example exists) or create manually

# Start dev server
pnpm dev
# → http://localhost:3000
```

---

## Deploying to Production

```bash
# 1. Verify the build passes locally
pnpm build

# 2. Deploy to production
vercel --prod
```

Vercel detects Next.js automatically. Build output is in `/vercel/output`. No custom build config needed.

---

## Versioning Workflow (for every release)

```
1. Complete your feature or fix in local files.
2. Add entry to CHANGELOG.md under [Unreleased].
3. Bump version in package.json (patch / minor / pre-release).
4. pnpm build          # must pass with 0 errors
5. vercel --prod        # deploy
6. Run smoke test (docs/04_TESTING.md).
7. Move [Unreleased] → [X.Y.Z-beta.N] in CHANGELOG.md with today's date.
8. git add -A && git commit -m "release: vX.Y.Z-beta.N"
9. git tag vX.Y.Z-beta.N
```

---

## Version Numbering Scheme

Pattern: `MAJOR.MINOR.PATCH-STAGE.N`

| Field | When to bump |
|---|---|
| `MAJOR` | Breaking change to the public-facing product (e.g. complete redesign, major DB migration) |
| `MINOR` | New feature or significant UX change |
| `PATCH` | Bug fix, copy change, small visual tweak |
| `STAGE` | `beta` until the platform accepts paying subscribers |
| `N` | Increments within each MAJOR.MINOR.PATCH cycle |

**Examples:**
- `0.1.0-beta.1` → first beta release
- `0.1.1-beta.1` → hotfix within 0.1 series
- `0.2.0-beta.1` → new feature (e.g. profile edit flow)
- `1.0.0` → public launch (out of beta)

---

## Rollback

If a production deploy breaks something:

```bash
# List recent deployments
vercel ls

# Roll back to a previous deployment URL
vercel promote <deployment-url>
```

Or via Vercel Dashboard → Deployments → click the previous deployment → "Promote to Production".
