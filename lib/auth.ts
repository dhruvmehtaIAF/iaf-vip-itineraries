import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile, supabase };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.profile?.role !== "admin") {
    throw new Error("Admin access required");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.profile?.role === "admin";
}
