import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { NavigationItem } from "./types";

export const FALLBACK_NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programmes", label: "Programmes" },
  { to: "/get-involved", label: "Get Involved" },
  { to: "/contact", label: "Contact" },
];

export async function getNavigation(
  menuSlug = "header",
): Promise<{ label: string; url: string; open_in_new_tab: boolean }[]> {
  if (!isSupabaseConfigured)
    return FALLBACK_NAV.map((n) => ({
      label: n.label,
      url: n.to,
      open_in_new_tab: false,
    }));
  const { data: menu } = await supabase
    .from("navigation_menus")
    .select("id")
    .eq("slug", menuSlug)
    .maybeSingle();
  if (!menu)
    return FALLBACK_NAV.map((n) => ({
      label: n.label,
      url: n.to,
      open_in_new_tab: false,
    }));
  const { data } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("menu_id", (menu as { id: string }).id)
    .eq("is_visible", true)
    .order("sort_order");
  if (!data || data.length === 0)
    return FALLBACK_NAV.map((n) => ({
      label: n.label,
      url: n.to,
      open_in_new_tab: false,
    }));
  return (data as NavigationItem[]).map((i) => ({
    label: i.label,
    url: i.url,
    open_in_new_tab: i.open_in_new_tab,
  }));
}

export async function adminListNavigation(menuSlug = "header") {
  if (!isSupabaseConfigured) return [];
  const { data: menu } = await supabase
    .from("navigation_menus")
    .select("id")
    .eq("slug", menuSlug)
    .maybeSingle();
  if (!menu) return [];
  const { data } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("menu_id", (menu as { id: string }).id)
    .order("sort_order");
  return data ?? [];
}
export async function adminUpsertNavigationItem(
  payload: Partial<NavigationItem> & { menu_id: string },
) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("navigation_items")
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
