import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AdminGuard } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/seo")({
  component: Seo,
});

function Seo() {
  const q = useQuery({
    queryKey: ["admin-seo"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];
      const { data } = await supabase
        .from("seo_metadata")
        .select("*")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <AdminGuard>
      <h1 className="font-display text-3xl">SEO</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Global + per-page overrides. Public routes read via getSeo().
      </p>
      <ul className="mt-6 divide-y divide-border rounded-sm border border-border">
        {(q.data ?? []).map(
          (s: {
            id: string;
            entity_type: string;
            seo_title: string | null;
          }) => (
            <li key={s.id} className="px-4 py-3 text-sm">
              {s.entity_type}: {s.seo_title ?? "—"}
            </li>
          ),
        )}
        {q.data?.length === 0 && (
          <li className="px-4 py-8 text-center text-muted-foreground">
            No SEO records yet. Insert via Supabase or extend this UI.
          </li>
        )}
      </ul>
    </AdminGuard>
  );
}
