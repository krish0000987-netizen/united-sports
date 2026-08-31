-- United Sports CMS - Core schema
-- Enable uuid generation
create extension if not exists "pgcrypto";

-- profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null check (role in ('super_admin','editor')) default 'editor',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_user_id on public.profiles(user_id);

-- pages
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  status text not null check (status in ('draft','published','scheduled','archived')) default 'draft',
  template text,
  featured_image_id uuid,
  author_id uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_pages_slug on public.pages(slug);
create index if not exists idx_pages_status on public.pages(status);

-- page_sections
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_type text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_page_sections_page_id on public.page_sections(page_id);

-- page_section_items (for card lists etc)
create table if not exists public.page_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.page_sections(id) on delete cascade,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- blog categories/tags
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);
create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  featured_image_id uuid,
  author_id uuid references public.profiles(id),
  category_id uuid references public.blog_categories(id) on delete set null,
  status text not null check (status in ('draft','published','scheduled','archived')) default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_blogs_slug on public.blogs(slug);
create index if not exists idx_blogs_status on public.blogs(status);

create table if not exists public.blog_post_tags (
  blog_id uuid not null references public.blogs(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (blog_id, tag_id)
);

-- media
create table if not exists public.media_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.media_folders(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null,
  public_url text not null,
  mime_type text not null,
  file_size int not null,
  width int,
  height int,
  alt_text text,
  caption text,
  folder_id uuid references public.media_folders(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- navigation
create table if not exists public.navigation_menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);
create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.navigation_menus(id) on delete cascade,
  label text not null,
  url text not null,
  parent_id uuid references public.navigation_items(id) on delete set null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_nav_items_menu on public.navigation_items(menu_id);

-- site_settings (single row)
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'UnitedAthletes',
  tagline text,
  logo_url text,
  favicon_url text,
  phone text,
  email text,
  address text,
  whatsapp_phone text,
  whatsapp_message text,
  whatsapp_enabled boolean not null default true,
  social_instagram text,
  social_facebook text,
  social_youtube text,
  social_linkedin text,
  social_x text,
  header_cta_label text,
  header_cta_url text,
  footer_description text,
  footer_copyright text,
  footer_columns jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- seo
create table if not exists public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  seo_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(entity_type, entity_id)
);

-- revisions
create table if not exists public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  data jsonb not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.blog_revisions (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs(id) on delete cascade,
  data jsonb not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- activity
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_created on public.activity_logs(created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_profiles_updated on public.profiles; create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists trg_pages_updated on public.pages; create trigger trg_pages_updated before update on public.pages for each row execute function public.set_updated_at();
drop trigger if exists trg_sections_updated on public.page_sections; create trigger trg_sections_updated before update on public.page_sections for each row execute function public.set_updated_at();
drop trigger if exists trg_blogs_updated on public.blogs; create trigger trg_blogs_updated before update on public.blogs for each row execute function public.set_updated_at();
drop trigger if exists trg_media_updated on public.media; create trigger trg_media_updated before update on public.media for each row execute function public.set_updated_at();
drop trigger if exists trg_nav_updated on public.navigation_items; create trigger trg_nav_updated before update on public.navigation_items for each row execute function public.set_updated_at();
drop trigger if exists trg_settings_updated on public.site_settings; create trigger trg_settings_updated before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists trg_seo_updated on public.seo_metadata; create trigger trg_seo_updated before update on public.seo_metadata for each row execute function public.set_updated_at();

-- seed default navigation menu and settings
insert into public.navigation_menus (name, slug) values ('Header','header'), ('Footer','footer') on conflict (slug) do nothing;
insert into public.site_settings (site_name, phone, address, whatsapp_phone, header_cta_label, header_cta_url)
values ('UnitedAthletes','+91 85278 77688','384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014','918527877688','Get Involved','/get-involved')
on conflict do nothing;
