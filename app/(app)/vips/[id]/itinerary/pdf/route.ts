import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ItineraryDocument, {
  type ItineraryEvent,
} from "./ItineraryDocument";
import { createElement } from "react";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const [vipRes, companionsRes, invitationsRes] = await Promise.all([
    supabase.from("vips").select("*").eq("id", id).single(),
    supabase.from("companions").select("full_name").eq("vip_id", id).order("created_at"),
    supabase
      .from("invitations")
      .select(
        "status, companions_attending, event:events(id,name,description,event_date,start_time,end_time,venue,map_url,dress_code,notes)"
      )
      .eq("vip_id", id)
      .eq("status", "accepted"),
  ]);

  const vip = vipRes.data;
  const companions = companionsRes.data;
  const invitations = invitationsRes.data;

  if (!vip) {
    console.error("[pdf route] vip lookup failed", {
      id,
      vipError: vipRes.error,
      invitationsError: invitationsRes.error,
      companionsError: companionsRes.error,
    });
    return new Response(
      `VIP not found.\nid: ${id}\nerror: ${JSON.stringify(vipRes.error)}`,
      { status: 404, headers: { "Content-Type": "text/plain" } }
    );
  }

  type InvRow = {
    status: string;
    companions_attending: number;
    event: {
      id: string;
      name: string;
      description: string | null;
      event_date: string;
      start_time: string | null;
      end_time: string | null;
      venue: string | null;
      map_url: string | null;
      dress_code: string | null;
      notes: string | null;
    } | null;
  };

  const events: ItineraryEvent[] = ((invitations ?? []) as unknown as InvRow[])
    .filter((i): i is InvRow & { event: NonNullable<InvRow["event"]> } => !!i.event)
    .map((i) => ({
      id: i.event.id,
      name: i.event.name,
      description: i.event.description,
      event_date: i.event.event_date,
      start_time: i.event.start_time,
      end_time: i.event.end_time,
      venue: i.event.venue,
      map_url: i.event.map_url,
      dress_code: i.event.dress_code,
      notes: i.event.notes,
      companions_attending: i.companions_attending,
    }))
    .sort((a, b) =>
      (a.event_date + (a.start_time ?? "")).localeCompare(b.event_date + (b.start_time ?? ""))
    );

  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const element = createElement(ItineraryDocument, {
    vip,
    events,
    companions: companions ?? [],
    generatedAt,
  });

  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  const filename = `${vip.full_name.replace(/[^a-z0-9-]+/gi, "_")}_IAF2027_itinerary.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
