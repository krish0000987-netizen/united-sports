import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AdminGuard } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pages")({
  component: PagesManager,
});

function PagesManager() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const q = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];
      const { data } = await supabase
        .from("pages")
        .select("*")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured) throw new Error("Supabase not configured");
      const slug = `new-page-${Date.now()}`;
      const { data, error } = await supabase
        .from("pages")
        .insert({ title: "New Page", slug, status: "draft" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Page created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (q.data ?? []).filter(
    (p: { title: string; slug: string }) =>
      !filter ||
      p.title.toLowerCase().includes(filter.toLowerCase()) ||
      p.slug.includes(filter.toLowerCase()),
  );

  return (
    <AdminGuard>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Pages</h1>
        <button
          onClick={() => create.mutate()}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          + New Page
        </button>
      </div>
      <input
        placeholder="Search pages…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mt-6 w-full rounded-sm border border-input px-3 py-2"
      />
      <div className="mt-6 overflow-x-auto rounded-sm border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-[0.14em]">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(
              (p: {
                id: string;
                title: string;
                slug: string;
                status: string;
                updated_at: string;
              }) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{p.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">/{p.slug}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/20 px-2 py-1 text-xs">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ),
            )}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {q.isLoading ? "Loading…" : "No pages. Create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Publish flow: draft → published (public site shows only published). Use
        Supabase for now; full editor at /admin/pages/:id coming next.
      </p>
      <Link
        to="/admin/dashboard"
        className="mt-4 inline-block text-sm text-primary"
      >
        ← Dashboard
      </Link>
    </AdminGuard>
  );
}
