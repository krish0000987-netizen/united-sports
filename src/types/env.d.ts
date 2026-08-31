/**
 * Minimal ambient declarations for server-side globals that are not covered by
 * the `vite/client` types bundled in tsconfig.json.
 */

declare const process: {
  env: {
    SUPABASE_URL?: string;
    VITE_SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
    VITE_SUPABASE_PUBLISHABLE_KEY?: string;
    SUPABASE_SECRET_KEY?: string;
    SUPABASE_JWKS_URL?: string;
    VITE_SUPABASE_STORAGE_BUCKET?: string;
    NODE_ENV?: string;
    [key: string]: string | undefined;
  };
};
