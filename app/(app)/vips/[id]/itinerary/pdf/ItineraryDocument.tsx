import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatDate, formatTimeRange, CATEGORY_LABELS } from "@/lib/utils";
import type { VipCategory } from "@/lib/types";

// Note: keep fonts built-in (Helvetica) to avoid fetching external fonts at render time.
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0a0a0a",
  },
  brandBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: 2,
    borderBottomColor: "#0a0a0a",
    paddingBottom: 10,
    marginBottom: 28,
  },
  brand: {
    fontFamily: "Helvetica",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 1.5,
  },
  eyebrow: {
    fontSize: 7,
    letterSpacing: 2,
    color: "#737373",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Helvetica",
    fontWeight: 700,
    fontSize: 36,
    letterSpacing: -1,
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 1,
  },
  subtitle: {
    fontSize: 11,
    color: "#525252",
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: "Helvetica",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: -0.3,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 18,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  metaCell: {
    width: "45%",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 7,
    letterSpacing: 1.5,
    color: "#737373",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 11,
  },
  eventRow: {
    flexDirection: "row",
    gap: 14,
    borderBottom: 0.5,
    borderBottomColor: "#d4d4d4",
    paddingVertical: 10,
  },
  eventDate: {
    width: 100,
  },
  eventBody: {
    flex: 1,
  },
  eventName: {
    fontFamily: "Helvetica",
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 3,
  },
  eventMeta: {
    fontSize: 9,
    color: "#525252",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#737373",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: 0.5,
    borderTopColor: "#d4d4d4",
    paddingTop: 8,
  },
  empty: {
    fontSize: 11,
    color: "#737373",
    fontStyle: "italic",
    paddingVertical: 12,
  },
});

export type ItineraryEvent = {
  id: string;
  name: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  dress_code: string | null;
  notes: string | null;
  companions_attending: number;
};

export type ItineraryProps = {
  vip: {
    full_name: string;
    country: string | null;
    category: VipCategory;
    email: string | null;
    phone: string | null;
    hotel: string | null;
    flight_arrival: string | null;
    flight_departure: string | null;
    dietary: string | null;
  };
  host: { full_name: string | null; email: string } | null;
  events: ItineraryEvent[];
  companions: { full_name: string }[];
  generatedAt: string;
};

export default function ItineraryDocument({ vip, host, events, companions, generatedAt }: ItineraryProps) {
  return (
    <Document title={`${vip.full_name} — IAF 2027 Itinerary`}>
      <Page size="A4" style={s.page} wrap>
        <View style={s.brandBar}>
          <Text style={s.brand}>INDIA ART FAIR</Text>
          <View>
            <Text style={s.eyebrow}>VIP Itinerary</Text>
            <Text style={s.eyebrow}>IAF 2027</Text>
          </View>
        </View>

        <Text style={s.eyebrow}>{CATEGORY_LABELS[vip.category] ?? vip.category}</Text>
        <Text style={s.title}>{vip.full_name}</Text>
        <Text style={s.subtitle}>{vip.country ?? ""}</Text>

        <View style={s.metaGrid}>
          {vip.email && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Email</Text>
              <Text style={s.metaValue}>{vip.email}</Text>
            </View>
          )}
          {vip.phone && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Phone</Text>
              <Text style={s.metaValue}>{vip.phone}</Text>
            </View>
          )}
          {vip.hotel && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Hotel</Text>
              <Text style={s.metaValue}>{vip.hotel}</Text>
            </View>
          )}
          {vip.dietary && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Dietary</Text>
              <Text style={s.metaValue}>{vip.dietary}</Text>
            </View>
          )}
          {vip.flight_arrival && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Arrival</Text>
              <Text style={s.metaValue}>{vip.flight_arrival}</Text>
            </View>
          )}
          {vip.flight_departure && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Departure</Text>
              <Text style={s.metaValue}>{vip.flight_departure}</Text>
            </View>
          )}
          {host && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Assigned Host</Text>
              <Text style={s.metaValue}>
                {host.full_name ?? "—"}
                {"\n"}
                {host.email}
              </Text>
            </View>
          )}
          {companions.length > 0 && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Companions</Text>
              <Text style={s.metaValue}>
                {companions.map((c) => c.full_name).join(", ")}
              </Text>
            </View>
          )}
        </View>

        <Text style={s.sectionTitle}>Schedule</Text>

        {events.length === 0 ? (
          <Text style={s.empty}>No confirmed events.</Text>
        ) : (
          events.map((e) => (
            <View key={e.id} style={s.eventRow} wrap={false}>
              <View style={s.eventDate}>
                <Text style={s.eventMeta}>{formatDate(e.event_date)}</Text>
                <Text style={{ ...s.eventName, fontSize: 11 }}>
                  {formatTimeRange(e.start_time, e.end_time) || "All day"}
                </Text>
              </View>
              <View style={s.eventBody}>
                <Text style={s.eventName}>{e.name}</Text>
                {e.venue && <Text style={s.eventMeta}>Venue: {e.venue}</Text>}
                {e.dress_code && <Text style={s.eventMeta}>Dress: {e.dress_code}</Text>}
                {e.companions_attending > 0 && (
                  <Text style={s.eventMeta}>
                    Accompanied by {e.companions_attending} companion{e.companions_attending === 1 ? "" : "s"}
                  </Text>
                )}
                {e.notes && <Text style={s.eventMeta}>{e.notes}</Text>}
              </View>
            </View>
          ))
        )}

        <View style={s.footer} fixed>
          <Text>India Art Fair · Internal</Text>
          <Text>Generated {generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}
