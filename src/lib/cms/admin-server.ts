import "@tanstack/react-start/server-only";

import { createServerFn } from "@tanstack/react-start";

import type {
  ActivityLog,
  Blog,
  BlogCategory,
  BlogRevision,
  BlogTag,
  FooterItem,
  FooterSection,
  Media,
  MediaFolder,
  NavItem,
  NavMenu,
  Page,
  PageRevision,
  PageSection,
  Profile,
  SeoMetadata,
  SiteSetting,
  StaffSession,
} from "@/lib/cms/types";
import { clearSupabaseAuthCookies, getAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAdminContext,
  getStaffSession,
  logActivity,
  requireSuperAdmin,
  slugify,
} from "@/lib/supabase/server-auth";

/**
 * ADMIN server layer — every mutation is guarded by session + RLS.
 *
 *  - Data CRUD goes through the session-bound client (RLS is the boundary).
 *  - Auth-admin + users + storage-fallback go through the secret-key client
 *    (server-only; never exposed to the browser).
 *  - All mutations record an activity_log entry.
 */

type FnInput<T> = T;

/* ================================ AUTH ================================== */

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getStaffSession();
  return session as StaffSession | null;
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ email: string; password: string }>) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return { ok: false as const, error: "Supabase not configured" };
    const { data: res, error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });
    if (error || !res.session) {
      return { ok: false as const, error: error?.message ?? "Login failed" };
    }
    // Session cookies are written by the ssr client automatically.
    const session = await getStaffSession();
    if (!session) {
      await supabase.auth.signOut();
      return {
        ok: false as const,
        error: "This account does not have staff access. Contact the administrator.",
      };
    }
    return { ok: true as const, session };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut().catch(() => undefined);
  }
  await clearSupabaseAuthCookies();
  return { ok: true as const };
});

/* ============================== DASHBOARD =============================== */

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { supabase } = ctx;
  const [pages, blogs, media, users, activity] = await Promise.all([
    supabase.from("pages").select("id,status", { count: "exact", head: false }).order("created_at", { ascending: false }).limit(100).then((r) => r.data ?? []),
    supabase.from("blogs").select("id,title,status").order("updated_at", { ascending: false }).limit(10).then((r) => r.data ?? []),
    supabase.from("media").select("id", { count: "exact", head: false }).limit(1).then((r) => ({ count: r.count ?? 0 })),
    supabase.from("profiles").select("id", { count: "exact", head: false }).limit(1).then((r) => ({ count: r.count ?? 0 })),
    supabase.from("activity_logs").select("id,action,entity_type,created_at").order("created_at", { ascending: false }).limit(12).then((r) => r.data ?? []),
  ]);
  const byStatus = { draft: 0, published: 0, scheduled: 0, archived: 0 };
  for (const p of pages) if (p.status in byStatus) byStatus[p.status as keyof typeof byStatus] += 1;
  return {
    pageCounts: byStatus,
    recentBlogs: blogs as Pick<Blog, "id" | "title" | "status">[],
    mediaCount: media.count,
    userCount: users.count,
    recentActivity: activity as unknown as ActivityLog[],
  };
});

/* ================================ PAGES ================================= */

export const adminListPages = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase
    .from("pages")
    .select("id,title,slug,status,template,updated_at,published_at")
    .order("updated_at", { ascending: false });
  return data as unknown as (Pick<Page, "id" | "title" | "slug" | "status" | "template" | "updated_at" | "published_at">)[] | null;
});

export const adminGetPage = createServerFn({ method: "GET" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return null;
    const { data: pageRows } = await ctx.supabase.from("pages").select("*").eq("id", data.id).limit(1);
    const page = pageRows?.[0] as Page | undefined;
    if (!page) return null;
    const { data: sections } = await ctx.supabase
      .from("page_sections")
      .select("*")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });
    return { page, sections: (sections ?? []) as PageSection[] };
  });

export const adminCreatePage = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ title: string; slug?: string; template?: Page["template"] }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const slug = data.slug?.trim() || slugify(data.title);
    const { data: row, error } = await ctx.supabase
      .from("pages")
      .insert({
        title: data.title,
        slug,
        template: data.template ?? "default",
        status: "draft",
        author_id: ctx.session.userId,
      })
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "PAGE_CREATED", entityType: "page", entityId: row.id, metadata: { title: data.title } });
    return { ok: true as const, id: row.id as string };
  });

export const adminUpdatePage = createServerFn({ method: "POST" })
  .validator((d: FnInput<Partial<Page> & { id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { id, ...patch } = data;
    const { data: updated, error } = await ctx.supabase
      .from("pages")
      .update(patch as Partial<Page>)
      .eq("id", id)
      .select("id,title,status")
      .single();
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "PAGE_UPDATED", entityType: "page", entityId: id, metadata: { title: updated?.title } });
    return { ok: true as const };
  });

export const adminDeletePage = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { data: page } = await ctx.supabase.from("pages").select("title").eq("id", data.id).single();
    const { error } = await ctx.supabase.from("pages").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "PAGE_DELETED", entityType: "page", entityId: data.id, metadata: { title: page?.title } });
    return { ok: true as const };
  });

/* ------------------------------ Sections -------------------------------- */

export const adminSaveSection = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ section?: Partial<PageSection>; id?: string; page_id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    if (data.id) {
      const { id, ...patch } = data.section ?? {};
      const { error } = await ctx.supabase.from("page_sections").update(patch as Partial<PageSection>).eq("id", data.id);
      if (error) return { ok: false as const, error: error.message };
      await logActivity({ userId: ctx.session.userId, action: "SECTION_UPDATED", entityType: "page_section", entityId: data.id });
      return { ok: true as const };
    }
    const { data: row, error } = await ctx.supabase
      .from("page_sections")
      .insert({
        page_id: data.page_id,
        section_type: data.section?.section_type ?? "rich_text",
        content: data.section?.content ?? {},
        sort_order: data.section?.sort_order ?? 0,
        is_visible: data.section?.is_visible ?? true,
      })
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "SECTION_CREATED", entityType: "page_section", entityId: row.id });
    return { ok: true as const, id: row.id as string };
  });

export const adminReorderSections = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ page_id: string; order: { id: string; sort_order: number }[] }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    for (const o of data.order) {
      await ctx.supabase.from("page_sections").update({ sort_order: o.sort_order }).eq("id", o.id).eq("page_id", data.page_id);
    }
    await logActivity({ userId: ctx.session.userId, action: "SECTIONS_REORDERED", entityType: "page", entityId: data.page_id });
    return { ok: true as const };
  });

export const adminDeleteSection = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase.from("page_sections").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "SECTION_DELETED", entityType: "page_section", entityId: data.id });
    return { ok: true as const };
  });

/* ================================ BLOGS ================================= */

export const adminListBlogs = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase
    .from("blogs")
    .select("id,title,slug,status,category_id,is_featured,updated_at,published_at")
    .order("updated_at", { ascending: false });
  return data as unknown as (Pick<Blog, "id" | "title" | "slug" | "status" | "category_id" | "is_featured" | "updated_at" | "published_at">)[] | null;
});

export const adminGetBlog = createServerFn({ method: "GET" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return null;
    const { data: rows } = await ctx.supabase.from("blogs").select("*").eq("id", data.id).limit(1);
    const blog = rows?.[0] as Blog | undefined;
    if (!blog) return null;
    const { data: tagLinks } = await ctx.supabase.from("blog_post_tags").select("tag_id").eq("blog_id", blog.id);
    return { blog, tagIds: (tagLinks ?? []).map((t) => t.tag_id as string) };
  });

export const adminCreateBlog = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ title: string; slug?: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const slug = data.slug?.trim() || slugify(data.title);
    const { data: row, error } = await ctx.supabase
      .from("blogs")
      .insert({ title: data.title, slug, status: "draft", author_id: ctx.session.userId })
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "BLOG_CREATED", entityType: "blog", entityId: row.id, metadata: { title: data.title } });
    return { ok: true as const, id: row.id as string };
  });

export const adminUpdateBlog = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string; patch: Partial<Blog>; tagIds?: string[] }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { id, patch, tagIds } = data;
    const { error } = await ctx.supabase.from("blogs").update(patch as Partial<Blog>).eq("id", id);
    if (error) return { ok: false as const, error: error.message };
    if (tagIds) {
      await ctx.supabase.from("blog_post_tags").delete().eq("blog_id", id);
      if (tagIds.length) {
        await ctx.supabase.from("blog_post_tags").insert(tagIds.map((tag_id) => ({ blog_id: id, tag_id })));
      }
    }
    await logActivity({ userId: ctx.session.userId, action: "BLOG_UPDATED", entityType: "blog", entityId: id, metadata: { title: patch.title } });
    return { ok: true as const };
  });

export const adminDeleteBlog = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase.from("blogs").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "BLOG_DELETED", entityType: "blog", entityId: data.id });
    return { ok: true as const };
  });

/* --------------------------- Categories / Tags --------------------------- */

export const adminListCategories = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase.from("blog_categories").select("*").order("sort_order", { ascending: true });
  return data as unknown as BlogCategory[] | null;
});

export const adminSaveCategory = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id?: string; name: string; slug?: string; description?: string | null; sort_order?: number }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const slug = data.slug?.trim() || slugify(data.name);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await ctx.supabase.from("blog_categories").update({ ...patch, slug }).eq("id", id);
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }
    const { data: row, error } = await ctx.supabase.from("blog_categories").insert({ name: data.name, slug, description: data.description, sort_order: data.sort_order ?? 0 }).select("id").single();
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "CATEGORY_CREATED", entityType: "blog_category", entityId: row.id });
    return { ok: true as const, id: row.id as string };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase.from("blog_categories").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const adminListTags = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase.from("blog_tags").select("*").order("name");
  return data as unknown as BlogTag[] | null;
});

export const adminSaveTag = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id?: string; name: string; slug?: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const slug = data.slug?.trim() || slugify(data.name);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await ctx.supabase.from("blog_tags").update({ ...patch, slug }).eq("id", id);
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }
    const { data: row, error } = await ctx.supabase.from("blog_tags").insert({ name: data.name, slug }).select("id").single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, id: row.id as string };
  });

export const adminDeleteTag = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase.from("blog_tags").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/* ================================ MEDIA ================================= */

export const adminListMedia = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const [media, folders] = await Promise.all([
    ctx.supabase.from("media").select("*").order("created_at", { ascending: false }).then((r) => r.data ?? []),
    ctx.supabase.from("media_folders").select("*").order("name").then((r) => r.data ?? []),
  ]);
  return { media: media as Media[], folders: folders as MediaFolder[] };
});

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string; storagePath?: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    if (data.storagePath) {
      const bucket = data.storagePath.split("/")[0];
      const path = data.storagePath.split("/").slice(1).join("/");
      if (bucket === "website-media" && path) {
        await ctx.supabase.storage.from(bucket).remove([path]).catch(() => undefined);
      }
    }
    const { error } = await ctx.supabase.from("media").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/* ============================ NAVIGATION ================================ */

export const adminGetNavigation = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const [menus, items] = await Promise.all([
    ctx.supabase.from("navigation_menus").select("*").order("name").then((r) => r.data ?? []),
    ctx.supabase.from("navigation_items").select("*").order("menu_id", { ascending: true }).order("sort_order", { ascending: true }).then((r) => r.data ?? []),
  ]);
  return { menus: menus as NavMenu[], items: items as NavItem[] };
});

export const adminSaveNavItem = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ item: Partial<NavItem>; id?: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    if (data.id) {
      const { id, ...patch } = data.item;
      const { error } = await ctx.supabase.from("navigation_items").update(patch as Partial<NavItem>).eq("id", data.id);
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }
    const { data: row, error } = await ctx.supabase.from("navigation_items").insert(data.item as Partial<NavItem>).select("id").single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, id: row.id as string };
  });

export const adminDeleteNavItem = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase.from("navigation_items").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const adminSaveMenu = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id?: string; name: string; slug: string; location: NavMenu["location"]; is_active: boolean }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await ctx.supabase.from("navigation_menus").update(patch).eq("id", id);
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }
    const { error } = await ctx.supabase.from("navigation_menus").insert(data);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/* ================================ FOOTER ================================ */

export const adminGetFooter = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const [sections, items] = await Promise.all([
    ctx.supabase.from("footer_sections").select("*").order("sort_order", { ascending: true }).then((r) => r.data ?? []),
    ctx.supabase.from("footer_items").select("*").order("sort_order", { ascending: true }).then((r) => r.data ?? []),
  ]);
  return { sections: sections as FooterSection[], items: items as FooterItem[] };
});

export const adminSaveFooterSection = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id?: string; title: string; sort_order?: number; is_visible?: boolean }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const slug = slugify(data.title) || `section-${Date.now().toString(36)}`;
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await ctx.supabase.from("footer_sections").update({ ...patch, slug }).eq("id", id);
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }
    const { data: row, error } = await ctx.supabase.from("footer_sections").insert({ title: data.title, slug, sort_order: data.sort_order ?? 99, is_visible: data.is_visible ?? true }).select("id").single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, id: row.id as string };
  });

export const adminDeleteFooterSection = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase.from("footer_sections").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const adminSaveFooterItem = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id?: string; item: Partial<FooterItem> }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    if (data.id) {
      const { id, ...patch } = data.item;
      const { error } = await ctx.supabase.from("footer_items").update(patch as Partial<FooterItem>).eq("id", data.id);
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }
    const { data: row, error } = await ctx.supabase.from("footer_items").insert(data.item as Partial<FooterItem>).select("id").single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, id: row.id as string };
  });

export const adminDeleteFooterItem = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase.from("footer_items").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/* ============================== SETTINGS ================================ */

export const adminGetSettings = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase.from("site_settings").select("*").order("key");
  return data as unknown as SiteSetting[] | null;
});

export const adminSaveSetting = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ key: string; value: Record<string, never> }>) => d)
  .handler(async ({ data }) => {
    const session = await requireSuperAdmin();
    if (!session) return { ok: false as const, error: "Super admin access required" };
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "SETTING_UPDATED", entityType: "site_setting", entityId: data.key });
    return { ok: true as const };
  });

/* ================================= SEO ================================== */

export const adminGetSeo = createServerFn({ method: "GET" })
  .validator((d: FnInput<{ entity_type: SeoMetadata["entity_type"]; entity_id: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return null;
    const { data: rows } = await ctx.supabase
      .from("seo_metadata")
      .select("*")
      .eq("entity_type", data.entity_type)
      .eq("entity_id", data.entity_id)
      .limit(1);
    return (rows?.[0] as SeoMetadata | undefined) ?? null;
  });

export const adminSaveSeo = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ entity_type: SeoMetadata["entity_type"]; entity_id: string; fields: Partial<SeoMetadata> }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase
      .from("seo_metadata")
      .upsert({ entity_type: data.entity_type, entity_id: data.entity_id, ...data.fields }, { onConflict: "entity_type,entity_id" });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/* ================================ USERS ================================= */

export const adminListUsers = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSuperAdmin();
  if (!session) return null;
  const admin = getAdminClient();
  const { data: usersData, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) return null;
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { data: profiles } = await ctx.supabase.from("profiles").select("*");
  const profileMap = new Map<string, Profile>();
  for (const p of (profiles ?? []) as Profile[]) profileMap.set(p.user_id, p);
  return {
    users: usersData.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      role: u.user_metadata?.["role"] as string | undefined,
    })),
    profiles: [...profileMap.values()],
  };
});

export const adminCreateUser = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ email: string; password: string; full_name?: string; role?: Profile["role"] }>) => d)
  .handler(async ({ data }) => {
    const session = await requireSuperAdmin();
    if (!session) return { ok: false as const, error: "Super admin access required" };
    const admin = getAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name ?? "", role: data.role ?? "editor", is_active: true },
    });
    if (error) return { ok: false as const, error: error.message };
    const userId = created?.user?.id;
    if (!userId) return { ok: false as const, error: "No user id returned" };
    await logActivity({ userId: session.userId, action: "USER_CREATED", entityType: "user", entityId: userId, metadata: { email: data.email } });
    return { ok: true as const, id: userId };
  });

export const adminUpdateUserRole = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ userId: string; role?: Profile["role"]; is_active?: boolean }>) => d)
  .handler(async ({ data }) => {
    const session = await requireSuperAdmin();
    if (!session) return { ok: false as const, error: "Super admin access required" };
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { error } = await ctx.supabase
      .from("profiles")
      .update({ role: data.role, is_active: data.is_active })
      .eq("user_id", data.userId);
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: session.userId, action: "USER_UPDATED", entityType: "user", entityId: data.userId });
    return { ok: true as const };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ userId: string }>) => d)
  .handler(async ({ data }) => {
    const session = await requireSuperAdmin();
    if (!session) return { ok: false as const, error: "Super admin access required" };
    const admin = getAdminClient();
    const { error } = await admin.auth.admin.deleteUser(data.userId);
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: session.userId, action: "USER_DELETED", entityType: "user", entityId: data.userId });
    return { ok: true as const };
  });

/* ============================== ACTIVITY ================================ */

export const adminGetActivity = createServerFn({ method: "GET" })
  .validator((d: FnInput<{ limit?: number }> = {}) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return null;
    const { data: rows } = await ctx.supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);
    return rows as unknown as ActivityLog[] | null;
  });

/* ============================== REVISIONS =============================== */

export const adminGetPageRevisions = createServerFn({ method: "GET" })
  .validator((d: FnInput<{ pageId: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return null;
    const { data: rows } = await ctx.supabase
      .from("page_revisions")
      .select("*")
      .eq("page_id", data.pageId)
      .order("created_at", { ascending: false })
      .limit(50);
    return rows as unknown as PageRevision[] | null;
  });

export const adminGetBlogRevisions = createServerFn({ method: "GET" })
  .validator((d: FnInput<{ blogId: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return null;
    const { data: rows } = await ctx.supabase
      .from("blog_revisions")
      .select("*")
      .eq("blog_id", data.blogId)
      .order("created_at", { ascending: false })
      .limit(50);
    return rows as unknown as BlogRevision[] | null;
  });

export const adminRestorePageRevision = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ revisionId: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { data: rev } = await ctx.supabase.from("page_revisions").select("*").eq("id", data.revisionId).single();
    if (!rev) return { ok: false as const, error: "Revision not found" };
    const { error } = await ctx.supabase.from("pages").update({ title: rev.title, slug: rev.slug, content: rev.content, status: rev.status }).eq("id", rev.page_id);
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "PAGE_REVISION_RESTORED", entityType: "page", entityId: rev.page_id });
    return { ok: true as const };
  });

export const adminRestoreBlogRevision = createServerFn({ method: "POST" })
  .validator((d: FnInput<{ revisionId: string }>) => d)
  .handler(async ({ data }) => {
    const ctx = await getAdminContext();
    if (!ctx) return { ok: false as const, error: "Unauthorized" };
    const { data: rev } = await ctx.supabase.from("blog_revisions").select("*").eq("id", data.revisionId).single();
    if (!rev) return { ok: false as const, error: "Revision not found" };
    const { error } = await ctx.supabase.from("blogs").update({ title: rev.title, slug: rev.slug, content: rev.content, status: rev.status }).eq("id", rev.blog_id);
    if (error) return { ok: false as const, error: error.message };
    await logActivity({ userId: ctx.session.userId, action: "BLOG_REVISION_RESTORED", entityType: "blog", entityId: rev.blog_id });
    return { ok: true as const };
  });
