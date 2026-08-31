import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function listMedia(opts?: {
  search?: string;
  folder_id?: string;
  limit?: number;
}) {
  if (!isSupabaseConfigured) return [];
  let q = supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });
  if (opts?.search) q = q.ilike("file_name", `%${opts.search}%`);
  if (opts?.folder_id) q = q.eq("folder_id", opts.folder_id);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return data ?? [];
}

export async function uploadMedia(file: File, folder = "general") {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
  ];
  if (!allowed.includes(file.type)) throw new Error("Invalid file type");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("File too large (max 10MB)");
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("website-media")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage
    .from("website-media")
    .getPublicUrl(path);
  const { data, error } = await supabase
    .from("media")
    .insert({
      file_name: file.name,
      storage_path: path,
      public_url: urlData.publicUrl,
      mime_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMedia(id: string, storage_path: string) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  await supabase.storage.from("website-media").remove([storage_path]);
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) throw error;
}
