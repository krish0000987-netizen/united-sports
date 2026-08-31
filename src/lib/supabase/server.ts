import "@tanstack/react-start/server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  deleteCookie,
  getCookie,
  getCookies,
  setCookie,
} from "@tanstack/react-start/server";
import type { CookieOptions } from "@supabase/ssr";

import { getServerEnv } from "./env";

/**
 * SERVER-ONLY Supabase clients.
 *
 * - `getSupabaseServerClient()` — session-bound @supabase/ssr client. RLS
 *   applies as the logged-in user (or `anon` when there's no session). This is
 *   the client used for ALL public rendering and ALL authenticated admin
 *   mutations (RLS is the real security boundary).
 * - `getAdminClient()` — secret-key client (bypasses RLS). Used ONLY for
 *   operations a plain user role cannot do through RLS: auth user management,
 *   storage uploads (fallback), schema-health checks. Never exposed to the
 *   browser bundle ("server-only" marker).
 *
 * TanStack Start is cookie-based, so we compose @supabase/ssr cookie methods
 * with the framework's cookie helpers (the pattern recommended by
 * @supabase/server docs for cookie-based SSR frameworks).
 */

export function getSupabaseServerClient() {
  const env = getServerEnv();
  const url = env.url;
  const publishableKey = env.publishableKey;

  // Missing env (schema not applied / not configured yet): return null so
  // callers can fall back to graceful defaults instead of throwing.
  if (!url || !publishableKey) return null;

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        const cookies = getCookies();
        return Object.entries(cookies).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            const { maxAge, ...rest } = (options ?? {}) as CookieOptions;
            setCookie(name, value, {
              ...(rest as Record<string, unknown>),
              ...(maxAge != null ? { maxAge } : {}),
            } as never);
          });
        } catch {
          // Setting cookies is best-effort inside server functions; a failure
          // here must not break data reads.
        }
      },
    },
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/** Secret-key client. Throws when the secret key is not configured. */
export function getAdminClient() {
  const env = getServerEnv();
  if (!env.url || !env.secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not configured");
  }
  return createClient(env.url, env.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function getBucket() {
  return getServerEnv().bucket || "website-media";
}

export async function clearSupabaseAuthCookies() {
  for (const name of ["sb-auth-token", "sb-refresh-token", "sb-access-token"]) {
    try {
      deleteCookie(name, { path: "/" });
    } catch {
      // ignore
    }
  }
}

// Re-export for convenience in data layer modules.
export { getCookie, setCookie, deleteCookie, getCookies };
