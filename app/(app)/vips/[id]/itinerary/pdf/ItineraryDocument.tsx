import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import {
  formatDate,
  formatDateTime,
  formatTimeRange,
  VIP_COUNTRY_LABELS,
} from "@/lib/utils";
import type { VipCountry } from "@/lib/types";

// Built-in @react-pdf fonts — Times-Roman / Times-Bold for the elegant
// editorial feel; Helvetica for small-caps labels. No external fetches.
const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: "#0a0a0a",
    lineHeight: 1.4,
  },
  brandBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: 0.75,
    borderBottomColor: "#0a0a0a",
    paddingBottom: 14,
    marginBottom: 36,
  },
  brand: {
    fontFamily: "Times-Bold",
    fontSize: 16,
    letterSpacing: 4,
  },
  eyebrow: {
    fontFamily: "Helvetica",
    fontSize: 7,
    letterSpacing: 2.5,
    color: "#525252",
    textTransform: "uppercase",
  },
  rightBlock: {
    alignItems: "flex-end",
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 36,
    letterSpacing: -0.4,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 1.05,
  },
  subtitle: {
    fontFamily: "Times-Italic",
    fontSize: 12,
    color: "#404040",
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: "Helvetica",
    fontSize: 8,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#525252",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionRule: {
    borderBottom: 0.5,
    borderBottomColor: "#a3a3a3",
    marginBottom: 14,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 28,
  },
  metaCell: {
    width: "50%",
    marginBottom: 12,
    paddingRight: 12,
  },
  metaLabel: {
    fontFamily: "Helvetica",
    fontSize: 7,
    letterSpacing: 2,
    color: "#737373",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  metaValue: {
    fontFamily: "Times-Roman",
    fontSize: 11,
  },
  eventRow: {
    flexDirection: "row",
    gap: 18,
    paddingVertical: 14,
    borderBottom: 0.5,
    borderBottomColor: "#d4d4d4",
  },
  eventDate: {
    width: 110,
  },
  eventDateText: {
    fontFamily: "Helvetica",
    fontSize: 7,
    letterSpacing: 2,
    color: "#525252",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  eventTimeText: {
    fontFamily: "Times-Bold",
    fontSize: 13,
  },
  eventBody: {
    flex: 1,
  },
  eventName: {
    fontFamily: "Times-Bold",
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  eventDescription: {
    fontFamily: "Times-Italic",
    fontSize: 10.5,
    color: "#404040",
    marginBottom: 6,
    lineHeight: 1.4,
  },
  eventMeta: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: "#404040",
    marginBottom: 1.5,
  },
  mapLink: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#525252",
    textDecoration: "underline",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#737373",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: 0.5,
    borderTopColor: "#d4d4d4",
    paddingTop: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  empty: {
    fontFamily: "Times-Italic",
    fontSize: 11,
    color: "#737373",
    paddingVertical: 12,
  },
});

export type ItineraryEvent = {
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
  companions_attending: number;
};

export type ItineraryProps = {
  vip: {
    full_name: string;
    country: VipCountry | null;
    email: string | null;
    phone: string | null;
    hotel: string | null;
    arrival_date: string | null;
    arrival_time: string | null;
    departure_date: string | null;
    departure_time: string | null;
  };
  events: ItineraryEvent[];
  companions: { full_name: string }[];
  generatedAt: string;
};

export default function ItineraryDocument({ vip, events, companions, generatedAt }: ItineraryProps) {
  const arrival = vip.arrival_date ? formatDateTime(vip.arrival_date, vip.arrival_time) : null;
  const departure = vip.departure_date
    ? formatDateTime(vip.departure_date, vip.departure_time)
    : null;
  const country = vip.country ? VIP_COUNTRY_LABELS[vip.country] : null;

  return (
    <Document title={`${vip.full_name} — IAF 2027 Itinerary`}>
      <Page size="A4" style={s.page} wrap>
        <View style={s.brandBar}>
          <Text style={s.brand}>INDIA ART FAIR</Text>
          <View style={s.rightBlock}>
            <Text style={s.eyebrow}>VIP Itinerary</Text>
            <Text style={s.eyebrow}>IAF 2027</Text>
          </View>
        </View>

        <Text style={s.title}>{vip.full_name}</Text>
        {country && <Text style={s.subtitle}>{country}</Text>}

        <Text style={s.sectionTitle}>Profile</Text>
        <View style={s.sectionRule} />
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
          {arrival && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Arrival</Text>
              <Text style={s.metaValue}>{arrival}</Text>
            </View>
          )}
          {departure && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Departure</Text>
              <Text style={s.metaValue}>{departure}</Text>
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
        <View style={s.sectionRule} />

        {events.length === 0 ? (
          <Text style={s.empty}>No confirmed events.</Text>
        ) : (
          events.map((e) => (
            <View key={e.id} style={s.eventRow} wrap={false}>
              <View style={s.eventDate}>
                <Text style={s.eventDateText}>{formatDate(e.event_date)}</Text>
                <Text style={s.eventTimeText}>
                  {formatTimeRange(e.start_time, e.end_time) || "All day"}
                </Text>
              </View>
              <View style={s.eventBody}>
                <Text style={s.eventName}>{e.name}</Text>
                {e.description && <Text style={s.eventDescription}>{e.description}</Text>}
                {e.venue && <Text style={s.eventMeta}>{e.venue}</Text>}
                {e.map_url && (
                  <Link src={e.map_url} style={s.mapLink}>
                    View on map
                  </Link>
                )}
                {e.dress_code && <Text style={s.eventMeta}>Dress: {e.dress_code}</Text>}
                {e.companions_attending > 0 && (
                  <Text style={s.eventMeta}>
                    Accompanied by {e.companions_attending} companion
                    {e.companions_attending === 1 ? "" : "s"}
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
