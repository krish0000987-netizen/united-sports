-- ============================================================================
-- UNITED SPORTS / UNITEDATHLETES — RLS POLICIES  (0002_rls_policies.sql)
-- ----------------------------------------------------------------------------
-- Run after 0001_cms_schema.sql. Idempotent via DO blocks.
-- Security model:
--   * Anonymous  → SELECT only on published/visible public content.
--   * Staff      → is_staff() (active super_admin OR editor profile) can
--                  INSERT/UPDATE/DELETE editorial + structural content.
--   * Super admin→ additionally manages site_settings, profiles, users.
--   * Storage    → public read of website-media; staff can upload/manage.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_read_own') then
    create policy "profiles_read_own" on public.profiles
      for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_read_staff') then
    create policy "profiles_read_staff" on public.profiles
      for select to authenticated using (public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own') then
    create policy "profiles_update_own" on public.profiles
      for update to authenticated using (user_id = auth.uid())
      with check (user_id = auth.uid() and role = (select role from public.profiles where user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_admin_all') then
    create policy "profiles_admin_all" on public.profiles
      for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- MEDIA + MEDIA FOLDERS
-- ---------------------------------------------------------------------------
alter table public.media_folders enable row level security;
alter table public.media enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='media_folders' and policyname='media_folders_read_public') then
    create policy "media_folders_read_public" on public.media_folders
      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='media_folders' and policyname='media_folders_staff_all') then
    create policy "media_folders_staff_all" on public.media_folders
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='media' and policyname='media_read_public') then
    create policy "media_read_public" on public.media
      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='media' and policyname='media_staff_all') then
    create policy "media_staff_all" on public.media
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- BLOGS, CATEGORIES, TAGS, POST-TAGS
-- ---------------------------------------------------------------------------
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blogs enable row level security;
alter table public.blog_post_tags enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_categories' and policyname='blog_categories_read_public') then
    create policy "blog_categories_read_public" on public.blog_categories
      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_categories' and policyname='blog_categories_staff_all') then
    create policy "blog_categories_staff_all" on public.blog_categories
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_tags' and policyname='blog_tags_read_public') then
    create policy "blog_tags_read_public" on public.blog_tags
      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_tags' and policyname='blog_tags_staff_all') then
    create policy "blog_tags_staff_all" on public.blog_tags
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blogs' and policyname='blogs_read_public') then
    create policy "blogs_read_public" on public.blogs
      for select to anon, authenticated
      using (status = 'published' and (published_at is null or published_at <= now()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blogs' and policyname='blogs_staff_all') then
    create policy "blogs_staff_all" on public.blogs
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_post_tags' and policyname='blog_post_tags_read_public') then
    create policy "blog_post_tags_read_public" on public.blog_post_tags
      for select to anon, authenticated
      using (exists (
        select 1 from public.blogs b
        where b.id = blog_id and b.status = 'published'
          and (b.published_at is null or b.published_at <= now())
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_post_tags' and policyname='blog_post_tags_staff_all') then
    create policy "blog_post_tags_staff_all" on public.blog_post_tags
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- NAVIGATION
-- ---------------------------------------------------------------------------
alter table public.navigation_menus enable row level security;
alter table public.navigation_items enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='navigation_menus' and policyname='nav_menus_read_public') then
    create policy "nav_menus_read_public" on public.navigation_menus
      for select to anon, authenticated using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='navigation_menus' and policyname='nav_menus_staff_all') then
    create policy "nav_menus_staff_all" on public.navigation_menus
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='navigation_items' and policyname='nav_items_read_public') then
    create policy "nav_items_read_public" on public.navigation_items
      for select to anon, authenticated using (is_visible = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='navigation_items' and policyname='nav_items_staff_all') then
    create policy "nav_items_staff_all" on public.navigation_items
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- FOOTER
-- ---------------------------------------------------------------------------
alter table public.footer_sections enable row level security;
alter table public.footer_items enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='footer_sections' and policyname='footer_sections_read_public') then
    create policy "footer_sections_read_public" on public.footer_sections
      for select to anon, authenticated using (is_visible = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='footer_sections' and policyname='footer_sections_staff_all') then
    create policy "footer_sections_staff_all" on public.footer_sections
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='footer_items' and policyname='footer_items_read_public') then
    create policy "footer_items_read_public" on public.footer_items
      for select to anon, authenticated using (is_visible = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='footer_items' and policyname='footer_items_staff_all') then
    create policy "footer_items_staff_all" on public.footer_items
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- PAGES + PAGE SECTIONS
-- ---------------------------------------------------------------------------
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='pages' and policyname='pages_read_public') then
    create policy "pages_read_public" on public.pages
      for select to anon, authenticated
      using (status = 'published' and (published_at is null or published_at <= now()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='pages' and policyname='pages_staff_all') then
    create policy "pages_staff_all" on public.pages
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='page_sections' and policyname='page_sections_read_public') then
    create policy "page_sections_read_public" on public.page_sections
      for select to anon, authenticated
      using (is_visible = true and exists (
        select 1 from public.pages p
        where p.id = page_id and p.status = 'published'
          and (p.published_at is null or p.published_at <= now())
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='page_sections' and policyname='page_sections_staff_all') then
    create policy "page_sections_staff_all" on public.page_sections
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- SITE SETTINGS + SEO METADATA
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.seo_metadata enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_settings' and policyname='site_settings_read_public') then
    create policy "site_settings_read_public" on public.site_settings
      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_settings' and policyname='site_settings_super_admin_all') then
    create policy "site_settings_super_admin_all" on public.site_settings
      for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='seo_metadata' and policyname='seo_metadata_read_public') then
    create policy "seo_metadata_read_public" on public.seo_metadata
      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='seo_metadata' and policyname='seo_metadata_staff_all') then
    create policy "seo_metadata_staff_all" on public.seo_metadata
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- REVISIONS + ACTIVITY LOGS
-- ---------------------------------------------------------------------------
alter table public.page_revisions enable row level security;
alter table public.blog_revisions enable row level security;
alter table public.activity_logs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='page_revisions' and policyname='page_revisions_staff_read') then
    create policy "page_revisions_staff_read" on public.page_revisions
      for select to authenticated using (public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='page_revisions' and policyname='page_revisions_staff_insert') then
    create policy "page_revisions_staff_insert" on public.page_revisions
      for insert to authenticated with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_revisions' and policyname='blog_revisions_staff_read') then
    create policy "blog_revisions_staff_read" on public.blog_revisions
      for select to authenticated using (public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_revisions' and policyname='blog_revisions_staff_insert') then
    create policy "blog_revisions_staff_insert" on public.blog_revisions
      for insert to authenticated with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='activity_logs' and policyname='activity_logs_staff_read') then
    create policy "activity_logs_staff_read" on public.activity_logs
      for select to authenticated using (public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='activity_logs' and policyname='activity_logs_staff_insert') then
    create policy "activity_logs_staff_insert" on public.activity_logs
      for insert to authenticated with check (public.is_staff());
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- STORAGE (website-media bucket)
--   * public read of all objects
--   * staff can upload / update / delete
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='cms_public_read_website_media') then
    create policy "cms_public_read_website_media" on storage.objects
      for select using (bucket_id = 'website-media');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='cms_staff_upload_website_media') then
    create policy "cms_staff_upload_website_media" on storage.objects
      for insert to authenticated with check (bucket_id = 'website-media' and public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='cms_staff_update_website_media') then
    create policy "cms_staff_update_website_media" on storage.objects
      for update to authenticated using (bucket_id = 'website-media' and public.is_staff())
      with check (bucket_id = 'website-media' and public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='cms_staff_delete_website_media') then
    create policy "cms_staff_delete_website_media" on storage.objects
      for delete to authenticated using (bucket_id = 'website-media' and public.is_staff());
  end if;
end $$;
