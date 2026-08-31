-- ============================================================================
-- UNITED SPORTS / UNITEDATHLETES — SUPABASE CMS SCHEMA  (0001_cms_schema.sql)
-- ----------------------------------------------------------------------------
-- Run in Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent: safe to run more than once.
-- Covers: profiles, media, media_folders, blog tables, navigation, footer,
--         pages + sections, site_settings, seo_metadata, revisions,
--         activity_logs, RLS policies, indexes, updated_at triggers.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS (used by RLS policies — the real security boundary)
-- ---------------------------------------------------------------------------
-- Returns true when the calling (authenticated) user has an active staff
-- profile (super_admin or editor).
create or replace function public.is_staff()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and p.role in ('super_admin', 'editor')
  );
end;
$$;

-- Returns true when the calling user is an active super_admin.
create or replace function public.is_super_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and p.role = 'super_admin'
  );
end;
$$;

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, role, is_active)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    coalesce((new.raw_user_meta_data ->> 'role')::text, 'editor'),
    coalesce((new.raw_user_meta_data ->> 'is_active')::boolean, true)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Bump updated_at on row changes.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Capture a page revision before a major update.
create or replace function public.capture_page_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    old.title is distinct from new.title or
    old.content is distinct from new.content or
    old.status  is distinct from new.status
  ) then
    insert into public.page_revisions (page_id, title, slug, content, status, author_id, revision_note, created_at)
    values (old.id, old.title, old.slug, old.content, old.status, old.author_id, 'Auto-saved before update', now());
  end if;
  return new;
end;
$$;

-- Capture a blog revision before a major update.
create or replace function public.capture_blog_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    old.title is distinct from new.title or
    old.content is distinct from new.content or
    old.status  is distinct from new.status
  ) then
    insert into public.blog_revisions (blog_id, title, slug, content, status, author_id, revision_note, created_at)
    values (old.id, old.title, old.slug, old.content, old.status, old.author_id, 'Auto-saved before update', now());
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique not null references auth.users (id) on delete cascade,
  full_name   text not null default '',
  avatar_url  text,
  role        text not null default 'editor'
              check (role in ('super_admin', 'editor')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. MEDIA FOLDERS + MEDIA
-- ---------------------------------------------------------------------------
create table if not exists public.media_folders (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references public.media_folders (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  file_name     text not null,
  storage_path  text not null unique,          -- website-media/heroes/foo.jpg
  public_url    text not null,                 -- full public URL
  mime_type     text not null,
  file_size     bigint not null default 0,
  width         integer,
  height        integer,
  alt_text      text,
  caption       text,
  folder_id     uuid references public.media_folders (id) on delete set null,
  uploaded_by   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists media_folder_idx on public.media (folder_id);
create index if not exists media_uploaded_by_idx on public.media (uploaded_by);

-- ---------------------------------------------------------------------------
-- 4. BLOG: CATEGORIES, TAGS, POSTS, POST-TAGS
-- ---------------------------------------------------------------------------
create table if not exists public.blog_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_id    uuid references public.media (id) on delete set null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.blog_tags (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.blogs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  content          text not null default '',       -- sanitized rich HTML
  featured_image_id uuid references public.media (id) on delete set null,
  author_id        uuid references auth.users (id) on delete set null,
  category_id      uuid references public.blog_categories (id) on delete set null,
  status           text not null default 'draft'
                   check (status in ('draft', 'published', 'scheduled', 'archived')),
  published_at     timestamptz,
  seo_title        text,
  seo_description  text,
  canonical_url    text,
  og_image_id      uuid references public.media (id) on delete set null,
  is_featured      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.blog_post_tags (
  blog_id uuid not null references public.blogs (id) on delete cascade,
  tag_id  uuid not null references public.blog_tags (id) on delete cascade,
  primary key (blog_id, tag_id)
);

create index if not exists blogs_slug_idx on public.blogs (slug);
create index if not exists blogs_status_idx on public.blogs (status);
create index if not exists blogs_published_at_idx on public.blogs (published_at);
create index if not exists blogs_category_idx on public.blogs (category_id);

-- ---------------------------------------------------------------------------
-- 5. NAVIGATION
-- ---------------------------------------------------------------------------
create table if not exists public.navigation_menus (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  location    text not null default 'main' check (location in ('main', 'footer', 'mobile', 'other')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.navigation_items (
  id          uuid primary key default gen_random_uuid(),
  menu_id     uuid not null references public.navigation_menus (id) on delete cascade,
  parent_id   uuid references public.navigation_items (id) on delete cascade,
  label       text not null,
  url         text not null default '/',
  is_internal boolean not null default true,
  is_external boolean not null default false,
  open_in_new_tab boolean not null default false,
  sort_order  integer not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists nav_items_menu_idx on public.navigation_items (menu_id);
create index if not exists nav_items_parent_idx on public.navigation_items (parent_id);
create index if not exists nav_items_sort_idx on public.navigation_items (menu_id, sort_order);

-- Unique (menu_id, label) so "on conflict" upserts in the seed work.
create unique index if not exists nav_items_menu_label_key
  on public.navigation_items (menu_id, label);

-- ---------------------------------------------------------------------------
-- 6. FOOTER
-- ---------------------------------------------------------------------------
create table if not exists public.footer_sections (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  sort_order  integer not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.footer_items (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.footer_sections (id) on delete cascade,
  label       text not null,
  url         text,
  icon        text,
  sort_order  integer not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists footer_items_section_idx on public.footer_items (section_id);
create index if not exists footer_items_sort_idx on public.footer_items (section_id, sort_order);

-- Unique (section_id, label) so "on conflict" upserts in the seed work.
create unique index if not exists footer_items_section_label_key
  on public.footer_items (section_id, label);

-- ---------------------------------------------------------------------------
-- 7. PAGES + PAGE SECTIONS
-- ---------------------------------------------------------------------------
create table if not exists public.pages (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  content          jsonb not null default '{}'::jsonb,  -- structured content per page
  status           text not null default 'draft'
                   check (status in ('draft', 'published', 'archived', 'scheduled')),
  template         text not null default 'default' check (template in ('default', 'home', 'landing', 'full-width')),
  featured_image_id uuid references public.media (id) on delete set null,
  author_id        uuid references auth.users (id) on delete set null,
  published_at     timestamptz,
  seo_title        text,
  seo_description  text,
  canonical_url    text,
  og_image_id      uuid references public.media (id) on delete set null,
  robots_index     boolean not null default true,
  robots_follow    boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.page_sections (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references public.pages (id) on delete cascade,
  section_type text not null default 'rich_text' check (section_type in (
    'hero', 'rich_text', 'image_content', 'cards', 'statistics', 'testimonials',
    'gallery', 'faq', 'cta', 'video', 'logo_grid', 'featured_blogs'
  )),
  sort_order  integer not null default 0,
  is_visible  boolean not null default true,
  content     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists pages_slug_idx on public.pages (slug);
create index if not exists pages_status_idx on public.pages (status);
create index if not exists pages_published_at_idx on public.pages (published_at);
create index if not exists page_sections_page_idx on public.page_sections (page_id, sort_order);

-- ---------------------------------------------------------------------------
-- 8. SITE SETTINGS + SEO METADATA
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,          -- general | contact | social | branding | whatsapp
  value       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.seo_metadata (
  id               uuid primary key default gen_random_uuid(),
  entity_type      text not null check (entity_type in ('page', 'blog')),
  entity_id        uuid not null,
  seo_title        text,
  meta_description text,
  canonical_url    text,
  og_title         text,
  og_description   text,
  og_image_id      uuid references public.media (id) on delete set null,
  robots_index     boolean not null default true,
  robots_follow    boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (entity_type, entity_id)
);

-- ---------------------------------------------------------------------------
-- 9. REVISIONS + ACTIVITY LOGS
-- ---------------------------------------------------------------------------
create table if not exists public.page_revisions (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid not null references public.pages (id) on delete cascade,
  title         text not null,
  slug          text not null,
  content       jsonb not null default '{}'::jsonb,
  status        text not null default 'draft',
  author_id     uuid references auth.users (id) on delete set null,
  revision_note text,
  created_at    timestamptz not null default now()
);

create table if not exists public.blog_revisions (
  id            uuid primary key default gen_random_uuid(),
  blog_id       uuid not null references public.blogs (id) on delete cascade,
  title         text not null,
  slug          text not null,
  content       text not null default '',
  status        text not null default 'draft',
  author_id     uuid references auth.users (id) on delete set null,
  revision_note text,
  created_at    timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_user_idx on public.activity_logs (user_id);
create index if not exists page_revisions_page_idx on public.page_revisions (page_id, created_at desc);
create index if not exists blog_revisions_blog_idx on public.blog_revisions (blog_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 10. REVISION + TIMESTAMP TRIGGERS
-- ---------------------------------------------------------------------------
drop trigger if exists pages_capture_revision on public.pages;
create trigger pages_capture_revision
  before update on public.pages
  for each row execute function public.capture_page_revision();

drop trigger if exists blogs_capture_revision on public.blogs;
create trigger blogs_capture_revision
  before update on public.blogs
  for each row execute function public.capture_blog_revision();

create trigger pages_touch_updated_at
  before update on public.pages
  for each row execute function public.touch_updated_at();

create trigger blogs_touch_updated_at
  before update on public.blogs
  for each row execute function public.touch_updated_at();

create trigger page_sections_touch_updated_at
  before update on public.page_sections
  for each row execute function public.touch_updated_at();

create trigger media_touch_updated_at
  before update on public.media
  for each row execute function public.touch_updated_at();

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

create trigger navigation_menus_touch_updated_at
  before update on public.navigation_menus
  for each row execute function public.touch_updated_at();

create trigger navigation_items_touch_updated_at
  before update on public.navigation_items
  for each row execute function public.touch_updated_at();

create trigger footer_sections_touch_updated_at
  before update on public.footer_sections
  for each row execute function public.touch_updated_at();

create trigger footer_items_touch_updated_at
  before update on public.footer_items
  for each row execute function public.touch_updated_at();

create trigger blog_categories_touch_updated_at
  before update on public.blog_categories
  for each row execute function public.touch_updated_at();

create trigger blog_tags_touch_updated_at
  before update on public.blog_tags
  for each row execute function public.touch_updated_at();

create trigger media_folders_touch_updated_at
  before update on public.media_folders
  for each row execute function public.touch_updated_at();

create trigger seo_metadata_touch_updated_at
  before update on public.seo_metadata
  for each row execute function public.touch_updated_at();
