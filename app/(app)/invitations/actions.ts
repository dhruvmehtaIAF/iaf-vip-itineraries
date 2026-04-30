"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { RsvpStatus } from "@/lib/types";

const STATUSES: RsvpStatus[] = [
  "not_sent",
  "invited",
  "accepted",
  "declined",
  "tentative",
  "waitlist",
];

function parseStatus(v: FormDataEntryValue | null): RsvpStatus {
  const s = (v ?? "not_sent").toString();
  return (STATUSES as string[]).includes(s) ? (s as RsvpStatus) : "not_sent";
}

function parseListNumber(v: FormDataEntryValue | null): number {
  const s = (v ?? "1").toString();
  const n = Math.floor(Number(s));
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export async function inviteVipToEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const vip_id = formData.get("vip_id")?.toString();
  const event_id = formData.get("event_id")?.toString();
  const status = parseStatus(formData.get("status"));
  const list_number = parseListNumber(formData.get("list_number"));
  if (!vip_id || !event_id) return;

  await supabase
    .from("invitations")
    .upsert({ vip_id, event_id, status, list_number }, { onConflict: "vip_id,event_id" });

  revalidatePath(`/vips/${vip_id}`);
  revalidatePath(`/events/${event_id}`);
}

export async function setInvitationStatus(
  invitationId: string,
  status: RsvpStatus,
  revalidate: { vipId?: string; eventId?: string }
) {
  const { supabase } = await requireAdmin();
  const updates: {
    status: RsvpStatus;
    responded_at?: string | null;
  } = { status };
  if (status === "accepted" || status === "declined" || status === "tentative") {
    updates.responded_at = new Date().toISOString();
  } else {
    updates.responded_at = null;
  }
  await supabase.from("invitations").update(updates).eq("id", invitationId);
  if (revalidate.vipId) revalidatePath(`/vips/${revalidate.vipId}`);
  if (revalidate.eventId) revalidatePath(`/events/${revalidate.eventId}`);
}

export async function setInvitationListNumber(
  invitationId: string,
  listNumber: number,
  revalidate: { vipId?: string; eventId?: string }
) {
  const { supabase } = await requireAdmin();
  const clean = Number.isFinite(listNumber) && listNumber >= 1 ? Math.floor(listNumber) : 1;
  await supabase.from("invitations").update({ list_number: clean }).eq("id", invitationId);
  if (revalidate.vipId) revalidatePath(`/vips/${revalidate.vipId}`);
  if (revalidate.eventId) revalidatePath(`/events/${revalidate.eventId}`);
}

export async function setCompanionsAttending(
  invitationId: string,
  count: number,
  revalidate: { vipId?: string; eventId?: string }
) {
  const { supabase } = await requireAdmin();
  const clean = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
  await supabase.from("invitations").update({ companions_attending: clean }).eq("id", invitationId);
  if (revalidate.vipId) revalidatePath(`/vips/${revalidate.vipId}`);
  if (revalidate.eventId) revalidatePath(`/events/${revalidate.eventId}`);
}

export async function removeInvitation(
  invitationId: string,
  revalidate: { vipId?: string; eventId?: string }
) {
  const { supabase } = await requireAdmin();
  await supabase.from("invitations").delete().eq("id", invitationId);
  if (revalidate.vipId) revalidatePath(`/vips/${revalidate.vipId}`);
  if (revalidate.eventId) revalidatePath(`/events/${revalidate.eventId}`);
}
