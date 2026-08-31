import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AdminGuard } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blogs")({
  component: Blogs,
});

function Blogs() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const q = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });
  const create = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured) throw new Error("Supabase not configured");
      const slug = `blog-${Date.now()}`;
      const { data, error } = await supabase
        .from("blogs")
        .insert({
          title: title || "Untitled Blog",
          slug,
          status: "draft",
          content: "Write content…",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blogs"] });
      setTitle("");
      toast.success("Blog created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <AdminGuard>
      <h1 className="font-display text-3xl">Blogs</h1>
      <div className="mt-6 flex gap-2">
        <input
          placeholder="New blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-sm border border-input px-3 py-2"
        />
        <button
          onClick={() => create.mutate()}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          Create
        </button>
      </div>
      <ul className="mt-6 divide-y divide-border rounded-sm border border-border">
        {(q.data ?? []).map(
          (b: { id: string; title: string; slug: string; status: string }) => (
            <li
              key={b.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span>
                {b.title}{" "}
                <span className="text-xs text-muted-foreground">/{b.slug}</span>
              </span>
              <span className="text-xs uppercase tracking-wide">
                {b.status}
              </span>
            </li>
          ),
        )}
        {q.data?.length === 0 && (
          <li className="px-4 py-8 text-center text-muted-foreground">
            No blogs yet.
          </li>
        )}
      </ul>
    </AdminGuard>
  );
}
