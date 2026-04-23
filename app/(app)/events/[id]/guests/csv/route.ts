import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, RSVP_LABELS } from "@/lib/utils";
import type { RsvpStatus, VipCategory } from "@/lib/types";

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
        "status, companions_attending, notes, vip:vips(full_name, email, phone, country, category, dietary, hotel)"
      )
      .eq("event_id", id),
  ]);

  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  type Row = {
    status: RsvpStatus;
    companions_attending: number;
    notes: string | null;
    vip: {
      full_name: string;
      email: string | null;
      phone: string | null;
      country: string | null;
      category: VipCategory;
      dietary: string | null;
      hotel: string | null;
    } | null;
  };
  const rows = (invitations ?? []) as unknown as Row[];
  rows.sort((a, b) => (a.vip?.full_name ?? "").localeCompare(b.vip?.full_name ?? ""));

  const headers = [
    "Name",
    "Status",
    "Companions",
    "Category",
    "Country",
    "Email",
    "Phone",
    "Dietary",
    "Hotel",
    "Notes",
  ];
  const lines = [headers.map(csvEscape).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.vip?.full_name,
        RSVP_LABELS[r.status] ?? r.status,
        r.companions_attending,
        r.vip ? CATEGORY_LABELS[r.vip.category] : "",
        r.vip?.country,
        r.vip?.email,
        r.vip?.phone,
        r.vip?.dietary,
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
