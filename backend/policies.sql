-- ==========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES — SAKSHAM PANDEY | NEXVORA TECHNOLOGIES
-- ==========================================================================
-- Security Architecture:
-- 1. Public visitors (anon) can ONLY read published records (`published = true`).
--    Unpublished drafts and private contact messages are inaccessible publicly.
-- 2. Only authenticated administrators (`auth.role() = 'authenticated'`) can
--    INSERT, UPDATE, DELETE, or read unpublished draft records.
-- 3. Public visitors can INSERT contact messages (subject to schema length
--    checks), but cannot read or modify existing messages.
-- ==========================================================================

-- Enable RLS across all tables
alter table public.portfolio_state enable row level security;
alter table public.profile enable row level security;
alter table public.site_settings enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.achievements enable row level security;
alter table public.certifications enable row level security;
alter table public.resumes enable row level security;
alter table public.social_links enable row level security;
alter table public.contact_settings enable row level security;
alter table public.contact_messages enable row level security;

-- 1. Portfolio State Policies
create policy "Public read portfolio_state"
  on public.portfolio_state for select
  using (true);

create policy "Admin full access portfolio_state"
  on public.portfolio_state for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2. Singleton Public Read + Admin Write Policies
create policy "Public read profile" on public.profile for select using (true);
create policy "Admin write profile" on public.profile for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read site_settings" on public.site_settings for select using (true);
create policy "Admin write site_settings" on public.site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read contact_settings" on public.contact_settings for select using (true);
create policy "Admin write contact_settings" on public.contact_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 3. Collection Policies: Public Reads ONLY `published = true`, Admin Full Access
create policy "Public read published skills"
  on public.skills for select using (published = true or auth.role() = 'authenticated');
create policy "Admin manage skills"
  on public.skills for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read published experiences"
  on public.experiences for select using (published = true or auth.role() = 'authenticated');
create policy "Admin manage experiences"
  on public.experiences for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read published education"
  on public.education for select using (published = true or auth.role() = 'authenticated');
create policy "Admin manage education"
  on public.education for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read published projects"
  on public.projects for select using (published = true or auth.role() = 'authenticated');
create policy "Admin manage projects"
  on public.projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read project_media"
  on public.project_media for select using (true);
create policy "Admin manage project_media"
  on public.project_media for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read published achievements"
  on public.achievements for select using (published = true or auth.role() = 'authenticated');
create policy "Admin manage achievements"
  on public.achievements for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read published certifications"
  on public.certifications for select using (published = true or auth.role() = 'authenticated');
create policy "Admin manage certifications"
  on public.certifications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read published resumes"
  on public.resumes for select using (published = true or auth.role() = 'authenticated');
create policy "Admin manage resumes"
  on public.resumes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read published social_links"
  on public.social_links for select using (published = true or auth.role() = 'authenticated');
create policy "Admin manage social_links"
  on public.social_links for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 4. Contact Messages Inbox Policies (Public Insert Only; Admin Read/Delete)
create policy "Public submit contact message"
  on public.contact_messages for insert
  with check (char_length(name) >= 2 and char_length(message) >= 10);

create policy "Admin read and manage contact messages"
  on public.contact_messages for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 5. Supabase Storage Bucket Policies (resumes & portfolio-media)
create policy "Public read access for resumes and media"
  on storage.objects for select
  using (bucket_id in ('resumes', 'portfolio-media'));

create policy "Authenticated admin upload to resumes and media"
  on storage.objects for insert
  with check (
    bucket_id in ('resumes', 'portfolio-media')
    and auth.role() = 'authenticated'
  );

create policy "Authenticated admin update resumes and media"
  on storage.objects for update
  using (
    bucket_id in ('resumes', 'portfolio-media')
    and auth.role() = 'authenticated'
  );

create policy "Authenticated admin delete from resumes and media"
  on storage.objects for delete
  using (
    bucket_id in ('resumes', 'portfolio-media')
    and auth.role() = 'authenticated'
  );
