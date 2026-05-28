# Testing

**Project:** CineVerse  
**Version:** 0.19.0-beta.1  
**Last updated:** 2026-05-29

---

## Test Strategy

CineVerse is a beta product with no automated test suite yet. Testing is manual and performed as a structured smoke test before every production deploy. The goal is to verify the core user journeys work end-to-end — not to exercise every code path.

---

## Pre-Deploy Smoke Test Checklist

Run this checklist in a real browser (not localhost) on the production URL before marking a deploy as stable.

### 1. Homepage

- [ ] Page loads without JS error in console
- [ ] Nav logo visible; "Join" CTA button is amber
- [ ] Hero search input accepts text
- [ ] Typing a role name (e.g. "gaffer") shows role suggestions dropdown
- [ ] Typing a person's name shows People suggestions (if profiles exist)
- [ ] Clicking a role suggestion navigates to `/search?role=<id>`
- [ ] Clicking "Find" button submits search
- [ ] Crew card stack loads (or shows loading skeleton, then empty deck)
- [ ] Role filter pills are horizontally scrollable on mobile
- [ ] "Available now" pill toggles filter

### 2. Search Page (`/search`)

- [ ] Loads with no results initially, then shows crew or "0 crew"
- [ ] No "Sample" badge visible (sample profiles are removed)
- [ ] Search input → typing shows role suggestions dropdown
- [ ] Clicking a role suggestion sets the role filter chip (active state)
- [ ] Role / Location / Experience / Availability filters work independently
- [ ] "Clear" button appears when any filter is active; clears all filters
- [ ] "View Full Profile" link on a card navigates to `/crew/<slug>`
- [ ] "Message [Name]" button is visible (may be a stub at this stage)

### 3. Crew Profile Page (`/crew/[slug]`)

- [ ] Valid slug: profile page renders with name, role, city, availability
- [ ] Invalid slug: returns Next.js 404 page (not a crash)
- [ ] "Connect" button visible when not logged in
- [ ] Clicking "Connect" when not logged in redirects to `/auth`
- [ ] Credits section hidden when profile has no credits
- [ ] Equipment section hidden when profile has no equipment

### 4. Auth Page (`/auth`)

- [ ] "Log in" tab shows "Welcome back" heading
- [ ] "Join" tab has amber button background; shows "Get listed" heading
- [ ] Google button present and clicks without JS error (actual OAuth flow requires a real session)
- [ ] Email input + "Send link" button visible
- [ ] Submitting empty email shows browser validation
- [ ] After sending OTP: "Check your inbox" confirmation state renders
- [ ] "Use a different email" link returns to form

### 5. Auth Flow (Google OAuth — requires a real Google account)

- [ ] Click "Continue with Google" → Google consent screen opens
- [ ] Complete auth -> redirected back to cineverseph.vercel.app
- [ ] New user → redirected to `/join`
- [ ] Returning user → redirected to `/dashboard`
- [ ] Session persists on page refresh
- [ ] No redirect to wrong project (skypixel18 or similar)

### 6. Join / Onboarding (`/join`)

- [ ] Page is accessible only when logged in (unauthenticated → redirect to `/auth`)
- [ ] Form renders correctly

### 7. Dashboard (`/dashboard`)

- [ ] Accessible only when logged in
- [ ] Unauthenticated access redirects to `/auth`
- [ ] Incoming connection requests visible (if any)

### 8. Mobile Responsiveness

- [ ] Homepage hero search pill fits within viewport on 375px width
- [ ] Card stack is full-width on mobile
- [ ] Search filters are horizontally scrollable without breaking layout
- [ ] Profile page info cards are readable on 375px

---

## Smoke Test Log

| Date | Version | Tester | Result | Notes |
|---|---|---|---|---|
| 2026-05-26 | 0.1.0-beta.1 | Cherwin | Pass | Role suggestions working; sample profiles removed; Google OAuth confirmed |

---

## Regression Areas

When making changes in the following areas, always re-test the related smoke test sections:

| Changed file | Re-test sections |
|---|---|
| `app/page.tsx` | Homepage, Auth flow |
| `app/search/page.tsx` | Search page |
| `app/crew/[slug]/page.tsx` | Crew profile page |
| `app/auth/page.tsx` | Auth page, Auth flow |
| `app/auth/callback/` | Auth flow |
| `lib/industryRoles.ts` | Homepage (suggestions), Search page (suggestions) |
| `supabase/schema.sql` | All sections that read from DB |
| `lib/constants.ts` | Homepage filters, Search page filters |
