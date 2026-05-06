import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
} from "@react-pdf/renderer";
import {
  formatDate,
  formatDateTime,
  formatTimeRange,
  googleCalendarUrl,
} from "@/lib/utils";

// Built-in @react-pdf fonts — Times-Roman / Times-Bold for the elegant
// editorial feel; Helvetica for small-caps labels. No external fetches.
const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: "#0a0a0a",
    lineHeight: 1.4,
  },
  brandBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: 0.75,
    borderBottomColor: "#0a0a0a",
    paddingBottom: 14,
    marginBottom: 36,
  },
  logo: {
    width: 130,
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
  linkRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 4,
  },
  smallLink: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#525252",
    textDecoration: "underline",
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
  notes: string | null;
  companions_attending: number;
};

export type ItineraryProps = {
  vip: {
    full_name: string;
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
  logo: Buffer | null;
};

export default function ItineraryDocument({ vip, events, companions, logo }: ItineraryProps) {
  const arrival = vip.arrival_date ? formatDateTime(vip.arrival_date, vip.arrival_time) : null;
  const departure = vip.departure_date
    ? formatDateTime(vip.departure_date, vip.departure_time)
    : null;

  return (
    <Document title={`${vip.full_name} — IAF 2027 Itinerary`}>
      <Page size="A4" style={s.page} wrap>
        <View style={s.brandBar}>
          {logo ? (
            <Image src={logo} style={s.logo} />
          ) : (
            <Text style={s.brand}>INDIA ART FAIR</Text>
          )}
          <View style={s.rightBlock}>
            <Text style={s.eyebrow}>VIP Itinerary</Text>
            <Text style={s.eyebrow}>IAF 2027</Text>
          </View>
        </View>

        <Text style={s.title}>{vip.full_name}</Text>

        <Text style={s.sectionTitle}>Information</Text>
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
                {e.companions_attending > 0 && (
                  <Text style={s.eventMeta}>
                    Accompanied by {e.companions_attending} companion
                    {e.companions_attending === 1 ? "" : "s"}
                  </Text>
                )}
                {e.notes && <Text style={s.eventMeta}>{e.notes}</Text>}
                <View style={s.linkRow}>
                  <Link src={googleCalendarUrl(e)} style={s.smallLink}>
                    Add to calendar
                  </Link>
                  {e.map_url && (
                    <Link src={e.map_url} style={s.smallLink}>
                      View on map
                    </Link>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}
