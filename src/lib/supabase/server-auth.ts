import "@tanstack/react-start/server-only";

import type { Profile, StaffSession } from "@/lib/cms/types";

import { getAdminClient, getSupabaseServerClient } from "./server";

/**
 * SERVER-ONLY session/authorization helpers used by admin server functions and
 * the admin UI. Never import from browser code.
 *
 * RLS is the real security boundary — these checks are defense-in-depth so the
 * admin API returns clean "unauthorized" responses before hitting the DB.
 */

export async function getStaffSession(): Promise<StaffSession | null> {
  const sb = getSupabaseServerClient();
  if (!sb) return null;

  const { data: userData } = await sb.auth.getUser();
  const user = userData?.user;
  if (!user) return null;

  const { data: profile } = await sb
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Profile>();

  if (!profile || !profile.is_active) return null;
  if (profile.role !== "super_admin" && profile.role !== "editor") return null;

  return {
    userId: user.id,
    email: user.email ?? "",
    profile,
    isSuperAdmin: profile.role === "super_admin",
  };
}

/** Returns the staff session or null (used to guard admin mutations). */
export async function requireStaff(): Promise<StaffSession | null> {
  return getStaffSession();
}

/** Returns the session only when the caller is a super_admin. */
export async function requireSuperAdmin(): Promise<StaffSession | null> {
  const session = await getStaffSession();
  if (!session?.isSuperAdmin) return null;
  return session;
}

export interface AdminContext {
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>;
  admin: ReturnType<typeof getAdminClient>;
  session: StaffSession;
}

/** Builds the supabase + admin client pair only after confirming staff auth. */
export async function getAdminContext(): Promise<AdminContext | null> {
  const session = await getStaffSession();
  if (!session) return null;
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  return { supabase, admin: getAdminClient(), session };
}

/** Insert a row into activity_logs (best-effort — never breaks the caller). */
export async function logActivity(input: {
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return;
    await supabase.from("activity_logs").insert({
      user_id: input.userId ?? null,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch {
    // Logging must never fail the primary mutation.
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
