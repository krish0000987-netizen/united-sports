import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SeoMetadata } from "./types";

export async function getSeo(
  entityType: string,
  entityId?: string | null,
): Promise<Partial<SeoMetadata> | null> {
  if (!isSupabaseConfigured) return null;
  if (entityId) {
    const { data } = await supabase
      .from("seo_metadata")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .maybeSingle();
    if (data) return data as SeoMetadata;
  }
  const { data } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("entity_type", entityType)
    .is("entity_id", null)
    .maybeSingle();
  return (data as SeoMetadata) ?? null;
}
export async function getGlobalSeo() {
  return getSeo("global", null);
}
