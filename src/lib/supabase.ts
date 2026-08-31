import { createClient } from "@supabase/supabase-js";

// Hardcoded fallback so Vercel works without manually setting env
// Anon key is public-safe, never put service_role/secret here
const HARDCODED_URL = "https://wkjdqjnqsbzrnfbpezgg.supabase.co";
const HARDCODED_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndramRxam5xc2J6cm5mYnBlemdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjE5NjYsImV4cCI6MjEwMzczNzk2Nn0.QBchXkiKZV6OZD5YweXDmXN3WTFA-QLdb6IBomJ5fII";

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabaseUrl = envUrl && envUrl !== "" && envUrl !== HARDCODED_URL ? envUrl : HARDCODED_URL;
const supabaseAnonKey = envAnon && envAnon !== "" && envAnon !== HARDCODED_ANON_KEY ? envAnon : HARDCODED_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== HARDCODED_URL && supabaseAnonKey !== HARDCODED_ANON_KEY,
);

// Also allow hardcoded if user replaces placeholders - treat as configured when placeholders replaced
const isHardcodedConfigured = HARDCODED_URL !== "https://your-project.supabase.co" && HARDCODED_ANON_KEY !== "your-anon-key";
const effectiveConfigured = isConfigured || isHardcodedConfigured;

if (!effectiveConfigured) {
  console.warn("[supabase] Hardcoded placeholders not replaced and no env set. Set real URL/anon key in src/lib/supabase.ts or Vercel env.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const isSupabaseConfigured = effectiveConfigured;
