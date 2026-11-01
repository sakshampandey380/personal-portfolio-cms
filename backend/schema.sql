-- ==========================================================================
-- POSTGRESQL SCHEMA — SAKSHAM PANDEY | NEXVORA TECHNOLOGIES PORTFOLIO & CMS
-- Target Database: Supabase (PostgreSQL 15+)
-- ==========================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- 1. Unified Atomic Portfolio State Table (Used for fast single-roundtrip sync)
create table if not exists public.portfolio_state (
  id text primary key default 'main',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Normalized Relational Entities
create table if not exists public.profile (
  id text primary key default 'profile_main',
  full_name text not null,
  brand_name text default 'NEXVORA TECHNOLOGIES',
  monogram text default 'SP',
  headline text not null,
  short_bio text,
  location text default 'India',
  relocation_preference text,
  email text,
  availability_text text,
  show_availability boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'site_main',
  hero jsonb not null default '{}'::jsonb,
  about jsonb not null default '{}'::jsonb,
  theme_settings jsonb not null default '{}'::jsonb,
  navigation_settings jsonb not null default '{}'::jsonb,
  seo_settings jsonb not null default '{}'::jsonb,
  footer_tagline text,
  footer_attribution text default 'Designed and developed by Saksham Pandey.',
  privacy_notice text,
  copyright_holder text default 'Saksham Pandey · NEXVORA TECHNOLOGIES',
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id text primary key default ('sk_' || gen_random_uuid()::text),
  name text not null,
  category text not null,
  icon text,
  proficiency text,
  description text,
  related_projects text[] default '{}',
  display_order integer not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id text primary key default ('exp_' || gen_random_uuid()::text),
  type text not null default 'Employment',
  title text not null,
  organization text not null,
  location text,
  start_date text,
  end_date text,
  is_current boolean not null default false,
  description text,
  technologies text[] default '{}',
  highlights text[] default '{}',
  logo_url text,
  external_link text,
  display_order integer not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id text primary key default ('edu_' || gen_random_uuid()::text),
  type text not null default 'Education',
  title text not null,
  organization text not null,
  location text,
  start_date text,
  end_date text,
  is_current boolean not null default false,
  description text,
  technologies text[] default '{}',
  highlights text[] default '{}',
  external_link text,
  display_order integer not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key default ('proj_' || gen_random_uuid()::text),
  title text not null,
  summary text not null,
  description text,
  cover_image text,
  screenshots text[] default '{}',
  demo_video_url text,
  category text not null,
  tech_stack text[] default '{}',
  key_features text[] default '{}',
  my_contribution text,
  technical_challenges text,
  solutions_tradeoffs text,
  measurable_outcomes text,
  github_url text,
  live_url text,
  case_study text,
  featured boolean not null default false,
  published boolean not null default true,
  display_order integer not null default 1,
  created_date text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id text primary key default ('med_' || gen_random_uuid()::text),
  project_id text references public.projects(id) on delete cascade,
  name text not null,
  url text not null,
  mime_type text,
  size_label text,
  display_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id text primary key default ('ach_' || gen_random_uuid()::text),
  category text default 'Achievement',
  title text not null,
  issuer text,
  date text,
  description text,
  credential_url text,
  media_url text,
  published boolean not null default true,
  display_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id text primary key default ('cert_' || gen_random_uuid()::text),
  category text default 'Certification',
  title text not null,
  issuer text not null,
  date text,
  description text,
  credential_url text,
  media_url text,
  published boolean not null default true,
  display_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id text primary key default ('res_' || gen_random_uuid()::text),
  title text not null,
  target_role text not null,
  category text not null,
  description text,
  file_url text not null,
  file_name text not null,
  file_size text,
  storage_id text,
  version text default 'v1.0',
  featured boolean not null default false,
  published boolean not null default true,
  download_count integer not null default 0,
  display_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id text primary key default ('soc_' || gen_random_uuid()::text),
  platform text not null,
  label text,
  url text not null,
  icon text,
  published boolean not null default true,
  display_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_settings (
  id text primary key default 'contact_main',
  heading text,
  subheading text,
  recipient_email text,
  response_time_note text,
  consent_text text,
  whatsapp_phone text,
  whatsapp_greeting text,
  show_floating_whatsapp boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id text primary key default ('msg_' || gen_random_uuid()::text),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 160),
  subject text,
  budget text,
  deadline text,
  message text not null check (char_length(message) between 10 and 3000),
  status text not null default 'unread',
  created_at timestamptz not null default now()
);

-- Create Managed Object Storage Buckets for Resumes & Media
insert into storage.buckets (id, name, public)
values
  ('resumes', 'resumes', true),
  ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;
