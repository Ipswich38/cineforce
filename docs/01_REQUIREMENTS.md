# Requirements

**Project:** CineVerse  
**Version:** 0.19.0-beta.1  
**Last updated:** 2026-05-29

---

## 1. Product Vision

CineVerse is a professional crew marketplace for the Philippine film and television industry. It lets crew members build a discoverable profile card (their "digital calling card") and lets producers, directors, and production companies find and connect with vetted crew — fast.

---

## 2. User Personas

### Crew Member
- Cinematographer, gaffer, boom op, editor, MUA, etc.
- Wants to be found for the next job without cold-emailing.
- Wants to show their credits, kit, and availability in one place.

### Hiring Party (Producer / Director / Coordinator)
- Needs to staff a production quickly.
- Wants to filter by role, city, experience, and availability.
- Wants to contact crew without sharing their own details upfront.

---

## 3. Functional Requirements

### FR-1: Authentication
- Users can sign in / sign up via **Google OAuth** (one-click).
- Users can sign in / sign up via **Magic Link email OTP** (no password).
- Authenticated session is managed by Supabase Auth (JWT).
- Post-auth redirect: new users go to `/join` for onboarding; returning users go to `/dashboard`.

### FR-2: Profile Creation (Crew)
- A crew member fills in: display name, role, specializations, city, experience level, availability, rate range, bio, showreel URL, portfolio URL.
- Profile slug is auto-generated from display name (unique, URL-safe).
- Specializations stored in a separate `profile_specializations` table (1NF).

### FR-3: Public Profile Page
- Any visitor can view a crew profile at `/crew/[slug]`.
- Shows: hero photo, name, availability, role, specializations, city, rate, bio, equipment kit, credits list.
- Shows a **Connect** button; contact details remain hidden until connection is accepted.

### FR-4: Search & Discovery
- Full-text search by name on `/search`.
- Filter by: role, city, experience level, availability.
- Inline role suggestion dropdown while typing (matches 80+ industry roles and aliases).
- Results sorted by creation date (newest first).

### FR-5: Role Suggestions
- The hero search and the `/search` page input both show an auto-suggest dropdown.
- Suggestions come from `lib/industryRoles.ts` (80+ roles, 19 departments, aliases).
- Clicking a role suggestion navigates to `/search?role=<id>` or sets the filter directly.

### FR-6: Crew Browser (Home)
- Homepage shows a swipeable card stack (Tinder-style) of crew profiles.
- Filterable by role and "Available now" toggle.
- Skip card with X button; view full profile with amber button.
- Touch swipe supported on mobile.

### FR-7: Connection Requests
- Any logged-in user can send a connection request to a crew member.
- `POST /api/connections` with `{ crewId, message?, projectTitle?, projectDates? }`.
- Crew member sees incoming requests on `/dashboard`.
- Crew can accept or decline a request.
- On accepted: requester can see crew's private contact details (phone, email, Facebook, Instagram).

### FR-8: Dashboard
- Authenticated-only page at `/dashboard`.
- Shows incoming connection requests with status (pending / accepted / declined).

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Page load time (LCP) | < 2.5 s on 4G mobile |
| NFR-2 | Auth session persistence | Supabase JWT, auto-refresh |
| NFR-3 | Database normalization | 3NF minimum |
| NFR-4 | Row-level security | All tables must have RLS enabled |
| NFR-5 | Contact privacy | Contact details only exposed on accepted connection |
| NFR-6 | Accessibility | Semantic HTML, ARIA labels on interactive controls |
| NFR-7 | Mobile-first | All pages responsive; touch gestures on card stack |
| NFR-8 | No dummy data in production | Real profiles only; empty states shown if DB is empty |

---

## 5. Out of Scope (Beta)

The following are deferred to a post-beta milestone:

- Payment / subscription flow (accepting paid subscribers)
- In-app messaging (real-time chat)
- Crew portfolio image gallery (multiple photos)
- Profile verification / badge system
- Email notification on connection request
- Admin panel
- Search by rate range
- Pagination on search results (currently returns all, sorted by date)
