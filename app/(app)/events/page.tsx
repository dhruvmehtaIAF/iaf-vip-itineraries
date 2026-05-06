import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import { EVENT_MODE_LABELS, formatDate, formatTime, formatTimeRange } from "@/lib/utils";
import { isAdmin } from "@/lib/auth";
import type { EventMode } from "@/lib/types";

type SearchParams = {
  view?: string;
  month?: string; // YYYY-MM
};

type EventRow = {
  id: string;
  name: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  capacity: number | null;
  mode: EventMode;
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const admin = await isAdmin();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_date, start_time, end_time, venue, capacity, mode")
    .order("event_date")
    .order("start_time");

  // RSVP counts per event
  const { data: rsvpRows } = await supabase.from("invitations").select("event_id, status");
  const counts: Record<string, { accepted: number; total: number }> = {};
  for (const r of rsvpRows ?? []) {
    counts[r.event_id] ??= { accepted: 0, total: 0 };
    counts[r.event_id].total++;
    if (r.status === "accepted") counts[r.event_id].accepted++;
  }

  const rows = (events ?? []) as EventRow[];
  const view = params.view === "list" ? "list" : "calendar";

  return (
    <>
      <PageHeader
        eyebrow={`${rows.length} ${rows.length === 1 ? "event" : "events"}`}
        title="Events"
        subtitle="All events across IAF 2027 week. Click any event to view its guest list."
        actions={admin && <LinkButton href="/events/new">+ Add event</LinkButton>}
      />

      <ViewToggle current={view} />

      {view === "calendar" ? (
        <CalendarView rows={rows} counts={counts} monthParam={params.month} />
      ) : (
        <ListView rows={rows} counts={counts} />
      )}
    </>
  );
}

function ViewToggle({ current }: { current: "list" | "calendar" }) {
  const tabCls = (active: boolean) =>
    `inline-flex items-center h-9 px-4 text-sm border ${
      active
        ? "bg-neutral-900 text-white border-neutral-900"
        : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900"
    }`;
  return (
    <div className="mb-6 flex items-center gap-px">
      <Link href="/events?view=list" className={tabCls(current === "list")}>
        List
      </Link>
      <Link href="/events?view=calendar" className={tabCls(current === "calendar")}>
        Calendar
      </Link>
    </div>
  );
}

function ListView({
  rows,
  counts,
}: {
  rows: EventRow[];
  counts: Record<string, { accepted: number; total: number }>;
}) {
  return (
    <div className="border border-neutral-200 overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Venue</th>
            <th className="px-4 py-3 font-medium text-right">Confirmed</th>
            <th className="px-4 py-3 font-medium text-right">Capacity</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                No events yet.
              </td>
            </tr>
          ) : (
            rows.map((e) => {
              const c = counts[e.id] ?? { accepted: 0, total: 0 };
              return (
                <tr key={e.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 align-top whitespace-nowrap text-neutral-700">
                    <div>{formatDate(e.event_date)}</div>
                    <div className="text-xs text-neutral-500">
                      {formatTimeRange(e.start_time, e.end_time)}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link href={`/events/${e.id}`} className="font-medium hover:underline">
                      {e.name}
                    </Link>
                    <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-0.5">
                      {EVENT_MODE_LABELS[e.mode]}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-neutral-700">{e.venue ?? "—"}</td>
                  <td className="px-4 py-3 align-top text-right tabular-nums font-medium">
                    {c.accepted}
                    <span className="text-neutral-400"> / {c.total}</span>
                  </td>
                  <td className="px-4 py-3 align-top text-right tabular-nums text-neutral-700">
                    {e.capacity ?? "—"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Calendar — month grid
// ============================================================

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseMonthParam(s: string | undefined): { year: number; month: number } | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(s);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { year, month };
}

function CalendarView({
  rows,
  counts,
  monthParam,
}: {
  rows: EventRow[];
  counts: Record<string, { accepted: number; total: number }>;
  monthParam: string | undefined;
}) {
  // Default month: month of the first upcoming event, or earliest event, or today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = rows.find((e) => new Date(e.event_date + "T00:00:00") >= today);
  const fallbackEvent = upcoming ?? rows[0];
  const fallbackDate = fallbackEvent
    ? new Date(fallbackEvent.event_date + "T00:00:00")
    : today;

  const parsed = parseMonthParam(monthParam);
  const year = parsed?.year ?? fallbackDate.getFullYear();
  const month = parsed?.month ?? fallbackDate.getMonth();

  // Group events by YYYY-MM-DD
  const byDate = new Map<string, EventRow[]>();
  for (const e of rows) {
    const list = byDate.get(e.event_date) ?? [];
    list.push(e);
    byDate.set(e.event_date, list);
  }

  // Build the grid (Mon-first)
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // JS getDay: 0=Sun..6=Sat. Convert to Mon-first index (0=Mon..6=Sun).
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  // Total cells, padded to a multiple of 7
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstWeekday + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ date: null, day: null });
    } else {
      const yyyy = year;
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(dayNum).padStart(2, "0");
      cells.push({ date: `${yyyy}-${mm}-${dd}`, day: dayNum });
    }
  }

  // Prev / next month links
  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };
  const monthHref = (y: number, m: number) =>
    `/events?view=calendar&month=${y}-${String(m + 1).padStart(2, "0")}`;

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="iaf-display text-2xl">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex items-center gap-px">
          <Link
            href={monthHref(prev.y, prev.m)}
            className="inline-flex items-center justify-center w-9 h-9 border border-neutral-200 hover:border-neutral-900 text-sm"
            aria-label="Previous month"
          >
            ‹
          </Link>
          <Link
            href={monthHref(today.getFullYear(), today.getMonth())}
            className="inline-flex items-center justify-center h-9 px-3 border border-neutral-200 hover:border-neutral-900 text-xs uppercase tracking-widest text-neutral-700"
          >
            Today
          </Link>
          <Link
            href={monthHref(next.y, next.m)}
            className="inline-flex items-center justify-center w-9 h-9 border border-neutral-200 hover:border-neutral-900 text-sm"
            aria-label="Next month"
          >
            ›
          </Link>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-px bg-neutral-200 border border-neutral-200 border-b-0">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-white px-3 py-2 text-[11px] uppercase tracking-widest text-neutral-500"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-neutral-200 border border-neutral-200">
        {cells.map((cell, i) => {
          const isToday =
            cell.date ===
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
              today.getDate()
            ).padStart(2, "0")}`;
          const dayEvents = cell.date ? byDate.get(cell.date) ?? [] : [];
          return (
            <div
              key={i}
              className={`bg-white min-h-28 p-2 ${
                cell.day === null ? "bg-neutral-50" : ""
              }`}
            >
              {cell.day !== null && (
                <div className="flex items-baseline justify-between mb-1.5">
                  <span
                    className={`text-xs tabular-nums ${
                      isToday
                        ? "inline-flex items-center justify-center w-6 h-6 -ml-1 bg-neutral-900 text-white font-semibold"
                        : "text-neutral-700"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dayEvents.length > 1 && (
                    <span className="text-[10px] text-neutral-400 tabular-nums">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-1">
                {dayEvents.map((e) => {
                  const c = counts[e.id] ?? { accepted: 0, total: 0 };
                  // Tint accent: green if any confirmed, neutral otherwise
                  const accent =
                    c.accepted > 0
                      ? "border-l-2 border-emerald-700"
                      : "border-l-2 border-neutral-400";
                  return (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      className={`block px-2 py-1 text-xs bg-neutral-50 hover:bg-neutral-100 ${accent}`}
                      title={e.name}
                    >
                      {e.start_time && (
                        <span className="text-[10px] text-neutral-500 tabular-nums mr-1">
                          {formatTime(e.start_time)}
                        </span>
                      )}
                      <span className="font-medium text-neutral-900 truncate inline-block max-w-full align-middle">
                        {e.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        Click any event to open its guest list. Green bar = at least one confirmed RSVP.
      </p>
    </div>
  );
}
