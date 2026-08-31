import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AdminGuard } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/navigation")({
  component: NavEditor,
});

function NavEditor() {
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const q = useQuery({
    queryKey: ["admin-nav"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];
      const { data: menu } = await supabase
        .from("navigation_menus")
        .select("id")
        .eq("slug", "header")
        .maybeSingle();
      if (!menu) return [];
      const { data } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("menu_id", (menu as { id: string }).id)
        .order("sort_order");
      return data ?? [];
    },
  });
  const add = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured) throw new Error("Supabase not configured");
      let menuId: string;
      const { data: menu } = await supabase
        .from("navigation_menus")
        .select("id")
        .eq("slug", "header")
        .maybeSingle();
      if (!menu) {
        const { data } = await supabase
          .from("navigation_menus")
          .insert({ name: "Header", slug: "header" })
          .select()
          .single();
        menuId = (data as { id: string }).id;
      } else menuId = (menu as { id: string }).id;
      const { error } = await supabase
        .from("navigation_items")
        .insert({
          menu_id: menuId,
          label,
          url: url || "/",
          sort_order: q.data?.length ?? 0,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-nav"] });
      setLabel("");
      setUrl("");
      toast.success("Navigation item added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminGuard>
      <h1 className="font-display text-3xl">Navigation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Header menu — public SiteHeader fetches from Supabase.
      </p>
      <div className="mt-6 flex gap-2">
        <input
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-sm border border-input px-3 py-2"
        />
        <input
          placeholder="/url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded-sm border border-input px-3 py-2"
        />
        <button
          onClick={() => add.mutate()}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          Add
        </button>
      </div>
      <ul className="mt-6 divide-y divide-border rounded-sm border border-border">
        {(q.data ?? []).map(
          (n: {
            id: string;
            label: string;
            url: string;
            is_visible: boolean;
          }) => (
            <li
              key={n.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span>
                {n.label}{" "}
                <span className="text-xs text-muted-foreground">{n.url}</span>
              </span>
              <span className="text-xs">
                {n.is_visible ? "visible" : "hidden"}
              </span>
            </li>
          ),
        )}
      </ul>
    </AdminGuard>
  );
}
