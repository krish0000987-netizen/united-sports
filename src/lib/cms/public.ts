import "@tanstack/react-start/server-only";

import { createServerFn } from "@tanstack/react-start";

import {
  DEFAULT_BLOG_CATEGORIES,
  DEFAULT_BLOG_TAGS,
  DEFAULT_FOOTER_ITEMS,
  DEFAULT_FOOTER_SECTIONS,
  DEFAULT_MEDIA,
  DEFAULT_NAV_ITEMS,
  DEFAULT_SETTINGS,
  getDefaultPageBySlug,
  getDefaultPages,
} from "@/lib/cms/defaults";
import type {
  Blog,
  BlogCategory,
  BlogTag,
  BlogWithRelations,
  FooterItem,
  FooterSection,
  Media,
  NavItem,
  Page,
  PageSection,
  PageWithSections,
  SiteSetting,
} from "@/lib/cms/types";
import { getServerEnv, hasServerSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * PUBLIC CMS data layer (server functions).
 *
 * Every function:
 *  - falls back to the hardcoded defaults that reproduce today's site when
 *    Supabase isn't configured or the schema hasn't been applied yet, and
 *  - reads ONLY published content (RLS enforces this for rows; we also filter
 *    in SQL so the app works even before RLS is enabled).
 *
 * These are the ONLY sanctioned read paths for the public website.
 */

function cast<T>(v: unknown): T {
  return v as T;
}

/* ------------------------------ Health probe ----------------------------- */

export const getSiteHealth = createServerFn({ method: "GET" }).handler(() => {
  return healthProbe();
});

export async function healthProbe() {
  const configured = hasServerSupabaseEnv();
  const env = getServerEnv();
  if (!configured) {
    return {
      configured: false,
      schemaReady: false,
      bucketReady: false,
      url: env.url ?? null,
      message:
        "Supabase environment variables are missing. Add them to .env.local (see .env.example).",
    };
  }
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      configured: true,
      schemaReady: false,
      bucketReady: false,
      url: env.url ?? null,
      message: "Supabase client could not be initialized.",
    };
  }
  try {
    const { error } = await supabase.from("site_settings").select("id").limit(1);
    const schemaReady = !error;
    let bucketReady = false;
    if (schemaReady) {
      try {
        const { data: buckets } = await getSupabaseServerClient()!.storage.listBuckets();
        bucketReady = Boolean(buckets && buckets.some((b) => b.name === (env.bucket || "website-media")));
      } catch {
        bucketReady = false;
      }
    }
    return {
      configured: true,
      schemaReady,
      bucketReady,
      url: env.url ?? null,
      message: schemaReady
        ? "Schema detected. CMS is ready."
        : "Schema not detected. Run the migrations (0001→0003) in the Supabase SQL Editor — see /supabase/migrations.",
    };
  } catch {
    return {
      configured: true,
      schemaReady: false,
      bucketReady: false,
      url: env.url ?? null,
      message: "Schema not detected. Run the migrations in the Supabase SQL Editor.",
    };
  }
}

/* -------------------------------- Settings ------------------------------- */

function normalizeSettings(rows: SiteSetting[] | null): SiteSetting[] {
  if (!rows || rows.length === 0) return DEFAULT_SETTINGS;
  const merged = new Map<string, SiteSetting>();
  for (const d of DEFAULT_SETTINGS) merged.set(d.key, d);
  for (const r of rows) merged.set(r.key, { ...r, value: { ...merged.get(r.key)?.value, ...(r.value ?? {}) } });
  return [...merged.values()];
}

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return DEFAULT_SETTINGS;
  try {
    const { data } = await supabase.from("site_settings").select("*").order("key");
    return normalizeSettings(cast<SiteSetting[]>(data));
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export const getSettingMap = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await getSettings();
  const map = new Map<string, Record<string, import("@/lib/cms/types").JsonValue>>();
  for (const s of settings) map.set(s.key, s.value);
  return Object.fromEntries(map);
});

/* ------------------------------- Navigation ------------------------------ */

export const getMainNav = createServerFn({ method: "GET" }).handler(async () => {
  return mainNav();
});

export async function mainNav(): Promise<NavItem[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return DEFAULT_NAV_ITEMS;
  try {
    const { data: menus } = await supabase
      .from("navigation_menus")
      .select("id")
      .eq("slug", "main")
      .eq("is_active", true)
      .limit(1);
    const menuId = menus?.[0]?.id;
    if (!menuId) return DEFAULT_NAV_ITEMS;
    const { data: items } = await supabase
      .from("navigation_items")
      .select("*")
      .eq("menu_id", menuId)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });
    const nav: NavItem[] = cast<NavItem[]>(items);
    return nav.length ? nav : DEFAULT_NAV_ITEMS;
  } catch {
    return DEFAULT_NAV_ITEMS;
  }
}

/* --------------------------------- Footer -------------------------------- */

export interface FooterData {
  sections: FooterSection[];
  items: FooterItem[];
}

export const getFooter = createServerFn({ method: "GET" }).handler(async () => {
  return footer();
});

export async function footer(): Promise<FooterData> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { sections: DEFAULT_FOOTER_SECTIONS, items: DEFAULT_FOOTER_ITEMS };
  }
  try {
    const [{ data: sections }, { data: items }] = await Promise.all([
      supabase.from("footer_sections").select("*").eq("is_visible", true).order("sort_order"),
      supabase.from("footer_items").select("*").eq("is_visible", true).order("sort_order"),
    ]);
    const s = cast<FooterSection[]>(sections);
    const i = cast<FooterItem[]>(items);
    return {
      sections: s.length ? s : DEFAULT_FOOTER_SECTIONS,
      items: i.length ? i : DEFAULT_FOOTER_ITEMS,
    };
  } catch {
    return { sections: DEFAULT_FOOTER_SECTIONS, items: DEFAULT_FOOTER_ITEMS };
  }
}

/* --------------------------------- Media --------------------------------- */

export const getMediaByPaths = createServerFn({ method: "GET" })
  .validator((d: { paths: string[] }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    if (!supabase || data.paths.length === 0) return [] as Media[];
    try {
      const { data: rows } = await supabase
        .from("media")
        .select("*")
        .in("storage_path", data.paths);
      return cast<Media[]>(rows ?? []);
    } catch {
      return [] as Media[];
    }
  });

export const getAllMedia = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return DEFAULT_MEDIA;
  try {
    const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    const rows = cast<Media[]>(data);
    return rows.length ? rows : DEFAULT_MEDIA;
  } catch {
    return DEFAULT_MEDIA;
  }
});

/* --------------------------------- Pages --------------------------------- */

export const getPublicPage = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    return publicPageBySlug(data.slug);
  });

export async function publicPageBySlug(
  slug: string,
  opts?: { includeDrafts?: boolean },
): Promise<PageWithSections | null> {
  const supabase = getSupabaseServerClient();
  const fallback = getDefaultPageBySlug(slug);
  const toPageWithSections = (p: { page: Page; sections: PageSection[] }): PageWithSections => ({
    ...p.page,
    sections: p.sections,
  });

  if (!supabase) return fallback ? toPageWithSections(fallback) : null;

  try {
    let query = supabase.from("pages").select("*").eq("slug", slug).limit(1);
    if (!opts?.includeDrafts) {
      query = query.eq("status", "published");
    }
    const { data: pageRows } = await query;
    const pageRow = pageRows?.[0];
    if (!pageRow) return fallback ? toPageWithSections(fallback) : null;

    const page = cast<Page>(pageRow);
    const { data: sectionRows } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page_id", page.id)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });
    const sections = cast<PageSection[]>(sectionRows ?? []);

    return { ...page, sections };
  } catch {
    return fallback ? toPageWithSections(fallback) : null;
  }
}

export const getPublicPages = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return Object.values(getDefaultPages()).map((d) => d.page);
  }
  try {
    const { data } = await supabase
      .from("pages")
      .select("id,title,slug,excerpt,status,published_at,updated_at,seo_title,seo_description")
      .eq("status", "published")
      .order("created_at");
    return cast<Page[]>(data ?? []);
  } catch {
    return Object.values(getDefaultPages()).map((d) => d.page);
  }
});

/* --------------------------------- Blogs --------------------------------- */

export const getPublishedBlogs = createServerFn({ method: "GET" })
  .validator((d: { categorySlug?: string; limit?: number } = {}) => d)
  .handler(async ({ data }) => {
    return publishedBlogs(data);
  });

export async function publishedBlogs(opts: { categorySlug?: string; limit?: number } = {}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [] as BlogWithRelations[];
  try {
    let query = supabase
      .from("blogs")
      .select(
        `*, category:blog_categories(*), featured_image:media!blogs_featured_image_id_fkey(*)`,
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (opts.categorySlug) {
      // Resolve category id first
      const { data: cats } = await supabase
        .from("blog_categories")
        .select("id")
        .eq("slug", opts.categorySlug)
        .limit(1);
      const catId = cats?.[0]?.id;
      if (catId) query = query.eq("category_id", catId);
    }
    if (opts.limit) query = query.limit(opts.limit);

    const { data: rows } = await query;
    if (!rows || rows.length === 0) return [] as BlogWithRelations[];

    const blogs = cast<BlogWithRelations[]>(rows);
    // Attach tags via junction
    const ids = blogs.map((b) => b.id);
    const { data: links } = await supabase
      .from("blog_post_tags")
      .select("blog_id, tag_id")
      .in("blog_id", ids);
    const tagIds = [...new Set((links ?? []).map((l) => l.tag_id))];
    const tagsByTag = conditionalTagFetch(supabase, tagIds);

    const tagsMap = new Map<string, BlogTag>();
    for (const t of await tagsByTag) tagsMap.set(t.id, t);
    const linksByBlog = new Map<string, BlogTag[]>();
    for (const l of links ?? []) {
      const t = tagsMap.get(l.tag_id);
      if (t) linksByBlog.set(l.blog_id, [...(linksByBlog.get(l.blog_id) ?? []), t]);
    }

    return blogs.map((b) => ({
      ...b,
      tags: linksByBlog.get(b.id) ?? [],
      author: null,
      og_image: null,
    }));
  } catch {
    return [] as BlogWithRelations[];
  }
}

async function conditionalTagFetch(supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>, tagIds: string[]) {
  if (tagIds.length === 0) return [] as BlogTag[];
  const { data } = await supabase.from("blog_tags").select("*").in("id", tagIds);
  return cast<BlogTag[]>(data ?? []);
}

export const getPublicBlog = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    return publicBlogBySlug(data.slug);
  });

export async function publicBlogBySlug(slug: string): Promise<BlogWithRelations | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  try {
    const { data: rows } = await supabase
      .from("blogs")
      .select(
        `*, category:blog_categories(*), featured_image:media!blogs_featured_image_id_fkey(*)`,
      )
      .eq("slug", slug)
      .eq("status", "published")
      .limit(1);
    const row = rows?.[0];
    if (!row) return null;
    const blog = cast<BlogWithRelations>(row);
    const { data: links } = await supabase
      .from("blog_post_tags")
      .select("tag_id")
      .eq("blog_id", blog.id);
    const tagIds = (links ?? []).map((l) => l.tag_id);
    const tags = tagIds.length
      ? cast<BlogTag[]>((await supabase.from("blog_tags").select("*").in("id", tagIds)).data ?? [])
      : [];
    return { ...blog, tags, author: null, og_image: null };
  } catch {
    return null;
  }
}

export const getBlogCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return DEFAULT_BLOG_CATEGORIES;
  try {
    const { data } = await supabase
      .from("blog_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    const rows = cast<BlogCategory[]>(data);
    return rows.length ? rows : DEFAULT_BLOG_CATEGORIES;
  } catch {
    return DEFAULT_BLOG_CATEGORIES;
  }
});

export const getBlogTags = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return DEFAULT_BLOG_TAGS;
  try {
    const { data } = await supabase.from("blog_tags").select("*").order("name");
    const rows = cast<BlogTag[]>(data);
    return rows.length ? rows : DEFAULT_BLOG_TAGS;
  } catch {
    return DEFAULT_BLOG_TAGS;
  }
});

export const getFeaturedBlogs = createServerFn({ method: "GET" })
  .validator((d: { limit?: number } = {}) => d)
  .handler(async ({ data }) => {
    const all = await publishedBlogs({ limit: data.limit ?? 3 });
    const featured = all.filter((b) => b.is_featured);
    return featured.length ? featured : all.slice(0, 3);
  });

/* ------------------------------- Types helper ---------------------------- */

// Re-export for consumers of the public layer.
export type { Page, PageSection, PageWithSections };
export type { Blog, BlogWithRelations };
