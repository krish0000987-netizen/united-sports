import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Blog } from "./types";

export async function getPublishedBlogs(opts?: {
  category_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  if (!isSupabaseConfigured) return [] as Blog[];
  let q = supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (opts?.category_id) q = q.eq("category_id", opts.category_id);
  if (opts?.search) q = q.ilike("title", `%${opts.search}%`);
  if (opts?.limit) q = q.limit(opts.limit);
  if (opts?.offset)
    q = q.range(opts.offset, opts.offset + (opts.limit ?? 10) - 1);
  const { data } = await q;
  return (data as Blog[]) ?? [];
}

export async function getBlogBySlug(slug: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as Blog | null;
}

// admin
export async function adminListBlogs() {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .order("updated_at", { ascending: false });
  return data ?? [];
}
export async function adminCreateBlog(payload: Partial<Blog>) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("blogs")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function adminUpdateBlog(id: string, payload: Partial<Blog>) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("blogs")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
