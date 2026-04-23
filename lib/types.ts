export type UserRole = "admin" | "viewer";

export type VipCategory =
  | "collector"
  | "artist"
  | "press"
  | "sponsor"
  | "curator"
  | "gallerist"
  | "institution"
  | "other";

export type RsvpStatus =
  | "not_sent"
  | "invited"
  | "accepted"
  | "declined"
  | "tentative"
  | "waitlist";

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
  email: string | null;
  phone: string | null;
  country: string | null;
  category: VipCategory;
  dietary: string | null;
  hotel: string | null;
  flight_arrival: string | null;
  flight_departure: string | null;
  assigned_host_id: string | null;
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
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  dress_code: string | null;
  capacity: number | null;
  invite_only: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Invitation = {
  id: string;
  vip_id: string;
  event_id: string;
  status: RsvpStatus;
  companions_attending: number;
  responded_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
