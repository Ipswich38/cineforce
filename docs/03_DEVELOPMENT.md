# Development Log

**Project:** CineVerse  
**Version:** 0.19.0-beta.1  
**Last updated:** 2026-05-29

This document logs significant development decisions, refactors, and the reasoning behind them. It is not a git log — it records the *why*, not just the *what*.

---

## Refactoring History

### REF-001 — ConnectButton: move `createClient()` inside async handler
**Date:** 2026-05 (pre-beta)  
**File:** `app/crew/[slug]/ConnectButton.tsx`  
**Problem:** `const supabase = createClient()` was called at the top of the component body. On profile pages, this ran during server-side rendering before Supabase env vars were confirmed present — causing the page to crash with a 500.  
**Fix:** Moved `createClient()` inside the `sendRequest()` async function so it only runs on user interaction in the browser.  
**Lesson:** Never call Supabase client constructors at module/component scope in shared server/client components.

---

### REF-002 — Remove SAMPLE_PROFILES from all data paths
**Date:** 2026-05-26  
**Files:** `app/page.tsx`, `app/search/page.tsx`, `app/crew/[slug]/page.tsx`  
**Problem:** Sample profiles were used as a fallback when Supabase had no data. This made the app appear populated to visitors, which was misleading. Sample profiles also had stale structure and didn't reflect the normalized schema.  
**Fix:** Removed all SAMPLE_PROFILES fallback logic. Pages now show real empty states (empty deck, "0 crew", 404 for unknown slugs).  
**Note:** `lib/sampleProfiles.ts` still exists but is no longer imported anywhere. It can be removed in a future cleanup pass.

---

### REF-003 — 3NF normalization of profiles table
**Date:** 2026-05 (pre-beta)  
**File:** `supabase/schema.sql`  
**Problem:** Original schema had `specializations text[]` (violated 1NF — non-atomic), `region text` (transitively dependent on `city` — violated 3NF), and `rate_currency text` (a constant in a PHP-only app — unnecessary attribute).  
**Fix:**
- Extracted `specializations` to `profile_specializations(id, profile_id, name)` with `UNIQUE(profile_id, name)`.
- Removed `region` column entirely.
- Removed `rate_currency` column; currency is implicitly ₱ throughout the app.
- Added `CHECK` constraints on all enum-like text fields.
- Added `rate_range_valid` constraint: `rate_max >= rate_min` when both are present.

---

### REF-004 — Role suggestions: static database vs. live query
**Date:** 2026-05-26  
**File:** `lib/industryRoles.ts`  
**Decision:** Industry roles are stored as a static TypeScript array, not in the database.  
**Rationale:** Role taxonomy is stable (changes rarely, if ever). A static file is zero-latency, works offline, and doesn't require a DB query. It ships with the app bundle. If the taxonomy needs to change, a code deploy is appropriate — this is a business rule, not user data.  
**Alternative considered:** Storing roles in a Supabase table for admin-editable taxonomy. Rejected for beta — adds infrastructure without user-facing benefit at this stage.

---

### REF-005 — Auth redirect: Google OAuth going to wrong project
**Date:** 2026-05 (pre-beta)  
**Problem:** After Google sign-in, users were redirected to a different Supabase project's site URL (a previous project).  
**Root cause:** Supabase Auth → URL Configuration → Site URL was still pointing to the old project's domain.  
**Fix:** Updated Site URL and Redirect URLs in Supabase dashboard to the production Vercel domain.  
**Also fixed:** Google Cloud Console had the Supabase callback URL in "Authorized JavaScript Origins" instead of "Authorized Redirect URIs" — corrected.

---

### REF-006 — Supabase query: `profile_specializations` join
**Date:** 2026-05-26  
**Files:** `app/search/page.tsx`, `app/crew/[slug]/page.tsx`  
**Change:** Updated all Supabase selects that previously queried `specializations` (removed column) to use the PostgREST embedded select syntax:
```sql
select("...,profile_specializations(name)")
```
Then mapped the result:
```ts
specializations: (row.profile_specializations ?? []).map((s) => s.name)
```

---

## Feature Implementation Notes

### Role Suggestion Dropdown
The dropdown in both HeroSearch and SearchContent follows this pattern:
1. `searchIndustryRoles(query, n)` runs synchronously on every keystroke (no debounce needed — it's in-memory).
2. Supabase profile suggestions are debounced at 220ms to avoid excess DB queries.
3. The dropdown uses `onMouseDown` (not `onClick`) for the search page's suggestion items so it fires before the input's `onBlur` closes the dropdown.

### Card Stack (CrewBrowser)
- Uses CSS `transition: transform 0.4s cubic-bezier(...)` for swipe exit animations.
- Ghost cards behind the front card are positioned with `rotate + translateY + scale` to create depth illusion without a 3D context.
- Keyboard: `ArrowRight` or `Escape` triggers skip.
- Touch: `onTouchStart` / `onTouchEnd` delta > 70px triggers skip (swipe right).

---

## Known Issues / Technical Debt

| ID | Description | Priority |
|---|---|---|
| TD-001 | `lib/sampleProfiles.ts` is no longer used but not deleted | Low |
| TD-002 | `role` CHECK constraint in schema.sql only lists 17 roles; full INDUSTRY_ROLES list not synced to DB constraint | Medium — will cause inserts to fail for roles outside the whitelist |
| TD-003 | Profile page photo shows avatar initials only (no multi-photo upload yet) | Planned feature |
| TD-004 | No email notification when a connection request is received | Planned feature |
| TD-005 | Search does not search by specialization — only by display_name | Minor UX gap |

> **TD-002 is the most impactful.** When the `/join` form is built out, the `role` column CHECK constraint must be expanded to include all valid `id` values from `INDUSTRY_ROLES`. Until then, only the 17 roles in the SQL constraint can be inserted.
