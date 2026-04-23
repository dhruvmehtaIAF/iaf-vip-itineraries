import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export const CATEGORY_LABELS: Record<string, string> = {
  collector: "Collector",
  artist: "Artist",
  press: "Press",
  sponsor: "Sponsor",
  curator: "Curator",
  gallerist: "Gallerist",
  institution: "Institution",
  other: "Other",
};
