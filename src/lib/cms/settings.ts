import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SiteSettings } from "./types";

const FALLBACK: Partial<SiteSettings> = {
  site_name: "UnitedAthletes",
  tagline: "for India Foundation",
  phone: "+91 85278 77688",
  whatsapp_phone: "918527877688",
  whatsapp_message:
    "Hello UnitedAthletes for India Foundation, I would like to get in touch!",
  whatsapp_enabled: true,
  address: "384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014",
  header_cta_label: "Get Involved",
  header_cta_url: "/get-involved",
};

export async function getSiteSettings(): Promise<Partial<SiteSettings>> {
  if (!isSupabaseConfigured) return FALLBACK;
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (!data) return FALLBACK;
  return { ...FALLBACK, ...(data as SiteSettings) };
}

export async function adminUpdateSettings(payload: Partial<SiteSettings>) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!existing) {
    const { data, error } = await supabase
      .from("site_settings")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", (existing as { id: string }).id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
