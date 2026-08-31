import { config as loadDotEnv } from "dotenv";

/**
 * Server-only Supabase environment access.
 *
 * NEVER import this module from browser/client code — it reads `process.env`
 * and loads `.env.local` (which must stay git-ignored and never be shipped to
 * the browser bundle).
 *
 * In local dev, Vite injects `VITE_*` variables into the client bundle and
 * Nitro exposes `.env` files on the server. We additionally dotenv-load
 * `.env.local` so the secret key resolves for server functions running in the
 * dev server. In production (Vercel + Supabase dashboard env vars) the file
 * doesn't exist and `config()` is a no-op.
 */

let loaded = false;

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  // Guarded so this module is inert if it is ever (incorrectly) bundled
  // into a browser chunk.
  loadDotEnv({ path: ".env.local", quiet: true });
  loadDotEnv({ quiet: true });
}

export interface ServerEnv {
  url: string | undefined;
  publishableKey: string | undefined;
  secretKey: string | undefined;
  jwksUrl: string | undefined;
  bucket: string;
}

export function getServerEnv(): ServerEnv {
  ensureLoaded();
  const e = process.env;
  return {
    url: e["SUPABASE_URL"] ?? e["VITE_SUPABASE_URL"],
    publishableKey:
      e["SUPABASE_PUBLISHABLE_KEY"] ?? e["VITE_SUPABASE_PUBLISHABLE_KEY"],
    secretKey: e["SUPABASE_SECRET_KEY"],
    jwksUrl: e["SUPABASE_JWKS_URL"],
    bucket: e["VITE_SUPABASE_STORAGE_BUCKET"] ?? "website-media",
  };
}

/** True when the server has enough config to talk to Supabase. */
export function hasServerSupabaseEnv() {
  const env = getServerEnv();
  return Boolean(env.url && env.publishableKey);
}
