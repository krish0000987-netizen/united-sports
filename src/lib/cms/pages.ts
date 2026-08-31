import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Page, PageSection } from "./types";

export async function getPublishedPage(
  slug: string,
): Promise<{ page: Page | null; sections: PageSection[] }> {
  if (!isSupabaseConfigured) return { page: null, sections: [] };
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (!page) return { page: null, sections: [] };
  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", (page as Page).id)
    .eq("is_visible", true)
    .order("sort_order");
  return { page: page as Page, sections: (sections as PageSection[]) ?? [] };
}

export async function getPublishedPages(): Promise<Page[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false });
  return (data as Page[]) ?? [];
}

// Admin
export async function adminListPages() {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from("pages")
    .select("*")
    .order("updated_at", { ascending: false });
  return data ?? [];
}
export async function adminCreatePage(payload: Partial<Page>) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("pages")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function adminUpdatePage(id: string, payload: Partial<Page>) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("pages")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function adminDeletePage(id: string) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw error;
}
