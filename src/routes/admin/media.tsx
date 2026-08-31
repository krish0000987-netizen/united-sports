import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AdminGuard } from "@/components/admin/AdminLayout";
import { uploadMedia, deleteMedia } from "@/lib/cms/media";
import { toast } from "sonner";
import { useRef } from "react";

export const Route = createFileRoute("/admin/media")({
  component: MediaLibrary,
});

function MediaLibrary() {
  const qc = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const q = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];
      const { data } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });
  const up = useMutation({
    mutationFn: async (file: File) => uploadMedia(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      toast.success("Uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (row: { id: string; storage_path: string }) =>
      deleteMedia(row.id, row.storage_path),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      toast.success("Deleted");
    },
  });
  return (
    <AdminGuard>
      <h1 className="font-display text-3xl">Media Library</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bucket: <code>website-media</code> • public read, admin write
      </p>
      <div className="mt-6">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) up.mutate(f);
          }}
          className="block w-full text-sm"
        />
        {!isSupabaseConfigured && (
          <p className="mt-2 text-sm text-amber-600">
            Configure Supabase to enable uploads.
          </p>
        )}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(q.data ?? []).map(
          (m: {
            id: string;
            public_url: string;
            file_name: string;
            storage_path: string;
          }) => (
            <div
              key={m.id}
              className="overflow-hidden rounded-sm border border-border bg-card"
            >
              <img
                src={m.public_url}
                alt={m.file_name}
                className="h-36 w-full object-cover"
                loading="lazy"
              />
              <div className="p-3">
                <p className="truncate text-xs">{m.file_name}</p>
                <button
                  onClick={() =>
                    del.mutate({ id: m.id, storage_path: m.storage_path })
                  }
                  className="mt-2 text-xs text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
      {q.data?.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No media yet. Upload to Supabase Storage.
        </p>
      )}
    </AdminGuard>
  );
}
