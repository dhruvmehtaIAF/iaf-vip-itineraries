import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { VipCategory, VipCountry, VipType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(time?: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

export function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  if (start && end) return `${formatTime(start)} – ${formatTime(end)}`;
  return formatTime(start || end);
}

/** "2027-02-04" + optional "09:15" → "Thu, 04 Feb 2027 · 09:15" */
export function formatDateTime(date?: string | null, time?: string | null) {
  if (!date) return "";
  const d = formatDate(date);
  const t = formatTime(time);
  return t ? `${d} · ${t}` : d;
}

export function formatAddedYear(year?: number | null) {
  if (!year) return "";
  return `IAF ${year}`;
}

export const RSVP_LABELS: Record<string, string> = {
  not_sent: "Not sent",
  invited: "Invited",
  accepted: "Accepted",
  declined: "Declined",
  tentative: "Tentative",
  waitlist: "Waitlist",
};

export const RSVP_CLASSES: Record<string, string> = {
  not_sent: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  invited: "bg-blue-50 text-blue-800 ring-blue-200",
  accepted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  declined: "bg-rose-50 text-rose-800 ring-rose-200",
  tentative: "bg-amber-50 text-amber-800 ring-amber-200",
  waitlist: "bg-violet-50 text-violet-800 ring-violet-200",
};

/** VIP work-type (what they do) */
export const VIP_TYPE_LABELS: Record<VipType, string> = {
  collector: "Collector",
  exhibitor: "Exhibitor",
  curator: "Curator",
  press: "Press",
  sponsor: "Sponsor",
  artist: "Artist",
  institution: "Institution",
  other: "Other",
};

/** VIP tier (which IAF list) */
export const VIP_CATEGORY_LABELS: Record<VipCategory, string> = {
  patrons: "Patrons",
  level_1: "Level 1",
  level_2: "Level 2",
  level_3: "Level 3",
  level_4: "Level 4",
  young_collector: "Young Collector",
};

export const VIP_COUNTRY_LABELS: Record<VipCountry, string> = {
  india: "India",
  international: "International",
};

/**
 * Back-compat alias — keeps any imports of CATEGORY_LABELS working.
 * After this change, `vip.category` is the tier, so this maps tier → label.
 */
export const CATEGORY_LABELS: Record<string, string> = VIP_CATEGORY_LABELS;
