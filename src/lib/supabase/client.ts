import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (publishable key only — never a secret key).
 *
 * @supabase/ssr persists the auth session in cookies so that SSR requests
 * (TanStack Start server functions / loaders) can read the session too.
 */
export function getBrowserClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // No env configured yet — the admin Setup screen handles this case.
    return null;
  }

  return createBrowserClient(url, key, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
}

let cached: ReturnType<typeof createBrowserClient> | null | undefined;

export function appClient() {
  if (cached === undefined) {
    const client = getBrowserClient();
    cached = client;
  }
  return cached;
}

/** True when Supabase env vars are present in the browser bundle. */
export function hasBrowserSupabaseEnv() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
}
