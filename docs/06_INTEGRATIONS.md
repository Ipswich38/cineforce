# Integrations

**Project:** CineVerse  
**Version:** 0.19.0-beta.1  
**Last updated:** 2026-05-29

---

## 1. Supabase

**Purpose:** PostgreSQL database + Authentication + Row Level Security

**Project ID:** `fhlkrenefobhshouuopc`  
**Dashboard:** https://supabase.com/dashboard/project/fhlkrenefobhshouuopc

### What it provides

| Feature | Usage |
|---|---|
| PostgreSQL | Stores profiles, specializations, equipment, credits, connection requests, contact details |
| Supabase Auth | User identity (Google OAuth + Magic Link OTP); JWT session management |
| Row Level Security | Per-table access policies; contact details only visible on accepted connection |
| PostgREST | Auto-generated REST API from schema; used via the JS SDK |

### SDK usage

```ts
// Browser (client components)
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Server (server components / route handlers)
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

The server client reads the auth cookie automatically via `@supabase/ssr`.

### Key queries

```ts
// Fetch a profile with specializations (PostgREST embedded select)
supabase
  .from("profiles")
  .select("*, profile_specializations(name)")
  .eq("slug", slug)
  .single()

// Search profiles
supabase
  .from("profiles")
  .select("id,slug,display_name,avatar_url,role,experience_level,city,availability,rate_min,rate_max,rate_unit,bio,profile_specializations(name)", { count: "exact" })
  .eq("role", roleFilter)        // optional
  .ilike("display_name", `%q%`)  // optional
  .order("created_at", { ascending: false })
```

### Auth flow integration

`app/auth/callback/route.ts` handles the OAuth redirect:
1. Receives `?code=` from Supabase
2. Calls `supabase.auth.exchangeCodeForSession(code)`
3. Reads `?next=` param and redirects accordingly

---

## 2. Google OAuth

**Purpose:** Primary authentication method for users

**Project:** `yournextcrew` (Google Cloud Console)  
**Client ID:** `163914934167-vmeq0ps0k5khfktstj5u7mc9q77p8teo.apps.googleusercontent.com`

### Configuration

| Setting | Value |
|---|---|
| Authorized Redirect URIs | `https://fhlkrenefobhshouuopc.supabase.co/auth/v1/callback` |
| Authorized JavaScript Origins | `https://cineverseph.vercel.app` |

### How it works

Supabase acts as the OAuth intermediary:
```
App → supabase.auth.signInWithOAuth({ provider: "google" })
    → Supabase Auth redirects to Google
    → Google redirects to Supabase callback
    → Supabase redirects to /auth/callback
    → App reads session from cookie
```

The Client ID and Secret are configured in Supabase Auth → Providers → Google. They are **not** stored in the app's env vars.

### Common errors

| Error | Cause | Fix |
|---|---|---|
| "Invalid origin" | Trailing slash or path in JavaScript Origins | Origins must be bare `https://domain.com` — no path, no trailing slash |
| Redirect to wrong app | Supabase Site URL incorrect | Auth → URL Configuration → update Site URL |
| "redirect_uri_mismatch" | Callback URL not in Redirect URIs | Add `https://<project>.supabase.co/auth/v1/callback` to Authorized Redirect URIs |

---

## 3. Vercel

**Purpose:** Hosting, CI/CD, edge CDN

**Project:** `setready` (Vercel project name)  
**Production alias:** `cineverseph.vercel.app`  
**Team:** Cherwin Fernandez's projects

### Deployment

```bash
vercel --prod   # deploys and promotes to production alias
```

### Environment variables

Set via Vercel Dashboard → Project → Settings → Environment Variables, or via `vercel env add`. Variables prefixed `NEXT_PUBLIC_` are exposed to the browser bundle.

### Build settings (auto-detected)

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build command | `pnpm build` |
| Output directory | `.next` |
| Node.js version | 24 (Vercel default) |

### Function regions

Dynamic routes (`/crew/[slug]`, `/dashboard`, `/api/connections`) run as Vercel Fluid Compute functions in the closest region to the user.

### Rollback

Vercel keeps all previous deployments. To roll back:
```bash
vercel promote <deployment-url>
```
Or use the Vercel Dashboard → Deployments → Promote.
