export type UserRole = "admin" | "viewer";

// What kind of person the VIP is — their professional role.
export type VipType =
  | "collector"
  | "exhibitor"
  | "curator"
  | "press"
  | "sponsor"
  | "artist"
  | "institution"
  | "other";

// Which IAF VIP tier they belong to.
export type VipCategory =
  | "patrons"
  | "level_1"
  | "level_2"
  | "level_3"
  | "level_4"
  | "young_collector";

export type VipCountry = "india" | "international";

export type RsvpStatus =
  | "not_sent"
  | "invited"
  | "accepted"
  | "declined"
  | "tentative"
  | "waitlist";

export type EventMode = "invite" | "rsvp";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type Vip = {
  id: string;
  full_name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  country: VipCountry | null;
  type: VipType;
  category: VipCategory;
  added_year: number | null;
  one_time: boolean;
  hotel: string | null;
  arrival_date: string | null;
  arrival_time: string | null;
  departure_date: string | null;
  departure_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Companion = {
  id: string;
  vip_id: string;
  full_name: string;
  notes: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  map_url: string | null;
  capacity: number | null;
  mode: EventMode;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Invitation = {
  id: string;
  vip_id: string;
  event_id: string;
  list_number: number;
  status: RsvpStatus;
  companions_attending: number;
  responded_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
