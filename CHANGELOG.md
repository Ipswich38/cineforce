# Changelog

All notable changes to **YourNextCrew** are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/) with `-beta.N` pre-release tags.

---

## [Unreleased]

> Work in progress — not yet tagged.

---

## [0.16.9-beta.1] — 2026-05-29

### Changed
- **Homepage** — hero only; removed Marketplace / "Crew, ready." card stack from homepage.
- **Find page** — Marketplace card stack (swipe-to-browse) moved to `/search`, rendered below the search results grid.

---

## [0.16.8-beta.1] — 2026-05-29

### Changed
- **Hero** — replaced large h1 + badge with a single small label line directly above the search bar; removed tagline below search.

---

## [0.16.7-beta.1] — 2026-05-29

### Changed
- **Hero search bar** — redesigned to Airbnb-style horizontal single-row pill bar with three sections: Location / Availability / Crew; active section gets an elevated highlight; dividers between sections hide when an adjacent section is active; amber Search button with icon on the right.

---

## [0.16.6-beta.1] — 2026-05-29

### Fixed
- **Search dropdown backdrop** — opening Role, Dates, or City panel now dims and blurs the page behind it so the dropdown doesn't visually bleed into the Crew Browser section below.

---

## [0.16.5-beta.1] — 2026-05-29

### Fixed
- **Build error** — renamed internal `openPanel` function to `handleOpenPanel` to resolve name collision with `openPanel` state variable in `BookingSearch`; removed unused `Info` import.

---

## [0.16.4-beta.1] — 2026-05-29

### Added
- **"How it works" modal** — pulsing amber indicator button on hero opens a popup with the 3-step explainer and calendar callout; same content added as a static section on the /about page.

### Changed
- **Hero** — removed video background; replaced with static dark gradient + subtle amber ambient glow; `overflow: hidden` removed from hero section.
- **Search dropdowns** — all panels (Role, Dates, City) now use `position: fixed` with viewport-relative coordinates so they always render above content regardless of parent overflow; the calendar is fully scrollable and never clipped.

---

## [0.16.3-beta.1] — 2026-05-29

### Changed
- **Hero search — Airbnb-style integrated layout** — search bar is back inside the hero with the video background as the centrepiece between headline and CTA buttons; separate search section removed; headline shortened to make search the primary focus; tagline moved below search.

---

## [0.16.2-beta.1] — 2026-05-29

### Changed
- **Hero section** — restored `bg.mp4` video background scoped to section 1 only with dark gradient overlay; search widget moved to its own section 2 ("Who do you need on set?") on a solid dark background so the video no longer bleeds into other sections.

---

## [0.16.1-beta.1] — 2026-05-29

### Added
- **Date-range filtering on search page** — `/search?from=YYYY-MM-DD&to=YYYY-MM-DD` now excludes crew who have marked any day in the range as busy in their availability calendar; orange date badge appears in active filters and can be removed independently.

### Fixed
- **City and date params from hero search** — search page now correctly initialises `city`, `from`, and `to` from URL params so the 3-pill hero search lands with all filters pre-applied.

---

## [0.16.0-beta.1] — 2026-05-29

### Added
- **Airbnb-style Account page** — full profile management with 3 sticky tabs (Profile, Availability, Account); Airbnb-inspired header with amber avatar, name, role, city, and live availability dot; inline editing for display name, bio, and city.
- **Full professional editing in settings** — crew can now edit role, experience level, rate range, rate unit, and specializations directly from the Account page without re-doing /join.
- **Tag-based specializations editor** — chip input with add/remove; saves to `profiles.specializations`.
- **Crew availability calendar** — month-grid calendar in the Availability tab; crew tap future dates to mark them busy or available; stored in `crew_availability` table via `POST /api/availability`.
- **Accepted bookings in Availability tab** — crew see their accepted connection requests with a Chat button.
- **`POST/GET /api/availability`** — crew set/read their busy dates; GET is public for date-based crew filtering.
- **`PATCH /api/profile`** — secure profile update API allowing all editable fields.
- **Airbnb 3-pill hero search** — replaced text search with Role / Project Dates / City pill bar; each pill opens a dropdown (roles grid, date range calendar, city list); navigates to /search with filter params.
- **Date range calendar in hero** — inline month calendar for picking project start/end dates; range highlighting between selected dates; navigates to /search with `from` and `to` params.
- **"How CineVerse works" section** — 3-step explainer (search by role+date, browse cards, connect and chat) + calendar feature callout with link to /search.

### Schema migration required (run in Supabase console)
```sql
create table if not exists crew_availability (
  id       uuid default gen_random_uuid() primary key,
  crew_id  uuid references auth.users(id) on delete cascade not null,
  date     date not null,
  status   text not null default 'busy' check (status in ('busy', 'booked')),
  unique(crew_id, date)
);
alter table crew_availability enable row level security;
create policy "crew_avail_own"  on crew_availability for all     using (auth.uid() = crew_id) with check (auth.uid() = crew_id);
create policy "crew_avail_read" on crew_availability for select  using (true);
```

---

## [0.15.0-beta.1] — 2026-05-28

### Added
- **In-app real-time chat** — accepted connections unlock a `/chat/[connectionId]` page with live Supabase Realtime messaging, date separators, auto-scroll, and auto-expanding textarea.
- **Chat button in crew inbox** — accepted requests in the "Earlier" section now show a "Chat" button linking directly to the conversation.
- **Chat button in client requests** — accepted sent requests in the client dashboard show an "Open Chat" button.
- **Messages API** — `POST /api/messages` inserts a message after verifying the user is part of the accepted connection.

### Changed
- **"Decline" replaced with "Skip For Now"** — crew can skip a request (status: "skipped") instead of permanently declining; badge shows gray "Skipped" label.
- **Inbox notification text** — updated from "tap Accept or Decline" to "tap Accept or Skip".

---

## [0.14.1-beta.1] — 2026-05-28

### Changed
- **Bottom nav — auth-aware** — logged-in crew see Home(dashboard) / Find / My Card / Account(settings); logged-in clients see Home(dashboard) / Find Crew / Account(settings); logged-out users keep the public Home / Find / About / Account(sheet) nav.

---

## [0.14.0-beta.1] — 2026-05-28

### Added
- **Profile photo upload** — `/settings` lets users upload from gallery or take a photo with camera; uploads to Supabase Storage (`avatars` bucket), updates `profiles.avatar_url`.
- **Legal page** — `/legal` with three tabs: Terms of Service, Privacy Policy, and Data Privacy Act (RA 10173) compliance notice.
- **Account pause** — users can pause their account from Settings; paused profiles are hidden from search results and cannot receive connection requests.
- **Account deactivation** — reason selector + type "DELETE" confirmation; calls `DELETE /api/account` which removes avatar from Storage, deletes profile row, and deletes auth user; redirects to homepage.
- **Settings link** — added Settings link in crew and client dashboard headers.

### Schema migration required (run in Supabase console)
```sql
alter table profiles add column if not exists is_paused boolean not null default false;

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "avatars_select" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "avatars_update" on storage.objects for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "avatars_delete" on storage.objects for delete using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## [0.13.4-beta.1] — 2026-05-28

### Fixed
- **Admin API routes** — all admin API routes (`/api/admin/invite`, `/api/admin/tickets`, `/api/admin/activate`) now check the `admin_auth` cookie instead of Supabase user email, consistent with the passcode login.

---

## [0.13.3-beta.1] — 2026-05-28

### Changed
- **Admin login — passcode only** — replaced Google OAuth on admin login with a server-verified passcode; sets an httpOnly cookie valid for 7 days; passcode controlled via `ADMIN_PASSCODE` env var.

---

## [0.13.2-beta.1] — 2026-05-28

### Changed
- **Auth page — Google only** — removed email magic link option; sign-in and sign-up now use Google OAuth exclusively.

---

## [0.13.1-beta.1] — 2026-05-28

### Added
- **Admin login page** — `/admin/login` with email magic link; unauthenticated `/admin` visits now redirect to `/admin/login` instead of the homepage; magic link redirects back to `/admin` on success.

### Changed
- `ADMIN_EMAIL` moved from hardcoded fallback to Vercel env var (`waevpoint@gmail.com`).

---

## [0.13.0-beta.1] — 2026-05-28

### Added
- **Invite-only signups** — `/join` now starts with an invite code step; code validated via `POST /api/invite/validate` before user can proceed; `used_count` incremented via `POST /api/invite/use` after successful profile creation.
- **Admin Invites tab** — generate 1/5/10/20 single-use codes via `POST /api/admin/invite`; stats row (Total/Unused/Used); per-code Copy button; Copy all unused button; availability/used/expired status badges.
- **Invite code API routes** — `GET/POST /api/admin/invite` (admin-only code generation and listing), `POST /api/invite/validate` (public code check), `POST /api/invite/use` (auth-required usage increment).

### Schema migration required (run in Supabase console)
```sql
create table if not exists invite_codes (
  id          uuid default gen_random_uuid() primary key,
  code        text unique not null,
  max_uses    integer not null default 1,
  used_count  integer not null default 0,
  expires_at  timestamptz,
  created_at  timestamptz default now()
);
```

---

## [0.12.1-beta.1] — 2026-05-28

### Changed
- **UI scale reduced 10%** — added `zoom: 0.9` to `body` in `globals.css`; scales all inline-px fonts, padding, gaps, and icons uniformly without touching individual component files.

---

## [0.12.0-beta.1] — 2026-05-28

### Added
- **Admin dashboard** — rebuilt `/admin` with three tabs: Overview (KPI cards + recent signups + open ticket preview), Users (searchable/filterable table with email, type, status, city, joined date), and Tickets (support queue with expand/status/notes management). Fetches all metrics via Supabase service role including auth user emails.
- **Support tickets** — `support_tickets` table; `/help` page with category picker and form; `POST /api/tickets` for submission; `PATCH /api/admin/tickets` for admin status updates and notes.
- **Help link** — crew and client dashboards now show a Help link in the header (visible on sm+ screens).

### Schema migration required (run in Supabase console)
```sql
create table if not exists support_tickets (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text not null,
  category    text not null default 'other' check (category in ('billing','bug','account','feature','other')),
  subject     text not null,
  message     text not null,
  status      text not null default 'open' check (status in ('open','in_progress','resolved')),
  admin_notes text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table support_tickets enable row level security;
create policy "tickets_insert"   on support_tickets for insert with check (auth.uid() = user_id);
create policy "tickets_own_read" on support_tickets for select using (auth.uid() = user_id);
create or replace function update_updated_at() returns trigger language plpgsql as $ begin new.updated_at = now(); return new; end; $;
create trigger support_tickets_updated_at before update on support_tickets for each row execute function update_updated_at();
```

---

## [0.11.0-beta.1] — 2026-05-28

### Added
- **Founding Member system** — `/subscribe` page shows beta/founding member status, GCash donation coming soon, and upcoming ₱150/month pricing at launch.
- **Subscription infrastructure** — `lib/subscription.ts` with `IS_BETA` flag, `trialDaysLeft`, `computeStatus`, `isSubscriptionActive` helpers. During beta all logged-in users have full access; flip `IS_BETA = false` at launch to activate 14-day trial gate.
- **Trial started at** — `trial_started_at` column written on join for both crew and client accounts, ready for billing activation at launch.
- **Membership banner** — crew and client dashboards show a "Founding Member" badge linking to `/subscribe` during beta; switches to trial countdown and upgrade prompt when `IS_BETA = false`.
- **Viewer subscription gate** — `ConnectButton` accepts `viewerSubActive` prop; shows upgrade prompt instead of connect form when viewer's subscription is expired (inactive post-beta).

### Changed
- Dashboard page now fetches `trial_started_at` and passes `subStatus`/`daysLeft` to both crew and client dashboard components.
- `isPremium` on crew profiles now uses `isSubscriptionActive` instead of raw `premium_status === "active"` check.

### Schema migration required (run in Supabase console)
```sql
alter table profiles add column if not exists trial_started_at timestamptz;
alter table profiles drop constraint if exists profiles_premium_status_check;
alter table profiles add constraint profiles_premium_status_check
  check (premium_status in ('free','trial','active','expired','requested'));
alter table profiles alter column premium_status set default 'trial';
update profiles set premium_status = 'trial', trial_started_at = now()
  where premium_status in ('free','requested') and trial_started_at is null;
```

---

## [0.10.2-beta.1] — 2026-05-27

### Changed
- **PWA icon font — Raleway Bold** — switched icon font from Playfair Display to Raleway Bold to match the logo's clean geometric sans-serif letterforms.

---

## [0.10.1-beta.1] — 2026-05-27

### Changed
- **PWA icon updated** — both `icon.tsx` (512x512) and `apple-icon.tsx` (180x180) now render a black rounded square with a gold gradient border and serif "CV" text in gold, matching the CineVerse brand logo. Uses Playfair Display Bold (WOFF1 from `@fontsource/playfair-display`).

---

## [0.10.0-beta.1] — 2026-05-27

### Added
- **Client account system** — account type picker on `/join` lets users register as Crew or as a Hiring client; client profiles store name, company, city, and production type
- **Client dashboard** — dedicated dashboard for client accounts with Requests tab (sent connection requests) and Saved tab (favorited crew)
- `favorites` table with RLS so clients can save crew they like
- `account_type`, `company`, and `production_type` columns on `profiles`

---

## [0.9.12-beta.1] — 2026-05-27

### Fixed
- **Logout now fully clears session** — replaced `router.push("/")` with `window.location.href = "/"` after `signOut()` so the hard reload flushes the Next.js router cache; navigating to `/dashboard` after logout correctly redirects to `/auth`.

---

## [0.9.11-beta.1] — 2026-05-27

### Changed
- **Background video — homepage only** — removed `/about` from video pages; video now plays on the homepage hero only.

---

## [0.9.10-beta.1] — 2026-05-27

### Changed
- **Account tab sheet — logged-in state** — tapping Account now always opens a sheet. When logged in: shows Dashboard (amber pill) + Log out (outline pill). When logged out: shows Sign up + Log in (existing behaviour).

---

## [0.9.9-beta.1] — 2026-05-27

### Changed
- **Background video scoped to hero and about** — video layer now only plays on `/` and `/about`; all other pages show grain + vignette only.

---

## [0.9.8-beta.1] — 2026-05-27

### Added
- **Background video layer** — compressed cinematic video (`bg.mp4`, 755KB) plays as a low-opacity background. Gated by `navigator.connection`: skipped automatically on `slow-2g`, `2g`, or `saveData` mode. Fades in smoothly over 1.8s only after the video is fully buffered — never blocks the UI.

---

## [0.9.7-beta.1] — 2026-05-27

### Added
- **Cinematic FX overlay** — `CinematicFX` component adds animated film grain (SVG feTurbulence, 0.35s jitter loop) and a vignette edge darkening across all pages. Pure CSS, zero network cost, no performance impact.

---

## [0.9.6-beta.1] — 2026-05-27

### Changed
- **Full CineVerse brand sweep** — replaced all remaining `YourNextCrew` references in `README.md` and all `docs/` files. Updated localStorage key from `ync_legal_v1` to `cv_legal_v1` (existing users will see the legal modal once more on next visit).

---

## [0.9.5-beta.1] — 2026-05-27

### Changed
- **Domain update** — fallback URL in `lib/email.ts` updated to `cineverseph.vercel.app`. Production URL controlled by `NEXT_PUBLIC_APP_URL` env var.

---

## [0.9.4-beta.1] — 2026-05-27

### Changed
- **Rebrand: EastBronx → CineVerse** — all user-facing strings, metadata, email templates, and PWA config updated. Icon updated from `eBx` to `CV`.

---

## [0.9.3-beta.1] — 2026-05-27

### Changed
- **PWA icon updated** — `app/icon.tsx` and `app/apple-icon.tsx` now display `eBx` instead of `YC`. Affects the home screen icon on iPhone and the browser favicon.

---

## [0.9.2-beta.1] — 2026-05-27

### Added
- **Auto-update on deploy** — `VersionChecker` client component polls `/api/version` every 5 minutes and on tab visibility change; silently reloads the app when a new version is detected so users always run the latest build without a manual refresh.

---

## [0.9.1-beta.1] — 2026-05-27

### Changed
- **Domain update** — fallback URL in `lib/email.ts` updated from `yournextcrew.vercel.app` to `eastbronx.vercel.app`. Production URL is now controlled by the `NEXT_PUBLIC_APP_URL` Vercel env var.

---

## [0.9.0-beta.1] — 2026-05-27

### Changed
- **Rebrand: YourNextCrew → EastBronx** — all user-facing strings updated across the full codebase.
  - `package.json` name field updated to `eastbronx`.
  - `app/layout.tsx` — page title now `"EastBronx — Your Next Set Is a Tap Away."`, updated description and all OG/Apple Web App tags.
  - `app/manifest.ts` — PWA `name`, `short_name`, and `description` updated; app installs as "EastBronx" on device.
  - Nav logos across all pages (home, auth, join, dashboard, about, search, crew profile) updated to `EastBronx`.
  - Hero label chip on homepage changed to the new tagline: `"Your Next Set Is a Tap Away."`
  - Auth join-tab subtitle updated to include the tagline.
  - BottomNav account sheet heading updated to `"Your next set is a tap away."`
  - `components/LegalModal.tsx` — all legal text references updated to `EastBronx`.
  - `lib/email.ts` — Resend `from` name updated to `EastBronx`.
  - Production URL fallback (`yournextcrew.vercel.app`) intentionally preserved — domain change is a separate infrastructure step.

---

## [0.8.2-beta.1] — 2026-05-27

### Fixed
- **Dashboard build errors** — extracted all `profile.field` accesses into typed local variables (`profileId`, `displayName`, `profileCity`, `profileBio`, `rateMin`, `rateMax`, `foundingTier`) to prevent TypeScript inferring `unknown` inside JSX conditionals. Availability toggle now correctly updates by `id` (respects RLS).

---

## [0.8.1-beta.1] — 2026-05-27

### Fixed
- **Dashboard TypeScript error** — replaced inline fields array (which caused `unknown` type inference on the Icon prop) with explicit JSX rows for Name and City fields.

---

## [0.8.0-beta.1] — 2026-05-27

### Fixed
- **Publish card error** — removed `specializations` from `profiles.insert()` (column does not exist on that table). Specializations are now correctly inserted into `profile_specializations` as separate rows after the profile is created.

### Added
- **Connection request email notification** — crew member receives an email via Resend when a production sends them a project request. Email shows project title, client email, and message with a direct "View in Dashboard" link.
- **`POST /api/connections`** — new server route that creates a connection request and triggers the crew notification email. `ConnectButton` now uses this route instead of inserting directly via the Supabase client.

### Changed
- **Dashboard redesign** — full rebuild of `DashboardClient`:
  - Header: notification bell with red badge count; tapping navigates to Inbox tab.
  - **Inbox tab** (default): amber banner when pending requests exist; each request shown as a notification card (project title, client email, message, date, Accept/Decline). Previous responses shown in a compact "Earlier" list.
  - **My Card tab**: role icon + name + experience; city, rate, bio, specialization chips. Availability toggle is now an inline dropdown pill that saves to Supabase on selection. Activation card moved here.
  - Removed old stats strip and 2-tab layout.
- **`dashboard/page.tsx`** — also fetches `profile_specializations` and passes them to `DashboardClient`.

---

## [0.7.0-beta.1] — 2026-05-27

### Added
- **Legal consent modal** — shown before first Google or email sign-up if the user has not yet agreed. Geo-aware jurisdiction detection (PH / EU / UK / US / Other) via `api.country.is` with timezone fallback. Bottom-sheet modal with scroll-to-unlock: checkboxes remain disabled until the user scrolls to the bottom. Three checkboxes: Terms of Use, jurisdiction-specific Privacy Policy (RA 10173 / GDPR / CCPA), and Beta Platform Notice. "I Agree & Continue" amber pill activates only when all three are checked; "Decline" outline pill always available. Agreement stored in `localStorage` (`ync_legal_v1`) so returning users are not shown the modal again. Declining blocks sign-up flow.
- **`components/LegalModal.tsx`** — self-contained modal component; exports `hasAgreedToTerms()` and `recordAgreement()` helpers used by the auth page.

---

## [0.6.0-beta.1] — 2026-05-27

### Changed
- **Auth page redesign** — all buttons are now pill/capsule shaped (borderRadius 999). Google button: white pill with shadow. Email input: pill container with icon inside. Submit button: amber pill. Tab switcher: iOS-style segmented pill control. Ambient amber glow added to background. Card corners increased to 24px. "Join" renamed to "Sign up" for clarity.
- **Bottom nav Account tab** — detects login state. When logged out, tapping Account shows a mini sheet above the nav bar with "Sign up free" (amber pill) and "Log in" (outline pill) options. When logged in, navigates directly to Dashboard. Sheet auto-dismisses on login.

---

## [0.5.1-beta.1] — 2026-05-27

### Changed
- **Find page redesign** — search box now uses the same pill-style as the homepage (glass background, amber Find button, role suggestion dropdown). Filter dropdowns are pill-shaped with unique accent colors per filter: Role (amber), Location (blue), Experience (purple), Availability (green). Active filters shown as removable color badges above results. Crew cards redesigned with left availability border, colored avatar ring, specialization chips, and full-card tap target. Results shown in a 2-column grid on wider screens.

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
