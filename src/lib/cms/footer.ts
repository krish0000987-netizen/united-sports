import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export async function getFooter() {
  if (!isSupabaseConfigured)
    return {
      description:
        "UnitedAthletes for India Foundation — an athlete-focused organisation building a stronger sporting ecosystem across India.",
      phone: "+91 85278 77688",
      address:
        "384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014",
      copyright: `© ${new Date().getFullYear()} UnitedAthletes for India Foundation. A Section 8 Company.`,
      columns: [] as FooterColumn[],
      social: {} as Record<string, string>,
    };
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const s = data as Record<string, unknown>;
  return {
    description: (s["footer_description"] as string) ?? null,
    phone: s["phone"] as string,
    address: s["address"] as string,
    copyright: s["footer_copyright"] as string,
    columns: (s["footer_columns"] as FooterColumn[]) ?? [],
    social: {
      instagram: s["social_instagram"] as string,
      facebook: s["social_facebook"] as string,
      youtube: s["social_youtube"] as string,
      linkedin: s["social_linkedin"] as string,
      x: s["social_x"] as string,
    },
  };
}
