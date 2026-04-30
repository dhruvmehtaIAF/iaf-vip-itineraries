import { createClient } from "@/lib/supabase/server";
import {
  RSVP_LABELS,
  VIP_CATEGORY_LABELS,
  VIP_COUNTRY_LABELS,
  VIP_TYPE_LABELS,
  formatAddedYear,
} from "@/lib/utils";
import type { RsvpStatus, VipCategory, VipCountry, VipType } from "@/lib/types";

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const [{ data: event }, { data: invitations }] = await Promise.all([
    supabase.from("events").select("id, name, event_date").eq("id", id).single(),
    supabase
      .from("invitations")
      .select(
        "status, companions_attending, list_number, notes, vip:vips(full_name, designation, email, phone, country, type, category, added_year, hotel)"
      )
      .eq("event_id", id),
  ]);

  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  type Row = {
    status: RsvpStatus;
    companions_attending: number;
    list_number: number;
    notes: string | null;
    vip: {
      full_name: string;
      designation: string | null;
      email: string | null;
      phone: string | null;
      country: VipCountry | null;
      type: VipType;
      category: VipCategory;
      added_year: number | null;
      hotel: string | null;
    } | null;
  };
  const rows = (invitations ?? []) as unknown as Row[];
  rows.sort((a, b) => {
    if (a.list_number !== b.list_number) return a.list_number - b.list_number;
    return (a.vip?.full_name ?? "").localeCompare(b.vip?.full_name ?? "");
  });

  const headers = [
    "List",
    "Name",
    "Designation",
    "Status",
    "Companions",
    "Type",
    "Category",
    "Country",
    "Added",
    "Email",
    "Phone",
    "Hotel",
    "Notes",
  ];
  const lines = [headers.map(csvEscape).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.list_number,
        r.vip?.full_name,
        r.vip?.designation,
        RSVP_LABELS[r.status] ?? r.status,
        r.companions_attending,
        r.vip ? VIP_TYPE_LABELS[r.vip.type] : "",
        r.vip ? VIP_CATEGORY_LABELS[r.vip.category] : "",
        r.vip?.country ? VIP_COUNTRY_LABELS[r.vip.country] : "",
        r.vip?.added_year ? formatAddedYear(r.vip.added_year) : "",
        r.vip?.email,
        r.vip?.phone,
        r.vip?.hotel,
        r.notes,
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  const body = lines.join("\r\n");
  const safeName = event.name.replace(/[^a-z0-9-]+/gi, "_").slice(0, 80);
  const filename = `${event.event_date}_${safeName}_guest_list.csv`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
