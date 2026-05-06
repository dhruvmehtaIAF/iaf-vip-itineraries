"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { EventMode } from "@/lib/types";

const EVENT_MODES: EventMode[] = ["invite", "rsvp"];

function parseString(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s.length ? s : null;
}

function parseInt(v: FormDataEntryValue | null): number | null {
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.floor(n) : null;
}

function parseMode(v: FormDataEntryValue | null): EventMode {
  const s = (v ?? "invite").toString();
  return (EVENT_MODES as string[]).includes(s) ? (s as EventMode) : "invite";
}

export type EventFormState = { error?: string } | undefined;

function extractPayload(formData: FormData) {
  return {
    name: parseString(formData.get("name")),
    description: parseString(formData.get("description")),
    event_date: parseString(formData.get("event_date")),
    start_time: parseString(formData.get("start_time")),
    end_time: parseString(formData.get("end_time")),
    venue: parseString(formData.get("venue")),
    map_url: parseString(formData.get("map_url")),
    capacity: parseInt(formData.get("capacity")),
    mode: parseMode(formData.get("mode")),
    notes: parseString(formData.get("notes")),
  };
}

export async function createEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const { supabase } = await requireAdmin();
  const p = extractPayload(formData);
  if (!p.name) return { error: "Name is required." };
  if (!p.event_date) return { error: "Date is required." };

  const { data, error } = await supabase
    .from("events")
    .insert({ ...p, name: p.name, event_date: p.event_date })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/events");
  redirect(`/events/${data.id}`);
}

export async function updateEvent(id: string, _prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const { supabase } = await requireAdmin();
  const p = extractPayload(formData);
  if (!p.name) return { error: "Name is required." };
  if (!p.event_date) return { error: "Date is required." };

  const { error } = await supabase
    .from("events")
    .update({ ...p, name: p.name, event_date: p.event_date })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function deleteEvent(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/events");
  redirect("/events");
}
