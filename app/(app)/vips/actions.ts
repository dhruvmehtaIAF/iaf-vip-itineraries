"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { VipCategory, VipCountry, VipType } from "@/lib/types";

const VIP_TYPES: VipType[] = [
  "collector",
  "exhibitor",
  "curator",
  "press",
  "sponsor",
  "artist",
  "institution",
  "other",
];

const VIP_CATEGORIES: VipCategory[] = [
  "patrons",
  "level_1",
  "level_2",
  "level_3",
  "level_4",
  "young_collector",
];

const VIP_COUNTRIES: VipCountry[] = ["india", "international"];

function parseType(v: FormDataEntryValue | null): VipType {
  const s = (v ?? "other").toString();
  return (VIP_TYPES as string[]).includes(s) ? (s as VipType) : "other";
}

function parseCategory(v: FormDataEntryValue | null): VipCategory {
  const s = (v ?? "level_4").toString();
  return (VIP_CATEGORIES as string[]).includes(s) ? (s as VipCategory) : "level_4";
}

function parseCountry(v: FormDataEntryValue | null): VipCountry | null {
  const s = (v ?? "").toString();
  if (!s) return null;
  return (VIP_COUNTRIES as string[]).includes(s) ? (s as VipCountry) : null;
}

function parseString(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s.length ? s : null;
}

function parseYear(v: FormDataEntryValue | null): number | null {
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const yr = Math.floor(n);
  // Sanity check — IAF started 2008; allow a generous window.
  if (yr < 2000 || yr > 2100) return null;
  return yr;
}

export type VipFormState = { error?: string } | undefined;

function extractPayload(formData: FormData) {
  return {
    full_name: parseString(formData.get("full_name")),
    designation: parseString(formData.get("designation")),
    email: parseString(formData.get("email")),
    phone: parseString(formData.get("phone")),
    country: parseCountry(formData.get("country")),
    type: parseType(formData.get("type")),
    category: parseCategory(formData.get("category")),
    added_year: parseYear(formData.get("added_year")),
    hotel: parseString(formData.get("hotel")),
    arrival_date: parseString(formData.get("arrival_date")),
    arrival_time: parseString(formData.get("arrival_time")),
    departure_date: parseString(formData.get("departure_date")),
    departure_time: parseString(formData.get("departure_time")),
    notes: parseString(formData.get("notes")),
  };
}

export async function createVip(_prev: VipFormState, formData: FormData): Promise<VipFormState> {
  const { supabase } = await requireAdmin();

  const payload = extractPayload(formData);
  if (!payload.full_name) return { error: "Name is required." };

  const { data, error } = await supabase
    .from("vips")
    .insert({ ...payload, full_name: payload.full_name })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/vips");
  redirect(`/vips/${data.id}`);
}

export async function updateVip(
  id: string,
  _prev: VipFormState,
  formData: FormData
): Promise<VipFormState> {
  const { supabase } = await requireAdmin();

  const payload = extractPayload(formData);
  if (!payload.full_name) return { error: "Name is required." };

  const { error } = await supabase
    .from("vips")
    .update({ ...payload, full_name: payload.full_name })
    .eq("id", id);
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
