import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  component: Login,
});

function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: "/admin/dashboard" });
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setErr(error);
    else navigate({ to: "/admin/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-sm border border-border bg-background p-8 shadow-xl"
      >
        <h1 className="font-display text-3xl">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          UnitedAthletes CMS — Supabase Auth
        </p>
        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-sm bg-destructive/10 p-3 text-sm text-destructive">
            Supabase not configured. Set VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY in .env
          </p>
        )}
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2.5"
            />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            disabled={loading}
            className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Use the Supabase Auth user you created (profiles.role =
          super_admin/editor). Create first user via Supabase Dashboard → Auth →
          Add User, then insert profile row.
        </p>
      </form>
    </div>
  );
}
