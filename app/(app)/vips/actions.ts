"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { VipCategory } from "@/lib/types";

const CATEGORIES: VipCategory[] = [
  "collector",
  "artist",
  "press",
  "sponsor",
  "curator",
  "gallerist",
  "institution",
  "other",
];

function parseCategory(v: FormDataEntryValue | null): VipCategory {
  const s = (v ?? "other").toString();
  return (CATEGORIES as string[]).includes(s) ? (s as VipCategory) : "other";
}

function parseString(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s.length ? s : null;
}

export type VipFormState = { error?: string } | undefined;

export async function createVip(_prev: VipFormState, formData: FormData): Promise<VipFormState> {
  const { supabase } = await requireAdmin();

  const full_name = parseString(formData.get("full_name"));
  if (!full_name) return { error: "Name is required." };

  const payload = {
    full_name,
    email: parseString(formData.get("email")),
    phone: parseString(formData.get("phone")),
    country: parseString(formData.get("country")),
    category: parseCategory(formData.get("category")),
    dietary: parseString(formData.get("dietary")),
    hotel: parseString(formData.get("hotel")),
    flight_arrival: parseString(formData.get("flight_arrival")),
    flight_departure: parseString(formData.get("flight_departure")),
    assigned_host_id: parseString(formData.get("assigned_host_id")),
    notes: parseString(formData.get("notes")),
  };

  const { data, error } = await supabase.from("vips").insert(payload).select("id").single();
  if (error) return { error: error.message };

  revalidatePath("/vips");
  redirect(`/vips/${data.id}`);
}

export async function updateVip(id: string, _prev: VipFormState, formData: FormData): Promise<VipFormState> {
  const { supabase } = await requireAdmin();

  const full_name = parseString(formData.get("full_name"));
  if (!full_name) return { error: "Name is required." };

  const payload = {
    full_name,
    email: parseString(formData.get("email")),
    phone: parseString(formData.get("phone")),
    country: parseString(formData.get("country")),
    category: parseCategory(formData.get("category")),
    dietary: parseString(formData.get("dietary")),
    hotel: parseString(formData.get("hotel")),
    flight_arrival: parseString(formData.get("flight_arrival")),
    flight_departure: parseString(formData.get("flight_departure")),
    assigned_host_id: parseString(formData.get("assigned_host_id")),
    notes: parseString(formData.get("notes")),
  };

  const { error } = await supabase.from("vips").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/vips");
  revalidatePath(`/vips/${id}`);
  redirect(`/vips/${id}`);
}

export async function deleteVip(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("vips").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vips");
  redirect("/vips");
}

export async function addCompanion(vipId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const full_name = parseString(formData.get("full_name"));
  if (!full_name) return;
  const notes = parseString(formData.get("notes"));
  await supabase.from("companions").insert({ vip_id: vipId, full_name, notes });
  revalidatePath(`/vips/${vipId}`);
}

export async function removeCompanion(vipId: string, id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("companions").delete().eq("id", id);
  revalidatePath(`/vips/${vipId}`);
}
