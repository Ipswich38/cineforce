# Architecture

**Project:** CineVerse  
**Version:** 0.19.0-beta.1  
**Last updated:** 2026-05-29

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 + inline styles | 4.x |
| Icons | Lucide React | 1.16.x |
| Backend-as-a-Service | Supabase (Postgres + Auth) | 2.x SDK |
| Hosting | Vercel | — |
| Package manager | pnpm | 10.x |
| Runtime | Node.js | 24 (Vercel default) |

---

## 2. System Overview

```
Browser
  │
  ├─ Static pages (/, /about, /auth, /search)
  │    └─ Served from Vercel Edge CDN (pre-rendered)
  │
  ├─ Dynamic pages (/crew/[slug], /dashboard)
  │    └─ Server-rendered on demand (Vercel Fluid Compute)
  │
  └─ Client components (Hero search, CrewBrowser, ConnectButton)
       └─ Call Supabase JS SDK directly from browser
            │
            ▼
         Supabase
           ├─ PostgreSQL (data)
           ├─ Auth (sessions, OAuth, OTP)
           └─ Row Level Security (access control)

External OAuth
  └─ Google → Supabase Auth → /auth/callback → app
```

---

## 3. Directory Structure

```
setready/
├─ app/
│   ├─ layout.tsx          Global HTML shell, fonts, global CSS
│   ├─ page.tsx            Homepage: Nav, HeroSearch, CrewBrowser
│   ├─ about/              Static about page
│   ├─ auth/
│   │   ├─ page.tsx        Sign-in / join (Google + Magic Link)
│   │   └─ callback/       Supabase OAuth redirect handler
│   ├─ crew/[slug]/
│   │   ├─ page.tsx        Public crew profile (Server Component)
│   │   └─ ConnectButton.tsx  Connect CTA (Client Component)
│   ├─ dashboard/          Authenticated dashboard
│   ├─ join/               Post-auth profile creation form
│   ├─ search/             Search + filter page (Client Component)
│   └─ api/connections/    Connection request API route
├─ lib/
│   ├─ constants.ts        ROLES, AVAILABILITY, EXPERIENCE_LEVELS, PH_LOCATIONS
│   ├─ industryRoles.ts    80+ film/TV roles with aliases (searchIndustryRoles)
│   ├─ sampleProfiles.ts   Legacy sample data (NOT used in production)
│   └─ supabase/
│       ├─ client.ts       Browser Supabase client (createClient)
│       └─ server.ts       Server Supabase client (createClient with cookies)
├─ supabase/
│   └─ schema.sql          Full 3NF schema + RLS policies
├─ docs/                   This documentation
├─ CHANGELOG.md
└─ package.json
```

---

## 4. Database Schema (3NF)

See full DDL in `supabase/schema.sql`. Summary:

```
profiles                    — one row per user (PK = auth.users.id)
  id, slug, display_name, avatar_url, bio
  role, experience_level, city, availability
  rate_min, rate_max, rate_unit
  portfolio_url, showreel_url
  created_at, updated_at

profile_specializations     — 1NF extraction of specializations array
  id, profile_id → profiles, name
  UNIQUE(profile_id, name)

equipment                   — crew kit items
  id, profile_id → profiles, name, description, category

credits                     — filmography
  id, profile_id → profiles
  project_title, role, year, type, network_studio

connection_requests         — hiring party ↔ crew
  id, client_id → auth.users, crew_id → profiles
  status (pending | accepted | declined)
  message, project_title, project_dates
  UNIQUE(client_id, crew_id)

contact_details             — private; revealed on accepted connection
  id → auth.users
  phone, email, facebook_url, instagram_url
```

**Normalization notes:**
- `specializations text[]` removed from `profiles` — violated 1NF. Now in `profile_specializations`.
- `region` removed — transitively dependent on `city` (violates 3NF).
- `rate_currency` removed — app is PHP-only; a constant has no place in a table attribute.

---

## 5. Authentication Flow

```
User clicks "Continue with Google"
  └─ supabase.auth.signInWithOAuth({ provider: "google" })
       └─ Redirects to Google consent screen
            └─ Google redirects to /auth/callback?code=...
                 └─ Supabase exchanges code for session
                      └─ app/auth/callback/ reads ?next= param
                           ├─ new user → /join
                           └─ returning user → /dashboard (or ?next= value)
```

Magic Link flow:
```
User enters email → supabase.auth.signInWithOtp({ email })
  └─ Supabase emails magic link
       └─ User clicks link → /auth/callback → same redirect logic
```

---

## 6. Role Suggestion System

`lib/industryRoles.ts` exports:
- `INDUSTRY_ROLES: IndustryRole[]` — static database of 80+ roles
- `searchIndustryRoles(query, limit)` — filters by label, department, or any alias (case-insensitive substring match)

Used in two places:
1. `app/page.tsx` HeroSearch — shows "Roles" section in dropdown; clicking routes to `/search?role=<id>`
2. `app/search/page.tsx` search input — shows dropdown; clicking sets `roleFilter` state

---

## 7. Key Design Decisions

| Decision | Rationale |
|---|---|
| Inline styles over Tailwind | Design tokens (colors, typography) need to be consistent across components without a design system. Inline styles make per-component theming explicit. Tailwind used for layout utilities only. |
| Server Components for profile pages | `/crew/[slug]` fetches DB data at request time — no client-side loading state. Falls back to 404 if slug not found. |
| Client Components for search | Filters are interactive and update in real time; requires `useState` / `useEffect`. |
| Supabase client in async functions | `createClient()` is called inside async handlers (not at component body level) to avoid crashes when env vars are missing locally. |
| No sample profiles in prod | Replaced with proper empty states. Fake data was misleading visitors. |
