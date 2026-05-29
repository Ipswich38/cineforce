-- CineVerse v0.24.0 migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- All statements are idempotent — safe to re-run.

set search_path to public;

-- ── profiles: social links + multi-role support ─────────────────────────────

-- Drop the old role CHECK constraint so all 41 roles are accepted
alter table profiles
  drop constraint if exists profiles_role_check;

-- Multi-role support: secondary roles beyond the primary
alter table profiles
  add column if not exists secondary_roles text[] default '{}';

-- Public social / portfolio links (shown on crew card)
alter table profiles
  add column if not exists tiktok_url    text,
  add column if not exists instagram_url text,
  add column if not exists linkedin_url  text,
  add column if not exists facebook_url  text;

-- ── contact_details: messaging apps ─────────────────────────────────────────

alter table contact_details
  add column if not exists viber    text,
  add column if not exists whatsapp text;
