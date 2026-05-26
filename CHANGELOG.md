# Changelog

All notable changes to **YourNextCrew** are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/) with `-beta.N` pre-release tags.

---

## [Unreleased]

> Work in progress — not yet tagged.

---

## [0.5.0-beta.1] — 2026-05-26

### Added
- **iOS bottom tab bar** — fixed bottom navigation (Home / Find / About / Account) shown on mobile (<768px). Hidden on `/auth`, `/join`, `/admin`. Replaces the hamburger menu on mobile.

### Changed
- **Safe area insets** — all fixed/sticky navs now pad `env(safe-area-inset-top)` so content clears the iPhone notch/Dynamic Island. `viewport-fit=cover` enabled.
- **Input font-size 16px** — was 15px; prevents iOS Safari from auto-zooming when tapping any text input across the app.
- **`100dvh` viewport** — replaced all `100vh` with `100dvh` so Safari's browser chrome doesn't clip page height.
- **Tap behavior** — added `-webkit-tap-highlight-color: transparent` (removes blue flash on tap) and `touch-action: manipulation` on buttons/links (removes 300ms tap delay).
- **`-webkit-text-size-adjust`** — prevents iOS from auto-resizing fonts on orientation change.

---

## [0.4.1-beta.1] — 2026-05-26

### Fixed
- **PWA manifest** — corrected `purpose` field from invalid `"any maskable"` to `"any"`; resolves TypeScript build error that blocked v0.4.0-beta.1 deploy.

---

## [0.4.0-beta.1] — 2026-05-26

### Added
- **PWA support** — `app/manifest.ts`, `app/icon.tsx`, `app/apple-icon.tsx`; layout updated with `appleWebApp` metadata and `themeColor`. App is now installable on iPhone via Safari Share → Add to Home Screen.

---

## [0.3.3-beta.1] — 2026-05-26

### Added
- `/about` Mission section — "Easy access to the filmmaking industry" goal statement with two-sided value props (productions: find excellent people; crew: find the right job).

---

## [0.3.2-beta.1] — 2026-05-26

### Changed
- `/about` Founding Member section redesigned — Kickstarter-style tier cards (spot count, progress bar, key benefit per tier); removed all body text walls; single short subtitle + CTA.

---

## [0.3.1-beta.1] — 2026-05-26

### Changed
- `/about` hero — new tagline "The Philippines' first. Built for every side of production." and subtitle updated to reflect crew, equipment, and locations vision; all em dashes removed.

---

## [0.3.0-beta.1] — 2026-05-26

### Added
- **Founding tier system** — activations are now auto-assigned to tiers (Founding 1–100, Pioneer 101–200, Early 201–400) at the moment admin activates them. Tier is stored in `profiles.founding_tier`.
- **`lib/foundingTiers.ts`** — tier config, `getTierForCount()`, `getTierInfo()`, `getTierById()`.
- **Admin batch progress** — `/admin` shows live progress bars per tier and previews which tier each pending request would land in.
- **Dashboard tier preview** — free state shows "You'd join as Founding Member — X spots left"; active state shows tier badge.
- **About page live counters** — `/about` Founding Member section now fetches live activated count and renders per-tier progress bars with Open/Closed status.
- **DB migration** — `founding_tier text check (in ('founding','pioneer','early'))` added to `profiles` table.

---

## [0.2.4-beta.1] — 2026-05-26

### Changed
- `/about` Founding Member section — removed all price/contribution language; reframed as "join for free, request activation"; founding spots now described as first 100 with locked access forever.
- Dashboard activation card — removed "payment details" reference from pending state; now reads "we'll reach out to complete your activation".

---

## [0.2.3-beta.1] — 2026-05-26

### Changed
- `/about` Founding Member section — removed ₱500 and GCash specifics; those details now belong in the activation modal, not the about page.

---

## [0.2.2-beta.1] — 2026-05-26

### Changed
- `/about` page — updated hero copy to reflect Philippine film industry focus; added **Founding Member** section explaining beta community contribution model (minimum ₱500 GCash, 1 year free premium, forever-locked rate); transition trigger set at 200 crew + 20 production sign-ups.

---

## [0.2.1-beta.1] — 2026-05-26

### Fixed
- Admin email default fallback changed from `pqfx18z@gmail.com` to `kreativloops@gmail.com` in `lib/email.ts` and `app/api/admin/activate/route.ts`.

---

## [0.2.0-beta.1] — 2026-05-26

### Added
- **Premium activation system** — manual monetization flow for beta. Crew click "Request Activation" on their dashboard; owner receives an email (via Resend) and activates the profile from `/admin` after payment is confirmed via GCash.
- **`/admin` page** — owner-only dashboard listing pending activation requests (with Activate button) and active premium members. Protected by `ADMIN_EMAIL` env var.
- **`/api/premium-request`** — POST endpoint crew use to submit activation request; updates `premium_status = 'requested'` and fires email.
- **`/api/admin/activate`** — POST endpoint (admin only) to set `premium_status = 'active'`; uses service-role client to bypass RLS.
- **Non-premium gate on ConnectButton** — profiles with `premium_status !== 'active'` show "Not accepting requests yet" instead of the connection form.
- **`lib/email.ts`** — Resend-based email sender; silently skips if `RESEND_API_KEY` is not set.
- **`createAdminClient()`** in `lib/supabase/server.ts` — service-role Supabase client for admin operations that need to bypass RLS.

### Changed
- `profiles` table: added `premium_status`, `premium_requested_at`, `premium_activated_at` columns (migration SQL in `supabase/schema.sql`).
- `ConnectButton` gains `isPremium` prop; shows non-premium state before the login check.
- Dashboard client gains premium status card (free → request button; pending → payment instructions; active → green badge).

---

## [0.1.0-beta.1] — 2026-05-26

First versioned beta release. App is live at **yournextcrew.vercel.app**.

### Added
- **Industry roles database** (`lib/industryRoles.ts`) — 80+ film/TV roles across 19 departments (Directing, Camera, Grip, Electric, Sound, Art, Wardrobe, Hair & Makeup, Production, Locations, Casting, Post-Production, Visual Effects, Sound Post, Stunts, Special FX, Talent, Writing, Animation). Each role has `id`, `label`, `department`, and `aliases` for fuzzy matching.
- **Role suggestion dropdown** on hero search (homepage) — shows matching roles as user types; clicking a role navigates to `/search?role=<id>`. Also shows matching crew profiles under a "People" section.
- **Role suggestion dropdown** on search page — inline dropdown below the search input; clicking a suggestion applies the role filter directly without navigating.
- **Auth page** (`/auth`) — Google OAuth (primary) + Magic Link email OTP (secondary). Tab switcher: Log in / Join. Join tab styled amber as primary CTA.
- **Search page** (`/search`) — full-text name search + filters for role, city, experience level, availability. Results from Supabase; shows 0 crew on empty DB (no fake data).
- **Crew profile page** (`/crew/[slug]`) — hero photo (4:3), name + availability status, info rows (role, specializations, city, rate), credits count card, bio, equipment kit, full credits list, Connect button.
- **Connection request system** — `POST /api/connections` creates a pending request; crew can accept/decline from dashboard. Accepted connection reveals contact details.
- **Dashboard** (`/dashboard`) — authenticated landing; shows incoming connection requests.
- **Join / onboarding** (`/join`) — post-auth profile creation form.
- **Crew browser** (homepage card stack) — Tinder-style swipeable card deck, filterable by role and "Available now". Shows empty state when DB has no profiles.
- **3NF normalized database schema** (`supabase/schema.sql`) — tables: `profiles`, `profile_specializations`, `equipment`, `credits`, `connection_requests`, `contact_details`. Full RLS policies. `updated_at` triggers.

### Changed
- **Auth redirect** — corrected Supabase Site URL so Google OAuth redirects to yournextcrew.vercel.app instead of an unrelated project.
- **Join tab CTA** — amber background + black text to differentiate from Log in tab.

### Removed
- All sample/demo profile data removed from search, home crew browser, and profile pages. Unknown slugs return 404.

### Infrastructure
- Deployed to Vercel; production alias set to `yournextcrew.vercel.app`.
- Connected to Supabase project `fhlkrenefobhshouuopc` (yournextcrew).
- Google OAuth enabled via Supabase Auth provider.

---

## Version History Summary

| Version | Date | Stage | Notes |
|---|---|---|---|
| 0.1.0-beta.1 | 2026-05-26 | Beta | First versioned release, live on Vercel |

---

## How to cut a new version

1. Do your work on a feature or fix.
2. Add an entry under `[Unreleased]` as you go.
3. When ready to tag: move `[Unreleased]` entries to a new `[X.Y.Z-beta.N]` section with today's date.
4. Bump `"version"` in `package.json`.
5. Run `pnpm build` to confirm it passes.
6. Run `vercel --prod` to deploy.
7. Commit: `git commit -m "release: vX.Y.Z-beta.N"`.
