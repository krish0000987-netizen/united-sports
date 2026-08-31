-- RLS: public can read only published content, writes require authenticated + role
alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.page_section_items enable row level security;
alter table public.blogs enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.media enable row level security;
alter table public.media_folders enable row level security;
alter table public.navigation_menus enable row level security;
alter table public.navigation_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.seo_metadata enable row level security;
alter table public.page_revisions enable row level security;
alter table public.blog_revisions enable row level security;
alter table public.activity_logs enable row level security;

-- helper: is admin
create or replace function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role in ('super_admin','editor') and is_active = true
  );
$$ language sql security definer stable;

create or replace function public.is_super_admin() returns boolean as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'super_admin' and is_active = true
  );
$$ language sql security definer stable;

-- profiles: users can read own, admins read all; users can update own
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "profiles admin write" on public.profiles;
create policy "profiles admin write" on public.profiles for all using (public.is_super_admin());

-- pages: public read published only
drop policy if exists "pages public read" on public.pages;
create policy "pages public read" on public.pages for select using (
  status = 'published' and (published_at is null or published_at <= now())
);
drop policy if exists "pages admin all" on public.pages;
create policy "pages admin all" on public.pages for all using (public.is_admin()) with check (public.is_admin());

-- page_sections: public read visible sections of published pages
drop policy if exists "sections public read" on public.page_sections;
create policy "sections public read" on public.page_sections for select using (
  is_visible = true and exists (select 1 from public.pages p where p.id = page_id and p.status='published' and (p.published_at is null or p.published_at <= now()))
);
drop policy if exists "sections admin all" on public.page_sections;
create policy "sections admin all" on public.page_sections for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "section_items public" on public.page_section_items;
create policy "section_items public" on public.page_section_items for select using (true);
drop policy if exists "section_items admin" on public.page_section_items;
create policy "section_items admin" on public.page_section_items for all using (public.is_admin()) with check (public.is_admin());

-- blogs: public read published
drop policy if exists "blogs public read" on public.blogs;
create policy "blogs public read" on public.blogs for select using (status='published' and (published_at is null or published_at <= now()));
drop policy if exists "blogs admin all" on public.blogs;
create policy "blogs admin all" on public.blogs for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories public" on public.blog_categories;
create policy "categories public" on public.blog_categories for select using (true);
drop policy if exists "categories admin" on public.blog_categories;
create policy "categories admin" on public.blog_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tags public" on public.blog_tags;
create policy "tags public" on public.blog_tags for select using (true);
drop policy if exists "tags admin" on public.blog_tags;
create policy "tags admin" on public.blog_tags for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "post_tags public" on public.blog_post_tags;
create policy "post_tags public" on public.blog_post_tags for select using (true);
drop policy if exists "post_tags admin" on public.blog_post_tags;
create policy "post_tags admin" on public.blog_post_tags for all using (public.is_admin()) with check (public.is_admin());

-- media: public read, admin write
drop policy if exists "media public read" on public.media;
create policy "media public read" on public.media for select using (true);
drop policy if exists "media admin write" on public.media;
create policy "media admin write" on public.media for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "media_folders public" on public.media_folders;
create policy "media_folders public" on public.media_folders for select using (true);
drop policy if exists "media_folders admin" on public.media_folders;
create policy "media_folders admin" on public.media_folders for all using (public.is_admin()) with check (public.is_admin());

-- navigation: public read visible
drop policy if exists "nav menus public" on public.navigation_menus;
create policy "nav menus public" on public.navigation_menus for select using (true);
drop policy if exists "nav menus admin" on public.navigation_menus;
create policy "nav menus admin" on public.navigation_menus for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "nav items public" on public.navigation_items;
create policy "nav items public" on public.navigation_items for select using (is_visible = true);
drop policy if exists "nav items admin" on public.navigation_items;
create policy "nav items admin" on public.navigation_items for all using (public.is_admin()) with check (public.is_admin());

-- site_settings / seo: public read, super_admin write
drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings for select using (true);
drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "seo public read" on public.seo_metadata;
create policy "seo public read" on public.seo_metadata for select using (true);
drop policy if exists "seo admin write" on public.seo_metadata;
create policy "seo admin write" on public.seo_metadata for all using (public.is_admin()) with check (public.is_admin());

-- revisions/activity: admin only
drop policy if exists "revisions admin" on public.page_revisions;
create policy "revisions admin" on public.page_revisions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "blog revisions admin" on public.blog_revisions;
create policy "blog revisions admin" on public.blog_revisions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "activity admin read" on public.activity_logs;
create policy "activity admin read" on public.activity_logs for select using (public.is_admin());
drop policy if exists "activity admin insert" on public.activity_logs;
create policy "activity admin insert" on public.activity_logs for insert with check (public.is_admin());

-- storage bucket policies (to be applied via storage.buckets insert + storage policies)
-- bucket: website-media (public read, admin write)
insert into storage.buckets (id, name, public) values ('website-media','website-media', true) on conflict (id) do nothing;

drop policy if exists "storage public read" on storage.objects;
create policy "storage public read" on storage.objects for select using (bucket_id = 'website-media');
drop policy if exists "storage admin write" on storage.objects;
create policy "storage admin write" on storage.objects for all using (bucket_id='website-media' and public.is_admin()) with check (bucket_id='website-media' and public.is_admin());
