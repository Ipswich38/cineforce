-- CineVerse database schema — 3NF normalized
-- Run this in your Supabase SQL editor (fresh project, no existing tables)

-- ─────────────────────────────────────────────
-- PROFILES
-- Each attribute depends solely on id (PK).
-- specializations extracted to avoid 1NF violation.
-- region removed (was transitively dependent on city).
-- rate_currency removed (app is PHP-only; no partial constant dep).
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id               uuid references auth.users on delete cascade primary key,
  slug             text unique not null,
  display_name     text not null,
  avatar_url       text,
  bio              text,
  role             text not null check (role in (
                     'director','dp','camera_op','gaffer','sound_mixer',
                     'editor','colorist','prod_designer','art_director',
                     'mua','wardrobe','ad','prod_manager',
                     'script_supervisor','vfx','pa'
                   )),
  experience_level text not null default 'mid' check (experience_level in ('entry','mid','senior','expert')),
  city             text not null,
  availability     text not null default 'available' check (availability in ('available','busy','not_looking')),
  rate_min         integer check (rate_min >= 0),
  rate_max         integer check (rate_max >= 0),
  rate_unit        text default 'day' check (rate_unit in ('day','half','hour','project')),
  portfolio_url    text,
  showreel_url     text,
  premium_status        text not null default 'free' check (premium_status in ('free','requested','active')),
  premium_requested_at  timestamptz,
  premium_activated_at  timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  constraint rate_range_valid check (rate_max is null or rate_min is null or rate_max >= rate_min)
);

-- ─────────────────────────────────────────────
-- PROFILE SPECIALIZATIONS
-- Extracted from profiles.specializations text[] to satisfy 1NF.
-- Each row is one atomic specialization for one profile.
-- ─────────────────────────────────────────────
create table if not exists profile_specializations (
  id         uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  name       text not null,
  unique(profile_id, name)
);

-- ─────────────────────────────────────────────
-- EQUIPMENT
-- All attributes depend solely on id (PK). 3NF satisfied.
-- ─────────────────────────────────────────────
create table if not exists equipment (
  id          uuid default gen_random_uuid() primary key,
  profile_id  uuid references profiles(id) on delete cascade not null,
  name        text not null,
  description text,
  category    text,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
-- CREDITS
-- All attributes depend solely on id (PK). 3NF satisfied.
-- ─────────────────────────────────────────────
create table if not exists credits (
  id             uuid default gen_random_uuid() primary key,
  profile_id     uuid references profiles(id) on delete cascade not null,
  project_title  text not null,
  role           text not null,
  year           integer check (year >= 1900 and year <= 2100),
  type           text check (type in ('film','tv','commercial','music_video','documentary','short_film','content','corporate')),
  network_studio text,
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────────
-- CONNECTION REQUESTS
-- unique(client_id, crew_id) prevents duplicate requests.
-- status constrained to valid values.
-- ─────────────────────────────────────────────
create table if not exists connection_requests (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid references auth.users(id) on delete cascade not null,
  crew_id       uuid references profiles(id) on delete cascade not null,
  status        text not null default 'pending' check (status in ('pending','accepted','declined')),
  message       text,
  project_title text,
  project_dates text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(client_id, crew_id)
);

-- ─────────────────────────────────────────────
-- CONTACT DETAILS
-- Private — only revealed on accepted connection.
-- All attributes depend solely on id (PK). 3NF satisfied.
-- ─────────────────────────────────────────────
create table if not exists contact_details (
  id            uuid references auth.users on delete cascade primary key,
  phone         text,
  email         text,
  facebook_url  text,
  instagram_url text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table profiles               enable row level security;
alter table profile_specializations enable row level security;
alter table equipment              enable row level security;
alter table credits                enable row level security;
alter table connection_requests    enable row level security;
alter table contact_details        enable row level security;

-- Profiles
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Specializations
create policy "specs_read"   on profile_specializations for select using (true);
create policy "specs_insert" on profile_specializations for insert with check (
  auth.uid() = (select id from profiles where id = profile_id)
);
create policy "specs_delete" on profile_specializations for delete using (
  auth.uid() = (select id from profiles where id = profile_id)
);

-- Equipment
create policy "equipment_read"   on equipment for select using (true);
create policy "equipment_insert" on equipment for insert with check (
  auth.uid() = (select id from profiles where id = profile_id)
);
create policy "equipment_delete" on equipment for delete using (
  auth.uid() = (select id from profiles where id = profile_id)
);

-- Credits
create policy "credits_read"   on credits for select using (true);
create policy "credits_insert" on credits for insert with check (
  auth.uid() = (select id from profiles where id = profile_id)
);
create policy "credits_delete" on credits for delete using (
  auth.uid() = (select id from profiles where id = profile_id)
);

-- Connection requests
create policy "conn_req_read"   on connection_requests for select
  using (auth.uid() = client_id or auth.uid() = crew_id);
create policy "conn_req_insert" on connection_requests for insert
  with check (auth.uid() = client_id);
create policy "conn_req_update" on connection_requests for update
  using (auth.uid() = crew_id);

-- Contact details
create policy "contact_self_read" on contact_details for select
  using (
    auth.uid() = id
    or exists (
      select 1 from connection_requests
      where client_id = auth.uid()
        and crew_id = contact_details.id
        and status = 'accepted'
    )
  );
create policy "contact_insert" on contact_details for insert with check (auth.uid() = id);
create policy "contact_update" on contact_details for update using (auth.uid() = id);

-- ─────────────────────────────────────────────
-- TRIGGERS — auto-update updated_at
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger connection_requests_updated_at
  before update on connection_requests
  for each row execute function update_updated_at();

create trigger contact_details_updated_at
  before update on contact_details
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- MIGRATION: v0.2.0-beta.1 — Premium system
-- Run this section on an existing database.
-- (Already included above for fresh installs.)
-- ─────────────────────────────────────────────
alter table profiles add column if not exists premium_status       text not null default 'free' check (premium_status in ('free','requested','active'));
alter table profiles add column if not exists premium_requested_at timestamptz;
alter table profiles add column if not exists premium_activated_at timestamptz;

-- ─────────────────────────────────────────────
-- MIGRATION: v0.3.0-beta.1 — Founding tier system
-- ─────────────────────────────────────────────
alter table profiles add column if not exists founding_tier text check (founding_tier in ('founding','pioneer','early'));

-- ─────────────────────────────────────────────
-- MIGRATION: v0.8.x — Client account type system
-- Run this on an existing database if not already applied.
-- ─────────────────────────────────────────────
alter table profiles alter column role drop not null;
alter table profiles add column if not exists account_type     text not null default 'crew' check (account_type in ('crew','client'));
alter table profiles add column if not exists company          text;
alter table profiles add column if not exists production_type  text;

create table if not exists favorites (
  id         uuid default gen_random_uuid() primary key,
  client_id  uuid references auth.users(id) on delete cascade not null,
  crew_id    uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(client_id, crew_id)
);

alter table favorites enable row level security;
create policy "fav_read"   on favorites for select using (auth.uid() = client_id);
create policy "fav_insert" on favorites for insert with check (auth.uid() = client_id);
create policy "fav_delete" on favorites for delete using (auth.uid() = client_id);

-- ─────────────────────────────────────────────
-- MIGRATION: v0.11.0 — 14-day free trial system
-- ─────────────────────────────────────────────
alter table profiles add column if not exists trial_started_at timestamptz;

-- Expand premium_status to include trial/expired states
alter table profiles drop constraint if exists profiles_premium_status_check;
alter table profiles add constraint profiles_premium_status_check
  check (premium_status in ('free', 'trial', 'active', 'expired', 'requested'));

-- Set default for new signups
alter table profiles alter column premium_status set default 'trial';

-- Give all existing free/requested users a fresh 14-day trial
update profiles
set premium_status = 'trial', trial_started_at = now()
where premium_status in ('free', 'requested') and trial_started_at is null;

-- ─────────────────────────────────────────────
-- MIGRATION: v0.12.0 — Support tickets
-- ─────────────────────────────────────────────
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
create policy "tickets_insert" on support_tickets for insert with check (auth.uid() = user_id);
create policy "tickets_own_read" on support_tickets for select using (auth.uid() = user_id);

create trigger support_tickets_updated_at
  before update on support_tickets
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- MIGRATION: v0.13.x — Account pause feature
-- ─────────────────────────────────────────────
alter table profiles add column if not exists is_paused boolean not null default false;

-- ─────────────────────────────────────────────
-- MIGRATION: v0.15.0-beta.1 — In-app chat + Skip For Now
-- ─────────────────────────────────────────────

-- Add 'skipped' to connection request status values
alter table connection_requests drop constraint if exists connection_requests_status_check;
alter table connection_requests add constraint connection_requests_status_check
  check (status in ('pending','accepted','declined','skipped'));

create table if not exists messages (
  id             uuid default gen_random_uuid() primary key,
  connection_id  uuid references connection_requests(id) on delete cascade not null,
  sender_id      uuid references auth.users(id) on delete cascade not null,
  body           text not null,
  created_at     timestamptz default now()
);

alter table messages enable row level security;
create policy "messages_read" on messages for select
  using (
    connection_id in (
      select id from connection_requests
      where (client_id = auth.uid() or crew_id = auth.uid())
        and status = 'accepted'
    )
  );
create policy "messages_insert" on messages for insert
  with check (
    sender_id = auth.uid()
    and connection_id in (
      select id from connection_requests
      where (client_id = auth.uid() or crew_id = auth.uid())
        and status = 'accepted'
    )
  );

-- ─────────────────────────────────────────────
-- MIGRATION: v0.16.0-beta.1 — Availability calendar + specializations
-- ─────────────────────────────────────────────

-- Denormalized specializations array on profiles (used by settings UI)
alter table profiles add column if not exists specializations text[] default '{}';

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
