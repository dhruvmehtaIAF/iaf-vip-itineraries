-- IAF VIP Itineraries — sample data
-- Run AFTER schema.sql. Safe to re-run: wipes vips/events/invitations first (keeps profiles/auth).

truncate table invitations, companions, vips, events restart identity cascade;

-- ============================================================
-- Events (IAF 2027: Feb 4–7, 2027 — sample schedule)
-- ============================================================
insert into events (name, event_date, start_time, end_time, venue, dress_code, capacity, invite_only, notes) values
  ('VIP Preview Day',               '2027-02-04', '11:00', '17:00', 'NSIC Exhibition Grounds, Okhla',       'Smart casual',           400,  true,  'Early access to galleries before public open.'),
  ('Opening Night Gala',            '2027-02-04', '19:30', '23:00', 'The Taj Mahal Hotel, Mansingh Road',   'Cocktail attire',        250,  true,  'Seated dinner. Speeches from Jaya Asokan at 20:30.'),
  ('Collectors Breakfast',          '2027-02-05', '08:30', '10:00', 'The Oberoi, Lodhi Road',               'Smart casual',           60,   true,  'Hosted by Jaya Asokan.'),
  ('Gallery Walk — Central Delhi',  '2027-02-05', '15:00', '18:00', 'Shrine Empire, Nature Morte, Vadehra', 'Casual',                 30,   true,  'Three galleries, curator-led.'),
  ('BMW Art Dinner',                '2027-02-05', '20:00', '23:30', 'Bikaner House',                        'Black tie',              120,  true,  'Partner event. Seating plan locked 48h prior.'),
  ('Artist Talks — Women Collectors','2027-02-06', '11:00', '12:30', 'Auditorium, NSIC',                    'Casual',                 150,  false, 'Open to all VIPs.'),
  ('Studio Visit — Subodh Gupta',   '2027-02-06', '14:00', '16:00', 'Gurgaon studio',                       'Casual',                 20,   true,  'Small group. Transport arranged.'),
  ('Institutional Dinner',          '2027-02-06', '20:00', '23:00', 'Bikaner House',                        'Cocktail attire',        80,   true,  'Museum directors & patrons only.'),
  ('Closing Brunch',                '2027-02-07', '11:00', '14:00', 'The Imperial, Janpath',                'Smart casual',           150,  true,  'Farewell event.'),
  ('Press Roundtable',              '2027-02-03', '16:00', '17:30', 'NSIC Media Lounge',                    'Business casual',        40,   true,  'Press only — day before opening.');

-- ============================================================
-- VIPs (sample roster — mix of categories + countries)
-- ============================================================
insert into vips (full_name, email, phone, country, category, dietary, hotel, flight_arrival, flight_departure, notes) values
  ('Kiran Nadar',           'kiran@example.com',      '+91 98100 11111', 'India',          'collector',    'Vegetarian',        'The Oberoi, Delhi',       'Local',                            'Local',                            'KNMA founder. Always accompanied by curator.'),
  ('Uli Sigg',              'uli@example.com',        '+41 44 000 0001', 'Switzerland',    'collector',    null,                'The Imperial',            'LX 146 arr 03 Feb 23:50',          'LX 147 dep 08 Feb 14:20',          'Major Chinese contemporary collection.'),
  ('Patrizia Sandretto',    'patrizia@example.com',   '+39 011 000 001', 'Italy',          'institution',  'Gluten-free',       'The Oberoi, Delhi',       'AZ 770 arr 03 Feb 20:10',          'AZ 771 dep 08 Feb 10:00',          'Fondazione Sandretto Re Rebaudengo.'),
  ('Hans Ulrich Obrist',    'huo@example.com',        '+44 20 0000 0001','United Kingdom', 'curator',      null,                'The Imperial',            'BA 143 arr 03 Feb 06:30',          'BA 142 dep 08 Feb 13:00',          'Serpentine Galleries. Wants studio visits.'),
  ('Subodh Gupta',          'subodh@example.com',     '+91 98110 22222', 'India',          'artist',       null,                'Local',                   'Local',                            'Local',                            'Hosting studio visit on Feb 6.'),
  ('Bharti Kher',           'bharti@example.com',     '+91 98110 33333', 'India',          'artist',       'Vegetarian',        'Local',                   'Local',                            'Local',                            null),
  ('Thaddaeus Ropac',       'thaddaeus@example.com',  '+43 1 000 0001',  'Austria',        'gallerist',    null,                'The Taj Mahal Hotel',     'OS 025 arr 03 Feb 21:00',          'OS 026 dep 08 Feb 10:30',          'Interested in Indian moderns.'),
  ('David Zwirner',         'david@example.com',      '+1 212 000 0001', 'United States',  'gallerist',    null,                'The Oberoi, Delhi',       'AI 102 arr 03 Feb 09:15',          'AI 101 dep 08 Feb 02:15',          null),
  ('Nicholas Logsdail',     'nick@example.com',       '+44 20 0000 0002','United Kingdom', 'gallerist',    null,                'The Imperial',            'BA 143 arr 03 Feb 06:30',          'BA 142 dep 08 Feb 13:00',          'Lisson Gallery.'),
  ('Anita Dube',            'anita@example.com',      '+91 98110 44444', 'India',          'artist',       'Vegan',             'Local',                   'Local',                            'Local',                            null),
  ('Roobina Karode',        'roobina@example.com',    '+91 98110 55555', 'India',          'curator',      'Vegetarian',        'Local',                   'Local',                            'Local',                            'KNMA Director.'),
  ('Maria Balshaw',         'maria@example.com',      '+44 20 0000 0003','United Kingdom', 'institution',  null,                'The Oberoi, Delhi',       'BA 143 arr 03 Feb 06:30',          'BA 142 dep 08 Feb 13:00',          'Director, Tate.'),
  ('Glenn Lowry',           'glenn@example.com',      '+1 212 000 0002', 'United States',  'institution',  null,                'The Taj Mahal Hotel',     'AI 102 arr 03 Feb 09:15',          'AI 101 dep 08 Feb 02:15',          'Director, MoMA.'),
  ('Suhanya Raffel',        'suhanya@example.com',    '+852 3000 0001',  'Hong Kong',      'institution',  null,                'The Oberoi, Delhi',       'CX 693 arr 03 Feb 21:45',          'CX 694 dep 08 Feb 00:30',          'Director, M+.'),
  ('Alia Al-Senussi',       'alia@example.com',       '+44 20 0000 0004','United Kingdom', 'collector',    'Halal',             'The Imperial',            'BA 143 arr 03 Feb 06:30',          'BA 142 dep 08 Feb 13:00',          null),
  ('Anna Schwartz',         'anna@example.com',       '+61 3 0000 0001', 'Australia',      'gallerist',    null,                'The Oberoi, Delhi',       'QF 67 arr 03 Feb 19:30',           'QF 68 dep 08 Feb 23:00',           null),
  ('Rohit Bal',             'rohit@example.com',      '+91 98110 66666', 'India',          'other',        null,                'Local',                   'Local',                            'Local',                            'Designer. VIP guest of sponsor.'),
  ('Sree Banerjee Goswami', 'sree@example.com',       '+91 98110 77777', 'India',          'gallerist',    'Vegetarian',        'Local',                   'Local',                            'Local',                            'Gallery Espace.'),
  ('Feroze Gujral',         'feroze@example.com',     '+91 98110 88888', 'India',          'collector',    null,                'Local',                   'Local',                            'Local',                            'Outset India.'),
  ('Adam Szymczyk',         'adam@example.com',       '+41 61 000 0001', 'Switzerland',    'curator',      null,                'The Imperial',            'LX 146 arr 03 Feb 23:50',          'LX 147 dep 08 Feb 14:20',          null),
  ('Shanay Jhaveri',        'shanay@example.com',     '+1 212 000 0003', 'United States',  'curator',      null,                'The Oberoi, Delhi',       'AI 102 arr 03 Feb 09:15',          'AI 101 dep 08 Feb 02:15',          'Barbican Head of Visual Arts.'),
  ('Vogue India',           'press-vogue@example.com',null,              'India',          'press',        null,                'Local',                   'Local',                            'Local',                            'Press pass x 2.'),
  ('The Art Newspaper',     'press-tan@example.com',  null,              'United Kingdom', 'press',        null,                'The Imperial',            'BA 143 arr 03 Feb 06:30',          'BA 142 dep 08 Feb 13:00',          'Kabir Jhala + photographer.'),
  ('BMW India',             'bmw@example.com',        '+91 124 000 0001','India',          'sponsor',      null,                'Local',                   'Local',                            'Local',                            'Partner. 10 guest slots at their dinner.'),
  ('Teiger Foundation',     'teiger@example.com',     '+1 212 000 0004', 'United States',  'sponsor',      null,                'The Oberoi, Delhi',       'AI 102 arr 03 Feb 09:15',          'AI 101 dep 08 Feb 02:15',          null);

-- Companions
insert into companions (vip_id, full_name, notes)
select id, 'Shiv Nadar',   'Spouse'      from vips where full_name = 'Kiran Nadar'
union all
select id, 'Rita Sigg',    'Spouse'      from vips where full_name = 'Uli Sigg'
union all
select id, 'Assistant TBC',null          from vips where full_name = 'Hans Ulrich Obrist'
union all
select id, 'Photographer', 'Press +1'    from vips where full_name = 'The Art Newspaper';

-- ============================================================
-- Invitations — spread across statuses so the UI shows variety
-- ============================================================
-- Helper CTE approach via separate inserts for readability:
with e as (select id, name from events),
     v as (select id, full_name from vips)
insert into invitations (vip_id, event_id, status, companions_attending, notes)
select v.id, e.id,
  case
    when v.full_name in ('Kiran Nadar','Uli Sigg','Hans Ulrich Obrist','Maria Balshaw','Glenn Lowry','Suhanya Raffel') then 'accepted'::rsvp_status
    when v.full_name in ('Patrizia Sandretto','Thaddaeus Ropac','David Zwirner','Alia Al-Senussi') then 'accepted'::rsvp_status
    when v.full_name in ('Adam Szymczyk','Shanay Jhaveri') then 'tentative'::rsvp_status
    when v.full_name in ('Nicholas Logsdail') then 'declined'::rsvp_status
    when v.full_name in ('Anna Schwartz') then 'waitlist'::rsvp_status
    else 'invited'::rsvp_status
  end,
  case when v.full_name in ('Kiran Nadar','Uli Sigg') then 1 else 0 end,
  null
from v cross join e
where e.name in ('Opening Night Gala','Closing Brunch');

-- Collectors Breakfast — invite collectors + institutions
insert into invitations (vip_id, event_id, status)
select v.id, e.id,
  case when v.category in ('collector','institution') then 'accepted'::rsvp_status else 'invited'::rsvp_status end
from vips v cross join events e
where e.name = 'Collectors Breakfast'
  and v.category in ('collector','institution','curator')
on conflict do nothing;

-- Gallery Walk — curators + select collectors
insert into invitations (vip_id, event_id, status)
select v.id, e.id,
  case when v.full_name in ('Hans Ulrich Obrist','Roobina Karode','Adam Szymczyk') then 'accepted'::rsvp_status
       else 'invited'::rsvp_status end
from vips v cross join events e
where e.name = 'Gallery Walk — Central Delhi'
  and v.category in ('curator','collector')
on conflict do nothing;

-- BMW Dinner
insert into invitations (vip_id, event_id, status)
select v.id, e.id,
  case when v.full_name in ('BMW India','Kiran Nadar','Feroze Gujral','Thaddaeus Ropac') then 'accepted'::rsvp_status
       when v.full_name in ('Glenn Lowry') then 'tentative'::rsvp_status
       else 'invited'::rsvp_status end
from vips v cross join events e
where e.name = 'BMW Art Dinner'
  and v.category in ('collector','gallerist','sponsor','institution')
on conflict do nothing;

-- Studio Visit — small group
insert into invitations (vip_id, event_id, status)
select v.id, e.id,
  case when v.full_name in ('Hans Ulrich Obrist','Maria Balshaw','Suhanya Raffel','Uli Sigg') then 'accepted'::rsvp_status
       when v.full_name = 'Subodh Gupta' then 'accepted'::rsvp_status
       else 'invited'::rsvp_status end
from vips v cross join events e
where e.name = 'Studio Visit — Subodh Gupta'
  and v.full_name in ('Hans Ulrich Obrist','Maria Balshaw','Suhanya Raffel','Uli Sigg','Subodh Gupta','Patrizia Sandretto')
on conflict do nothing;

-- Press Roundtable — press only
insert into invitations (vip_id, event_id, status)
select v.id, e.id, 'accepted'::rsvp_status
from vips v cross join events e
where e.name = 'Press Roundtable' and v.category = 'press'
on conflict do nothing;

-- Artist Talks — open to all, default to invited
insert into invitations (vip_id, event_id, status)
select v.id, e.id, 'invited'::rsvp_status
from vips v cross join events e
where e.name = 'Artist Talks — Women Collectors'
on conflict do nothing;

-- Preview Day — accepted for almost everyone
insert into invitations (vip_id, event_id, status)
select v.id, e.id,
  case when v.category = 'press' then 'accepted'::rsvp_status
       when v.full_name = 'Nicholas Logsdail' then 'declined'::rsvp_status
       else 'accepted'::rsvp_status end
from vips v cross join events e
where e.name = 'VIP Preview Day'
on conflict do nothing;

-- Institutional Dinner — institutions + select curators
insert into invitations (vip_id, event_id, status)
select v.id, e.id, 'accepted'::rsvp_status
from vips v cross join events e
where e.name = 'Institutional Dinner' and v.category in ('institution','curator','sponsor')
on conflict do nothing;
