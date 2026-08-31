import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function logActivity(
  action: string,
  entity_type: string,
  entity_id?: string,
  metadata?: Record<string, unknown>,
) {
  if (!isSupabaseConfigured) return;
  const { data: user } = await supabase.auth.getUser();
  await supabase.from("activity_logs").insert({
    user_id: user.user?.id ?? null,
    action,
    entity_type,
    entity_id: entity_id ?? null,
    metadata: metadata ?? null,
  });
}

export async function getActivity(limit = 20) {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
