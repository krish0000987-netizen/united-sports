import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Menu,
  Settings,
  LogOut,
  Newspaper,
  Search,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/blogs", label: "Blogs", icon: Newspaper },
  { to: "/admin/media", label: "Media", icon: ImageIcon },
  { to: "/admin/navigation", label: "Navigation", icon: Menu },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/seo", label: "SEO", icon: Search },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-navy-deep lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-border p-6">
            <p className="font-display text-xl">
              United<span className="text-primary">Athletes</span>
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Admin CMS
            </p>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {nav.map((n) => {
              const active =
                pathname === n.to || pathname.startsWith(n.to + "/");
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-accent"}`}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <p className="text-sm font-semibold truncate">
              {profile?.full_name ?? user.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile?.role ?? "editor"}
            </p>
            <button
              onClick={signOut}
              className="mt-3 flex w-full items-center gap-2 rounded-sm border border-input px-3 py-2 text-sm hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
            <Link
              to="/"
              className="mt-2 block text-xs text-muted-foreground hover:text-primary"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:hidden">
          <span className="font-display">Admin</span>
          <button onClick={signOut} className="text-sm">
            Logout
          </button>
        </header>
        <div className="flex-1 p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const routerState = useRouterState({ select: (s) => s.location.pathname });
  const isDemo = typeof window !== "undefined" && localStorage.getItem("demo_admin") === "1";
  if (loading && !isDemo)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading…
      </div>
    );
  if (!user && !isDemo) {
    if (
      typeof window !== "undefined" &&
      !routerState.startsWith("/admin/login")
    )
      window.location.href = "/admin/login";
    return (
      <div className="flex min-h-screen items-center justify-center">
        Redirecting to login…
      </div>
    );
  }
  // demo admin override
  if (isDemo && !user) {
    return (
      <div className="flex min-h-screen bg-muted/20">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-navy-deep lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-border p-6">
              <p className="font-display text-xl">United<span className="text-primary">Athletes</span></p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Admin CMS (Demo)</p>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {nav.map((n) => {
                const active = routerState === n.to || routerState.startsWith(n.to + "/");
                return (
                  <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-accent"}`}>
                    <n.icon className="h-4 w-4" /> {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border p-4">
              <p className="text-sm font-semibold">Demo Admin</p>
              <button onClick={() => { localStorage.removeItem("demo_admin"); window.location.href = "/admin/login"; }} className="mt-3 flex w-full items-center gap-2 rounded-sm border border-input px-3 py-2 text-sm hover:bg-accent">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </aside>
        <div className="flex flex-1 flex-col"><div className="flex-1 p-6 sm:p-8">{children}</div></div>
      </div>
    );
  }
  return <AdminLayout>{children}</AdminLayout>;
}
