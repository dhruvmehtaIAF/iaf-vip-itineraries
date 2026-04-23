"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

const ROLES: UserRole[] = ["admin", "viewer"];

export async function setUserRole(userId: string, role: UserRole) {
  if (!ROLES.includes(role)) throw new Error("Invalid role");
  const { supabase, user } = await requireAdmin();

  if (user.id === userId && role !== "admin") {
    throw new Error("You can't demote yourself.");
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}
