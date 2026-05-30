# CineForce

**Version:** 0.19.0-beta.1 · **Status:** Beta · **Live:** https://cineforce.vercel.app

A professional crew marketplace for the Philippine film and television industry. Crew members build a discoverable profile card; producers and directors find and connect with vetted crew — fast.

---

## What it does

- **Crew profiles** — role, specializations, city, experience, availability, rate, bio, credits, equipment kit
- **Search & discovery** — filter by role, location, experience, availability; role auto-suggest with 80+ industry titles
- **Connection system** — send a request, crew accepts, contact details revealed
- **Auth** — Google OAuth (one-click) + Magic Link email OTP (no password ever)

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + inline design tokens |
| Database | Supabase (PostgreSQL, 3NF schema, RLS) |
| Auth | Supabase Auth — Google OAuth + Magic Link |
| Hosting | Vercel |
| Package manager | pnpm |

---

## Local setup

```bash
# 1. Clone and install
pnpm install

# 2. Create .env.local
NEXT_PUBLIC_SUPABASE_URL=https://fhlkrenefobhshouuopc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# 3. Run dev server
pnpm dev
# → http://localhost:3000
```

Database schema lives in `supabase/schema.sql`. Run it once in the Supabase SQL editor on a fresh project.

---

## Deploying

```bash
pnpm build        # verify build passes
vercel --prod     # deploy to cineforce.vercel.app
```

See `docs/05_DEPLOYMENT.md` for the full versioning workflow.

---

## Documentation

| Doc | Contents |
|---|---|
| `docs/01_REQUIREMENTS.md` | User personas, functional + non-functional requirements, out-of-scope features |
| `docs/02_ARCHITECTURE.md` | Tech stack, directory structure, DB schema, auth flow, key design decisions |
| `docs/03_DEVELOPMENT.md` | Refactoring history, feature notes, known technical debt |
| `docs/04_TESTING.md` | Smoke test checklist, regression areas, test log |
| `docs/05_DEPLOYMENT.md` | Setup, env vars, versioning workflow, rollback |
| `docs/06_INTEGRATIONS.md` | Supabase, Google OAuth, Vercel — config, usage, common errors |
| `CHANGELOG.md` | Version history (Keep a Changelog format) |

---

## Versioning

This project uses **Semantic Versioning** with `-beta.N` pre-release tags.  
Every production deploy corresponds to a version bump in `package.json` and an entry in `CHANGELOG.md`.

Current: `0.19.0-beta.1` · Next: `0.19.1-beta.1` (next fix) or `0.20.0-beta.1` (next feature)
