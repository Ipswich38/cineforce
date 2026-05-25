-- SetReady database schema
-- Run this in your Supabase SQL editor

-- Profiles (public)
create table if not exists profiles (
  id                uuid references auth.users on delete cascade primary key,
  slug              text unique not null,
  display_name      text not null,
  avatar_url        text,
  bio               text,
  role              text not null,
  specializations   text[] default '{}',
  experience_level  text not null default 'mid',
  city              text not null,
  region            text,
  availability      text not null default 'available',
  rate_min          integer,
  rate_max          integer,
  rate_currency     text default 'PHP',
  rate_unit         text default 'day',
  portfolio_url     text,
  showreel_url      text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Equipment (public)
create table if not exists equipment (
  id          uuid default gen_random_uuid() primary key,
  profile_id  uuid references profiles(id) on delete cascade not null,
  name        text not null,
  description text,
  category    text,
  created_at  timestamptz default now()
);

-- Credits / past work (public)
create table if not exists credits (
  id              uuid default gen_random_uuid() primary key,
  profile_id      uuid references profiles(id) on delete cascade not null,
  project_title   text not null,
  role            text not null,
  year            integer,
  type            text,
  network_studio  text,
  created_at      timestamptz default now()
);

-- Connection requests
create table if not exists connection_requests (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid references auth.users(id) on delete cascade not null,
  crew_id       uuid references profiles(id) on delete cascade not null,
  status        text not null default 'pending',
  message       text,
  project_title text,
  project_dates text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(client_id, crew_id)
);

-- Contact details (private — only revealed on accepted connection)
create table if not exists contact_details (
  id            uuid references auth.users on delete cascade primary key,
  phone         text,
  email         text,
  facebook_url  text,
  instagram_url text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Row-level security
alter table profiles          enable row level security;
alter table equipment         enable row level security;
alter table credits           enable row level security;
alter table connection_requests enable row level security;
alter table contact_details   enable row level security;

-- Profiles: anyone can read, only owner can write
create policy "profiles_read"  on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Equipment: anyone can read, only owner can write
create policy "equipment_read"   on equipment for select using (true);
create policy "equipment_insert" on equipment for insert with check (
  auth.uid() = (select id from profiles where id = profile_id)
);
create policy "equipment_delete" on equipment for delete using (
  auth.uid() = (select id from profiles where id = profile_id)
);

-- Credits: anyone can read, only owner can write
create policy "credits_read"   on credits for select using (true);
create policy "credits_insert" on credits for insert with check (
  auth.uid() = (select id from profiles where id = profile_id)
);
create policy "credits_delete" on credits for delete using (
  auth.uid() = (select id from profiles where id = profile_id)
);

-- Connection requests
create policy "conn_req_read" on connection_requests for select
  using (auth.uid() = client_id or auth.uid() = crew_id);

create policy "conn_req_insert" on connection_requests for insert
  with check (auth.uid() = client_id);

create policy "conn_req_update" on connection_requests for update
  using (auth.uid() = crew_id);

-- Contact details: only visible to self OR to clients with accepted connection
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

create policy "contact_insert" on contact_details for insert
  with check (auth.uid() = id);

create policy "contact_update" on contact_details for update
  using (auth.uid() = id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at          before update on profiles          for each row execute function update_updated_at();
create trigger connection_requests_updated_at before update on connection_requests for each row execute function update_updated_at();
create trigger contact_details_updated_at   before update on contact_details   for each row execute function update_updated_at();
