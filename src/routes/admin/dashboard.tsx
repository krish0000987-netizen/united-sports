import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AdminGuard } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      if (!isSupabaseConfigured)
        return {
          pages: 0,
          blogs: 0,
          media: 0,
          publishedPages: 0,
          publishedBlogs: 0,
        };
      const [pages, blogs, media] = await Promise.all([
        supabase.from("pages").select("id,status", { count: "exact" }),
        supabase.from("blogs").select("id,status", { count: "exact" }),
        supabase.from("media").select("id", { count: "exact", head: true }),
      ]);
      return {
        pages: pages.count ?? pages.data?.length ?? 0,
        publishedPages:
          pages.data?.filter(
            (p: { status: string }) => p.status === "published",
          ).length ?? 0,
        blogs: blogs.count ?? blogs.data?.length ?? 0,
        publishedBlogs:
          blogs.data?.filter(
            (p: { status: string }) => p.status === "published",
          ).length ?? 0,
        media: media.count ?? 0,
      };
    },
  });

  return (
    <AdminGuard>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Real Supabase data — no mock numbers.
      </p>
      {!isSupabaseConfigured && (
        <p className="mt-4 rounded-sm bg-amber-500/10 p-3 text-sm">
          Supabase not configured — stats show 0. Connect .env to see live data.
        </p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Pages", value: stats.data?.pages ?? "—" },
          {
            label: "Published Pages",
            value: stats.data?.publishedPages ?? "—",
          },
          { label: "Total Blogs", value: stats.data?.blogs ?? "—" },
          { label: "Media Files", value: stats.data?.media ?? "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-sm border border-border bg-card p-6"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-2 font-display text-4xl">{String(s.value)}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/pages"
          className="rounded-sm bg-primary p-6 text-primary-foreground"
        >
          Manage Pages →
        </Link>
        <Link
          to="/admin/blogs"
          className="rounded-sm border border-border bg-card p-6"
        >
          Create Blog →
        </Link>
      </div>
    </AdminGuard>
  );
}
