import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AdminGuard } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return null;
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      return data as Record<string, unknown> | null;
    },
  });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data) setForm(q.data as Record<string, string>);
  }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured) throw new Error("Supabase not configured");
      const payload = {
        site_name: form.site_name,
        phone: form.phone,
        address: form.address,
        whatsapp_phone: form.whatsapp_phone,
        header_cta_label: form.header_cta_label,
      };
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (!existing) {
        const { error } = await supabase.from("site_settings").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .update(payload)
          .eq("id", (existing as { id: string }).id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminGuard>
      <h1 className="font-display text-3xl">Site Settings</h1>
      <div className="mt-6 max-w-2xl space-y-4">
        {[
          ["site_name", "Site Name"],
          ["phone", "Phone"],
          ["address", "Address"],
          ["whatsapp_phone", "WhatsApp Phone"],
          ["header_cta_label", "Header CTA Label"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="text-xs uppercase tracking-wide">{label}</label>
            <input
              value={form[key] ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 w-full rounded-sm border border-input px-3 py-2"
            />
          </div>
        ))}
        <button
          onClick={() => save.mutate()}
          className="rounded-sm bg-primary px-6 py-2 text-sm font-bold text-primary-foreground"
        >
          Save
        </button>
        {!isSupabaseConfigured && (
          <p className="text-sm text-amber-600">
            Configure Supabase to persist settings.
          </p>
        )}
      </div>
    </AdminGuard>
  );
}
